import React, { useEffect, useMemo, useState } from "react";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };

/** ========= Types ========= */
type Course = {
  id: number;
  title: string;
  teacher?: string;
  organization?: string;
  thumbnail?: string;
  rating_avg?: number;
  students_count?: number;
  price?: number;     // 0 => free
  level?: "Beginner" | "Intermediate" | "Advanced";
  language?: "EN" | "FA";
  published_at?: string;
};

/** ========= Mock Data ========= */
const mockCourses: Course[] = Array.from({ length: 24 }, (_, i) => {
  const lvl = (["Beginner", "Intermediate", "Advanced"] as const)[i % 3];
  const lang = (["EN", "FA"] as const)[i % 2];
  const price = i % 5 === 0 ? 0 : 19 + (i % 4) * 10;
  return {
    id: i + 1,
    title: `Practical Course ${i + 1}: Topic ${(i + 1) * 3}`,
    teacher: ["Sara", "Ali", "Lina", "Omid"][i % 4],
    organization: ["Future Minds", "Dunetube Academy", "TechLab"][i % 3],
    thumbnail: "",
    rating_avg: 3.8 + (i % 12) * 0.1, // 3.8..5.0
    students_count: 1200 + i * 37,
    price,
    level: lvl,
    language: lang,
    published_at: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
  };
});

/** ========= Helpers ========= */
const timeSince = (iso?: string) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [string, number][] = [
    ["y", 31536000],
    ["mo", 2592000],
    ["w", 604800],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "now";
};

const currency = (v?: number) =>
  v === undefined ? "" : v === 0 ? "Free" : `$${v.toFixed(0)}`;

/** ========= Icons ========= */
const Icon = {
  Hamburger: () => (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  ),
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor" />
      <polygon points="10,9 16,12 10,15" fill="white" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path fill="currentColor" d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
};

