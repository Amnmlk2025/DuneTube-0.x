from __future__ import annotations

import random
from decimal import Decimal

from django.db import migrations
from django.utils import timezone


def seed_demo_content(apps, schema_editor):
    Publisher = apps.get_model("courses", "Publisher")
    Teacher = apps.get_model("courses", "Teacher")
    Course = apps.get_model("courses", "Course")
    Lesson = apps.get_model("lessons", "Lesson")

    randomizer = random.Random(42)

    centers = [
        {
            "name": "Arrakis Flight Conservatory",
            "slug": "arrakis-flight-conservatory",
            "description": "Premier ornithopter training hub focused on safe navigation above the dunes.",
            "avatar_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=200&q=80",
        },
        {
            "name": "Sietch Water Guild",
            "slug": "sietch-water-guild",
            "description": "Community academy dedicated to water discipline, ecology, and desert survival.",
            "avatar_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80",
        },
        {
            "name": "Mentat Strategic Institute",
            "slug": "mentat-strategic-institute",
            "description": "Elite mentorship program for logic craft, rhetoric, and Bene Gesserit voice.",
            "avatar_url": "https://images.unsplash.com/photo-1485727749690-d091e8284ef6?auto=format&fit=crop&w=200&q=80",
        },
    ]

    languages = ["en", "fa", "ar"]
    topic_seeds = [
        ("Ornithopter Systems", ["flight", "mechanics", "safety"]),
        ("Crysknife Discipline", ["discipline", "tradition", "fremen"]),
        ("Spice Logistics", ["spice", "logistics", "arrakis"]),
        ("Mentat Computation", ["mentat", "logic", "strategy"]),
        ("Voice Resonance", ["voice", "training", "bene-gesserit"]),
        ("Water Harvesting", ["water", "recycling", "sustainability"]),
    ]

    # wipe existing seed/demo content
    Lesson.objects.all().delete()
    Course.objects.all().delete()
    Teacher.objects.all().delete()
    Publisher.objects.all().delete()

    for center in centers:
        publisher = Publisher.objects.create(
            slug=center["slug"],
            name=center["name"],
            description=center["description"],
            avatar_url=center["avatar_url"],
        )

        teacher_total = randomizer.randint(2, 5)
        for mentor_index in range(teacher_total):
            expertise_pool = [
                "spice economy",
                "desert survival",
                "ornithopter",
                "logic craft",
                "water discipline",
            ]
            expertise = randomizer.sample(
                expertise_pool,
                k=randomizer.randint(1, min(3, len(expertise_pool))),
            )
            teacher = Teacher.objects.create(
                name=f"{publisher.name} Mentor {mentor_index + 1}",
                bio=f"{publisher.name} mentor specialising in {', '.join(expertise)}.",
                avatar_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
                expertise=expertise,
            )

            course_total = randomizer.randint(1, 3)
            for course_index in range(course_total):
                topic_name, topic_tags = randomizer.choice(topic_seeds)
                language = randomizer.choice(languages)
                price = Decimal(f"{randomizer.uniform(29.0, 159.0):.2f}")
                rating = Decimal(f"{randomizer.uniform(3.6, 4.9):.2f}")
                participants = randomizer.randint(120, 2400)
                course = Course.objects.create(
                    title=f"{topic_name} Track {mentor_index + 1}-{course_index + 1}",
                    description=f"Immersive module covering {topic_name.lower()} under the guidance of {teacher.name}.",
                    price_amount=price,
                    price_currency="USD",
                    language=language,
                    tags=topic_tags,
                    thumbnail_url="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80",
                    participants_count=participants,
                    rating_avg=rating,
                    published_at=timezone.now() - timezone.timedelta(days=randomizer.randint(10, 240)),
                    publisher=publisher,
                    teacher=teacher,
                )

                lesson_total = randomizer.randint(3, 7)
                for order in range(1, lesson_total + 1):
                    Lesson.objects.create(
                        course=course,
                        order=order,
                        title=f"Lesson {order}: {topic_name} Fundamentals",
                        description=f"Focus session {order} on {topic_name.lower()} practices.",
                        duration_seconds=randomizer.randint(8, 18) * 60,
                        is_free_preview=order == 1,
                        video_url="https://videos.example.com/demo-intro.mp4",
                    )


def unseed_demo_content(apps, schema_editor):
    Publisher = apps.get_model("courses", "Publisher")
    Teacher = apps.get_model("courses", "Teacher")
    Course = apps.get_model("courses", "Course")
    Lesson = apps.get_model("lessons", "Lesson")

    Lesson.objects.all().delete()
    Course.objects.all().delete()
    Teacher.objects.all().delete()
    Publisher.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0002_seed_courses"),
        ("lessons", "0002_seed_lessons"),
    ]

    operations = [
        migrations.RunPython(seed_demo_content, unseed_demo_content),
    ]
