import React, { useEffect, useMemo, useRef, useState } from "react";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };

/** ========= Types ========= */
type Lesson = {
  id: number;
  title: string;
  duration_minutes: number;
  video_url?: string; // mock
  completed?: boolean;
};
type Course = {
  id: number;
  title: string;
  teacher?: string;
  organization?: string;
  students_count?: number;
  rating_avg?: number;
  purchased?: boolean;
};

/** ========= Mock Data ========= */
const mockCourse: Course = {
  id: 1,
  title: "Mastering Prompt Engineering",
  teacher: "Dr. Sara AI",
  organization: "Future Minds Academy",
  students_count: 12840,
  rating_avg: 4.7,
  purchased: true,
};

const mockLessons: Lesson[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  title: `Lesson ${i + 1}: Concept ${(i + 1) * 5}`,
  duration_minutes: 8 + (i % 6) * 4,
  video_url: "", // use empty => poster icon; connect real URL later
  completed: i < 3, // first 3 completed as example
}));

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
  Play: () => (
    <svg width="48" height="48" viewBox="0 0 24 24">
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17l-3.5-3.5L4 14.17l5 5 11-11-1.41-1.41z"/></svg>
  ),
  Prev: () => (
    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
  ),
  Next: () => (
    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
  ),
};

/** ========= Utils ========= */
const timeLabel = (mins: number) => `${mins} min`;

