from django.contrib import admin

from courses.models import Course, Publisher, Teacher


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "publisher",
        "teacher",
        "price_amount",
        "price_currency",
        "language",
        "participants_count",
        "rating_avg",
        "published_at",
    )
    search_fields = ("title", "description", "publisher__name", "teacher__name")
    list_filter = ("language", "price_currency", "publisher")
    ordering = ("-published_at", "title")
