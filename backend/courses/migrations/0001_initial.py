from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Publisher",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("slug", models.SlugField(unique=True)),
                ("avatar_url", models.URLField(blank=True)),
                ("description", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Teacher",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("bio", models.TextField(blank=True)),
                ("avatar_url", models.URLField(blank=True)),
                ("expertise", models.JSONField(blank=True, default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("price_amount", models.DecimalField(decimal_places=2, max_digits=8)),
                ("price_currency", models.CharField(default="USD", max_length=8)),
                ("language", models.CharField(default="en", max_length=8)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("thumbnail_url", models.URLField(blank=True)),
                ("participants_count", models.PositiveIntegerField(default=0)),
                ("rating_avg", models.DecimalField(decimal_places=2, default=0, max_digits=3)),
                ("published_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "publisher",
                    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="courses", to="courses.publisher"),
                ),
                (
                    "teacher",
                    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="courses", to="courses.teacher"),
                ),
            ],
            options={
                "ordering": ["-published_at", "title"],
            },
        ),
    ]
