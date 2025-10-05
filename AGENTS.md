# Codex Agent — DuneTube Project Guide

## 🎯 Mission
DuneTube یک پلتفرم آموزش و مشاوره ویدیویی است (ترکیب YouTube + آموزش).  
این Agent باید تسک‌های توسعه را بر اساس فایل ROADMAP.md اجرا کند، از جمله:
- ایجاد، تست و بهبود بخش‌های backend و frontend
- باز کردن Pull Requestها
- اجرای CI/CD و اطمینان از پایداری buildها

## 👥 Roles
- **architect** — تفسیر specs و تقسیم وظایف بین بخش‌ها  
- **backend-dev** — Django REST + JWT + PostgreSQL  
- **frontend-dev** — React + Vite + Tailwind + i18n  
- **infra-dev** — Docker Compose + CI/CD GitHub Actions  
- **qa** — تست خودکار و بررسی کیفیت کد  

## 🧩 Repository Structure


## 🔐 Workflow Rules
- Branch naming: `codex/feat-*`, `codex/fix-*`, `codex/chore-*`
- Commit format: Conventional Commits (`feat(scope): message`)
- PR title: `[Phase-X][P0|P1|P2] Short description`
- CI must pass before merge
- PR auto-merge allowed when green checks ✅

## 🧠 Agent Abilities
- خواندن ROADMAP.md و specs برای استخراج تسک‌ها
- ساخت Issue و Branch برای هر تسک
- ایجاد PR با کد و توضیح مناسب
- در صورت خطا → باز کردن Issue جدید با توضیح

## 📦 Labels
P0, P1, P2, Phase-1, Phase-2, backend, frontend, infra, docs, ci, enhancement, bug

## ✅ Definition of Done
- کد تمیز و lint شده (black, eslint)
- تست‌های اصلی پاس شده
- مستندات به‌روز
- اگر UI دارد → اسکرین‌شات یا GIF در PR
