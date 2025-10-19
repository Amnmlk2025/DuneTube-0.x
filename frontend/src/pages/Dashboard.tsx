import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ===== Brand ===== */
const BRAND = { deepBlue: "#0A355C" };

/* ===== LocalStorage keys (همان‌هایی که در CourseDetail استفاده شد) ===== */
const LS_WISHLIST = "dt_wishlist";          // number[]
const LS_PROGRESS = "dt_progress";          // { [courseId]: lessonId }

/* ===== Helpers for LS ===== */
const readWishlist = (): number[] => {
  try { const r = localStorage.getItem(LS_WISHLIST); return r ? JSON.parse(r) : []; } catch { return []; }
};
const writeWishlist = (ids: number[]) => localStorage.setItem(LS_WISHLIST, JSON.stringify(ids));

const readProgress = (): Record<string, number> => {
  try { const r = localStorage.getItem(LS_PROGRESS); return r ? JSON.parse(r) : {}; } catch { return {}; }
};

/* ===== Types & Mock Data ===== */
type Course = {
  id: number;
  title: string;
  teacher?: string;
  organization?: string;
  rating_avg?: number;
  students_count?: number;
  thumbnail?: string;
  purchased?: boolean;
};

const allCourses: Course[] = [
  { id: 1, title: "Mastering Prompt Engineering", teacher: "Dr. Sara AI", organization: "Future Minds", rating_avg: 4.7, students_count: 12840, purchased: true },
  { id: 2, title: "Practical UI Design", teacher: "Lina", organization: "Dunetube Academy", rating_avg: 4.6, students_count: 9200, purchased: false },
  { id: 3, title: "Data Viz with D3", teacher: "Omid", organization: "TechLab", rating_avg: 4.4, students_count: 5400, purchased: true },
  { id: 4, title: "Marketing Analytics", teacher: "Ali", organization: "MarketIQ", rating_avg: 4.5, students_count: 6100, purchased: false },
];

/* ===== Icons ===== */
const Icon = {
  Hamburger: () => (
    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>
  ),
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor"/><polygon points="10,9 16,12 10,15" fill="white"/></svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"/></svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"/></svg>
  ),
  Star: () => (<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>),
  Trash: () => (<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12v2H6V7Zm2 3h8l-1 9H9l-1-9Zm3-7h2l1 1h5v2H5V4h5l1-1Z"/></svg>),
};

/* ===== Card ===== */
function CourseRow({ c, lastLesson, onRemoveWishlist }: {
  c: Course;
  lastLesson?: number;
  onRemoveWishlist?: (id: number) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 flex items-center gap-3">
      <div className="w-28 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-60"><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium leading-tight line-clamp-2">{c.title}</div>
        <div className="text-xs text-gray-600">{c.organization} • {c.teacher}</div>
        <div className="text-[12px] text-gray-500 flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><Icon.Star/> {c.rating_avg?.toFixed(1)}</span>
          <span>•</span>
          <span>{(c.students_count ?? 0).toLocaleString()} students</span>
          {typeof lastLesson === "number" && <><span>•</span><span>Last lesson: {lastLesson}</span></>}
        </div>
      </div>

      {c.purchased ? (
        <Link to={`/course/${c.id}/lesson/${lastLesson ?? 1}`}>
          <button className="px-3 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>
            Continue
          </button>
        </Link>
      ) : onRemoveWishlist ? (
        <button onClick={() => onRemoveWishlist(c.id)} className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">
          <Icon.Trash/> Remove
        </button>
      ) : (
        <Link to={`/course/${c.id}/checkout`}>
          <button className="px-3 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>
            Enroll
          </button>
        </Link>
      )}
    </div>
  );
}