/** ========= Component ========= */
export default function LessonPlayer() {
  // data
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // header/ui
  const [panelOpen, setPanelOpen] = useState(true);
  const [lang, setLang] = useState<"FA" | "EN">("EN");
  const [isAuth, setIsAuth] = useState(true);
  const [search, setSearch] = useState("");
  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 340);

  // right column tabs (stacked boxes, each scrollable)
  const [notes, setNotes] = useState<string>("");
  const transcript = useMemo(
    () =>
      `Auto transcript (mock) for "${lessons[currentIndex]?.title ?? "Lesson"}".
Timestamps and speaker turns can go here...`,
    [lessons, currentIndex]
  );
  const resources = [
    { id: 1, title: "Slides (PDF)", href: "#" },
    { id: 2, title: "Code Starter (ZIP)", href: "#" },
    { id: 3, title: "Extra Reading", href: "#" },
  ];

  // video ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // responsive panel width
  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 340);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // load mock
  useEffect(() => {
    setCourse(mockCourse);
    setLessons(mockLessons);
    setCurrentIndex(0);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const v = videoRef.current;
      if (e.key === " " || e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (v.paused) v.play().catch(()=>{}); else v.pause();
      } else if (e.key.toLowerCase() === "j") {
        v.currentTime = Math.max(0, v.currentTime - 10);
      } else if (e.key.toLowerCase() === "l") {
        v.currentTime = Math.min(v.duration || v.currentTime + 10, v.currentTime + 10);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const paddingLeftWhenOpen = panelOpen ? panelW : 0;
  const current = lessons[currentIndex];
  const nextIdx = Math.min(lessons.length - 1, currentIndex + 1);
  const prevIdx = Math.max(0, currentIndex - 1);

  const filteredList = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter((l) => l.title.toLowerCase().includes(q));
  }, [lessons, search]);

  const gotoLesson = (id: number) => {
    const idx = lessons.findIndex((l) => l.id === id);
    if (idx >= 0) setCurrentIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-2xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
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
                placeholder={lang === "FA" ? "جست‌وجوی درس…" : "Search lessons…"}
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Icon.Search />
              </span>
            </div>
          </div>

          {/* language */}
          <button onClick={() => setLang((l) => (l === "EN" ? "FA" : "EN"))} className="px-3 py-2 rounded border text-sm">
            {lang}
          </button>

          {/* auth */}
          <button onClick={() => setIsAuth((v) => !v)} className="p-2 rounded hover:bg-gray-100" title={isAuth ? "Profile" : "Login"}>
            <Icon.User />
          </button>
        </div>
      </header>

      {/* ===== LEFT SIDEBAR (Course Outline) ===== */}
      {panelOpen && (
        <aside
          className="fixed left-0 top-16 bottom-0 z-40 border-r bg-white flex flex-col"
          style={{ width: panelW }}
          aria-label="Course outline"
        >
          <div className="p-3 border-b">
            <div className="font-semibold text-[clamp(.95rem,1.4vw,1.05rem)]" style={{ color: BRAND.deepBlue }}>
              {course?.title}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {course?.organization} • {course?.teacher}
            </div>
          </div>

          <div className="p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder={lang === "FA" ? "جست‌وجو در فهرست…" : "Search outline…"}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            <ul className="space-y-1">
              {filteredList.map((l, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => gotoLesson(l.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 border flex items-center justify-between ${isActive ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50"}`}
                    >
                      <span className="text-[13px] md:text-sm line-clamp-2">{l.title}</span>
                      <span className="text-[11px] text-gray-500 ml-2">{timeLabel(l.duration_minutes)}</span>
                    </button>
                    {l.completed && <div className="pl-3 pt-1 text-green-600 text-xs inline-flex items-center gap-1"><Icon.Check /> Completed</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      )}

      {/* ===== PAGE CONTENT ===== */}
      <div className="pt-[80px]" style={{ paddingLeft: panelOpen ? panelW : 0 }}>
        <main className="max-w-screen-2xl w-full mx-auto px-3 sm:px-6 py-5">
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-6">
            {/* Center: Player & controls */}
            <section>
              {/* Video */}
              <div className="relative overflow-hidden rounded-xl aspect-video bg-black flex items-center justify-center text-white">
                {current?.video_url ? (
                  <video ref={videoRef} src={current.video_url} controls className="w-full h-full" />
                ) : (
                  <Icon.Play />
                )}
              </div>

              {/* Title + Controls */}
              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h1 className="text-[clamp(1rem,1.8vw,1.35rem)] font-semibold">{current?.title}</h1>
                <div className="flex items-center gap-2">
                  {/* speed */}
                  <label className="text-sm text-gray-600">Speed</label>
                  <select
                    className="border rounded-lg px-2 py-1 text-sm"
                    onChange={(e) => {
                      if (videoRef.current) videoRef.current.playbackRate = Number(e.target.value);
                    }}
                    defaultValue={1}
                  >
                    <option value={0.75}>0.75×</option>
                    <option value={1}>1×</option>
                    <option value={1.25}>1.25×</option>
                    <option value={1.5}>1.5×</option>
                    <option value={1.75}>1.75×</option>
                    <option value={2}>2×</option>
                  </select>

                  {/* complete toggle */}
                  <button
                    className={`px-3 py-1.5 rounded-lg text-sm border ${current?.completed ? "bg-green-50 border-green-300 text-green-700" : ""}`}
                    onClick={() =>
                      setLessons((arr) =>
                        arr.map((l, i) => (i === currentIndex ? { ...l, completed: !l.completed } : l))
                      )
                    }
                  >
                    {current?.completed ? "Completed ✓" : "Mark as Complete"}
                  </button>
                </div>
              </div>

              {/* Prev / Next */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  className="px-3 py-2 rounded-lg border inline-flex items-center gap-1 disabled:opacity-50"
                  onClick={() => setCurrentIndex(prevIdx)}
                  disabled={currentIndex === 0}
                >
                  <Icon.Prev /> Prev
                </button>
                <button
                  className="px-3 py-2 rounded-lg border inline-flex items-center gap-1 disabled:opacity-50"
                  onClick={() => setCurrentIndex(nextIdx)}
                  disabled={currentIndex === lessons.length - 1}
                >
                  Next <Icon.Next />
                </button>
              </div>
            </section>

            {/* Right column: three independent scrollable boxes */}
            <aside className="space-y-6">
              {/* Notes */}
              <div className="rounded-xl border bg-white p-3">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>
                  {lang === "FA" ? "یادداشت‌ها" : "Notes"}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-28 border rounded-lg p-2 text-sm"
                  placeholder={lang === "FA" ? "یادداشت بنویس…" : "Write a note…"}
                />
              </div>

              {/* Transcript */}
              <div className="rounded-xl border bg-white p-3 overflow-y-auto max-h-80">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>
                  Transcript
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{transcript}</pre>
              </div>

              {/* Resources */}
              <div className="rounded-xl border bg-white p-3 overflow-y-auto max-h-80">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>
                  Resources
                </div>
                <ul className="space-y-2 text-sm">
                  {resources.map((r) => (
                    <li key={r.id}>
                      <a href={r.href} className="text-blue-700 hover:underline">{r.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
