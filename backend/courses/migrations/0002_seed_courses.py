from datetime import timedelta
from decimal import Decimal

from django.db import migrations
from django.utils import timezone


COURSE_TITLES = [
    "Fremen Survival Essentials",
    "Mentat Logic Bootcamp",
    "Voice Mastery for Negotiators",
    "Crysknife Craftsmanship Workshop",
    "Shield Combat Fundamentals",
    "Sandworm Riding Clinic",
    "The Spice Economy",
    "Sietch Leadership Tactics",
    "Baliset Ballads for Beginners",
    "Prescience Awareness Primer",
]


def seed_courses(apps, schema_editor):
    Publisher = apps.get_model("courses", "Publisher")
    Teacher = apps.get_model("courses", "Teacher")
    Course = apps.get_model("courses", "Course")

    publishers = [
        {"slug": "arrakis-institute", "name": "Arrakis Institute", "avatar_url": "https://picsum.photos/seed/arrakis/128"},
        {"slug": "mentat-guild", "name": "Mentat Guild", "avatar_url": "https://picsum.photos/seed/mentat/128"},
        {"slug": "bene-gesserit-hub", "name": "Bene Gesserit Hub", "avatar_url": "https://picsum.photos/seed/gesserit/128"},
    ]
    publisher_map = {}
    for item in publishers:
        publisher, _ = Publisher.objects.get_or_create(slug=item["slug"], defaults={"name": item["name"], "avatar_url": item["avatar_url"]})
        publisher_map[item["slug"]] = publisher

    teachers = [
        {"name": "Thufir Hawat", "avatar_url": "https://picsum.photos/seed/hawat/128"},
        {"name": "Lady Jessica", "avatar_url": "https://picsum.photos/seed/jessica/128"},
        {"name": "Stilgar", "avatar_url": "https://picsum.photos/seed/stilgar/128"},
        {"name": "Gurney Halleck", "avatar_url": "https://picsum.photos/seed/gurney/128"},
        {"name": "Wellington Yueh", "avatar_url": "https://picsum.photos/seed/yueh/128"},
    ]
    teacher_map = {}
    for item in teachers:
        teacher, _ = Teacher.objects.get_or_create(name=item["name"], defaults={"avatar_url": item["avatar_url"]})
        teacher_map[item["name"]] = teacher

    now = timezone.now()
    courses = [
        {
            "title": "Fremen Survival Essentials",
            "description": "Master desert survival tactics from the sietch dwellers of Arrakis.",
            "price_amount": Decimal("49.00"),
            "price_currency": "USD",
            "language": "fa",
            "tags": ["survival", "arrakis", "desert"],
            "thumbnail_url": "https://picsum.photos/seed/fremen/640/360",
            "participants_count": 320,
            "rating_avg": Decimal("4.8"),
            "published_at": now - timedelta(days=10),
            "publisher": publisher_map["arrakis-institute"],
            "teacher": teacher_map["Stilgar"],
        },
        {
            "title": "Mentat Logic Bootcamp",
            "description": "Sharpen your analytical mind with mentat-grade logic drills and mental models.",
            "price_amount": Decimal("79.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["mentat", "logic", "analysis"],
            "thumbnail_url": "https://picsum.photos/seed/mentat-course/640/360",
            "participants_count": 210,
            "rating_avg": Decimal("4.7"),
            "published_at": now - timedelta(days=20),
            "publisher": publisher_map["mentat-guild"],
            "teacher": teacher_map["Thufir Hawat"],
        },
        {
            "title": "Voice Mastery for Negotiators",
            "description": "Learn vocal control and persuasion inspired by Bene Gesserit teachings.",
            "price_amount": Decimal("59.00"),
            "price_currency": "USD",
            "language": "fa",
            "tags": ["communication", "psychology", "voice"],
            "thumbnail_url": "https://picsum.photos/seed/voice/640/360",
            "participants_count": 280,
            "rating_avg": Decimal("4.6"),
            "published_at": now - timedelta(days=5),
            "publisher": publisher_map["bene-gesserit-hub"],
            "teacher": teacher_map["Lady Jessica"],
        },
        {
            "title": "Crysknife Craftsmanship Workshop",
            "description": "Step-by-step guide on crafting and honoring the sacred crysknife.",
            "price_amount": Decimal("39.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["craft", "culture", "arrakis"],
            "thumbnail_url": "https://picsum.photos/seed/crysknife/640/360",
            "participants_count": 145,
            "rating_avg": Decimal("4.3"),
            "published_at": now - timedelta(days=15),
            "publisher": publisher_map["arrakis-institute"],
            "teacher": teacher_map["Stilgar"],
        },
        {
            "title": "Shield Combat Fundamentals",
            "description": "Train with slow-blade techniques to defeat defensive shields.",
            "price_amount": Decimal("69.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["combat", "shield", "training"],
            "thumbnail_url": "https://picsum.photos/seed/shield/640/360",
            "participants_count": 390,
            "rating_avg": Decimal("4.9"),
            "published_at": now - timedelta(days=3),
            "publisher": publisher_map["mentat-guild"],
            "teacher": teacher_map["Gurney Halleck"],
        },
        {
            "title": "Sandworm Riding Clinic",
            "description": "Experience the thrill of mounting and steering colossal sandworms.",
            "price_amount": Decimal("89.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["sandworm", "adventure", "arrakis"],
            "thumbnail_url": "https://picsum.photos/seed/sandworm/640/360",
            "participants_count": 120,
            "rating_avg": Decimal("4.5"),
            "published_at": now - timedelta(days=7),
            "publisher": publisher_map["arrakis-institute"],
            "teacher": teacher_map["Stilgar"],
        },
        {
            "title": "The Spice Economy",
            "description": "Analyze the macroeconomics of melange and its impact on interstellar trade.",
            "price_amount": Decimal("99.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["economy", "spice", "strategy"],
            "thumbnail_url": "https://picsum.photos/seed/spice/640/360",
            "participants_count": 265,
            "rating_avg": Decimal("4.4"),
            "published_at": now - timedelta(days=11),
            "publisher": publisher_map["mentat-guild"],
            "teacher": teacher_map["Thufir Hawat"],
        },
        {
            "title": "Sietch Leadership Tactics",
            "description": "Leadership lessons molded by the harsh sands and loyal tribes of Arrakis.",
            "price_amount": Decimal("54.00"),
            "price_currency": "USD",
            "language": "fa",
            "tags": ["leadership", "community", "fremen"],
            "thumbnail_url": "https://picsum.photos/seed/leadership/640/360",
            "participants_count": 310,
            "rating_avg": Decimal("4.6"),
            "published_at": now - timedelta(days=9),
            "publisher": publisher_map["arrakis-institute"],
            "teacher": teacher_map["Stilgar"],
        },
        {
            "title": "Baliset Ballads for Beginners",
            "description": "Learn the iconic baliset tunes and improvisational storytelling.",
            "price_amount": Decimal("29.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["music", "baliset", "art"],
            "thumbnail_url": "https://picsum.photos/seed/baliset/640/360",
            "participants_count": 180,
            "rating_avg": Decimal("4.2"),
            "published_at": now - timedelta(days=25),
            "publisher": publisher_map["mentat-guild"],
            "teacher": teacher_map["Gurney Halleck"],
        },
        {
            "title": "Prescience Awareness Primer",
            "description": "Introductory course on safe spice consumption and prescient visions.",
            "price_amount": Decimal("109.00"),
            "price_currency": "USD",
            "language": "en",
            "tags": ["prescience", "spice", "meditation"],
            "thumbnail_url": "https://picsum.photos/seed/prescience/640/360",
            "participants_count": 95,
            "rating_avg": Decimal("4.1"),
            "published_at": now - timedelta(days=4),
            "publisher": publisher_map["bene-gesserit-hub"],
            "teacher": teacher_map["Lady Jessica"],
        },
    ]

    for payload in courses:
        Course.objects.get_or_create(
            title=payload["title"],
            defaults={k: v for k, v in payload.items() if k not in {"title"}},
        )


def unseed_courses(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    Course.objects.filter(title__in=COURSE_TITLES).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_courses, reverse_code=unseed_courses),
    ]
