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
      layout: {
        tagline: "Stream Arrakis wisdom",
      },
      nav: {
        home: "Home",
        catalog: "Catalog",
      },
      hero: {
        badge: "New lessons daily",
        title: "Stream the knowledge of Arrakis",
        subtitle:
          "Discover cinematic lessons from Fremen survivalists, Bene Gesserit mentors, and Mentat strategists—curated for lifelong learners.",
        ctaCatalog: "Browse catalog",
        ctaHealth: "Check API health",
        healthStatus: {
          idle: "Tap the health button to confirm the API is ready.",
          checking: "Checking API health...",
          ok: "API is healthy.",
          fail: "API health check failed.",
        },
        infocard: {
          title: "Mentat Metrics",
          subtitle: "Curated playlists keep your guild sharp.",
          metricsTitle: "Community learners",
          learners: "active explorers",
          caption: "Powered by the spice of shared knowledge.",
        },
      },
      home: {
        actions: {
          viewCatalog: "Open catalog",
        },
        rails: {
          featuredTitle: "Featured for you",
          featuredSubtitle: "High-signal courses, boosted by Mentat recommendations.",
          latestTitle: "Latest arrivals",
          latestSubtitle: "Fresh drops from trusted creators across the Dune universe.",
          error: "We could not load spotlight courses. Please try again.",
          empty: "Courses will appear here once instructors publish them.",
        },
      },
      catalog: {
        title: "Course catalog",
        subtitle: "Live data fetched straight from the DuneTube API.",
        count: "{{count}} courses ready to stream.",
        loading: "Loading courses...",
        error: "Unable to load courses. Please try again.",
        empty: "No courses match your filters yet.",
        searchPlaceholder: "Search by title, publisher, mentor, or tag…",
        searchAction: "Search",
        clear: "Clear",
        sortLabel: "Sort",
        sortOptions: {
          newest: "Newest",
          title: "Title A-Z",
          priceAsc: "Price · Low to high",
          priceDesc: "Price · High to low",
        },
        reset: "Reset filters",
        paginationStatus: "Page {{page}} of {{totalPages}}",
        prev: "Prev",
        next: "Next",
        teacherLabel: "Taught by {{teacher}}",
        teacherUnknown: "Unknown mentor",
        learners: "{{count}} learners enrolled",
        tags: "Tags",
        priceLabel: "Tuition",
      },
      course: {
        actions: {
          backToCatalog: "Back to catalog",
        },
        errors: {
          notFound: "Course not found.",
          generic: "We could not load this course. Please try again.",
        },
        meta: {
          price: "Tuition: {{price}}",
          language: "Language: {{language}}",
          learners: "{{count}} learners",
          rating: "Rating: {{rating}} / 5",
          publishedAt: "Published: {{date}}",
          teacher: "Instructor: {{teacher}}",
          teacherUnknown: "Unknown instructor",
          priceLabelShort: "Tuition",
          footer: "Pricing adapts to your locale preferences.",
        },
        lessons: {
          title: "Lesson plan",
          count: "{{count}} lessons",
          empty: "Lessons will appear here soon.",
          lessonLabel: "Lesson {{order}}",
          preview: "Free preview",
          watch: "Watch lesson",
        },
        reviews: {
          title: "Learner reviews",
          count: "{{count}} reviews",
          empty: "No reviews yet.",
          rating: "Rating: {{rating}} / 5",
        },
      },
      languageSwitcher: {
        label: "Language",
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
      footer: {
        rights: "All rights reserved.",
      },
    },
  },
  fa: {
    translation: {
      layout: {
        tagline: "جریان دانش آراکیس",
      },
      nav: {
        home: "خانه",
        catalog: "فهرست",
      },
      hero: {
        badge: "درس‌های تازه هر روز",
        title: "دانش سیاره آراکیس را استریم کن",
        subtitle:
          "درس‌های ویدیویی از فریمن‌ها، معلمان بنه جسرت و منتات‌ها را کشف کن؛ همه به‌صورت منتخب برای یادگیرنده‌های جدی.",
        ctaCatalog: "مشاهده فهرست",
        ctaHealth: "بررسی سلامت API",
        healthStatus: {
          idle: "برای اطمینان از آماده بودن API دکمه را بزن.",
          checking: "در حال بررسی سلامت API...",
          ok: "API سالم است.",
          fail: "بررسی سلامت API ناموفق بود.",
        },
        infocard: {
          title: "شاخص‌های منتات",
          subtitle: "لیست‌های منتخب، انجمن را تیزبین نگه می‌دارد.",
          metricsTitle: "یادگیرنده‌های جامعه",
          learners: "کاوشگر فعال",
          caption: "با ادویه دانش مشترک انرژی می‌گیرد.",
        },
      },
      home: {
        actions: {
          viewCatalog: "باز کردن فهرست",
        },
        rails: {
          featuredTitle: "انتخاب ویژه برای تو",
          featuredSubtitle: "دوره‌های پرسیگنال که توسط منتات‌ها پیشنهاد شده‌اند.",
          latestTitle: "تازه‌ترین‌ها",
          latestSubtitle: "تازه‌ترین دوره‌ها از سازندگان مورد اعتماد دنیای دون.",
          error: "لود دوره‌های ویژه ممکن نشد. دوباره تلاش کن.",
          empty: "به‌محض انتشار مدرس‌ها، دوره‌ها اینجا نشان داده می‌شوند.",
        },
      },
      catalog: {
        title: "فهرست دوره‌ها",
        subtitle: "داده‌های زنده از API دون‌تیوب.",
        count: "{{count}} دوره آماده پخش است.",
        loading: "در حال بارگذاری دوره‌ها...",
        error: "لود دوره‌ها ممکن نشد. دوباره تلاش کن.",
        empty: "هیچ دوره‌ای با فیلترهای فعلی پیدا نشد.",
        searchPlaceholder: "جستجو بر اساس عنوان، منتشرکننده، مربی یا برچسب…",
        searchAction: "جستجو",
        clear: "پاک کردن",
        sortLabel: "مرتب‌سازی",
        sortOptions: {
          newest: "جدیدترین",
          title: "عنوان · الف تا ی",
          priceAsc: "قیمت · صعودی",
          priceDesc: "قیمت · نزولی",
        },
        reset: "بازنشانی فیلترها",
        paginationStatus: "صفحه {{page}} از {{totalPages}}",
        prev: "قبلی",
        next: "بعدی",
        teacherLabel: "مدرس: {{teacher}}",
        teacherUnknown: "مدرس نامشخص",
        learners: "{{count}} یادگیرنده ثبت‌نام کرده",
        tags: "برچسب‌ها",
        priceLabel: "شهریه",
      },
      course: {
        actions: {
          backToCatalog: "بازگشت به فهرست",
        },
        errors: {
          notFound: "دوره پیدا نشد.",
          generic: "امکان لود این دوره نبود. دوباره امتحان کن.",
        },
        meta: {
          price: "شهریه: {{price}}",
          language: "زبان: {{language}}",
          learners: "{{count}} یادگیرنده",
          rating: "امتیاز: {{rating}} از ۵",
          publishedAt: "انتشار: {{date}}",
          teacher: "مدرس: {{teacher}}",
          teacherUnknown: "مدرس نامشخص",
          priceLabelShort: "شهریه",
          footer: "قیمت‌ها بر اساس ترجیحات زبان و ارز تو تنظیم می‌شوند.",
        },
        lessons: {
          title: "برنامه درسی",
          count: "{{count}} درس",
          empty: "به‌زودی درس‌ها اینجا نمایش داده می‌شوند.",
          lessonLabel: "درس {{order}}",
          preview: "پیش‌نمایش رایگان",
          watch: "مشاهده درس",
        },
        reviews: {
          title: "بازخورد یادگیرندگان",
          count: "{{count}} نظر",
          empty: "هنوز نظری ثبت نشده است.",
          rating: "امتیاز: {{rating}} از ۵",
        },
      },
      languageSwitcher: {
        label: "زبان",
      },
      preferences: {
        currency: "ارز",
        dateStyle: "نمایش تاریخ",
        dateStyles: {
          short: "کوتاه",
          medium: "متوسط",
          long: "بلند",
        },
      },
      footer: {
        rights: "تمام حقوق محفوظ است.",
      },
    },
  },
  ar: {
    translation: {
      layout: {
        tagline: "بث حكمة أراكيس",
      },
      nav: {
        home: "الرئيسية",
        catalog: "الفهرس",
      },
      hero: {
        badge: "دروس جديدة يومياً",
        title: "ابث معرفة كوكب أراكيس",
        subtitle:
          "اكتشف دروساً سينمائية من مقاتلي فريمَن، وموجهي البيني جيسرت، واستراتيجيي المنتات — مختارة لمتعلمي المستقبل.",
        ctaCatalog: "تصفح الفهرس",
        ctaHealth: "فحص صحة API",
        healthStatus: {
          idle: "اضغط الزر للتحقق من جاهزية الـAPI.",
          checking: "جارٍ فحص صحة الـAPI...",
          ok: "الـAPI يعمل بشكل سليم.",
          fail: "فشل فحص صحة الـAPI.",
        },
        infocard: {
          title: "إحصاءات المنتات",
          subtitle: "القوائم المختارة تبقي الطاقم متيقظاً.",
          metricsTitle: "متعلمين من المجتمع",
          learners: "مستكشف نشط",
          caption: "مدعوم بتوابل المعرفة المشتركة.",
        },
      },
      home: {
        actions: {
          viewCatalog: "فتح الفهرس",
        },
        rails: {
          featuredTitle: "مقترح لك",
          featuredSubtitle: "دورات عالية القيمة موصى بها من المنتات.",
          latestTitle: "الإضافات الأحدث",
          latestSubtitle: "إصدارات جديدة من منشئي محتوى موثوقين في عالم ديون.",
          error: "تعذر تحميل الدورات المميزة. حاول مرة أخرى.",
          empty: "ستظهر الدورات هنا حالما ينشرها المدرسون.",
        },
      },
      catalog: {
        title: "فهرس الدورات",
        subtitle: "بيانات حية من واجهة DuneTube.",
        count: "{{count}} دورة جاهزة للبث.",
        loading: "جارٍ تحميل الدورات...",
        error: "تعذر تحميل الدورات. حاول مرة أخرى.",
        empty: "لا توجد دورات تطابق عوامل التصفية حالياً.",
        searchPlaceholder: "ابحث حسب العنوان أو الناشر أو المعلّم أو الوسم…",
        searchAction: "بحث",
        clear: "مسح",
        sortLabel: "ترتيب",
        sortOptions: {
          newest: "الأحدث",
          title: "العنوان · أ إلى ي",
          priceAsc: "السعر · تصاعدي",
          priceDesc: "السعر · تنازلي",
        },
        reset: "إعادة ضبط المرشحات",
        paginationStatus: "صفحة {{page}} من {{totalPages}}",
        prev: "السابق",
        next: "التالي",
        teacherLabel: "يقدمه {{teacher}}",
        teacherUnknown: "مدرّس غير معروف",
        learners: "{{count}} متعلم مسجّل",
        tags: "الوسوم",
        priceLabel: "الرسوم",
      },
      course: {
        actions: {
          backToCatalog: "عودة إلى الفهرس",
        },
        errors: {
          notFound: "الدورة غير موجودة.",
          generic: "تعذر تحميل هذه الدورة. حاول مجدداً.",
        },
        meta: {
          price: "الرسوم: {{price}}",
          language: "اللغة: {{language}}",
          learners: "{{count}} متعلم",
          rating: "التقييم: {{rating}} من ٥",
          publishedAt: "تاريخ النشر: {{date}}",
          teacher: "المدرّس: {{teacher}}",
          teacherUnknown: "مدرّس غير معروف",
          priceLabelShort: "الرسوم",
          footer: "تتكيّف الأسعار مع تفضيلاتك للغة والعملة.",
        },
        lessons: {
          title: "خطة الدروس",
          count: "{{count}} درس",
          empty: "سيتم عرض الدروس هنا قريباً.",
          lessonLabel: "الدرس {{order}}",
          preview: "معاينة مجانية",
          watch: "مشاهدة الدرس",
        },
        reviews: {
          title: "مراجعات المتعلمين",
          count: "{{count}} مراجعة",
          empty: "لا توجد مراجعات بعد.",
          rating: "التقييم: {{rating}} من ٥",
        },
      },
      languageSwitcher: {
        label: "اللغة",
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
