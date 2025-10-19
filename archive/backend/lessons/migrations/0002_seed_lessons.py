from django.db import migrations
from django.utils import timezone


def seed_lessons(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    Lesson = apps.get_model("lessons", "Lesson")

    template_titles = [
        "Introduction",
        "Core Concepts",
        "Field Application",
        "Expert Insights",
        "Case Study",
        "Practice Lab",
        "Next Steps",
    ]

    for course in Course.objects.all():
        for index, base_title in enumerate(template_titles[:5], start=1):
            Lesson.objects.get_or_create(
                course=course,
                order=index,
                defaults={
                    "title": f"{course.title}: {base_title}",
                    "video_url": f"https://videos.dunetube.local/{course.id}-{index}.mp4",
                    "duration_seconds": 480 + index * 60,
                    "is_free_preview": index == 1 or (index == 2 and course.language == "fa"),
                    "description": f"{base_title} for {course.title} recorded on {timezone.now():%Y-%m-%d}.",
                },
            )


def unseed_lessons(apps, schema_editor):
    Lesson = apps.get_model("lessons", "Lesson")
    Lesson.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("lessons", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_lessons, reverse_code=unseed_lessons),
    ]
