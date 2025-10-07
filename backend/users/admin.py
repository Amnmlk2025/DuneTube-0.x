from django.contrib import admin

from users.models import RoleAssignment, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "active_role", "created_at", "updated_at")
    search_fields = ("user__username", "user__email", "active_role")


@admin.register(RoleAssignment)
class RoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "assigned_at")
    search_fields = ("user__username", "role")
    list_filter = ("role",)
