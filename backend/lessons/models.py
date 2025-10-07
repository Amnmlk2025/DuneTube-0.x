from django.db import models


class Lesson(models.Model):
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="lessons")
    order = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    is_free_preview = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        indexes = [
            models.Index(fields=["course", "order"]),
        ]
        unique_together = ("course", "order")

    def __str__(self) -> str:
        return f"{self.course.title} - {self.title}"
