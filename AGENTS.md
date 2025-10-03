# AGENTS.md — DuneTube Agent Playbook (ROLE: Developer)

## Role & Policy
- **Your role:** `Developer` (کدنویس و اجراکننده‌ی تسک‌ها).
- **Source of truth:** همین فایل.
- **Do not** ویرایش‌های تزئینی روی README انجام نده مگر در مراحل صراحتاً گفته شود.
- **Do not** ایجاد PR خودکار؛ مستقیم روی `main` پوش کن مگر خلافش ذکر شده باشد.
- **No `gh` CLI`.** فقط `git` با remote شامل `${GITHUB_TOKEN}`.
- **Working dir:** `/workspace/DuneTube-0.x`.

## Git Rules
1) تنظیم ریموت:
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/Amn1982/DuneTube-0.x.git
2) شاخه:
git fetch origin main || true
git checkout -B main
3) پوش:
git add -A
if ! git diff --cached --quiet; then
git commit -m "<meaningful message>"
git push -u origin main

fi


## Step 0 — Monorepo layout (one-time)
- بساز: `backend/`, `frontend/`, `infra/`, `specs/`, `docs/`, `.github/workflows/`.
- README ریشه را به «Monorepo overview» به‌روزرسانی کن (مختصر).
- **Commit:** `chore(scaffold): monorepo folders and docs`

## Step 1 — Backend MVP (Django REST)
### Must-haves
- `requirements.txt`:  
`Django`, `djangorestframework`, `drf-spectacular`, `django-cors-headers`,  
`python-dotenv`, `django-filter`, `djangorestframework-simplejwt`.
- پروژه `api/` + اپ `core/`.
- `settings.py`:
- فعال: `rest_framework`, `drf_spectacular`, `corsheaders`, `django_filters`, `core`.
- `REST_FRAMEWORK` با JWT auth و `DEFAULT_SCHEMA_CLASS`.
- `CORS_ALLOW_ALL_ORIGINS=True`, `ALLOWED_HOSTS=['*']`.
- URLs:
- `/api/schema/` و `/api/docs/` (Swagger/Redoc).
- JWT: `/api/token`, `/api/token/refresh`.
- Health: `/healthz`.
- مدل‌ها در `core/models.py`:
- `UserProfile(active_role)`, `RoleAssignment(user, role)`,  
 `Course(title, description, price_amount, price_currency, language, tags, thumbnail_url, publisher, created_at, updated_at)`.
- View/Serializer/Router:
- `CourseViewSet` با `search` و `ordering` (title/created_at/price_amount).
- `GET /api/auth/roles/` و `POST /api/auth/roles/activate`.
- Migrations + Seed dev:
- کاربر `dev/dev123456` و ۶ دوره‌ی نمونه.
- **Commit:** `feat(backend): Django REST + JWT + roles + courses + docs`

## Step 2 — Frontend MVP (React + Vite + TS + Tailwind)
### Must-haves
- Vite React TS + Tailwind config.
- i18n با `react-i18next` برای `fa/en/ar`.
- صفحات:
- `Home` با سوییچر زبان و لینک **Check API health** و لینک به Catalog.
- `Catalog` که `/api/courses/` را fetch و گرید کارت نمایش دهد.
- Router (`/`, `/catalog`).
- **Commit:** `feat(frontend): vite+ts+tailwind + i18n (fa/en/ar) + catalog grid`

## Step 3 — Infra & CI
- `backend/Dockerfile`, `frontend/Dockerfile`.
- `infra/compose.dev.yml` با سرویس‌های `db (postgres)`, `api`, `web`.
- CI:
- `.github/workflows/backend-ci.yml`: setup python, install reqs, `manage.py check`, `migrate`.
- `.github/workflows/frontend-ci.yml`: setup node, `npm ci`/`npm i`, `npm run build`.
- **Commit:** `chore(infra,ci): compose dev and CI workflows`

## Step 4 — Push & Verify
- با قوانین Git Rules بالا، همه‌ی Commitها را روی `main` پوش کن.
- پس از پوش، خروجی buildهای GitHub Actions را بررسی کن.

## Definition of Done (Phase-2)
- `http://localhost:8000/healthz` → `{"ok": true, "service": "dunetube-api"}`.
- Swagger روی `/api/docs`.
- `/api/courses/` لیست دوره‌های seed را برگرداند.
- فرانت روی `/` رندر و روی `/catalog` دوره‌ها دیده شوند.
- CI هر دو جاب سبز.

## Prohibited
- تغییر فلسفه‌ی شاخه‌ها، حذف محتوا، تولید متن‌های placeholder غیرلازم.
- استفاده از ابزار سیستمی خارج از git/node/python موردنیاز.
