from django.contrib.auth.hashers import make_password
from django.db import migrations


DEV_USER = {
    "username": "dev",
    "email": "dev@example.com",
    "password": "dev123456",
    "first_name": "Dev",
    "last_name": "Mentat",
}


def create_dev_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    UserProfile = apps.get_model("users", "UserProfile")
    RoleAssignment = apps.get_model("users", "RoleAssignment")

    user, created = User.objects.get_or_create(
        username=DEV_USER["username"],
        defaults={
            "email": DEV_USER["email"],
            "first_name": DEV_USER["first_name"],
            "last_name": DEV_USER["last_name"],
            "password": make_password(DEV_USER["password"]),
        },
    )

    if not created:
        user.email = DEV_USER["email"]
        user.first_name = DEV_USER["first_name"]
        user.last_name = DEV_USER["last_name"]
        user.password = make_password(DEV_USER["password"])
        user.save(update_fields=["email", "first_name", "last_name", "password"])

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if not profile.active_role:
        profile.active_role = "student"
        profile.save(update_fields=["active_role", "updated_at"])

    for role in ["student", "creator"]:
        RoleAssignment.objects.get_or_create(user=user, role=role)


def remove_dev_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    try:
        user = User.objects.get(username=DEV_USER["username"])
    except User.DoesNotExist:
        return
    user.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_dev_user, reverse_code=remove_dev_user),
    ]
