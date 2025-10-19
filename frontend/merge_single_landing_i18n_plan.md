# Dunetube — Merge to Single Landing & Fix i18n (FA)
**Objective:** داشتن فقط یک صفحه‌ی لندینگ (/)، ادغام محتوای «Catalog/فهرست دوره‌ها» در همین صفحه، حذف/ریدایرکت مسیر اضافه، و یکپارچه‌سازی زبان فارسی (RTL) در کل UI.

---

## پیشرفت (Codex Progress)
- ✅ انجام شده و کامیت شد
- 🚧 در حال انجام
- ⏳ هنوز انجام نشده

> در هر مرحله، بعد از اعمال تغییرات: تست سریع + Commit + به‌روزرسانی وضعیت همین فایل.

---

## فاز 1 — ادغام صفحات (Home + Catalog → Home)
**هدف:** همه‌ی بخش‌های مفید صفحه‌ی «Catalog/فهرست دوره‌ها» به `Home.tsx` منتقل شود و تنها یک لندینگ وجود داشته باشد.

**گام‌ها:**
1. شناسایی فایل‌ها (فرض متداول، بسته به پروژه):
   - `src/pages/Home.tsx`  ← صفحه لندینگ اصلی
   - `src/pages/Catalog.tsx` یا `src/pages/Courses.tsx`  ← صفحه اضافی
   - `src/components/*`  ← سکشن‌ها/کامپوننت‌های استفاده‌شده در کاتالوگ
2. هر سکشن مفید از Catalog (مثلاً Hero، CTA، Grid دوره‌ها، متریک‌ها) را به صورت کامپوننت مجزا استخراج کن (اگر نیست):
   - `src/components/Hero.tsx`
   - `src/components/StatsBar.tsx`
   - `src/components/CoursesGrid.tsx` (می‌تواند همان Grid موجود Home باشد)
3. `Home.tsx` را بازسازی کن تا شامل این سکشن‌ها باشد:
   - Header (مینیمال)
   - Hero (تیتر «دانش آراکیس را استریم کن»)
   - FiltersBar
   - CoursesGrid (توصیه‌ها/محبوب/جدیدها)
   - Rails: Shorts + Exams
   - Footer
4. در صورت تداخل، فقط یک Grid دوره‌ها نگه‌دار (بدون مرز، سفید).
5. **Commit:** `feat(ui): merge catalog into single landing page`

**وضعیت:** ✅ تکمیل شد (لندینگ شبیه یوتیوب با Carousel + گرید ۵۰تایی)

---

## فاز 2 — حذف/ریدایرکت مسیر اضافه
**هدف:** مسیر /catalog (یا مشابه) حذف یا به / ریدایرکت شود؛ تمام لینک‌ها به صفحه‌ی اضافی پاک شوند.

**گام‌ها:**
1. در فایل روتر (معمولاً یکی از این‌ها):
   - `src/main.tsx` یا `src/App.tsx` یا `src/router.tsx`
2. مسیر قبلی را حذف و ریدایرکت اضافه کن:
   ```tsx
   // نمونه با React Router v6
   import { Navigate } from 'react-router-dom';
   // ...
   <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/catalog" element={<Navigate to="/" replace />} />
     <Route path="*" element={<Navigate to="/" replace />} />
   </Routes>
   ```
3. هر جایی از Header/Footers که لینکی به `/catalog` دارد را حذف یا به `/` تغییر بده.
4. **Commit:** `chore(router): remove catalog route and redirect to /`

**وضعیت:** ✅ ریدایرکت /catalog → / و حذف Route

---

## فاز 3 — یکپارچه‌سازی زبان فارسی و RTL
**هدف:** وقتی کاربر فارسی را انتخاب می‌کند، کل UI فارسی و راست‌به‌چپ شود و باقی نماندن هیچ متن انگلیسی روی صفحه.

