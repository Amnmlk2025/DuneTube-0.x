from django.contrib import admin

from lessons.models import Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("course", "order", "title", "is_free_preview", "duration_seconds")
    list_filter = ("is_free_preview", "course")
    search_fields = ("title", "course__title")
