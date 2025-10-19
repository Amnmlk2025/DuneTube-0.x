from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.db import migrations


def seed_initial_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Course = apps.get_model("core", "Course")
    RoleAssignment = apps.get_model("core", "RoleAssignment")
    UserProfile = apps.get_model("core", "UserProfile")

    user, created = User.objects.get_or_create(
        username="dev",
        defaults={
            "email": "dev@example.com",
            "is_staff": True,
            "is_superuser": True,
            "password": make_password("dev123456"),
        },
    )

    if not created:
        user.email = user.email or "dev@example.com"
        user.is_staff = True
        user.is_superuser = True
        user.password = make_password("dev123456")
        user.save(update_fields=["email", "is_staff", "is_superuser", "password"])

    profile, _ = UserProfile.objects.get_or_create(user=user)
    roles = ["student", "creator", "admin"]
    for role in roles:
        RoleAssignment.objects.get_or_create(user=user, role=role)
    profile.active_role = roles[-1]
    profile.save(update_fields=["active_role", "updated_at"])

    courses = [
        {
            "title": "Intro to Arrakis Ecology",
            "description": "Understand the delicate balance of Arrakis ecosystems and spice flow.",
            "price_amount": Decimal("49.99"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["arrakis", "ecology", "spice"],
            "thumbnail_url": "https://example.com/thumbnails/arrakis-ecology.jpg",
            "publisher": "Fremen Research Guild",
        },
        {
            "title": "Bene Gesserit Voice Training",
            "description": "Daily drills to control intonation, posture, and persuasion.",
            "price_amount": Decimal("59.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["voice", "training", "bene-gesserit"],
            "thumbnail_url": "https://example.com/thumbnails/voice-training.jpg",
            "publisher": "Bene Gesserit Archives",
        },
        {
            "title": "Sietch Water Discipline",
            "description": "Learn rituals and technology for conserving every drop in the deep desert.",
            "price_amount": Decimal("35.50"),
            "price_currency": "USD",
            "language": "fa",
            "tags": ["water", "discipline", "fremen"],
            "thumbnail_url": "https://example.com/thumbnails/water-discipline.jpg",
            "publisher": "Sietch Tabr Training",
        },
        {
            "title": "Ornithopter Flight Basics",
            "description": "Flight safety, maintenance checks, and emergency maneuvers for new pilots.",
            "price_amount": Decimal("79.99"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["ornithopter", "flight", "pilot"],
            "thumbnail_url": "https://example.com/thumbnails/ornithopter.jpg",
            "publisher": "Atreides Flight Academy",
        },
        {
            "title": "Mentat Logic for Strategists",
            "description": "Adopt Mentat computation methods for real-time strategic planning.",
            "price_amount": Decimal("120.00"),
            "price_currency": "USD",
            "language": "ar",
            "tags": ["mentat", "strategy", "logic"],
            "thumbnail_url": "https://example.com/thumbnails/mentat-logic.jpg",
            "publisher": "Imperial Strategic Institute",
        },
        {
            "title": "Spice Harvest Safety",
            "description": "Protocols for minimizing risk during spice blows and worm sign response.",
            "price_amount": Decimal("42.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["spice", "safety", "harvest"],
            "thumbnail_url": "https://example.com/thumbnails/spice-safety.jpg",
            "publisher": "CHOAM Operations",
        },
    ]

    for course in courses:
        Course.objects.get_or_create(title=course["title"], defaults=course)


def unseed_initial_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Course = apps.get_model("core", "Course")
    RoleAssignment = apps.get_model("core", "RoleAssignment")
    UserProfile = apps.get_model("core", "UserProfile")

    try:
        user = User.objects.get(username="dev")
    except User.DoesNotExist:
        user = None

    if user:
        RoleAssignment.objects.filter(user=user).delete()
        UserProfile.objects.filter(user=user).delete()
        user.delete()

    Course.objects.filter(
        title__in=[
            "Intro to Arrakis Ecology",
            "Bene Gesserit Voice Training",
            "Sietch Water Discipline",
            "Ornithopter Flight Basics",
            "Mentat Logic for Strategists",
            "Spice Harvest Safety",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [migrations.RunPython(seed_initial_data, unseed_initial_data)]
