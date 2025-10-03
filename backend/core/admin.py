from django.contrib import admin

from .models import Course, RoleAssignment, UserProfile


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
