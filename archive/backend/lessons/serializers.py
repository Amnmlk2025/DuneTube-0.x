from rest_framework import serializers

from lessons.models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = (
            "id",
            "course",
            "order",
            "title",
            "video_url",
            "duration_seconds",
            "is_free_preview",
            "description",
            "created_at",
            "updated_at",
        )
