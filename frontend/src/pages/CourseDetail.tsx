import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };

// ===== Types =====
type Course = {
  id: number;
  title: string;
  teacher?: string;
  organization?: string;
  thumbnail?: string;
  rating_avg?: number;
  students_count?: number;
  description?: string;
  purchased?: boolean;
  last_update?: string;
};
type Lesson = { id: number; title: string; duration_minutes: number };
type QA = { id: number; question: string; answer?: string };
type Review = { id: number; user: string; comment: string; rating: number };

// ===== Mock Data =====
const mockCourse: Course = {
  id: 1,
  title: "Mastering Prompt Engineering",
  teacher: "Dr. Sara AI",
  organization: "Future Minds Academy",
  rating_avg: 4.7,
  students_count: 12840,
  description:
    "Learn to design effective prompts for AI models, evaluate outputs, and apply best practices to real products. This course balances theory and hands-on labs so you can ship confidently.",
  purchased: false,
  last_update: new Date(Date.now() - 9 * 86400000).toISOString(),
};
const mockLessons: Lesson[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Lesson ${i + 1}: Concept ${(i + 1) * 5}`,
  duration_minutes: 8 + (i % 6) * 4,
}));
const mockQA: QA[] = [
  { id: 1, question: "Do I need prior programming knowledge?", answer: "No. We start from basics and build up gradually." },
  { id: 2, question: "Is there a certificate?", answer: "Yes, a shareable certificate is issued upon completion." },
  { id: 3, question: "Can I access updates later?", answer: "Lifetime access to all updates is included." },
  { id: 4, question: "Is there any project?", answer: "Yes, two capstone projects with feedback." },
];
const mockReviews: Review[] = [
  { id: 1, user: "Sara", comment: "Clear, practical and up-to-date!", rating: 5 },
  { id: 2, user: "Ali", comment: "Loved the examples. Highly recommended.", rating: 5 },
  { id: 3, user: "Lina", comment: "Great pacing and structure.", rating: 4 },
  { id: 4, user: "Omid", comment: "Exactly what I needed for work.", rating: 5 },
  { id: 5, user: "Neda", comment: "Very useful tips.", rating: 4 },
];

// ===== Helpers =====
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

// ===== LocalStorage Keys & utils =====
const LS_WISHLIST = "dt_wishlist";         // number[] of course ids
const LS_PROGRESS = "dt_progress";         // { [courseId: string]: number (lessonId) }

function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem(LS_WISHLIST);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}
function writeWishlist(ids: number[]) {
  localStorage.setItem(LS_WISHLIST, JSON.stringify(ids));
}
function isWishlisted(courseId: number): boolean {
  return readWishlist().includes(courseId);
}
function toggleWishlistLS(courseId: number): boolean {
  const current = readWishlist();
  const idx = current.indexOf(courseId);
  if (idx >= 0) {
    current.splice(idx, 1);
    writeWishlist(current);
    return false;
  } else {
    current.push(courseId);
    writeWishlist(current);
    return true;
  }
}

function readProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_PROGRESS);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}
function writeProgress(map: Record<string, number>) {
  localStorage.setItem(LS_PROGRESS, JSON.stringify(map));
}
function getLastLesson(courseId: number): number {
  const map = readProgress();
  return map[String(courseId)] ?? 1;
}
function setLastLesson(courseId: number, lessonId: number) {
  const map = readProgress();
  map[String(courseId)] = lessonId;
  writeProgress(map);
}

// ===== Icons =====
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
      <path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z" />
    </svg>
  ),
  Play: () => (
    <svg width="48" height="48" viewBox="0 0 24 24">
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
    </svg>
  ),
   Heart: ({ filled = false, color = BRAND.deepBlue }: { filled?: boolean; color?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-200"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

// ===== Main Component =====
export default function CourseDetail() {
  // data
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [qa, setQa] = useState<QA[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // UI state
  const [panelOpen, setPanelOpen] = useState(false);
  const [lang, setLang] = useState<"FA" | "EN">("EN");
  const [isAuth, setIsAuth] = useState(false);
  const [search, setSearch] = useState("");

  // wishlist & progress state
  const [wishlisted, setWishlisted] = useState(false);
  const [lastLesson, setLastLessonState] = useState<number>(1);

  // responsive panel width
  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 360);
  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 360);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // load mock & LS-based states
  useEffect(() => {
    setCourse(mockCourse);
    setLessons(mockLessons);
    setQa(mockQA);
    setReviews(mockReviews);
  }, []);
  useEffect(() => {
    if (!course) return;
    setWishlisted(isWishlisted(course.id));
    setLastLessonState(getLastLesson(course.id));
  }, [course?.id]); // run when course id becomes available

  const paddingLeftWhenOpen = panelOpen ? panelW : 0;

  const filteredLessons = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter((l) => l.title.toLowerCase().includes(q));
  }, [lessons, search]);

  const handleToggleWishlist = () => {
    if (!course) return;
    const newState = toggleWishlistLS(course.id);
    setWishlisted(newState);
  };

  const handleLessonClick = (lessonId: number) => {
    if (!course) return;
    setLastLesson(course.id, lessonId);
    setLastLessonState(lessonId);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Menu"
          >
            <Icon.Hamburger />
          </button>

          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
            style={{ background: BRAND.deepBlue }}
            aria-label="Dunetube"
          >
            <Icon.Logo />
          </div>
          <span
            className="hidden sm:block font-semibold text-[clamp(1rem,1.6vw,1.125rem)]"
            style={{ color: BRAND.deepBlue }}
          >
            Dunetube
          </span>

          {/* search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-[clamp(.9rem,1.2vw,1rem)]"
                placeholder={lang === "FA" ? "جست‌وجو در دروس..." : "Search lessons…"}
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

      {/* ===== SETTINGS PANEL (pushes content) ===== */}
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
                <div className="rounded border p-3">Signed in • Profile & Security</div>
              ) : (
                <button className="px-3 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>
                  {lang === "FA" ? "ورود / ثبت‌نام" : "Sign in / Sign up"}
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ===== PAGE CONTENT ===== */}
      <div className="pt-[80px]" style={{ paddingLeft: paddingLeftWhenOpen }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5 py-6">
          {/* TOP: video left, info+description right */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="lg:w-2/3">
              <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-200 flex items-center justify-center text-gray-600">
                {course?.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <Icon.Play />
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-start overflow-y-auto">
              <h1 className="text-[clamp(1.3rem,2vw,1.6rem)] font-semibold mb-2">
                {course?.title}
              </h1>
              <div className="text-[clamp(.9rem,1.3vw,1rem)] text-gray-700 mb-3">
                {course?.organization && (
                  <>
                    <span className="font-medium text-gray-800">{course.organization}</span>
                    <span className="mx-1">•</span>
                  </>
                )}
                {course?.teacher}
              </div>
              <div className="text-[clamp(.85rem,1.2vw,.95rem)] text-gray-600 mb-4">
                ★ {course?.rating_avg} • {(course?.students_count ?? 0).toLocaleString()} {lang === "FA" ? "دانشجو" : "students"} • {timeSince(course?.last_update)}
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                {course?.purchased ? (
                  <Link to={`/course/${course?.id}/lesson/${lastLesson || 1}`}>
                    <button className="px-5 py-2 rounded-lg text-white font-medium" style={{ background: BRAND.deepBlue }}>
                      {lang === "FA" ? "ادامه دوره" : "Continue Course"}
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link to={`/course/${course?.id}/checkout`}>
                      <button
                        className="px-5 py-2 rounded-lg text-white font-medium"
                        style={{ background: BRAND.deepBlue }}
                      >
                        {lang === "FA" ? "ثبت‌نام" : "Enroll Now"}
                      </button>
                    </Link>

                    {/* Wishlist toggle (persistent) */}
                    <button
                      className={`px-5 py-2 rounded-lg border font-medium inline-flex items-center gap-2`}
                      style={{ borderColor: BRAND.deepBlue, color: BRAND.deepBlue }}
                      onClick={handleToggleWishlist}
                      title={wishlisted ? (lang === "FA" ? "حذف از نشان‌ها" : "Remove from wishlist") : (lang === "FA" ? "افزودن به نشان‌ها" : "Add to wishlist")}
                    >
                      <Icon.Heart filled={wishlisted} />
                      {wishlisted
                        ? (lang === "FA" ? "در نشان‌هاست" : "Wishlisted")
                        : (lang === "FA" ? "نشان کردن" : "Add to Wishlist")}
                    </button>

                    {/* دکمهٔ نمایشی برای تست: خریداری‌شده */}
                    <button
                      className="px-5 py-2 rounded-lg border font-medium"
                      onClick={() => setCourse((c) => (c ? { ...c, purchased: true } : c))}
                    >
                      Demo: Mark Purchased
                    </button>
                  </>
                )}
              </div>

              <p className="text-[clamp(.9rem,1.2vw,1rem)] text-gray-700 leading-7 whitespace-pre-line">
                {course?.description}
              </p>
            </div>
          </div>

          {/* BOTTOM: grid WITHOUT fixed height (page can scroll fully) */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            {/* LEFT: Lessons (click stores last-lesson progress) */}
            <div className="pr-2">
              <section>
                <h2 className="text-[clamp(1rem,1.6vw,1.25rem)] font-semibold mb-3" style={{ color: BRAND.deepBlue }}>
                  {lang === "FA" ? "فهرست دروس" : "Curriculum"}
                </h2>
                <ul className="divide-y rounded-xl border bg-white">
                  {filteredLessons.map((l) => (
                    <li key={l.id} className="p-3 flex items-center justify-between">
                      <Link
                        to={`/course/${course?.id}/lesson/${l.id}`}
                        onClick={() => handleLessonClick(l.id)}
                        className="text-[clamp(.92rem,1.2vw,1rem)] hover:underline"
                      >
                        {l.title}
                      </Link>
                      <span className="text-sm text-gray-500">{l.duration_minutes} min</span>
                    </li>
                  ))}
                </ul>
                {/* نمایش درس آخر */}
                <div className="text-xs text-gray-600 mt-2">
                  {lang === "FA" ? "آخرین درس ثبت شده: " : "Last recorded lesson: "}
                  <strong>{lastLesson}</strong>
                </div>
              </section>
            </div>

            {/* RIGHT: Q&A + Reviews — each scrollable box (≈ 3 items tall) */}
            <div className="pl-2">
              <section className="mb-6">
                <h2 className="text-[clamp(1rem,1.6vw,1.25rem)] font-semibold mb-3" style={{ color: BRAND.deepBlue }}>
                  Q&A
                </h2>
                <div className="rounded-xl border bg-white p-3 overflow-y-auto max-h-80">
                  <div className="space-y-3">
                    {qa.map((q) => (
                      <div key={q.id} className="rounded-lg border p-3 text-gray-700">
                        <p className="font-medium">{q.question}</p>
                        {q.answer ? (
                          <p className="text-sm text-gray-600 mt-1">{q.answer}</p>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1">(No answer yet)</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[clamp(1rem,1.6vw,1.25rem)] font-semibold mb-3" style={{ color: BRAND.deepBlue }}>
                  {lang === "FA" ? "نظرات" : "Reviews"}
                </h2>
                <div className="rounded-xl border bg-white p-3 overflow-y-auto max-h-80">
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border p-3 text-gray-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{r.user}</span>
                          <span className="text-sm text-yellow-600">{"★".repeat(r.rating)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
