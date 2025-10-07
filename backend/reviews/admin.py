from django.contrib import admin

from reviews.models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("course", "user", "rating", "created_at")
    search_fields = ("course__title", "user__username", "text")
    list_filter = ("rating",)
