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
