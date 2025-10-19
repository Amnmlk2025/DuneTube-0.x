# AGENTS.md — DuneTube Agent Playbook (ROLE: Developer, SAFE MODE)

> **Source of truth = همین فایل.**  
> اگر هر سند دیگری (مثل codex_run_phase1_2.txt یا frontend.md) با این فایل تعارض داشت، این فایل ارجح است.  
> هدف: اجرای امن، مرحله‌ای و کنترل‌شدهٔ تمام کارها توسط Codex **بدون هیچ تغییر مستقیم در frontend/** مگر پس از تأیید انسانی.

---

## 1) Role & Global Policy

- **Role:** Developer (Agent کدنویس با سطح دسترسی محدود)
- **Frontend is PROTECTED:** مسیر `frontend/**` فقط قابل خواندن است؛ هیچ ویرایشی نباید مستقیماً روی آن انجام شود.
- **Proposal-first:** هر تغییری در UI یا کدهای فرانت باید فقط به‌صورت **پیشنهاد (proposal)** در مسیر `docs/codex_proposals/frontend/` تولید شود.
- **Reports:** بعد از هر گام (Step) باید گزارشی به `docs/codex_reports/` افزوده شود.
- **No auto PRs:** اجازهٔ ایجاد Pull Request خودکار وجود ندارد.
- **Git write policy:** فقط در branch‌های `codex/<task>` بنویس. مرج به `main` فقط پس از تأیید انسان.
- **Working dir:** `/workspace/DuneTube-0.x`
- **Language:** تمام گزارش‌ها و توضیحات به انگلیسی؛ توضیحات بیزینسی دو‌زبانه مجاز است.

---

## 2) Protected vs Allowed Write Scopes

### PROTECTED_PATHS  (هیچ نوشتنی مجاز نیست)
```

frontend/**

```

### ALLOWED WRITES (مجاز)
```

backend/**
infra/**
docs/**
scripts/**

# استثنا برای Artefactهای پیشنهادی و گزارش‌ها:

docs/codex_proposals/frontend/**
docs/codex_reports/**
.vscode/settings.json  # فقط برای گاردهای ReadOnly و Preview

````

---

## 3) Proposal System (فرمت و مسیر ذخیره)

### A. تغییر فایل‌های موجود (Edits)
- خروجی به‌صورت unified diff (`.patch`)
- مسیر: `docs/codex_proposals/frontend/STEP_##__<relative-path>.patch`

### B. فایل‌های جدید (Components, Pages, Helpers)
- خروجی به‌صورت فایل `*.proposal.tsx` با هدر:
  ```tsx
  /**
   * PROPOSAL ONLY — NOT APPLIED
   * REVIEW: این فایل صرفاً پیشنهاد است. بدون تأیید انسان اجرا یا import نشود.
   * Notes: هدف، وابستگی‌ها، محل Mount.
   */
  // TODO[REVIEW]: توضیحات تکمیلی...
````

* مسیر ذخیره:
  `docs/codex_proposals/frontend/STEP_##__<relative-path>.proposal.tsx`

### C. نشانه‌گذاری درون کد

* برای بلوک‌های نیازمند بازبینی:

  ```tsx
  {/* REVIEW: proposed block */}
  ```

---

## 4) Reporting (لاگ و چک‌لیست)

* فایل گزارش هر روز یا هر مرحله:

  ```
  docs/codex_reports/YYYY-MM-DD_codex_report.md
  ```
* هر Step باید شامل موارد زیر باشد:

  1. **Step ID & Title**
  2. Summary از اقدامات و دلیل
  3. لیست proposalهای تولیدشده (patch / tsx)
  4. چک‌لیست `[ ]` برای تأیید دستی
  5. پیشنهاد گام بعدی (Next Step)

---

## 5) VS Code Safeguards

در فایل `.vscode/settings.json` اضافه یا ادغام شود:

```json
{
  "files.readonlyInclude": { "frontend/**": true },
  "codex.previewOnly": true,
  "codex.requireConfirmation": true,
  "codex.maxChangesPerRun": 30
}
```

> اگر افزونه از کلیدهای دیگری استفاده می‌کند، Codex باید آن‌ها را کشف کرده و در گزارش بنویسد (حدس نزن).

---

## 6) Git Rules

1. **Remote Setup (اختیاری)**

   ```bash
   git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/Amn1982/DuneTube-0.x.git
   ```

2. **Branching:**

   ```bash
   git fetch origin main || true
   git checkout -B main
   git checkout -B codex/<step-id>
   ```

