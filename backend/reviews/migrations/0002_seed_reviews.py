from django.contrib.auth.hashers import make_password
from django.db import migrations


def seed_reviews(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Review = apps.get_model("reviews", "Review")
    Course = apps.get_model("courses", "Course")

    reviewers = [
        {"username": "reviewer1", "email": "reviewer1@example.com"},
        {"username": "reviewer2", "email": "reviewer2@example.com"},
    ]
    reviewer_users = []
    for reviewer in reviewers:
        user, _ = User.objects.get_or_create(
            username=reviewer["username"],
            defaults={
                "email": reviewer["email"],
                "password": make_password("review123"),
            },
        )
        reviewer_users.append(user)

    dev_user = User.objects.filter(username="dev").first()
    users = reviewer_users + ([dev_user] if dev_user else [])

    courses = list(Course.objects.all()[:5])
    ratings = [5, 4, 3, 5, 2]
    texts = [
        "Outstanding material, I learnt survival tactics fast.",
        "Well structured and informative.",
        "Solid content but could use more visual aids.",
        "Loved the instructor energy!",
        "Challenging concepts yet worthwhile.",
    ]

    for idx, course in enumerate(courses):
        for user in users:
            if user is None:
                continue
            Review.objects.update_or_create(
                course=course,
                user=user,
                defaults={
                    "rating": ratings[idx % len(ratings)],
                    "text": texts[idx % len(texts)],
                },
            )


def unseed_reviews(apps, schema_editor):
    Review = apps.get_model("reviews", "Review")
    User = apps.get_model("auth", "User")
    Review.objects.all().delete()
    User.objects.filter(username__in=["reviewer1", "reviewer2"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("reviews", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_reviews, reverse_code=unseed_reviews),
    ]
