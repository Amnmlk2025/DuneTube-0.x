from django.db import models
from django.utils import timezone


class Publisher(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    avatar_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Teacher(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    expertise = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price_amount = models.DecimalField(max_digits=8, decimal_places=2)
    price_currency = models.CharField(max_length=8, default="USD")
    language = models.CharField(max_length=8, default="en")
    tags = models.JSONField(default=list, blank=True)
    thumbnail_url = models.URLField(blank=True)
    participants_count = models.PositiveIntegerField(default=0)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    publisher = models.ForeignKey(Publisher, on_delete=models.PROTECT, related_name="courses")
    teacher = models.ForeignKey(Teacher, on_delete=models.PROTECT, related_name="courses")

    class Meta:
        ordering = ["-published_at", "title"]

    def __str__(self) -> str:
        return self.title
