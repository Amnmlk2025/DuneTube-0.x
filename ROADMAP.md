# 🗺️ DuneTube — Project Roadmap

## Phase-1 (MVP)
**هدف:** راه‌اندازی پایه‌ای سامانه (backend + frontend + infra + CI)

### Backend — P0
- [P0][backend] ایجاد پروژه Django + DRF + JWT Auth + healthz endpoint
- [P0][backend] تنظیم CORS + ساخت App `core`
- [P1][backend] ایجاد مدل Course و Lesson (CRUD ابتدایی)
- [P1][backend] مستند Swagger (drf-spectacular)

### Frontend — P0
- [P0][frontend] ساخت پروژه Vite + React + TS + Tailwind + i18n
- [P0][frontend] HealthCheck از API و نمایش در صفحه‌ی اصلی
- [P1][frontend] صفحه‌ی CourseList و CourseDetail با layout مشابه YouTube
- [P1][frontend] اضافه کردن i18n (fa/en)

### Infra — P1
- [P1][infra] ساخت فایل docker-compose.yml (api, web, db)
- [P1][infra] فایل‌های .env.example برای api و web
- [P2][infra] آماده‌سازی CI/CD در GitHub Actions

### Docs — P2
- [P2][docs] تکمیل README و توضیح اجرای لوکال
- [P2][docs] اضافه کردن دیاگرام معماری ساده (backend/frontend/infra)

---

## Phase-2 (Core Features)
**هدف:** افزودن قابلیت‌های آموزشی (Courses, Roles, Studio)

- [P0][backend] گسترش مدل Course (teacher, participants, stats)
- [P0][frontend] صفحه‌ی Studio و داشبورد مدرس
- [P1][backend] APIهای مدیریت ویدیو (آپلود mock)
- [P1][frontend] صفحه‌ی ویدیو و پخش‌کننده با نوار پیشرفت

---

## Phase-3 (Monetization & Social)
**هدف:** تعامل کاربران و درآمدزایی

- [P0][backend] Wallet + Transaction models (mock)
- [P0][frontend] صفحه‌ی کیف پول
- [P1][frontend] دکمه‌ی دنبال کردن و صفحات سازمانی
- [P2][backend] Notifications و Logs پایه

---

### 🧩 دستورالعمل Agent
برای هر مورد بالا:
- Issue با برچسب‌های `[Phase-X][PX]` و دامنه (`backend` / `frontend` / `infra`) بساز.  
- بر اساس Issue، شاخه‌ی `codex/...` ایجاد کن.  
- در PR از قالب `.github/pull_request_template.md` استفاده کن.  
- CI را اجرا کن؛ در صورت سبز بودن merge کن.
