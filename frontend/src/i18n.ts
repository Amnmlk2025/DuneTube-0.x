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
        subtitle: "Discover curated lessons from Fremen survivalists, Bene Gesserit mentors, and Mentat strategists.",
        ctaCatalog: "Explore catalog",
        ctaHealth: "Check API health",
        healthStatus: {
          idle: "Tap the button to verify API status.",
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
        count: "{{count}} courses available.",
        price: "Price",
        language: "Language",
        publisher: "Publisher",
        teacher: "Teacher",
        learners: "{{count}} learners enrolled",
        rating: "Rating: {{rating}} / 5",
        tags: "Tags",
      },
      course: {
        loading: "Loading course...",
        titleFallback: "Course unavailable",
        actions: {
          backToCatalog: "Back to catalog",
        },
        meta: {
          price: "Tuition: {{price}}",
          language: "Language: {{language}}",
          learners: "{{count}} learners",
          rating: "Rating: {{rating}} / 5",
          publishedAt: "Published: {{date}}",
          teacher: "Instructor: {{teacher}}",
        },
        lessons: {
          title: "Lesson plan",
          empty: "Lessons will appear here soon.",
          lessonLabel: "Lesson {{order}}",
          preview: "Free preview",
          watch: "Watch lesson",
        },
        reviews: {
          title: "Learner reviews",
          empty: "No reviews yet.",
          rating: "Rating: {{rating}} / 5",
        },
        errors: {
          notFound: "Course not found.",
          generic: "We could not load this course. Please try again.",
        },
      },
      preferences: {
        currency: "Currency",
        dateStyle: "Date style",
        dateStyles: {
          short: "Short",
          medium: "Medium",
          long: "Long",
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
        catalog: "کاتالوگ",
      },
      hero: {
        title: "دانش جهان دون را به اشتراک بگذارید",
        subtitle: "از درس‌های گزیده بقا در میان فریمن تا مربی‌گری بنه جسریت و راهبردهای منتات بهره ببرید.",
        ctaCatalog: "مشاهده کاتالوگ",
        ctaHealth: "بررسی وضعیت API",
        healthStatus: {
          idle: "برای بررسی سلامت، دکمه را فشار دهید.",
          ok: "API سالم است.",
          fail: "بررسی سلامت API ناموفق بود.",
        },
      },
      catalog: {
        title: "کاتالوگ دوره‌ها",
        subtitle: "فهرست زنده از API دون‌تیوب.",
        loading: "در حال بارگذاری دوره‌ها...",
        error: "امکان بارگذاری دوره‌ها نبود. لطفاً دوباره تلاش کنید.",
        empty: "هنوز دوره‌ای موجود نیست.",
        count: "{{count}} دوره برای یادگیری آماده است.",
        price: "قیمت",
        language: "زبان",
        publisher: "منتشرکننده",
        teacher: "مدرس",
        learners: "{{count}} نفر شرکت کرده‌اند",
        rating: "امتیاز: {{rating}} از ۵",
        tags: "برچسب‌ها",
      },
      course: {
        loading: "در حال بارگذاری دوره...",
        titleFallback: "دوره در دسترس نیست",
        actions: {
          backToCatalog: "بازگشت به کاتالوگ",
        },
        meta: {
          price: "شهریه: {{price}}",
          language: "زبان: {{language}}",
          learners: "{{count}} نفر شرکت کرده‌اند",
          rating: "امتیاز: {{rating}} از ۵",
          publishedAt: "انتشار: {{date}}",
          teacher: "مدرس: {{teacher}}",
        },
        lessons: {
          title: "برنامه درسی",
          empty: "هنوز درسی اضافه نشده است.",
          lessonLabel: "درس {{order}}",
          preview: "پیش‌نمایش رایگان",
          watch: "مشاهده درس",
        },
        reviews: {
          title: "دیدگاه فراگیران",
          empty: "هنوز دیدگاهی ثبت نشده است.",
          rating: "امتیاز: {{rating}} از ۵",
        },
        errors: {
          notFound: "دوره پیدا نشد.",
          generic: "امکان بارگذاری دوره نبود. لطفاً دوباره تلاش کنید.",
        },
      },
      preferences: {
        currency: "واحد پول",
        dateStyle: "فرمت تاریخ",
        dateStyles: {
          short: "کوتاه",
          medium: "متوسط",
          long: "بلند",
        },
      },
      languageSwitcher: {
        label: "زبان",
      },
      footer: {
        rights: "تمام حقوق محفوظ است.",
      },
    },
  },
  ar: {
    translation: {
      nav: {
        home: "الرئيسية",
        catalog: "الدورات",
      },
      hero: {
        title: "شارك معرفة عالم دون",
        subtitle: "اكتشف دروسًا منتقاة من مقاتلي فريمن إلى مرشدات البِنَة جِسْريت ومخططي المنتات.",
        ctaCatalog: "استكشف الدورات",
        ctaHealth: "تحقق من صحة الـAPI",
        healthStatus: {
          idle: "اضغط الزر للتحقق من الحالة.",
          ok: "الـAPI يعمل بشكل جيد.",
          fail: "فشل فحص صحة الـAPI.",
        },
      },
      catalog: {
        title: "كتالوج الدورات",
        subtitle: "بيانات مباشرة من واجهة دون تيوب.",
        loading: "جاري تحميل الدورات...",
        error: "تعذر تحميل الدورات. حاول مرة أخرى.",
        empty: "لا توجد دورات متاحة بعد.",
        count: "{{count}} دورة جاهزة للاستكشاف.",
        price: "السعر",
        language: "اللغة",
        publisher: "الناشر",
        teacher: "المدرب",
        learners: "{{count}} متعلمًا مسجلاً",
        rating: "التقييم: {{rating}} من ٥",
        tags: "الوسوم",
      },
      course: {
        loading: "جاري تحميل الدورة...",
        titleFallback: "الدورة غير متاحة",
        actions: {
          backToCatalog: "العودة إلى الكتالوج",
        },
        meta: {
          price: "الرسوم: {{price}}",
          language: "اللغة: {{language}}",
          learners: "{{count}} متعلمًا",
          rating: "التقييم: {{rating}} من ٥",
          publishedAt: "تاريخ النشر: {{date}}",
          teacher: "المدرب: {{teacher}}",
        },
        lessons: {
          title: "منهج الدروس",
          empty: "لم تتم إضافة دروس بعد.",
          lessonLabel: "الدرس {{order}}",
          preview: "معاينة مجانية",
          watch: "مشاهدة الدرس",
        },
        reviews: {
          title: "مراجعات المتعلمين",
          empty: "لا توجد مراجعات حتى الآن.",
          rating: "التقييم: {{rating}} من ٥",
        },
        errors: {
          notFound: "لم يتم العثور على الدورة.",
          generic: "تعذر تحميل هذه الدورة. حاول مرة أخرى.",
        },
      },
      preferences: {
        currency: "العملة",
        dateStyle: "تنسيق التاريخ",
        dateStyles: {
          short: "قصير",
          medium: "متوسط",
          long: "طويل",
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
