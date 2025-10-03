from django.contrib import admin

from .models import Course, Lesson, LessonNote, LessonProgress, RoleAssignment, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "active_role", "created_at", "updated_at"]
    search_fields = ["user__username", "active_role"]


@admin.register(RoleAssignment)
class RoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ["user", "role", "assigned_at"]
    search_fields = ["user__username", "role"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "publisher", "language", "price_amount", "price_currency", "created_at"]
    search_fields = ["title", "publisher", "language"]
    list_filter = ["language", "publisher"]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "position", "duration_seconds", "created_at"]
    list_filter = ["course"]
    search_fields = ["title", "course__title"]


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "last_position", "updated_at"]
    search_fields = ["user__username", "lesson__title", "lesson__course__title"]
    list_filter = ["lesson__course"]


@admin.register(LessonNote)
class LessonNoteAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "timestamp", "updated_at"]
    search_fields = ["user__username", "lesson__title", "body"]
    list_filter = ["lesson__course"]
