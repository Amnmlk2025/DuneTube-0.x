from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import filters, permissions, status, viewsets, parsers
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
    StudioCourseSerializer,
    StudioLessonSerializer,
    WalletInvoiceSerializer,
    WalletTransactionSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().select_related("owner").order_by("title")
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


class IsCreatorOrAdmin(permissions.BasePermission):
    message = "Creator or admin role is required."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return RoleAssignment.objects.filter(user=user, role__in=["creator", "admin"]).exists()


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


class StudioCourseViewSet(viewsets.ModelViewSet):
    serializer_class = StudioCourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "language", "publisher"]
    ordering_fields = ["updated_at", "created_at", "title"]
    http_method_names = ["get", "post", "patch", "put", "delete"]

    def get_queryset(self):
        return (
            Course.objects.select_related("owner")
            .filter(owner=self.request.user)
            .order_by("-updated_at")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save(owner=self.request.user)


class StudioLessonViewSet(viewsets.ModelViewSet):
    serializer_class = StudioLessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["position", "updated_at", "created_at"]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    http_method_names = ["get", "post", "patch", "put", "delete"]

    def get_queryset(self):
        queryset = (
            Lesson.objects.select_related("course", "course__owner")
            .filter(course__owner=self.request.user)
            .order_by("position", "id")
        )
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        if not course or course.owner_id != self.request.user.id:
            raise ValidationError({"course": ["You can only manage your own courses."]})
        serializer.save()

    def perform_update(self, serializer):
        course = serializer.validated_data.get("course") or serializer.instance.course
        if course.owner_id != self.request.user.id:
            raise ValidationError({"course": ["You can only manage your own courses."]})
        serializer.save(course=course)

    @action(
        detail=True,
        methods=["post"],
        url_path="upload",
        permission_classes=[permissions.IsAuthenticated, IsCreatorOrAdmin],
        parser_classes=[parsers.FormParser, parsers.MultiPartParser],
    )
    def upload(self, request, pk=None):
        lesson = self.get_object()
        file_obj = request.data.get("file") or request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

        lesson.video_file = file_obj
        lesson.save(update_fields=["video_file", "updated_at"])
        serializer = self.get_serializer(lesson)
        return Response(serializer.data)


class WalletTransactionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        courses = list(Course.objects.order_by("-created_at")[:3])

        def course_ref(index: int):
            if len(courses) > index:
                course = courses[index]
                return course.id, course.title, course.price_amount, course.price_currency
            return None, "", Decimal("0.00"), "USD"

        transactions = []
        course_id, course_title, amount, currency = course_ref(0)
        if amount > 0:
            transactions.append(
                {
                    "id": f"txn-{now:%Y%m%d}-001",
                    "direction": "credit",
                    "amount": amount,
                    "currency": currency,
                    "description": f"Sale • {course_title}" if course_title else "Course sale",
                    "status": "settled",
                    "occurred_at": now - timedelta(days=2, hours=4),
                    "course_id": course_id,
                    "course_title": course_title,
                }
            )

        course_id, course_title, amount, currency = course_ref(1)
        if amount > 0:
            transactions.append(
                {
                    "id": f"txn-{now:%Y%m%d}-002",
                    "direction": "credit",
                    "amount": amount,
                    "currency": currency,
                    "description": f"Sale • {course_title}" if course_title else "Course sale",
                    "status": "settled",
                    "occurred_at": now - timedelta(days=5, hours=3),
                    "course_id": course_id,
                    "course_title": course_title,
                }
            )

        transactions.append(
            {
                "id": f"txn-{now:%Y%m%d}-003",
                "direction": "debit",
                "amount": Decimal("75.00"),
                "currency": "USD",
                "description": "Creator payout",
                "status": "processing",
                "occurred_at": now - timedelta(days=1, hours=1),
            }
        )

        transactions.append(
            {
                "id": f"txn-{now:%Y%m%d}-004",
                "direction": "debit",
                "amount": Decimal("15.00"),
                "currency": "USD",
                "description": "Platform fee",
                "status": "settled",
                "occurred_at": now - timedelta(days=12),
            }
        )

        balance = Decimal("0.00")
        for item in transactions:
            if item["direction"] == "credit":
                balance += item["amount"]
            else:
                balance -= item["amount"]

        serializer = WalletTransactionSerializer(transactions, many=True)
        return Response(
            {
                "balance": {
                    "amount": balance,
                    "currency": transactions[0]["currency"] if transactions else "USD",
                },
                "transactions": serializer.data,
            }
        )


class WalletInvoicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        invoices = [
            {
                "id": f"inv-{now:%Y%m}-001",
                "amount": Decimal("19.00"),
                "currency": "USD",
                "status": "paid",
                "issued_at": now - timedelta(days=34),
                "due_at": now - timedelta(days=27),
                "reference": "Creator workspace subscription · Last month",
            },
            {
                "id": f"inv-{now:%Y%m}-002",
                "amount": Decimal("19.00"),
                "currency": "USD",
                "status": "open",
                "issued_at": now - timedelta(days=4),
                "due_at": now + timedelta(days=3),
                "reference": "Creator workspace subscription · This month",
            },
        ]

        serializer = WalletInvoiceSerializer(invoices, many=True)
        return Response({"invoices": serializer.data})