3. **Commit & Push:**

   ```bash
   git add -A
   if ! git diff --cached --quiet; then
     git commit -m "<type(scope): message>"
     git push -u origin codex/<step-id>
   fi
   ```

4. **Merge:**
   هیچ مرجی به main انجام نشود مگر پس از تأیید دستی.

---

## 7) Chunked Steps (برای جلوگیری از مصرف زیاد توکن)

هر Step در یک اجرا انجام شود و پس از تأیید انسانی Step بعدی آغاز گردد.

---

### Step 01 — Workspace Audit & Guardrails

* اسکن ساختار ریپو
* نصب گاردهای VSCode
* ایجاد گزارش اولیه

**Commit:** `chore(guardrails): vscode readonly & report skeleton`

---

### Step 02 — Frontend Delta Analysis

* تحلیل اختلاف فرانت موجود با MVP Studio
* تولید طرح تغییرات در `docs/codex_proposals/frontend/STEP_02__plan.md`

**Commit:** `docs(studio): plan for frontend proposals (no code changes)`

---

### Step 03 — Studio Fixes (Batch A)

* ایجاد proposal برای اصلاحات جزئی Studio (null-checks, متن‌ها, UX جزئی)
* فقط در مسیر proposals ذخیره شود.

**Commit:** `docs(proposal): studio fixes batch A (patch/proposal only)`

---

### Step 04 — Studio Enhancements (Batch B)

* پیشنهاد کامپوننت‌های جدید کوچک (Badge, EmptyState, Skeleton)
* فقط فایل proposal
* توضیح محل mount در header فایل

**Commit:** `docs(proposal): studio enhancements batch B`

---

### Step 05 — Backend Scaffolding

* ایجاد اسکلت Django REST Framework:

  * apps: courses, lessons, attachments, migration
  * مدل‌ها، serializerها، viewsetها
* (اختیاری) infra/docker-compose.yml
* README اجرای backend

**Commit:** `feat(backend): drf scaffold + endpoints skeleton`

---

### Step 06 — Integration Notes

* مستند اتصال فرانت به بک‌اند (endpointها و محل استفاده در Studio)
* ذخیره در `docs/codex_proposals/frontend/STEP_06__integration.md`

**Commit:** `docs(integration): how frontend would call backend`

---

### Step 07 — Sanity Checks & Summary

* تست backend و infra (دستورات اجرا)
* جمع‌بندی proposalها + چک‌لیست تأیید

**Commit:** `docs(report): summary and approval checklist`

---

## 8) Definition of Done (برای هر Step)

* هیچ تغییری در `frontend/**` اعمال نشده باشد مگر در قالب proposal.
* Artefactهای پیشنهادی در `docs/codex_proposals/frontend/**` ذخیره شده باشند.
* گزارش روز مربوطه در `docs/codex_reports/` به‌روز شده باشد.
* Backend و infra (در Step مجاز) حداقل Build/Test را پاس کنند.
* هر Step روی branch جدا push شده باشد.

---

## 9) بعد از تأیید انسانی (Apply Proposal)

وقتی یکی از proposalها تأیید شد:

* Step جدید بساز: `Step APPLY-<ID>`
* فقط همان patch یا proposal را به frontend اعمال کن.
* قبل از نوشتن، Diff را نمایش بده.
* سپس commit:

  ```
  git add -A
  git commit -m "feat(frontend): apply approved proposal <id>"
  git push -u origin codex/apply-<id>
  ```

---

## 10) Prohibited Actions

🚫 تغییر مستقیم هر فایلی زیر frontend/**
🚫 مرج خودکار یا push به main
🚫 حذف یا بازنویسی docs/codex_proposals یا reports
🚫 Restyle/Refactor عمومی خارج از محدودهٔ Studio
🚫 افزودن dependency جدید بدون توضیح در proposal

---

## 11) Notes

* اگر افزونهٔ VS Code کلید تنظیم متفاوتی دارد، Codex باید آن را در گزارش بنویسد.
* اگر تغییری به dependency جدید وابسته است، فقط در proposal توضیح دهد و نصب نکند.
* اگر در هر Step ابهام دارد، خروجی را در گزارش ذکر کند و منتظر دستور انسانی بماند.

---

### TL;DR (خلاصه برای Codex)

1. **Frontend ممنوع برای ویرایش مستقیم.**
2. هر تغییر → proposal در `docs/codex_proposals/frontend/`
3. هر Step → برنچ جدا + گزارش Markdown
4. backend/infra → مجاز به تغییر واقعی
5. Apply proposals فقط پس از تأیید دستی
6. تمام فعالیت‌ها مستند و مرحله‌ای با حداقل مصرف توکن.