**گام‌ها:**
1. **Persist زبان:** اگر انتخاب زبان انجام می‌شود، مقدار آن را در `localStorage.setItem('lang','fa')` ذخیره و در بوت اپ خوانده شود.
2. **dir/lang روی html:** در روت اپ پس از تعیین زبان، ویژگی‌های زیر اعمال شوند:
   ```ts
   const lang = localStorage.getItem('lang') || 'fa';
   document.documentElement.setAttribute('lang', lang);
   document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
   ```
3. **i18n منابع فارسی:** مطمئن شو تمام متن‌های صفحه Home از فایل‌های ترجمه می‌آیند (نه هاردکد انگلیسی). اگر فایل‌ها وجود ندارد:
   - `src/i18n/fa.json`, `src/i18n/en.json`
   - نمونه کلیدها:
     ```json
     {
       "hero.title": "جریان دانش آراکـیس را استریم کن",
       "hero.subtitle": "درس‌های سینمایی از مربیان بنام، مخصوص یادگیرندگان حرفه‌ای",
       "filters.all": "همه",
       "sections.shorts": "ویدیوهای کوتاه",
       "sections.courses": "فید دوره‌ها",
       "sections.exams": "آزمون‌ها",
       "actions.viewAll": "مشاهده همه"
     }
     ```
4. **جایگزینی متن‌ها:** در `Home.tsx` و کامپوننت‌ها از هوک ترجمه استفاده کن (مثلاً `useTranslation`).
5. **فونت و راست‌چین:** اطمینان از اعمال `text-right` و کلاس‌های RTL در سکشن‌های متنی (در صورت نیاز).
6. **Commit:** `fix(i18n): enforce FA as default with RTL and translate Home`

**وضعیت:** ✅ زبان پیش‌فرض فارسی + i18n/RTL تکمیل

---

## فاز 4 — پاک‌سازی UI و لینک‌ها
**هدف:** حذف تمام ارجاعات و import های بدون استفاده از صفحه‌ی حذف‌شده و یک‌دست‌سازی دکمه‌ها/رنگ‌ها.

**گام‌ها:**
1. حذف فایل صفحه‌ی قدیمی اگر دیگر استفاده نمی‌شود (یا نگه‌داشتن برای مرجع اما خارج از مسیر build).
2. جست‌وجوی `catalog` و جایگزینی لینک‌ها با `/`.
3. بررسی header برای حذف «فهرست دوره‌ها» اگر اضافه است.
4. **Commit:** `chore(ui): clean unused imports and links after merge`

**وضعیت:** ✅ لینک‌ها پاک‌سازی و فایل Catalog حذف شد

---

## فاز 5 — QA و مرور نهایی
**چک‌لیست:**
- [x] فقط مسیر `/` صفحه‌ی لندینگ را نشان می‌دهد؛ `/catalog` → ریدایرکت به `/`
- [x] تمام متن‌ها فارسی و راست‌به‌چپ هستند
- [x] کارت‌ها بدون مرز، پس‌زمینه کلی سفید
- [x] رنگ آبی عمیق/ماسه‌ای فقط در لوگو/CTA/هایلایت‌ها
- [x] ریل‌های Shorts/Exams و گرید دوره‌ها داده را نمایش می‌دهند

**Commit:** `test(ui): pass single-landing & fa-rtl QA`

**وضعیت:** ✅ QA مرور شد و تست‌ها پاس شدند

---

## نکات فنی سریع (راهنما برای Codex)
- اگر پروژه از React Router v6 استفاده می‌کند، برای ریدایرکت از `<Navigate />` بهره ببر.
- سعی کن همه‌ی متن‌های دکمه‌ها و تیترها از i18n خوانده شوند تا دوباره انگلیسی باقی نماند.
- تنظیم `dir` روی `<html>` از مشکلات چیدمان RTL جلوگیری می‌کند؛ اگر Tailwind RTL plugin نداری، با کلاس‌های utility (`text-right`, `flex-row-reverse`) هم قابل مدیریت است.
- در صورت وجود فایل `Header.tsx` که دکمه «فهرست دوره‌ها» دارد، آن آیتم را حذف یا به `/` تغییر بده.
