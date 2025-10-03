from django.db import transaction
from rest_framework import permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, RoleAssignment, UserProfile
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by("title")
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "publisher", "language", "tags"]
    ordering_fields = ["title", "created_at", "price_amount"]


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
