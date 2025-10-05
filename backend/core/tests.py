from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile


class CoreApiTests(APITestCase):
    def setUp(self):
        # Ensure seed data is available via migrations
        self.profile = UserProfile.objects.select_related("user").first()
        if not self.profile:
            raise AssertionError("Seed data missing")
        self.user = self.profile.user
        self.refresh = RefreshToken.for_user(self.user)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.refresh.access_token}"}

    def test_health_endpoint(self):
        response = self.client.get("/healthz")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"ok": True, "service": "dunetube-api"})

    def test_courses_seeded(self):
        response = self.client.get("/api/courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 6)

    def test_role_endpoints(self):
        response = self.client.get("/api/auth/roles/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("active_role", data)
        self.assertIn("available_roles", data)
        self.assertGreaterEqual(len(data["available_roles"]), 1)

        activate_response = self.client.post(
            "/api/auth/roles/activate",
            data={"role": data["available_roles"][0]},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(activate_response.status_code, status.HTTP_200_OK)
        self.assertEqual(activate_response.json()["active_role"], data["available_roles"][0])

        bad_response = self.client.post(
            "/api/auth/roles/activate",
            data={"role": "non-existent"},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(bad_response.status_code, status.HTTP_400_BAD_REQUEST)
