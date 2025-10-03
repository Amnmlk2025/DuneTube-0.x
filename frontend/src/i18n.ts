import i18n from "i18next";
import { initReactI18next } from "react-i18next";

type LanguageCode = "en" | "fa" | "ar";

type SupportedLanguage = {
  code: LanguageCode;
  label: string;
};

const STORAGE_KEY = "dunetube.lang";

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        catalog: "Catalog",
      },
      hero: {
        title: "Share the knowledge of the Dune universe",
        subtitle:
          "Discover curated lessons from Fremen survivalists, Bene Gesserit mentors, and Mentat strategists.",
        ctaCatalog: "Explore catalog",
        ctaHealth: "Check API health",
        healthStatus: {
          idle: "",
          ok: "API is healthy.",
          fail: "API health check failed.",
        },
      },
      catalog: {
        title: "Course Catalog",
        subtitle: "Live data fetched from the DuneTube API.",
        loading: "Loading courses...",
        error: "Unable to load courses. Please try again.",
        empty: "No courses are available yet.",
        price: "Price",
        language: "Language",
        publisher: "Publisher",
        tags: "Tags",
      },
      course: {
        state: {
          loading: "Loading course...",
          noLessons: "Lessons will appear here soon.",
          selectLesson: "Select a lesson to begin.",
        },
        tabs: {
          overview: "Overview",
          lessons: "Lessons",
          notes: "Notes",
        },
        meta: {
          language: "Language: {{language}}",
          price: "Price: {{price}} {{currency}}",
          publisher: "Publisher",
          languageLabel: "Language",
          priceLabel: "Price",
        },
        actions: {
          back: "Go back",
        },
        player: {
          resume: "Resume from {{time}}",
          start: "Start lesson",
          noSupport: "Your browser does not support HTML5 video.",
          authHint: "Sign in with the dev account to sync your playback position.",
        },
        notes: {
          authRequired: "Sign in to create and manage notes.",
          lessonLabel: "Lesson",
          selectLesson: "Select a lesson",
          bodyLabel: "Note",
          placeholder: "Write your note here...",
          timestampLabel: "Timestamp (seconds)",
          useCurrentTime: "Use current time",
          saving: "Saving...",
          save: "Save note",
          loading: "Loading notes...",
          empty: "Your notes will appear here.",
          delete: "Delete note",
        },
        errors: {
          notFound: "Course not found.",
          generic: "We could not load this course. Please try again.",
          lessons: "Unable to load lessons for this course.",
          notesAuth: "You need to authenticate to load notes.",
          notes: "Unable to load notes. Try again.",
          notesCreate: "Unable to save your note. Try again.",
          notesDelete: "Unable to delete the note.",
        },
      },
      languageSwitcher: {
        label: "Language",
      },
      footer: {
        rights: "All rights reserved.",
      },
    },
  },
  fa: {
    translation: {
      nav: {
        home: "خانه",
        catalog: "کتابخانه دوره‌ها",
      },
      hero: {
        title: "دانش جهان تپه را به اشتراک بگذارید",
        subtitle:
          "دوره‌های برگزیده از فرمن‌ها، بانوان بن جسرایت و منتات‌ها را کشف کنید.",
        ctaCatalog: "مشاهده دوره‌ها",
        ctaHealth: "بررسی وضعیت API",
        healthStatus: {
          idle: "",
          ok: "رابط برنامه سالم است.",
          fail: "بررسی سلامت با خطا مواجه شد.",
        },
      },
      catalog: {
        title: "کتابخانه دوره‌ها",
        subtitle: "داده‌ها به صورت زنده از API دون‌تیوب واکشی می‌شوند.",
        loading: "در حال بارگذاری دوره‌ها...",
        error: "بارگذاری دوره‌ها ممکن نشد. لطفاً دوباره تلاش کنید.",
        empty: "هنوز دوره‌ای موجود نیست.",
        price: "قیمت",
        language: "زبان",
        publisher: "انتشاردهنده",
        tags: "برچسب‌ها",
      },
      course: {
        state: {
          loading: "در حال بارگذاری دوره...",
          noLessons: "درس‌ها به زودی در اینجا نمایش داده می‌شوند.",
          selectLesson: "یک درس را برای شروع انتخاب کنید.",
        },
        tabs: {
          overview: "نمای کلی",
          lessons: "درس‌ها",
          notes: "یادداشت‌ها",
        },
        meta: {
          language: "زبان: {{language}}",
          price: "قیمت: {{price}} {{currency}}",
          publisher: "انتشاردهنده",
          languageLabel: "زبان",
          priceLabel: "قیمت",
        },
        actions: {
          back: "بازگشت",
        },
        player: {
          resume: "ادامه از {{time}}",
          start: "شروع درس",
          noSupport: "مرورگر شما از ویدئوی HTML5 پشتیبانی نمی‌کند.",
          authHint: "برای ذخیره موقعیت پخش، با حساب توسعه‌دهنده وارد شوید.",
        },
        notes: {
          authRequired: "برای ایجاد و مدیریت یادداشت‌ها باید وارد شوید.",
          lessonLabel: "درس",
          selectLesson: "یک درس را انتخاب کنید",
          bodyLabel: "یادداشت",
          placeholder: "یادداشت خود را اینجا بنویسید...",
          timestampLabel: "زمان (ثانیه)",
          useCurrentTime: "استفاده از زمان فعلی",
          saving: "در حال ذخیره...",
          save: "ذخیره یادداشت",
          loading: "در حال بارگذاری یادداشت‌ها...",
          empty: "یادداشت‌های شما اینجا نمایش داده می‌شوند.",
          delete: "حذف یادداشت",
        },
        errors: {
          notFound: "دوره یافت نشد.",
          generic: "بارگذاری این دوره ممکن نشد. دوباره تلاش کنید.",
          lessons: "بارگذاری درس‌های دوره با خطا مواجه شد.",
          notesAuth: "برای مشاهده یادداشت‌ها باید احراز هویت شوید.",
          notes: "بارگذاری یادداشت‌ها با خطا مواجه شد. دوباره تلاش کنید.",
          notesCreate: "ذخیره یادداشت ممکن نشد. دوباره تلاش کنید.",
          notesDelete: "حذف یادداشت انجام نشد.",
        },
      },
      languageSwitcher: {
        label: "زبان",
      },
      footer: {
        rights: "تمامی حقوق محفوظ است.",
      },
    },
  },
  ar: {
    translation: {
      nav: {
        home: "الرئيسية",
        catalog: "دليل الدورات",
      },
      hero: {
        title: "انشر معرفة عالم الكثبان",
        subtitle:
          "اكتشف دروسًا منتقاة من الفريمين وأخوات البيني جسرِت ومنتات الاستراتيجيات.",
        ctaCatalog: "استعرض الدورات",
        ctaHealth: "تحقق من صحة الواجهة",
        healthStatus: {
          idle: "",
          ok: "واجهة برمجة التطبيقات تعمل بشكل جيد.",
          fail: "فشل التحقق من الصحة.",
        },
      },
      catalog: {
        title: "دليل الدورات",
        subtitle: "يتم جلب البيانات مباشرة من واجهة دون تيوب.",
        loading: "جاري تحميل الدورات...",
        error: "تعذر تحميل الدورات. حاول مرة أخرى لاحقًا.",
        empty: "لا توجد دورات متاحة حاليًا.",
        price: "السعر",
        language: "اللغة",
        publisher: "الناشر",
        tags: "الوسوم",
      },
      course: {
        state: {
          loading: "جاري تحميل الدورة...",
          noLessons: "سيتم عرض الدروس هنا قريبًا.",
          selectLesson: "اختر درسًا للبدء.",
        },
        tabs: {
          overview: "نظرة عامة",
          lessons: "الدروس",
          notes: "الملاحظات",
        },
        meta: {
          language: "اللغة: {{language}}",
          price: "السعر: {{price}} {{currency}}",
          publisher: "الناشر",
          languageLabel: "اللغة",
          priceLabel: "السعر",
        },
        actions: {
          back: "رجوع",
        },
        player: {
          resume: "استئناف من {{time}}",
          start: "ابدأ الدرس",
          noSupport: "المتصفح لا يدعم فيديو HTML5.",
          authHint: "سجّل الدخول بحساب المطور لمزامنة موضع التشغيل.",
        },
        notes: {
          authRequired: "يلزم تسجيل الدخول لإنشاء الملاحظات وإدارتها.",
          lessonLabel: "الدرس",
          selectLesson: "اختر درسًا",
          bodyLabel: "ملاحظة",
          placeholder: "اكتب ملاحظتك هنا...",
          timestampLabel: "الطابع الزمني (ثوانٍ)",
          useCurrentTime: "استخدام الوقت الحالي",
          saving: "جارٍ الحفظ...",
          save: "احفظ الملاحظة",
          loading: "جارٍ تحميل الملاحظات...",
          empty: "ستظهر ملاحظاتك هنا.",
          delete: "حذف الملاحظة",
        },
        errors: {
          notFound: "لم يتم العثور على الدورة.",
          generic: "تعذر تحميل هذه الدورة. حاول مرة أخرى.",
          lessons: "تعذر تحميل دروس هذه الدورة.",
          notesAuth: "يلزم تسجيل الدخول لعرض الملاحظات.",
          notes: "تعذر تحميل الملاحظات. حاول مرة أخرى.",
          notesCreate: "تعذر حفظ الملاحظة. حاول مرة أخرى.",
          notesDelete: "تعذر حذف الملاحظة.",
        },
      },
      languageSwitcher: {
        label: "اللغة",
      },
      footer: {
        rights: "جميع الحقوق محفوظة.",
      },
    },
  },
};

const supportedLanguages: SupportedLanguage[] = [
  { code: "en", label: "English" },
  { code: "fa", label: "فارسی" },
  { code: "ar", label: "العربية" },
];

const rtlLanguages = new Set<LanguageCode>(["fa", "ar"]);

const getInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") {
    return "en";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (stored && supportedLanguages.some((lang) => lang.code === stored)) {
    return stored;
  }
  const browser = window.navigator.language?.slice(0, 2) as LanguageCode | undefined;
  if (browser && supportedLanguages.some((lang) => lang.code === browser)) {
    return browser;
  }
  return "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window === "undefined") {
    return;
  }
  const language = lng as LanguageCode;
  window.localStorage.setItem(STORAGE_KEY, language);
  document.documentElement.lang = language;
  document.documentElement.dir = rtlLanguages.has(language) ? "rtl" : "ltr";
});

export { supportedLanguages, rtlLanguages };
export type { LanguageCode, SupportedLanguage };

export default i18n;
