from rest_framework import serializers

from .models import (
    Course,
    Lesson,
    LessonNote,
    LessonProgress,
    RoleAssignment,
    UserProfile,
)


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


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["last_position", "updated_at"]
        read_only_fields = ["updated_at"]


class LessonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    stream_url = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "description",
            "video_url",
            "stream_url",
            "duration_seconds",
            "position",
            "created_at",
            "updated_at",
            "progress",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "progress",
            "stream_url",
        ]

    def get_progress(self, obj: Lesson) -> dict:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return {"last_position": 0, "updated_at": None}

        progress_entries = getattr(obj, "user_progress", None)
        if progress_entries:
            entry = progress_entries[0]
            return LessonProgressSerializer(entry).data

        progress = LessonProgress.objects.filter(user=request.user, lesson=obj).first()
        if progress:
            return LessonProgressSerializer(progress).data

        return {"last_position": 0, "updated_at": None}

    def get_stream_url(self, obj: Lesson) -> str | None:
        stream = obj.stream_url
        if not stream:
            return None
        request = self.context.get("request")
        if request and obj.video_file:
            return request.build_absolute_uri(stream)
        return stream


class LessonNoteSerializer(serializers.ModelSerializer):
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), required=False)
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = LessonNote
        fields = [
            "id",
            "lesson",
            "lesson_title",
            "body",
            "timestamp",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "lesson_title", "created_at", "updated_at"]


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


class StudioCourseSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)

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
            "owner",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class StudioLessonSerializer(serializers.ModelSerializer):
    stream_url = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "description",
            "video_url",
            "stream_url",
            "duration_seconds",
            "position",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "stream_url", "created_at", "updated_at"]

    def get_stream_url(self, obj: Lesson) -> str | None:
        stream = obj.stream_url
        if not stream:
            return None
        request = self.context.get("request")
        if request and obj.video_file:
            return request.build_absolute_uri(stream)
        return stream


class WalletTransactionSerializer(serializers.Serializer):
    id = serializers.CharField()
    direction = serializers.ChoiceField(choices=["credit", "debit"])
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    occurred_at = serializers.DateTimeField()
    course_id = serializers.IntegerField(required=False, allow_null=True)
    course_title = serializers.CharField(required=False, allow_blank=True)


class WalletInvoiceSerializer(serializers.Serializer):
    id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField()
    status = serializers.CharField()
    issued_at = serializers.DateTimeField()
    due_at = serializers.DateTimeField()
    reference = serializers.CharField()
