from rest_framework import serializers

from courses.models import Course, Publisher, Teacher


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ("slug", "name", "avatar_url")


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ("id", "name", "avatar_url")


class CourseSerializer(serializers.ModelSerializer):
    publisher = PublisherSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "thumbnail_url",
            "publisher",
            "teacher",
            "price_amount",
            "price_currency",
            "language",
            "tags",
            "participants_count",
            "published_at",
            "rating_avg",
        )
