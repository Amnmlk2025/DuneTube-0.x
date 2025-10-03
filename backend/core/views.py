from django.db import transaction
from django.db.models import Prefetch
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, Lesson, LessonNote, LessonProgress, RoleAssignment, UserProfile
from .serializers import (
    CourseSerializer,
    LessonNoteSerializer,
    LessonProgressSerializer,
    LessonSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by("title")
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "publisher", "language", "tags"]
    ordering_fields = ["title", "created_at", "price_amount"]

    @action(detail=True, methods=["get"], url_path="lessons")
    def lessons(self, request, pk=None):
        course = self.get_object()
        lessons = course.lessons.all().order_by("position", "id")
        user = request.user
        if user.is_authenticated:
            lessons = lessons.prefetch_related(
                Prefetch(
                    "progress_entries",
                    queryset=LessonProgress.objects.filter(user=user),
                    to_attr="user_progress",
                )
            )
        serializer = LessonSerializer(lessons, many=True, context={"request": request})
        return Response(serializer.data)


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"ok": True, "service": "dunetube-api"})


class ActiveRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        roles = RoleAssignment.objects.filter(user=user).order_by("role")
        return Response(
            {
                "active_role": profile.active_role,
                "available_roles": [role.role for role in roles],
            }
        )


class ActivateRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        requested_role = request.data.get("role")
        if not requested_role:
            return Response({"detail": "role is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not RoleAssignment.objects.filter(user=user, role=requested_role).exists():
            return Response({"detail": "role not assigned"}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.active_role = requested_role
        profile.save(update_fields=["active_role", "updated_at"])
        return Response({"active_role": profile.active_role})


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["position", "created_at"]

    def get_queryset(self):
        queryset = Lesson.objects.select_related("course").all()
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        queryset = queryset.order_by("position", "id")
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    "progress_entries",
                    queryset=LessonProgress.objects.filter(user=user),
                    to_attr="user_progress",
                )
            )
        return queryset

    @action(detail=True, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def progress(self, request, pk=None):
        lesson = self.get_object()
        progress, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)

        if request.method == "GET":
            serializer = LessonProgressSerializer(progress)
            return Response(serializer.data)

        last_position = request.data.get("last_position")
        if last_position is None:
            return Response(
                {"detail": "last_position is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            position_value = int(last_position)
        except (TypeError, ValueError):
            return Response(
                {"detail": "last_position must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if position_value < 0:
            position_value = 0

        progress.last_position = position_value
        progress.save(update_fields=["last_position", "updated_at"])
        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticated])
    def notes(self, request, pk=None):
        lesson = self.get_object()

        if request.method == "GET":
            notes = lesson.notes.filter(user=request.user).select_related("lesson").order_by("-updated_at")
            serializer = LessonNoteSerializer(notes, many=True)
            return Response(serializer.data)

        serializer = LessonNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, lesson=lesson)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path=r"notes/(?P<note_id>[^/.]+)",
        permission_classes=[permissions.IsAuthenticated],
    )
    def note_detail(self, request, pk=None, note_id=None):
        lesson = self.get_object()
        try:
            note = lesson.notes.get(id=note_id, user=request.user)
        except LessonNote.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.method == "DELETE":
            note.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = LessonNoteSerializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, lesson=note.lesson)
        return Response(serializer.data)


class LessonNoteViewSet(viewsets.ModelViewSet):
    serializer_class = LessonNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "put", "delete"]

    def get_queryset(self):
        queryset = LessonNote.objects.filter(user=self.request.user).select_related("lesson", "lesson__course")
        lesson_id = self.request.query_params.get("lesson")
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(lesson__course_id=course_id)
        return queryset.order_by("-updated_at")

    def perform_create(self, serializer):
        lesson = serializer.validated_data.get("lesson")
        if lesson is None:
            raise ValidationError({"lesson": ["This field is required."]})
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user, lesson=serializer.instance.lesson)
