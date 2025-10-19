from django.db import migrations


LESSON_SEED_DATA = {
    "Intro to Arrakis Ecology": [
        {
            "title": "Planetary Overview",
            "description": "Survey the major ecological zones across Arrakis and their unique challenges.",
            "video_url": "https://videos.example.com/arrakis-ecology/lesson1.mp4",
            "duration_seconds": 540,
        },
        {
            "title": "Spice Cycle Mechanics",
            "description": "Understand how sand plankton and sandtrout maintain the spice cycle.",
            "video_url": "https://videos.example.com/arrakis-ecology/lesson2.mp4",
            "duration_seconds": 620,
        },
        {
            "title": "Weathering the Coriolis Storms",
            "description": "Field recordings that teach you how to read and survive the sudden storms.",
            "video_url": "https://videos.example.com/arrakis-ecology/lesson3.mp4",
            "duration_seconds": 480,
        },
    ],
    "Bene Gesserit Voice Training": [
        {
            "title": "Breath and Tone Alignment",
            "description": "Daily diaphragm drills to project authority without strain.",
            "video_url": "https://videos.example.com/bg-voice/lesson1.mp4",
            "duration_seconds": 420,
        },
        {
            "title": "Sonic Persuasion Patterns",
            "description": "Practice cadence patterns used for subtle influence.",
            "video_url": "https://videos.example.com/bg-voice/lesson2.mp4",
            "duration_seconds": 505,
        },
        {
            "title": "Advanced Command Sequences",
            "description": "Deploy multi-layered commands while maintaining composure.",
            "video_url": "https://videos.example.com/bg-voice/lesson3.mp4",
            "duration_seconds": 560,
        },
    ],
    "Sietch Water Discipline": [
        {
            "title": "Storage Rituals",
            "description": "Set up and maintain communal catch basins with ceremonial care.",
            "video_url": "https://videos.example.com/sietch-water/lesson1.mp4",
            "duration_seconds": 400,
        },
        {
            "title": "Recovering Dew",
            "description": "Harvest night moisture using stillsuit condensers.",
            "video_url": "https://videos.example.com/sietch-water/lesson2.mp4",
            "duration_seconds": 450,
        },
    ],
    "Ornithopter Flight Basics": [
        {
            "title": "Pre-flight Safety",
            "description": "Conduct systematic checks before taking off in harsh conditions.",
            "video_url": "https://videos.example.com/ornithopter/lesson1.mp4",
            "duration_seconds": 610,
        },
        {
            "title": "Lift and Glide",
            "description": "Balance wing articulation to control altitude with minimal spice loss.",
            "video_url": "https://videos.example.com/ornithopter/lesson2.mp4",
            "duration_seconds": 575,
        },
        {
            "title": "Emergency Descent",
            "description": "Execute controlled landings when facing worm sign or engine failure.",
            "video_url": "https://videos.example.com/ornithopter/lesson3.mp4",
            "duration_seconds": 530,
        },
    ],
    "Mentat Logic for Strategists": [
        {
            "title": "Human Computer Mindset",
            "description": "Reset your focus and memory structures before mission planning.",
            "video_url": "https://videos.example.com/mentat-logic/lesson1.mp4",
            "duration_seconds": 690,
        },
        {
            "title": "Signal Filtering",
            "description": "Triangulate truth from noise using formal Mentat heuristics.",
            "video_url": "https://videos.example.com/mentat-logic/lesson2.mp4",
            "duration_seconds": 640,
        },
        {
            "title": "Crisis Simulations",
            "description": "Run through real-time battle calculations under pressure.",
            "video_url": "https://videos.example.com/mentat-logic/lesson3.mp4",
            "duration_seconds": 720,
        },
    ],
    "Spice Harvest Safety": [
        {
            "title": "Spotting Worm Sign",
            "description": "Read shifting sands and respond before the maker arrives.",
            "video_url": "https://videos.example.com/spice-safety/lesson1.mp4",
            "duration_seconds": 505,
        },
        {
            "title": "Team Extraction Protocol",
            "description": "Coordinate carryall extractions under turbulent winds.",
            "video_url": "https://videos.example.com/spice-safety/lesson2.mp4",
            "duration_seconds": 560,
        },
    ],
}


def seed_lessons(apps, schema_editor):
    Course = apps.get_model("core", "Course")
    Lesson = apps.get_model("core", "Lesson")

    for course_title, lessons in LESSON_SEED_DATA.items():
        try:
            course = Course.objects.get(title=course_title)
        except Course.DoesNotExist:
            continue

        for index, lesson_data in enumerate(lessons, start=1):
            Lesson.objects.update_or_create(
                course=course,
                title=lesson_data["title"],
                defaults={
                    "description": lesson_data["description"],
                    "video_url": lesson_data["video_url"],
                    "duration_seconds": lesson_data["duration_seconds"],
                    "position": lesson_data.get("position", index),
                },
            )


def unseed_lessons(apps, schema_editor):
    Lesson = apps.get_model("core", "Lesson")
    Lesson.objects.filter(title__in=[lesson["title"] for lessons in LESSON_SEED_DATA.values() for lesson in lessons]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_lesson_lessonnote_lessonprogress"),
    ]

    operations = [migrations.RunPython(seed_lessons, unseed_lessons)]
