from collections import Counter

import pytest
from rest_framework.test import APIClient

from courses.models import Course
from lessons.models import Lesson


@pytest.mark.django_db
def test_health_endpoint():
    client = APIClient()
    response = client.get("/api/healthz/")
    assert response.status_code == 200
    assert response.json() == {"ok": True, "service": "dunetube-api"}


@pytest.mark.django_db
def test_courses_list_returns_seeded_data():
    client = APIClient()
    response = client.get("/api/courses/")
    assert response.status_code == 200
    payload = response.json()
    assert "results" in payload
    assert payload["count"] >= 10
    assert len(payload["results"]) > 0
    sample = payload["results"][0]
    assert {"id", "title", "publisher", "teacher", "thumbnail_url"}.issubset(sample.keys())
    publishers = Counter(item["publisher"]["slug"] for item in payload["results"])
    assert publishers, "Expected publisher data in course payload."


@pytest.mark.django_db
def test_lessons_filtering_and_ordering():
    course = Course.objects.first()
    assert course is not None, "Seed courses missing."
    assert Lesson.objects.filter(course=course).exists()

    client = APIClient()
    response = client.get(f"/api/lessons/?course={course.id}&ordering=order")
    assert response.status_code == 200
    lessons = response.json()
    assert len(lessons) >= 3
    orders = [item["order"] for item in lessons]
    assert orders == sorted(orders)
    assert all(item["course"] == course.id for item in lessons)


@pytest.mark.django_db
def test_jwt_token_flow_and_profile_me():
    client = APIClient()
    token_response = client.post(
        "/api/token/",
        {"username": "dev", "password": "dev123456"},
        format="json",
    )
    assert token_response.status_code == 200
    tokens = token_response.json()
    assert "access" in tokens and "refresh" in tokens

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    profile_response = client.get("/api/profile/me/")
    assert profile_response.status_code == 200
    profile = profile_response.json()
    assert profile["username"] == "dev"
    assert profile["profile"]["roles"], "Expected roles in profile payload."

    refresh_response = client.post(
        "/api/token/refresh/",
        {"refresh": tokens["refresh"]},
        format="json",
    )
    assert refresh_response.status_code == 200
    assert "access" in refresh_response.json()
