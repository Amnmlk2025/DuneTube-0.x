from __future__ import annotations

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from courses.models import Course, Publisher, Teacher


class Command(BaseCommand):
  help = "Ensure the demo database has at least N courses for frontend browsing."

  def add_arguments(self, parser):
    parser.add_argument(
      "--count",
      type=int,
      default=15,
      help="Minimum number of demo courses to ensure exist (default: 15).",
    )

  @transaction.atomic
  def handle(self, *args, **options):
    target = options["count"]
    current = Course.objects.count()

    if current >= target:
      self.stdout.write(self.style.SUCCESS(f"Already have {current} courses (target {target}). Nothing to do."))
      return

    publisher, _ = Publisher.objects.get_or_create(
      slug="demo-guild",
      defaults={
        "name": "Demo Guild",
        "avatar_url": "https://placehold.co/96x96?text=DG",
        "description": "Curated Arrakis learning collective for demo purposes.",
      },
    )
    teacher, _ = Teacher.objects.get_or_create(
      name="Demo Mentor",
      defaults={
        "bio": "Seasoned mentor guiding learners through the dunes of knowledge.",
        "avatar_url": "https://placehold.co/128x128?text=DM",
        "expertise": ["mentat", "strategy", "desert-survival"],
      },
    )

    created = 0
    for index in range(current, target):
      course_number = index + 1
      title = f"Demo Course #{course_number}"
      slug_suffix = course_number * 7
      description = (
        "Explore cinematic lessons, tactical breakdowns, and lore-rich storytelling crafted for rapid onboarding. "
        "This demo course helps showcase the Dunetube catalog during development."
      )
      Course.objects.create(
        title=title,
        description=description,
        price_amount=random.choice([0, 19.0, 29.0, 39.0]),
        price_currency="USD",
        language=random.choice(["fa", "en", "ar"]),
        tags=["demo", "intro", f"batch-{slug_suffix}"],
        thumbnail_url=f"https://placehold.co/640x360?text=Demo+{course_number}",
        participants_count=random.randint(50, 2500),
        rating_avg=random.choice([3.8, 4.2, 4.7, 5.0]),
        published_at=timezone.now() - timedelta(days=course_number),
        publisher=publisher,
        teacher=teacher,
      )
      created += 1

    self.stdout.write(
      self.style.SUCCESS(f"Created {created} demo courses (now {Course.objects.count()} total, target {target})."),
    )