/** ========= Reusable Course Card (self-contained) ========= */
function CourseCard({ c }: { c: Course }) {
  return (
    <a href={`/course/${c.id}`} className="block rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300">
      <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-100">
        {c.thumbnail ? (
          <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg width="42" height="42" viewBox="0 0 24 24" className="opacity-60">
              <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
      <div className="pt-2">
        <div className="font-medium leading-snug line-clamp-2 text-[clamp(.92rem,1.8vw,1rem)]">
          {c.title}
        </div>
        <div className="text-[13px] md:text-sm text-gray-500 line-clamp-1">
          {c.organization ? `${c.organization} • ${c.teacher ?? ""}` : c.teacher}
        </div>
        <div className="text-[12px] md:text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1"><Icon.Star /> {c.rating_avg?.toFixed(1)}</span>
          <span>•</span>
          <span>{(c.students_count ?? 0).toLocaleString()} students</span>
          <span>•</span>
          <span>{currency(c.price)}</span>
        </div>
      </div>
    </a>
  );
}

/** ========= Main Page ========= */
export default function Catalog() {
  // data
  const [courses, setCourses] = useState<Course[]>([]);
  // header state
  const [panelOpen, setPanelOpen] = useState(false);
  const [lang, setLang] = useState<"FA" | "EN">("EN");
  const [isAuth, setIsAuth] = useState(false);
  const [search, setSearch] = useState("");
  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 360);

  // filters
  const [level, setLevel] = useState<"All" | Course["level"]>("All");
  const [price, setPrice] = useState<"All" | "Free" | "Paid">("All");
  const [language, setLanguage] = useState<"All" | "EN" | "FA">("All");
  const [sort, setSort] = useState<"popular" | "rating" | "newest" | "price_low" | "price_high">("popular");

  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 360);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // mock load
    setCourses(mockCourses);
  }, []);

  const paddingLeftWhenOpen = panelOpen ? panelW : 0;

  // computed list
  const filtered = useMemo(() => {
    let list = courses.slice();

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.teacher ?? "").toLowerCase().includes(q) ||
          (c.organization ?? "").toLowerCase().includes(q)
      );
    }
    if (level !== "All") list = list.filter((c) => c.level === level);
    if (price !== "All") list = list.filter((c) => (price === "Free" ? (c.price ?? 0) === 0 : (c.price ?? 0) > 0));
    if (language !== "All") list = list.filter((c) => c.language === language);

    switch (sort) {
      case "rating":
        list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.published_at ?? "").getTime() - new Date(a.published_at ?? "").getTime());
        break;
      case "price_low":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_high":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      default: // popular
        list.sort((a, b) => (b.students_count ?? 0) - (a.students_count ?? 0));
    }

    return list;
  }, [courses, search, level, price, language, sort]);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const perPage = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    // reset page when filters change
    setPage(1);
  }, [search, level, price, language, sort]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
          <button onClick={() => setPanelOpen((v) => !v)} className="p-2 rounded hover:bg-gray-100" aria-label="Menu">
            <Icon.Hamburger />
          </button>

          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: BRAND.deepBlue }}>
            <Icon.Logo />
          </div>
          <span className="hidden sm:block font-semibold text-[clamp(1rem,1.6vw,1.125rem)]" style={{ color: BRAND.deepBlue }}>
            Dunetube
          </span>

          {/* search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-[clamp(.9rem,1.2vw,1rem)]"
                placeholder={lang === "FA" ? "جست‌وجوی دوره‌ها…" : "Search courses…"}
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Icon.Search />
              </span>
            </div>
          </div>

          {/* language */}
          <div className="ml-2">
            <button
              onClick={() => setLang((l) => (l === "EN" ? "FA" : "EN"))}
              className="px-3 py-2 rounded border text-sm"
              title="Toggle language"
            >
              {lang}
            </button>
          </div>

          {/* auth */}
          <div className="ml-2">
            <button
              onClick={() => setIsAuth((v) => !v)}
              className="p-2 rounded hover:bg-gray-100"
              title={isAuth ? "Profile" : "Login"}
            >
              <Icon.User />
            </button>
          </div>
        </div>
      </header>

      {/* SETTINGS PANEL */}
      {panelOpen && (
        <aside
          className="fixed left-0 top-16 bottom-0 z-40 border-r bg-white overflow-y-auto"
          style={{ width: panelW }}
          aria-label="Settings panel"
        >
          <div className="p-4 text-sm text-gray-700 space-y-6">
            <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>
              Settings
            </div>

            <div className="space-y-2">
              <div className="font-medium">Theme</div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">Light</button>
                <button className="px-3 py-2 rounded border">Dark</button>
                <button className="px-3 py-2 rounded border">System</button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="font-medium">Language</div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">FA</button>
                <button className="px-3 py-2 rounded border">EN</button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="font-medium">Account</div>
              {isAuth ? (
                <div className="rounded border p-3">Signed in • Profile &amp; Security</div>
              ) : (
                <button className="px-3 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>
                  {lang === "FA" ? "ورود / ثبت‌نام" : "Sign in / Sign up"}
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* CONTENT */}
      <div className="pt-[80px]" style={{ paddingLeft: paddingLeftWhenOpen }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5 py-6">
          {/* Filters row */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level */}
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">{lang === "FA" ? "همه سطوح" : "All levels"}</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Price */}
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">{lang === "FA" ? "همه قیمت‌ها" : "All prices"}</option>
                <option value="Free">{lang === "FA" ? "رایگان" : "Free"}</option>
                <option value="Paid">{lang === "FA" ? "غیررایگان" : "Paid"}</option>
              </select>

              {/* Language */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">{lang === "FA" ? "همه زبان‌ها" : "All languages"}</option>
                <option value="EN">EN</option>
                <option value="FA">FA</option>
              </select>
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{lang === "FA" ? "مرتب‌سازی:" : "Sort by:"}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="popular">{lang === "FA" ? "محبوب‌ترین" : "Most popular"}</option>
                <option value="rating">{lang === "FA" ? "بالاترین امتیاز" : "Top rated"}</option>
                <option value="newest">{lang === "FA" ? "جدیدترین" : "Newest"}</option>
                <option value="price_low">{lang === "FA" ? "ارزان‌ترین" : "Price: Low→High"}</option>
                <option value="price_high">{lang === "FA" ? "گران‌ترین" : "Price: High→Low"}</option>
              </select>
            </div>
          </div>

          {/* Counter */}
          <div className="text-sm text-gray-600 mb-3">
            {lang === "FA" ? "تعداد نتایج" : "Results"}: {filtered.length}
          </div>

          {/* Grid */}
          <section>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          </section>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded border disabled:opacity-50"
            >
              {lang === "FA" ? "قبلی" : "Prev"}
            </button>
            <div className="text-sm text-gray-700">
              {lang === "FA" ? "صفحه" : "Page"} {page} / {pageCount}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="px-3 py-2 rounded border disabled:opacity-50"
            >
              {lang === "FA" ? "بعدی" : "Next"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
