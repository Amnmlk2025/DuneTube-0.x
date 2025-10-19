from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("courses", "0002_seed_courses"),
    ]

    operations = [
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order", models.PositiveIntegerField(default=1)),
                ("title", models.CharField(max_length=255)),
                ("video_url", models.URLField(blank=True)),
                ("duration_seconds", models.PositiveIntegerField(default=0)),
                ("is_free_preview", models.BooleanField(default=False)),
                ("description", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lessons", to="courses.course"),
                ),
            ],
            options={
                "ordering": ["order", "id"],
                "unique_together": {("course", "order")},
            },
        ),
        migrations.AddIndex(
            model_name="lesson",
            index=models.Index(fields=["course", "order"], name="lessons_les_course__acef55_idx"),
        ),
    ]
