from django.db import migrations


def assign_owner(apps, schema_editor):
    Course = apps.get_model("core", "Course")
    User = apps.get_model("auth", "User")

    try:
        owner = User.objects.get(username="dev")
    except User.DoesNotExist:
        owner = None

    if owner is None:
        return

    Course.objects.filter(owner__isnull=True).update(owner=owner)


def remove_owner(apps, schema_editor):
    Course = apps.get_model("core", "Course")
    Course.objects.update(owner=None)


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0005_course_owner_lesson_video_file_and_more"),
    ]

    operations = [migrations.RunPython(assign_owner, remove_owner)]