/* ===== Page ===== */
export default function Dashboard() {
  // header/panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 360);
  const [lang, setLang] = useState<"FA" | "EN">("EN");
  const [search, setSearch] = useState("");
  const [isAuth, setIsAuth] = useState(true);
  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 360);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const paddingLeftWhenOpen = panelOpen ? panelW : 0;

  // data
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    setWishlistIds(readWishlist());
    setProgress(readProgress());
  }, []);

  const myCourses = useMemo(() => allCourses.filter(c => c.purchased), []);
  const wishlistCourses = useMemo(
    () => allCourses.filter(c => wishlistIds.includes(c.id)),
    [wishlistIds]
  );

  const filteredMy = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? myCourses : myCourses.filter(c => c.title.toLowerCase().includes(q));
  }, [myCourses, search]);

  const filteredWish = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? wishlistCourses : wishlistCourses.filter(c => c.title.toLowerCase().includes(q));
  }, [wishlistCourses, search]);

  const removeFromWishlist = (id: number) => {
    const next = wishlistIds.filter(x => x !== id);
    setWishlistIds(next);
    writeWishlist(next);
  };

  // tabs
  type Tab = "my" | "wishlist" | "certs" | "settings";
  const [tab, setTab] = useState<Tab>("my");

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
          <button onClick={() => setPanelOpen(v=>!v)} className="p-2 rounded hover:bg-gray-100" aria-label="Menu"><Icon.Hamburger/></button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: BRAND.deepBlue }}>
            <Icon.Logo/>
          </div>
          <span className="hidden sm:block font-semibold text-[clamp(1rem,1.6vw,1.125rem)]" style={{ color: BRAND.deepBlue }}>Dunetube</span>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border text-[clamp(.9rem,1.2vw,1rem)]" placeholder="Search my courses…"/>
              <span className="absolute left-3 top-2.5 text-gray-500"><Icon.Search/></span>
            </div>
          </div>

          <button onClick={()=>setLang(l=>l==="EN"?"FA":"EN")} className="px-3 py-2 rounded border text-sm">{lang}</button>
          <button onClick={()=>setIsAuth(v=>!v)} className="p-2 rounded hover:bg-gray-100"><Icon.User/></button>
        </div>
      </header>

      {/* SETTINGS PANEL */}
      {panelOpen && (
        <aside className="fixed left-0 top-16 bottom-0 z-40 border-r bg-white overflow-y-auto" style={{ width: panelW }}>
          <div className="p-4 text-sm text-gray-700 space-y-6">
            <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Settings</div>
            <div className="space-y-2">
              <div className="font-medium">Language</div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">FA</button>
                <button className="px-3 py-2 rounded border">EN</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium mt-4">Account</div>
              {isAuth ? <div className="rounded border p-3">Signed in • Profile & Security</div> :
                <button className="px-3 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>Sign in / Sign up</button>}
            </div>
          </div>
        </aside>
      )}

      {/* CONTENT */}
      <div className="pt-[80px]" style={{ paddingLeft: paddingLeftWhenOpen }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5 py-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5">
            {[
              { id: "my", label: lang==="FA"?"دوره‌های من":"My Courses" },
              { id: "wishlist", label: "Wishlist" },
              { id: "certs", label: lang==="FA"?"گواهی‌ها":"Certificates" },
              { id: "settings", label: lang==="FA"?"تنظیمات":"Settings" },
            ].map(t => (
              <button
                key={t.id}
                onClick={()=>setTab(t.id as any)}
                className={`px-3 py-2 rounded-lg border ${tab===t.id ? "border-blue-500 ring-1 ring-blue-200" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* My Courses */}
          {tab==="my" && (
            <section className="space-y-3">
              {filteredMy.length === 0 ? (
                <div className="rounded-xl border bg-white p-6 text-center text-gray-600">
                  {lang==="FA"?"هنوز دوره‌ای نخریده‌اید.":"You haven't purchased any courses yet."}
                  <div className="mt-3">
                    <Link to="/catalog">
                      <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>
                        {lang==="FA"?"مشاهده کاتالوگ":"Browse Catalog"}
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                filteredMy.map(c => (
                  <CourseRow key={c.id} c={c} lastLesson={progress[String(c.id)] ?? 1}/>
                ))
              )}
            </section>
          )}

          {/* Wishlist */}
          {tab==="wishlist" && (
            <section className="space-y-3">
              {filteredWish.length === 0 ? (
                <div className="rounded-xl border bg-white p-6 text-center text-gray-600">
                  {lang==="FA"?"لیست نشان‌ها خالی است.":"Your wishlist is empty."}
                </div>
              ) : (
                filteredWish.map(c => (
                  <CourseRow key={c.id} c={c} onRemoveWishlist={removeFromWishlist}/>
                ))
              )}
            </section>
          )}

          {/* Certificates (mock) */}
          {tab==="certs" && (
            <section className="grid gap-4 sm:grid-cols-2">
              {[1,2].map(i=>(
                <div key={i} className="rounded-xl border bg-white p-4">
                  <div className="font-medium">Certificate #{i}</div>
                  <div className="text-sm text-gray-600">Issued: 2025-01-0{i}</div>
                  <div className="mt-2">
                    <button className="px-3 py-2 rounded-lg border">Download PDF</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Settings (mock) */}
          {tab==="settings" && (
            <section className="rounded-xl border bg-white p-4 max-w-lg space-y-3">
              <div className="font-semibold" style={{ color: BRAND.deepBlue }}>Profile</div>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="Full name"/>
              <input className="border rounded-lg px-3 py-2 w-full" placeholder="Email"/>
              <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }}>Save</button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
