from rest_framework import serializers

from .models import Course, RoleAssignment, UserProfile


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "price_amount",
            "price_currency",
            "language",
            "tags",
            "thumbnail_url",
            "publisher",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RoleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleAssignment
        fields = ["role"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["user", "active_role", "created_at", "updated_at"]
        read_only_fields = ["user", "created_at", "updated_at"]
