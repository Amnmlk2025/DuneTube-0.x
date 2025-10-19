from django.contrib.auth import get_user_model
from rest_framework import serializers

from reviews.models import Review

User = get_user_model()


class ReviewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")


class ReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "course", "user", "rating", "text", "created_at")
        read_only_fields = ("course", "user", "created_at")
