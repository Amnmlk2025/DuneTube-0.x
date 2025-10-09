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
        tabTitle: "DuneTube | Stream Arrakis wisdom",
      },
      nav: {
        home: "Home",
        catalog: "Catalog",
      },
      header: {
        searchPlaceholder: "Search DuneTube…",
        searchSubmit: "Run search",
        searchClose: "Close search",
        searchOpen: "Toggle search bar",
        openSettings: "Open quick settings",
        openProfile: "Open profile or sign in",
      },
      hero: {
        badge: "New lessons every day",
        title: "Stream the knowledge of Arrakis",
        subtitle:
          "Discover cinematic lessons from Fremen survivalists, Bene Gesserit mentors, and Mentat strategists curated for lifelong learners.",
        ctaCatalog: "Browse catalog",
        ctaHealth: "Check API health",
        healthStatus: {
          idle: "Tap the health button to confirm the API is ready.",
          checking: "Checking API health...",
          ok: "API is healthy.",
          fail: "API health check failed.",
        },
        infocard: {
          title: "Mentat metrics",
          subtitle: "Curated playlists keep your guild sharp.",
          metricsTitle: "Community learners",
          learners: "active explorers",
          caption: "Powered by the spice of shared knowledge.",
        },
        sidebar: {
          title: "Need a quick start?",
          help: "Scan the highlights, then jump into the catalog grid to filter by topic or mentor.",
          tipLabel: "Pro tip",
          tipBody: "Ping the API health before inviting your sietch to watch.",
        },
      },
      home: {
        title: "دفق معرفة أراكيس",
        subtitle: "اختر موضوعاً لضبط أحدث الدورات والمقاطع وقوائم التشغيل بما يلائم اهتماماتك.",
        actions: {
          viewCatalog: "فتح الدليل",
          resetFilters: "إعادة تعيين المرشحات",
          viewAll: "عرض الكل",
        },
        filters: {
          all: "كل المواضيع",
          popular: "شائع",
          new: "الأحدث",
          mentat: "منتات",
          fremen: "فرمن",
          strategy: "استراتيجية",
          selected: "نعرض لك التوصيات الخاصة بـ:",
        },
        stats: {
          learners: {
            value: "٨٥ألف+",
            label: "متعلمين في أرجاء الإمبراطورية",
          },
          courses: {
            value: "١٫٢ألف",
            label: "دورات غامرة",
          },
          languages: {
            value: "١٢",
            label: "لغات للترجمة",
          },
        },
        rails: {
          featuredTitle: "مختارات لأجلك",
          featuredSubtitle: "دورات عالية القيمة يرشحها مشرفو المنتات.",
          latestTitle: "أحدث الإصدارات",
          latestSubtitle: "إصدارات جديدة من صناع موثوقين في عالم ديون.",
          error: "تعذر تحميل الدورات المميزة. حاول مرة أخرى.",
          empty: "ستظهر الدورات هنا حالما ينشرها المدرسون.",
        },
      },
      catalog: {
        title: "Course catalog",
        subtitle: "Live data fetched straight from the DuneTube API.",
        count: "{{count}} courses ready to stream.",
        loading: "Loading courses...",
        error: "Unable to load courses. Please try again.",
        empty: "No courses match your filters yet.",
        searchPlaceholder: "Search by title, publisher, mentor, or tag...",
        searchAction: "Search",
        clear: "Clear",
        sortLabel: "Sort",
        sortOptions: {
          newest: "Newest",
          title: "Title A-Z",
          priceAsc: "Price | low to high",
          priceDesc: "Price | high to low",
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
        ctaPreview: "Play intro for {{title}}",
        publisherLink: "Visit {{publisher}} channel",
        metadata: {
          publishedAgo: "Published {{time}}",
          viewComments: "Comments",
          joinCourse: "Join course",
          bookmark: "Bookmark",
        },
      },
      course: {
        actions: {
          backToCatalog: "Back to catalog",
          bookmark: "Bookmark course",
          preview: "Preview intro",
        },
        tabs: {
          overview: "Overview",
          lessons: "Lessons",
          reviews: "Reviews",
        },
        cta: {
          join: "Join course",
          watchFirst: "Watch first lesson",
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
          publishedRelative: "Published {{time}}",
          participants: "{{count}} learners",
          footer: "Pricing adapts to your locale preferences.",
        },
        overview: {
          title: "About this course",
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
        current: "Current language",
        more: "Other languages…",
        modalTitle: "Choose your language",
        modalSubtitle: "Pick any language available in DuneTube.",
      },
      preferences: {
        currency: "Currency",
        dateStyle: "Date style",
        calendar: "Calendar",
        dateStyles: {
          short: "Short",
          medium: "Medium",
          long: "Long",
        },
        calendarOptions: {
          gregorian: "Gregorian",
          jalali: "Jalali",
          hijri: "Hijri",
        },
      },
      modals: {
        common: {
          close: "Close modal",
        },
        login: {
          title: "Sign in or create an account",
          subtitle: "Access exclusive playlists and keep your progress synced.",
          emailLabel: "Email",
          passwordLabel: "Password",
          submit: "Sign in",
          continueHint: "You can finish setting up your account later.",
          continueGuest: "Continue as guest",
        },
        settings: {
          title: "Quick settings",
          subtitle: "Adjust how DuneTube feels in seconds.",
          signOut: "Sign out",
        },
      },
      watch: {
        badge: "Golden click",
        title: "Lesson {{lessonId}} playback",
        subtitle: "Full cinematic playback is coming soon. Enjoy the preview while we wire the stream.",
        placeholder: "We are preparing the Watch experience. For now, check the course details or continue browsing.",
        backToCatalog: "Back to catalog",
      },
      publisher: {
        badge: "Creator spotlight",
        title: "Publisher: {{slug}}",
        subtitle: "We will surface publisher bios, playlists, and live streams here soon.",
        placeholder: "Stay tuned—publisher profiles will showcase curated collections and stats.",
        backToCatalog: "Return to catalog",
      },
      teacher: {
        badge: "Mentat mentor",
        title: "Instructor #{{teacherId}}",
        subtitle: "A detailed instructor dossier will be available soon.",
        placeholder: "We are crafting instructor pages with achievements, expertise, and upcoming sessions.",
        backToCatalog: "Return to catalog",
      },
      profile: {
        badge: "Traveler profile",
        title: "Your DuneTube profile",
        subtitle: "More customization is on the way.",
        placeholder: "We will surface your history, badges, and guild stats in a future update.",
      },
      footer: {
        rights: "All rights reserved.",
        terms: "Terms of service",
        privacy: "Privacy policy",
      },
    },
  },
  fa: {
    translation: {
      layout: {
        tagline: "جریان دانش آراکیس",
        tabTitle: "دیون‌تیوب | جریان دانش آراکیس",
      },
      nav: {
        home: "خانه",
        catalog: "فهرست دوره‌ها",
      },
      header: {
        searchPlaceholder: "در دیون‌تیوب جستجو کنید…",
        searchSubmit: "اجرای جستجو",
        searchClose: "بستن جستجو",
        searchOpen: "نمایش نوار جستجو",
        openSettings: "باز کردن تنظیمات سریع",
        openProfile: "نمایه یا ورود",
      },
      hero: {
        badge: "دروس جديدة كل يوم",
        title: "دفق معرفة أراكيس",
        subtitle:
          "دروس سينمائية من الناجين الفرمن، ومرشدات البِنِي جسرِت، واستراتيجيي المنتات لعشاق التعلم المستمر.",
        ctaCatalog: "استعراض الدليل",
        ctaHealth: "تحقق من صحة الـAPI",
        healthStatus: {
          idle: "اضغط زر الصحة للتأكد من جاهزية الـAPI.",
          checking: "جاري فحص صحة الـAPI...",
          ok: "الـAPI يعمل بصحة جيدة.",
          fail: "فشل فحص صحة الـAPI.",
        },
        infocard: {
          title: "قياسات المنتات",
          subtitle: "القوائم المختارة تُبقي جماعتك يقظة.",
          metricsTitle: "متعلمين من المجتمع",
          learners: "مستكشفون نشطون",
          caption: "قوة المعرفة المشتركة المدعومة بالتوابل.",
        },
        sidebar: {
          title: "تحتاج بداية سريعة؟",
          help: "اطلع على اللمحات البارزة ثم انتقل إلى شبكة الدورات لتفلتر حسب الموضوع أو المدرب.",
          tipLabel: "نصيحة محترف",
          tipBody: "تحقق من صحة الـAPI قبل دعوة السيتش حتى تُحمّل البيانات فوراً.",
        },
      },
      home: {
        title: "جریان دانش آراکیس را استریم کن",
        subtitle: "موضوعی را انتخاب کن تا جدیدترین دوره‌ها، شورت‌ها و پلی‌لیست‌ها بر اساس علاقه‌ات چیده شوند.",
        actions: {
          viewCatalog: "مشاهده فهرست دوره‌ها",
          resetFilters: "بازنشانی فیلترها",
          viewAll: "مشاهده همه",
        },
        filters: {
          all: "همه موضوع‌ها",
          popular: "محبوب",
          new: "تازه‌ها",
          mentat: "منتات",
          fremen: "فرمن",
          strategy: "استراتژی",
          selected: "در حال نمایش پیشنهادها برای:",
        },
        stats: {
          learners: {
            value: "۸۵هزار+",
            label: "یادگیرنده‌ی فعال در سراسر امپراتوری",
          },
          courses: {
            value: "۱٫۲هزار",
            label: "دوره‌ی تعاملی",
          },
          languages: {
            value: "۱۲",
            label: "زبان زیرنویس",
          },
        },
        rails: {
          featuredTitle: "گزیده مخصوص شما",
          featuredSubtitle: "دوره‌های پربازده که منتات‌ها پیشنهاد داده‌اند.",
          latestTitle: "جدیدترین دوره‌ها",
          latestSubtitle: "تازه‌ترین محتوا از سازندگان مورد اعتماد جهان دیون.",
          error: "بارگذاری دوره‌های ویژه ممکن نشد. لطفاً دوباره تلاش کنید.",
          empty: "به محض انتشار مدرس‌ها، دوره‌ها در این بخش ظاهر می‌شوند.",
        },
      },
      catalog: {
        title: "فهرست دوره‌ها",
        subtitle: "داده زنده مستقیماً از API دیون‌تیوب.",
        count: "{{count}} دوره برای استریم آماده است.",
        loading: "در حال بارگذاری دوره‌ها...",
        error: "امکان بارگذاری دوره‌ها نبود. لطفاً دوباره تلاش کنید.",
        empty: "هیچ دوره‌ای با فیلترهای شما مطابقت ندارد.",
        searchPlaceholder: "جستجو بر اساس عنوان، ناشر، مدرس یا برچسب...",
        searchAction: "جستجو",
        clear: "پاکسازی",
        sortLabel: "مرتب‌سازی",
        sortOptions: {
          newest: "جدیدترین",
          title: "عنوان | الف تا ی",
          priceAsc: "قیمت | کم به زیاد",
          priceDesc: "قیمت | زیاد به کم",
        },
        reset: "بازنشانی فیلترها",
        paginationStatus: "صفحه {{page}} از {{totalPages}}",
        prev: "قبلی",
        next: "بعدی",
        teacherLabel: "مدرس: {{teacher}}",
        teacherUnknown: "مدرس نامشخص",
        learners: "{{count}} نفر شرکت کرده‌اند",
        tags: "برچسب‌ها",
        priceLabel: "شهریه",
        ctaPreview: "پخش پیش‌نمایش {{title}}",
        publisherLink: "مشاهده کانال {{publisher}}",
        metadata: {
          publishedAgo: "انتشار {{time}}",
          viewComments: "نظرات",
          joinCourse: "شرکت در دوره",
          bookmark: "نشان کردن",
        },
      },
      course: {
        actions: {
          backToCatalog: "بازگشت به فهرست",
          bookmark: "نشان کردن دوره",
          preview: "پخش پیش‌نمایش",
        },
        tabs: {
          overview: "معرفی",
          lessons: "درس‌ها",
          reviews: "دیدگاه‌ها",
        },
        cta: {
          join: "شرکت در دوره",
          watchFirst: "تماشای اولین درس",
        },
        errors: {
          notFound: "دوره پیدا نشد.",
          generic: "امکان نمایش این دوره نبود. لطفاً دوباره تلاش کنید.",
        },
        meta: {
          price: "شهریه: {{price}}",
          language: "زبان: {{language}}",
          learners: "{{count}} نفر",
          rating: "امتیاز: {{rating}} از ۵",
          publishedAt: "تاریخ انتشار: {{date}}",
          teacher: "مدرس: {{teacher}}",
          teacherUnknown: "مدرس نامشخص",
          priceLabelShort: "شهریه",
          publishedRelative: "انتشار {{time}}",
          participants: "{{count}} نفر",
          footer: "قیمت بر اساس ترجیحات شما تنظیم می‌شود.",
        },
        overview: {
          title: "درباره این دوره",
        },
        lessons: {
          title: "برنامه درسی",
          count: "{{count}} درس",
          empty: "به زودی درس‌ها اضافه می‌شوند.",
          lessonLabel: "درس {{order}}",
          preview: "پیش‌نمایش رایگان",
          watch: "تماشای درس",
        },
        reviews: {
          title: "دیدگاه دانشجویان",
          count: "{{count}} دیدگاه",
          empty: "هنوز دیدگاهی ثبت نشده است.",
          rating: "امتیاز: {{rating}} از ۵",
        },
      },
      languageSwitcher: {
        label: "زبان",
        current: "زبان فعلی",
        more: "زبان‌های دیگر…",
        modalTitle: "انتخاب زبان",
        modalSubtitle: "زبان مورد نظر خود را برای دیون‌تیوب انتخاب کنید.",
      },
      preferences: {
        currency: "ارز",
        dateStyle: "نوع تاریخ",
        calendar: "تقویم",
        dateStyles: {
          short: "کوتاه",
          medium: "متوسط",
          long: "بلند",
        },
        calendarOptions: {
          gregorian: "میلادی",
          jalali: "جلالی",
          hijri: "هجری",
        },
      },
      modals: {
        common: {
          close: "بستن",
        },
        login: {
          title: "ورود یا ایجاد حساب",
          subtitle: "به فهرست‌های اختصاصی دسترسی پیدا کنید و پیشرفت خود را ذخیره نمایید.",
          emailLabel: "ایمیل",
          passwordLabel: "رمز عبور",
          submit: "ورود به حساب",
          continueHint: "می‌توانید بعداً اطلاعات حساب خود را کامل کنید.",
          continueGuest: "ادامه به صورت مهمان",
        },
        settings: {
          title: "تنظیمات سریع",
          subtitle: "تجربه دیون‌تیوب را در چند ثانیه تنظیم کنید.",
          signOut: "خروج از حساب",
        },
      },
      watch: {
        badge: "پیش‌نمایش طلایی",
        title: "پخش درس {{lessonId}}",
        subtitle: "پخش کامل به‌زودی فعال می‌شود. تا آن زمان از پیش‌نمایش لذت ببرید.",
        placeholder: "در حال آماده‌سازی تجربه تماشا هستیم. فعلاً می‌توانید جزئیات دوره را بررسی کنید.",
        backToCatalog: "بازگشت به فهرست",
      },
      publisher: {
        badge: "معرفی ناشر",
        title: "ناشر: {{slug}}",
        subtitle: "به‌زودی معرفی و مجموعه‌های ویژه این ناشر را نمایش می‌دهیم.",
        placeholder: "به زودی صفحه ناشر شامل مجموعه‌های منتخب و آمار فعالیت خواهد بود.",
        backToCatalog: "بازگشت به فهرست",
      },
      teacher: {
        badge: "راهنمای منتات",
        title: "مدرس شماره {{teacherId}}",
        subtitle: "به‌زودی پرونده کامل مدرس را در اختیار می‌گذاریم.",
        placeholder: "صفحه مدرس به زودی شامل سوابق، تخصص‌ها و جلسات آتی خواهد بود.",
        backToCatalog: "بازگشت به فهرست",
      },
      profile: {
        badge: "نمایه مسافر",
        title: "نمایه شما در دیون‌تیوب",
        subtitle: "به‌زودی امکانات شخصی‌سازی بیشتری اضافه می‌شود.",
        placeholder: "در به‌روزرسانی‌های آینده، تاریخچه تماشا، نشان‌ها و آمار قبیله شما نمایش داده خواهد شد.",
      },
      footer: {
        rights: "تمام حقوق محفوظ است.",
        terms: "قوانین سایت",
        privacy: "حریم خصوصی",
      },
    },
  },
  ar: {
    translation: {
      layout: {
        tagline: "بث حكمة أراكيس",
        tabTitle: "ديون تيوب | بث حكمة أراكيس",
      },
      nav: {
        home: "الرئيسية",
        catalog: "دليل الدورات",
      },
      header: {
        searchPlaceholder: "ابحث في ديون تيوب…",
        searchSubmit: "تشغيل البحث",
        searchClose: "إغلاق البحث",
        searchOpen: "إظهار شريط البحث",
        openSettings: "فتح الإعدادات السريعة",
        openProfile: "الملف الشخصي أو تسجيل الدخول",
      },
      hero: {
        badge: "دروس جديدة كل يوم",
        title: "بث معرفة أراكيس",
        subtitle:
          "اكتشف دروساً سينمائية من مقاتلي الفوريمين ومعلمات البيني جزيريت واستراتيجيي المنتات، مصممة للمتعلمين الدائمين.",
        ctaCatalog: "استعرض الدليل",
        ctaHealth: "تحقق من صحة API",
        healthStatus: {
          idle: "اضغط زر الحالة للتأكد من جاهزية واجهة API.",
          checking: "جاري فحص صحة API...",
          ok: "الواجهة سليمة.",
          fail: "فشل فحص صحة الواجهة.",
        },
        infocard: {
          title: "مؤشرات المنتات",
          subtitle: "القوائم المنتقاة تبقي فريقك متيقظاً.",
          metricsTitle: "متعلمين من المجتمع",
          learners: "مستكشفون نشطون",
          caption: "مدعومون بتبادل المعرفة.",
        },
      },
      home: {
        actions: {
          viewCatalog: "عرض كل الدورات",
        },
        rails: {
          featuredTitle: "مختارات لك",
          featuredSubtitle: "دورات عالية القيمة يوصي بها المنتات.",
          latestTitle: "أحدث الإصدارات",
          latestSubtitle: "محتوى جديد من صنّاع موثوقين في عالم ديون.",
          error: "تعذر تحميل الدورات المميزة. حاول مرة أخرى.",
          empty: "ستظهر الدورات هنا بمجرد نشرها.",
        },
      },
      catalog: {
        title: "دليل الدورات",
        subtitle: "بيانات مباشرة من واجهة ديون تيوب.",
        count: "{{count}} دورة جاهزة للبث.",
        loading: "جاري تحميل الدورات...",
        error: "تعذر تحميل الدورات. حاول مرة أخرى.",
        empty: "لا توجد دورات مطابقة لمرشحاتك.",
        searchPlaceholder: "ابحث بالعنوان أو الناشر أو المدرّس أو الوسوم...",
        searchAction: "بحث",
        clear: "مسح",
        sortLabel: "فرز",
        sortOptions: {
          newest: "الأحدث",
          title: "العنوان أ-ي",
          priceAsc: "السعر | من الأقل إلى الأعلى",
          priceDesc: "السعر | من الأعلى إلى الأقل",
        },
        reset: "إعادة تعيين المرشحات",
        paginationStatus: "صفحة {{page}} من {{totalPages}}",
        prev: "السابق",
        next: "التالي",
        teacherLabel: "المدرّس: {{teacher}}",
        teacherUnknown: "مدرّس غير معروف",
        learners: "{{count}} متعلم",
        tags: "الوسوم",
        priceLabel: "الرسوم",
        ctaPreview: "تشغيل مقدمة {{title}}",
        publisherLink: "زيارة قناة {{publisher}}",
        metadata: {
          publishedAgo: "نُشر {{time}}",
          viewComments: "التعليقات",
          joinCourse: "الانضمام للدورة",
          bookmark: "إضافة للمحفوظات",
        },
      },
      course: {
        actions: {
          backToCatalog: "العودة إلى الدليل",
          bookmark: "حفظ الدورة",
          preview: "تشغيل المعاينة",
        },
        tabs: {
          overview: "نظرة عامة",
          lessons: "الدروس",
          reviews: "المراجعات",
        },
        cta: {
          join: "الانضمام للدورة",
          watchFirst: "مشاهدة الدرس الأول",
        },
        errors: {
          notFound: "لم يتم العثور على الدورة.",
          generic: "تعذر تحميل هذه الدورة. حاول مرة أخرى.",
        },
        meta: {
          price: "الرسوم: {{price}}",
          language: "اللغة: {{language}}",
          learners: "{{count}} متعلم",
          rating: "التقييم: {{rating}} من 5",
          publishedAt: "تاريخ النشر: {{date}}",
          teacher: "المدرّس: {{teacher}}",
          teacherUnknown: "مدرّس غير معروف",
          priceLabelShort: "الرسوم",
          publishedRelative: "نُشر {{time}}",
          participants: "{{count}} متعلم",
          footer: "يتم ضبط الأسعار بناءً على تفضيلاتك.",
        },
        overview: {
          title: "عن الدورة",
        },
        lessons: {
          title: "خطة الدروس",
          count: "{{count}} درس",
          empty: "سيتم إضافة الدروس قريباً.",
          lessonLabel: "الدرس {{order}}",
          preview: "معاينة مجانية",
          watch: "مشاهدة الدرس",
        },
        reviews: {
          title: "مراجعات المتعلمين",
          count: "{{count}} مراجعة",
          empty: "لا توجد مراجعات بعد.",
          rating: "التقييم: {{rating}} من 5",
        },
      },
      languageSwitcher: {
        label: "اللغة",
        current: "اللغة الحالية",
        more: "لغات أخرى…",
        modalTitle: "اختر لغتك",
        modalSubtitle: "اختر اللغة التي تفضلها في ديون تيوب.",
      },
      preferences: {
        currency: "العملة",
        dateStyle: "تنسيق التاريخ",
        calendar: "التقويم",
        dateStyles: {
          short: "قصير",
          medium: "متوسط",
          long: "طويل",
        },
        calendarOptions: {
          gregorian: "ميلادي",
          jalali: "جلالي",
          hijri: "هجري",
        },
      },
      modals: {
        common: {
          close: "إغلاق",
        },
        login: {
          title: "تسجيل الدخول أو إنشاء حساب",
          subtitle: "احصل على قوائم حصرية واحتفظ بتقدمك.",
          emailLabel: "البريد الإلكتروني",
          passwordLabel: "كلمة المرور",
          submit: "تسجيل الدخول",
          continueHint: "يمكنك إكمال بياناتك لاحقاً.",
          continueGuest: "الاستمرار كضيف",
        },
        settings: {
          title: "الإعدادات السريعة",
          subtitle: "اضبط تجربة ديون تيوب خلال ثوانٍ.",
          signOut: "تسجيل الخروج",
        },
      },
      watch: {
        badge: "النقرة الذهبية",
        title: "مشاهدة الدرس {{lessonId}}",
        subtitle: "البث الكامل قادم قريباً. استمتع بالمعاينة ريثما نجهز التجربة.",
        placeholder: "نحضّر تجربة المشاهدة. يمكنك حالياً استكشاف تفاصيل الدورة أو متابعة التصفح.",
        backToCatalog: "العودة إلى الدليل",
      },
      publisher: {
        badge: "قناة منشئ المحتوى",
        title: "الناشر: {{slug}}",
        subtitle: "سنضيف قريباً معلومات كاملة عن الناشر وقوائمه المختارة.",
        placeholder: "ستعرض صفحة الناشر قريباً مجموعات منسقة وإحصاءات المشاركة.",
        backToCatalog: "العودة إلى الدليل",
      },
      teacher: {
        badge: "مدرب المنتات",
        title: "المدرّس رقم {{teacherId}}",
        subtitle: "ملف المدرّس التفصيلي سيظهر قريباً.",
        placeholder: "نعمل على إعداد صفحات المدرّسين مع الخبرات والإنجازات والجلسات القادمة.",
        backToCatalog: "العودة إلى الدليل",
      },
      profile: {
        badge: "ملف المسافر",
        title: "ملفك في ديون تيوب",
        subtitle: "سنضيف المزيد من التخصيص قريباً.",
        placeholder: "سنُظهر سجل المشاهدة والأوسمة وإحصاءات الفريق في التحديثات القادمة.",
      },
      footer: {
        rights: "جميع الحقوق محفوظة.",
        terms: "شروط الاستخدام",
        privacy: "سياسة الخصوصية",
      },
    },
  },
} satisfies Record<LanguageCode, { translation: Record<string, unknown> }>;

const supportedLanguages: SupportedLanguage[] = [
  { code: "en", label: "English" },
  { code: "fa", label: "فارسی" },
  { code: "ar", label: "العربية" },
];

const rtlLanguages = new Set<LanguageCode>(["fa", "ar"]);

const applyDocumentLanguage = (language: LanguageCode, options: { persist?: boolean } = {}) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.has(language) ? "rtl" : "ltr";
  }
  if (options.persist && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
};

const getInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") {
    return "fa";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (stored && supportedLanguages.some((lang) => lang.code === stored)) {
    return stored;
  }

  const browser = window.navigator.language?.slice(0, 2) as LanguageCode | undefined;
  if (browser && supportedLanguages.some((lang) => lang.code === browser)) {
    return browser;
  }

  return "fa";
};

const initialLanguage = getInitialLanguage();
applyDocumentLanguage(initialLanguage, { persist: true });

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "fa",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  const language = (lng ?? "en") as LanguageCode;
  applyDocumentLanguage(language, { persist: true });
});

export { supportedLanguages, rtlLanguages };
export type { LanguageCode, SupportedLanguage };

export default i18n;
