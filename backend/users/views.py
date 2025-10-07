from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import RoleAssignment, UserProfile
from users.serializers import UserSerializer


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)


class RoleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        roles = RoleAssignment.objects.filter(user=request.user).order_by("role").values_list("role", flat=True)
        return Response({"active_role": profile.active_role, "available_roles": list(roles)})


class RoleActivationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        role = request.data.get("role")
        if not role:
            return Response({"detail": "role is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not RoleAssignment.objects.filter(user=request.user, role=role).exists():
            return Response({"detail": "role not assigned"}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.active_role = role
        profile.save(update_fields=["active_role", "updated_at"])
        return Response({"active_role": profile.active_role})
