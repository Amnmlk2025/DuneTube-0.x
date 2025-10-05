# DuneTube Backend

## Overview
The backend is built with Django REST Framework and Simple JWT authentication. Key endpoints:

- `POST /api/token/` – obtain access and refresh tokens.
- `POST /api/token/refresh/` – refresh an access token.
- `GET /healthz` – service health probe.
- `GET /api/courses/` – list available courses with search and ordering support.
- `GET /api/auth/roles/` – return the authenticated user's active and available roles.
- `POST /api/auth/roles/activate` – activate a role already assigned to the authenticated user.
- `GET /api/schema/` – OpenAPI schema document.
- `GET /api/docs/` – Swagger UI documentation.

## Seed Data
Migrations provision a developer account and sample courses.

- Username: `dev`
- Password: `dev123456`
- Roles: `student`, `creator`, `admin` (active by default).
- Sample catalog: six lore-friendly courses in English, Farsi, and Arabic.

Use the credentials above to generate JWT tokens and explore the API responses.
