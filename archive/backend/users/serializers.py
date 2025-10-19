from django.contrib.auth import get_user_model
from rest_framework import serializers

from users.models import RoleAssignment, UserProfile

User = get_user_model()


class RoleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleAssignment
        fields = ("role", "assigned_at")


class UserProfileSerializer(serializers.ModelSerializer):
    roles = RoleAssignmentSerializer(source="user.role_assignments", many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ("active_role", "roles")


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "profile")
