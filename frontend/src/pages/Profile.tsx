import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

/* ===== FullCalendar (بدون ایمپورت CSS از پکیج‌ها) ===== */
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

/* ================= Brand ================= */
const BRAND = { deepBlue: "#0A355C" };

/* ================= Types ================= */
type Short = {
  id: number;
  title: string;
  views: number;
  createdAt: string;
  videoUrl?: string;   // external link
  mediaId?: string;    // uploaded file in IndexedDB
  thumbnail?: string;
};
type Course = { id: number; title: string; students?: number; rating?: number; thumbnail?: string };
type Experience = { role: string; org: string; from: string; to?: string; desc?: string };
type Post = { id: number; caption: string; mediaUrl?: string; createdAt: string };
type BookingStatus = "pending" | "approved" | "declined";

/** v2 booking compatible with calendar providers */
type Booking = {
  id: string;           // string for FC compatibility
  title?: string;
  start: string;        // ISO
  end: string;          // ISO
  note?: string;
  status: BookingStatus;
};

type LegacyBooking = {
  id: number;
  when: string;         // ISO start
  durationMin: number;
  note?: string;
  status: BookingStatus;
};

type Profile = {
  id: number;
  username: string;
  fullName: string;
  headline: string;
  bio: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  posts: number;
  avatar?: string;
  cover?: string;
  isInstructor?: boolean;
  resume: {
    about: string;
    experiences: Experience[];
    skills: string[];
  };
};

type AvailabilityBlock = { dow: number; start: string; end: string }; // 0..6 (Sun..Sat)
type Availability = { slotMinutes: number; blocks: AvailabilityBlock[] };
type BookingPolicy = { requireApproval: boolean };

/* ================= LocalStorage Keys ================= */
const LS_PROFILE_PREFIX = "dt_profile_";
const LS_FOLLOWING = "dt_following";
const lsKeyShorts = (u: string) => `dt_shorts_${u}`;
const lsKeyPosts = (u: string) => `dt_posts_${u}`;
const lsKeyBooks = (u: string) => `dt_bookings_v2_${u}`;
const lsKeyBooksLegacy = (u: string) => `dt_bookings_${u}`;
const lsKeyAvail = (u: string) => `dt_availability_${u}`;
const lsKeyPolicy = (u: string) => `dt_booking_policy_${u}`;

/* ================= Mock Seed ================= */
const baseProfile: Profile = {
  id: 101,
  username: "sara",
  fullName: "Dr. Sara AI",
  headline: "AI Educator • Prompt Engineering Specialist",
  bio: "Helping teams design reliable AI workflows. Instructor @Future Minds Academy.",
  location: "Tehran, IR",
  website: "https://dunetube.example",
  followers: 12800,
  following: 312,
  posts: 56,
  isInstructor: true,
  avatar: "",
  cover: "",
  resume: {
    about:
      "10+ years in ML/NLP. Teaching prompt engineering, evaluation, and safety. Previously at ResearchLab.",
    experiences: [
      { role: "Lead Instructor", org: "Future Minds Academy", from: "2022", desc: "Designed 6 courses on LLMs." },
      { role: "Senior NLP Engineer", org: "ResearchLab", from: "2018", to: "2022", desc: "Built production LLM systems." },
    ],
    skills: ["Prompting", "RAG", "Evaluation", "Python", "Product Thinking"],
  },
};

const mockCourses: Course[] = [
  { id: 1, title: "Mastering Prompt Engineering", students: 12840, rating: 4.7 },
  { id: 2, title: "AI Safety for Builders", students: 7200, rating: 4.6 },
];

/* ================= Icons ================= */
const Icon = {
  Hamburger: () => (<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>),
  Logo: () => (<svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor"/><polygon points="10,9 16,12 10,15" fill="white"/></svg>),
  Search: () => (<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"/></svg>),
  User: () => (<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"/></svg>),
  Link: () => (<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3.9 12a5 5 0 015-5h3v2h-3a3 3 0 100 6h3v2h-3a5 5 0 01-5-5Zm6-1h4v2h-4v-2Zm5.1-4h3a5 5 0 110 10h-3v-2h3a3 3 0 100-6h-3V7Z"/></svg>),
  PlaySmall: () => (<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>),
  Star: () => (<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>),
  Trash: () => (<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 7h12v2H6V7Zm2 3h8l-1 9H9l-1-9Zm3-7h2l1 1h5v2H5V4h5l1-1Z"/></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 011 1v15a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3V2zm13 8H4v9h16v-9zM6 12h5v4H6v-4z"/></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 1.75A10.25 10.25 0 112 12 10.26 10.26 0 0112 1.75Zm0 1.5A8.75 8.75 0 1020.75 12 8.76 8.76 0 0012 3.25Zm.75 4v4.19l3.5 2.1-.75 1.23L11.25 12V7.25h1.5Z"/></svg>),
};

/* ================= IndexedDB (برای فایل‌های شرت) ================= */
const IDB_VERSION = 1;
function openMediaDB(username: string): Promise<IDBDatabase> {
  const dbName = `dt_media_${username}`;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbPutFile(username: string, id: string, blob: Blob): Promise<void> {
  const db = await openMediaDB(username);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put({ id, blob, type: blob.type });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGetFile(username: string, id: string): Promise<Blob | null> {
  const db = await openMediaDB(username);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const req = tx.objectStore("files").get(id);
    req.onsuccess = () => resolve(req.result ? (req.result.blob as Blob) : null);
    req.onerror = () => reject(req.error);
  });
}

/* ================= LS utils ================= */
function loadProfile(username: string): Profile {
  const raw = localStorage.getItem(LS_PROFILE_PREFIX + username);
  if (raw) { try { return JSON.parse(raw) as Profile; } catch {} }
  const seed = { ...baseProfile, username };
  localStorage.setItem(LS_PROFILE_PREFIX + username, JSON.stringify(seed));
  return seed;
}
function saveProfileLS(p: Profile) { localStorage.setItem(LS_PROFILE_PREFIX + p.username, JSON.stringify(p)); }
function readFollowing(): string[] { try { return JSON.parse(localStorage.getItem(LS_FOLLOWING) || "[]"); } catch { return []; } }
function writeFollowing(arr: string[]) { localStorage.setItem(LS_FOLLOWING, JSON.stringify(arr)); }
function readShorts(username: string): Short[] { try { return JSON.parse(localStorage.getItem(lsKeyShorts(username)) || "[]"); } catch { return []; } }
function writeShorts(username: string, items: Short[]) { localStorage.setItem(lsKeyShorts(username), JSON.stringify(items)); }
function readPosts(username: string): Post[] { try { return JSON.parse(localStorage.getItem(lsKeyPosts(username)) || "[]"); } catch { return []; } }
function writePosts(username: string, items: Post[]) { localStorage.setItem(lsKeyPosts(username), JSON.stringify(items)); }

/* ---- Booking read/write with migration (v1 -> v2) ---- */
function migrateLegacyBookings(username: string): Booking[] {
  const legacyRaw = localStorage.getItem(lsKeyBooksLegacy(username));
  if (!legacyRaw) return [];
  let legacy: LegacyBooking[] = [];
  try { legacy = JSON.parse(legacyRaw) as LegacyBooking[]; } catch {}
  const migrated: Booking[] = legacy.map(b => {
    const start = new Date(b.when);
    const end = new Date(start.getTime() + b.durationMin * 60000);
    return {
      id: String(b.id),
      title: b.status === "pending" ? "Awaiting approval" : "Session",
      start: start.toISOString(),
      end: end.toISOString(),
      note: b.note,
      status: b.status,
    };
  });
  localStorage.setItem(lsKeyBooks(username), JSON.stringify(migrated));
  localStorage.removeItem(lsKeyBooksLegacy(username));
  return migrated;
}
function readBookings(username: string): Booking[] {
  const raw = localStorage.getItem(lsKeyBooks(username));
  if (raw) { try { return JSON.parse(raw) as Booking[]; } catch {} }
  return migrateLegacyBookings(username);
}
function writeBookings(username: string, items: Booking[]) {
  localStorage.setItem(lsKeyBooks(username), JSON.stringify(items));
}

function readAvailability(username: string): Availability {
  try {
    const raw = localStorage.getItem(lsKeyAvail(username));
    if (raw) return JSON.parse(raw) as Availability;
  } catch {}
  const def: Availability = {
    slotMinutes: 30,
    blocks: [
      { dow: 6, start: "10:00", end: "13:00" }, // Sat
      { dow: 6, start: "15:00", end: "18:00" },
      { dow: 0, start: "10:00", end: "13:00" }, // Sun
      { dow: 0, start: "15:00", end: "18:00" },
      { dow: 1, start: "10:00", end: "13:00" }, // Mon
      { dow: 1, start: "15:00", end: "18:00" },
      { dow: 2, start: "10:00", end: "13:00" }, // Tue
      { dow: 2, start: "15:00", end: "18:00" },
      { dow: 3, start: "10:00", end: "13:00" }, // Wed
      { dow: 3, start: "15:00", end: "18:00" },
    ],
  };
  localStorage.setItem(lsKeyAvail(username), JSON.stringify(def));
  return def;
}
function saveAvailability(username: string, a: Availability) {
  localStorage.setItem(lsKeyAvail(username), JSON.stringify(a));
}
function readPolicy(username: string): BookingPolicy {
  try { const raw = localStorage.getItem(lsKeyPolicy(username)); if (raw) return JSON.parse(raw); } catch {}
  const def = { requireApproval: true };
  localStorage.setItem(lsKeyPolicy(username), JSON.stringify(def));
  return def;
}
function savePolicy(username: string, p: BookingPolicy) {
  localStorage.setItem(lsKeyPolicy(username), JSON.stringify(p));
}

/* ================= Helpers ================= */
function pad2(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toBusinessHours(av: Availability): { daysOfWeek: number[]; startTime: string; endTime: string }[] {
  const grouped: Record<string, number[]> = {};
  for (const b of av.blocks) {
    const key = `${b.start}-${b.end}`;
    grouped[key] = grouped[key] || [];
    grouped[key].push(b.dow);
  }
  return Object.entries(grouped).map(([key, dows]) => {
    const [start, end] = key.split("-");
    return { daysOfWeek: dows, startTime: start, endTime: end };
  });
}

/* ================= LinkedIn Import (URL-based) ================= */
type LIUnified = {
  fullName?: string;
  headline?: string;
  summary?: string;
  location?: string;
  experiences?: { role?: string; org?: string; from?: string; to?: string; desc?: string }[];
  skills?: string[];
};
function mapLinkedInToProfile(p: Profile, unified?: LIUnified): Profile {
  if (!unified) return p;
  const exp = (unified.experiences || []).map(e=>({
    role: e.role || "",
    org: e.org || "",
    from: e.from || "",
    to: e.to || "",
    desc: e.desc || "",
  }));
  return {
    ...p,
    fullName: unified.fullName || p.fullName,
    headline: unified.headline || p.headline,
    bio: unified.summary || p.bio,
    location: unified.location || p.location,
    resume: {
      ...p.resume,
      about: unified.summary || p.resume.about || p.bio,
      experiences: exp.length ? exp : p.resume.experiences,
      skills: (unified.skills || []).length ? (unified.skills as string[]) : p.resume.skills,
    },
  };
}
async function importLinkedInByUrl(url: string): Promise<{ unified?: LIUnified }> {
  try {
    const res = await fetch("/api/linkedin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return data;
  } catch {
    // fallback demo
    const demo: LIUnified = {
      fullName: "Demo User",
      headline: "Senior AI Instructor",
      summary: "Educator and builder in LLM apps. Passionate about safe and reliable AI.",
      location: "Remote",
      skills: ["Prompt Engineering", "Python", "RAG", "Evaluation"],
      experiences: [
        { role: "Instructor", org: "Dunetube Academy", from: "2023", desc: "Taught 3 cohorts in Prompting." },
        { role: "ML Engineer", org: "Acme AI", from: "2020", to: "2023", desc: "Shipped production NLP systems." },
      ],
    };
    return { unified: demo };
  }
}

/* ================= Page ================= */
export default function ProfilePage() {
  const params = useParams();
  const username = (params.username || "sara").toLowerCase();

  // header / settings
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 340);
  const [search, setSearch] = useState("");
  const [isAuth, setIsAuth] = useState(true); // فرض: وارد شده‌ایم
  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 340);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const paddingLeftWhenOpen = panelOpen ? panelW : 0;

  // profile
  const [profile, setProfile] = useState<Profile>(() => loadProfile(username));
  useEffect(() => setProfile(loadProfile(username)), [username]);

  // follow
  const [following, setFollowing] = useState<string[]>(readFollowing());
  const isFollowing = following.includes(username);
  const toggleFollow = () => {
    const next = isFollowing ? following.filter(u => u !== username) : [...new Set([...following, username])];
    setFollowing(next); writeFollowing(next);
    setProfile(p => { const np = { ...p, followers: p.followers + (isFollowing ? -1 : 1) }; saveProfileLS(np); return np; });
  };

  // shorts/posts
  const [shorts, setShorts] = useState<Short[]>(() => readShorts(username));
  const [posts, setPosts] = useState<Post[]>(() => readPosts(username));
  useEffect(() => { setShorts(readShorts(username)); setPosts(readPosts(username)); }, [username]);
  const filteredShorts = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? shorts : shorts.filter((s) => s.title.toLowerCase().includes(q));
  }, [search, shorts]);

  // availability & policy
  const [availability, setAvailability] = useState<Availability>(() => readAvailability(username));
  const [policy, setPolicy] = useState<BookingPolicy>(() => readPolicy(username));

  // bookings (v2)
  const [bookings, setBookings] = useState<Booking[]>(() => readBookings(username));
  useEffect(() => { setBookings(readBookings(username)); }, [username]);

  // right column derived lists
  const fmtShort = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const upcomingApproved = bookings.filter(b => b.status === "approved" && new Date(b.start) >= new Date());
  const pendingBookings = bookings.filter(b => b.status === "pending");

  // tabs (چیدمان اولیه)
  type Tab = "resume" | "shorts" | "courses" | "posts";
  const [tab, setTab] = useState<Tab>("resume");

  // modals
  const [editOpen, setEditOpen] = useState(false);
  const [liUrl, setLiUrl] = useState("");
  const [calendarModal, setCalendarModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [bookNote, setBookNote] = useState("");
  const [availModal, setAvailModal] = useState(false);

  // shorts create
  const [shortModal, setShortModal] = useState(false);
  const [shortTitle, setShortTitle] = useState("");
  const [shortVideoUrl, setShortVideoUrl] = useState("");
  const [shortThumb, setShortThumb] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");

  async function addShort() {
    if (!shortTitle.trim()) return;
    const id = Date.now();
    let entry: Short = {
      id,
      title: shortTitle.trim(),
      views: Math.floor(500 + Math.random() * 5000),
      createdAt: new Date().toISOString(),
    };
    const file = fileRef.current?.files?.[0];
    if (file) {
      const mediaId = `vid_${id}`;
      await idbPutFile(username, mediaId, file);
      entry.mediaId = mediaId;
    } else if (shortVideoUrl.trim()) {
      entry.videoUrl = shortVideoUrl.trim();
    }
    if (shortThumb.trim()) entry.thumbnail = shortThumb.trim();

    const next = [entry, ...shorts];
    setShorts(next); writeShorts(username, next);
    setShortTitle(""); setShortVideoUrl(""); setShortThumb(""); setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    setShortModal(false);
  }
  function deleteShort(id: number) {
    const next = shorts.filter(s => s.id !== id);
    setShorts(next); writeShorts(username, next);
  }
  const [objectUrlCache, setObjectUrlCache] = useState<Record<string, string>>({});
  async function ensureObjectUrl(mediaId: string) {
    if (objectUrlCache[mediaId]) return objectUrlCache[mediaId];
    const blob = await idbGetFile(username, mediaId);
    if (!blob) return "";
    const url = URL.createObjectURL(blob);
    setObjectUrlCache(prev => ({ ...prev, [mediaId]: url }));
    return url;
  }

  // posts
  const [postModal, setPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postMedia, setPostMedia] = useState("");
  function addPost() {
    if (!postCaption.trim()) return;
    const item: Post = { id: Date.now(), caption: postCaption.trim(), mediaUrl: postMedia.trim() || undefined, createdAt: new Date().toISOString() };
    const next = [item, ...posts];
    setPosts(next); writePosts(username, next);
    setPostCaption(""); setPostMedia(""); setPostModal(false);
    setProfile(p => { const np = { ...p, posts: p.posts + 1 }; saveProfileLS(np); return np; });
  }
  function deletePost(id: number) {
    const next = posts.filter(p => p.id !== id);
    setPosts(next); writePosts(username, next);
  }

  // booking helpers
  function createBookingFromSelection(startISO: string, endISO: string) {
    const b: Booking = {
      id: String(Date.now()),
      title: policy.requireApproval ? "Awaiting approval" : "Session",
      start: startISO,
      end: endISO,
      note: bookNote.trim() || undefined,
      status: policy.requireApproval ? "pending" : "approved",
    };
    const next = [...bookings, b].sort((a,b)=> a.start.localeCompare(b.start));
    setBookings(next); writeBookings(username, next);
  }
  function approveBooking(id: string, status: BookingStatus) {
    const next = bookings.map(b => b.id === id ? { ...b, status, title: status === "pending" ? "Awaiting approval" : "Session" } : b);
    setBookings(next); writeBookings(username, next);
  }
  function deleteBooking(id: string) {
    const next = bookings.filter(b => b.id !== id);
    setBookings(next); writeBookings(username, next);
  }

  // FC derived
  const businessHours = useMemo(() => toBusinessHours(availability), [availability]);
  const slotDuration = useMemo(() => {
    const mins = Math.max(5, availability.slotMinutes || 30);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}:00`;
  }, [availability.slotMinutes]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ===== Header ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
          <button onClick={() => setPanelOpen((v) => !v)} className="p-2 rounded hover:bg-gray-100" aria-label="Menu"><Icon.Hamburger /></button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: BRAND.deepBlue }}><Icon.Logo /></div>
          <span className="hidden sm:block font-semibold text-[clamp(1rem,1.6vw,1.125rem)]" style={{ color: BRAND.deepBlue }}>Dunetube</span>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border text-[clamp(.9rem,1.2vw,1rem)]" placeholder={"Search content…"} />
              <span className="absolute left-3 top-2.5 text-gray-500"><Icon.Search /></span>
            </div>
          </div>

          <button onClick={() => setIsAuth((v) => !v)} className="p-2 rounded hover:bg-gray-100"><Icon.User /></button>
        </div>
      </header>

      {/* Settings panel */}
      {panelOpen && (
        <aside className="fixed left-0 top-16 bottom-0 z-40 border-r bg-white overflow-y-auto" style={{ width: panelW }}>
          <div className="p-4 text-sm text-gray-700 space-y-6">
            <div className="font-semibold" style={{ color: BRAND.deepBlue }}>Settings</div>
            <div className="space-y-1">
              <div className="font-medium mt-4">Preview</div>
              <div className="text-xs text-gray-500">Switch your role via the right column buttons.</div>
            </div>
          </div>
        </aside>
      )}

      {/* ===== Page content ===== */}
      <div className="pt-[80px]" style={{ paddingLeft: paddingLeftWhenOpen }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5 pb-10">
          {/* Cover + header strip */}
          <section className="rounded-xl overflow-hidden border bg-white">
            <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-blue-50 to-blue-100 relative">
              {profile.cover && <img src={profile.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            </div>
            <div className="px-4 sm:px-6 -mt-8 sm:-mt-10 relative">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-gray-200 overflow-hidden">
                  {profile.avatar && <img src={profile.avatar} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-[clamp(1.15rem,2vw,1.6rem)] font-semibold">{profile.fullName}</h1>
                  <div className="text-sm text-gray-700">{profile.headline}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {profile.location || "—"} •{" "}
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                        <Icon.Link /> Website
                      </a>
                    ) : (
                      <span className="text-gray-400">No website</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <button className="px-4 py-2 rounded-lg border">Message</button>
                  <button className="px-4 py-2 rounded-lg border" onClick={() => setEditOpen(true)}>Edit Profile</button>
                </div>
              </div>

              {/* Tabs ON TOP of left column (layout اولیه) */}
              <div className="mt-4 border-t">
                <div className="flex gap-2 py-2">
                  {[
                    { id: "resume", label: "Resume" },
                    { id: "shorts", label: "Shorts" },
                    { id: "courses", label: "Courses" },
                    { id: "posts", label: "Posts" },
                  ].map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id as any)} className={`px-3 py-2 rounded-lg border ${tab === t.id ? "border-blue-500 ring-1 ring-blue-200" : ""}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Two-column layout (LEFT big, RIGHT narrow) */}
          <section className="mt-4 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            {/* LEFT: Tab contents */}
            <div>
              {tab === "resume" && (
                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
                  {/* About + Experience */}
                  <div className="rounded-xl border bg-white p-4 space-y-5">
                    <div>
                      <div className="font-semibold mb-1" style={{ color: BRAND.deepBlue }}>About</div>
                      <p className="text-sm text-gray-700">{profile.resume.about || profile.bio}</p>
                    </div>
                    <div>
                      <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Experience</div>
                      <ul className="space-y-3">
                        {profile.resume.experiences.map((e, i) => (
                          <li key={i} className="rounded-lg border p-3">
                            <div className="font-medium">{e.role || "-"}</div>
                            <div className="text-sm text-gray-600">{e.org || "-"} • {e.from || "-"}{e.to ? `–${e.to}` : ""}</div>
                            {e.desc && <p className="text-sm text-gray-700 mt-1">{e.desc}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills */}
                  <aside className="rounded-xl border bg-white p-4">
                    <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.resume.skills.map((s, i) => (<span key={i} className="px-3 py-1 rounded-full border text-sm bg-white">{s}</span>))}
                    </div>
                  </aside>
                </div>
              )}

              {tab === "shorts" && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Vertical videos • {filteredShorts.length}</div>
                    <button className="px-3 py-2 rounded-lg border inline-flex items-center gap-1" onClick={() => setShortModal(true)}>+ Add Short</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredShorts.map((s) => (
                      <div key={s.id} className="rounded-xl overflow-hidden bg-white border hover:shadow-sm transition relative">
                        <button className="absolute top-2 right-2 z-10 bg-white/80 rounded p-1" onClick={() => deleteShort(s.id)} title="Delete"><Icon.Trash /></button>
                        <div className="aspect-[9/16] bg-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
                          {s.thumbnail ? (
                            <img src={s.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : s.videoUrl ? (
                            <video src={s.videoUrl} className="w-full h-full object-cover" muted controls />
                          ) : s.mediaId ? (
                            <VideoFromIDB username={username} mediaId={s.mediaId} ensureObjectUrl={ensureObjectUrl} />
                          ) : (
                            <Icon.PlaySmall />
                          )}
                        </div>
                        <div className="p-2">
                          <div className="text-sm font-medium line-clamp-2">{s.title}</div>
                          <div className="text-xs text-gray-500">{s.views.toLocaleString()} views</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "courses" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockCourses.map((c) => (
                    <div key={c.id} className="rounded-xl border bg-white overflow-hidden">
                      <div className="aspect-video bg-gray-200" />
                      <div className="p-3">
                        <div className="font-medium line-clamp-2">{c.title}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1"><Icon.Star />{c.rating?.toFixed(1)}</span>
                          <span>•</span>
                          <span>{(c.students ?? 0).toLocaleString()} students</span>
                        </div>
                        <div className="mt-2">
                          <Link to={`/course/${c.id}`}>
                            <button className="px-3 py-1.5 rounded-lg text-white text-sm" style={{ background: BRAND.deepBlue }}>
                              View course
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "posts" && (
                <div className="space-y-3">
                  <div className="text-right"><button className="px-3 py-2 rounded-lg border inline-flex items-center gap-1" onClick={() => setPostModal(true)}>+ Create Post</button></div>
                  {posts.length === 0 ? (
                    <div className="rounded-xl border bg-white p-6 text-center text-gray-600">No posts yet.</div>
                  ) : (
                    posts.map((p) => (
                      <div key={p.id} className="rounded-xl border bg-white p-4">
                        <div className="text-xs text-gray-500 mb-1">{fmtShort.format(new Date(p.createdAt))}</div>
                        <div className="text-sm">{p.caption}</div>
                        {p.mediaUrl && <div className="mt-2 rounded-lg overflow-hidden border">
                          {/\.(mp4|webm|ogg)$/i.test(p.mediaUrl) ? (
                            <video src={p.mediaUrl} controls className="w-full" />
                          ) : (
                            <img src={p.mediaUrl} alt="" className="w-full object-cover" />
                          )}
                        </div>}
                        <div className="mt-2 text-right"><button className="px-3 py-1.5 rounded-lg border inline-flex items-center gap-1" onClick={() => deletePost(p.id)}><Icon.Trash /> Delete</button></div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: contact + booking widgets (همان جای قبلی) */}
            <aside className="space-y-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Contact</div>
                <div className="text-sm text-gray-700">{profile.bio}</div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    className="px-4 py-2 rounded-lg text-white flex-1"
                    style={{ background: BRAND.deepBlue }}
                    onClick={() => { setCalendarModal(true); setSelectedRange(null); setBookNote(""); }}
                  >
                    Book a session
                  </button>
                  <button className="px-4 py-2 rounded-lg border flex-1" onClick={() => setAvailModal(true)}>
                    Set availability
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Calendar opens in a modal. Select a time range to request a session.</p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Upcoming sessions</div>
                {upcomingApproved.length === 0 ? (
                  <div className="text-sm text-gray-600">No sessions yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {upcomingApproved.map(b => (
                      <li key={b.id} className="rounded-lg border p-2 text-sm flex items-center justify-between">
                        <span className="inline-flex items-center gap-2"><Icon.Clock/>{fmtShort.format(new Date(b.start))}</span>
                        <button className="px-2 py-1 rounded border inline-flex items-center gap-1" onClick={() => deleteBooking(b.id)}><Icon.Trash /> Cancel</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {pendingBookings.length > 0 && (
                <div className="rounded-xl border bg-white p-4">
                  <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>Pending approval</div>
                  <ul className="space-y-2">
                    {pendingBookings.map(b => (
                      <li key={b.id} className="rounded-lg border p-2 text-sm flex items-center justify-between">
                        <span className="inline-flex items-center gap-2"><Icon.Clock/>{fmtShort.format(new Date(b.start))}</span>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 rounded-lg border" onClick={() => approveBooking(b.id, "declined")}>Decline</button>
                          <button className="px-2 py-1 rounded-lg text-white" style={{ background: BRAND.deepBlue }} onClick={() => approveBooking(b.id, "approved")}>Approve</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </section>
        </main>
      </div>

      {/* ===== Modals ===== */}

      {/* Edit Profile + LinkedIn importer */}
      {editOpen && (
        <ModalBase
          title="Edit Profile"
          onClose={() => setEditOpen(false)}
          footer={
            <>
              <button className="px-4 py-2 rounded-lg border" onClick={() => setEditOpen(false)}>Close</button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }} onClick={() => { saveProfileLS(profile); setEditOpen(false); }}>
                Save
              </button>
            </>
          }
        >
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <LabeledInput label="Full name" value={profile.fullName} onChange={(v)=>setProfile(p=>({...p, fullName:v}))}/>
              <LabeledInput label="Headline" value={profile.headline} onChange={(v)=>setProfile(p=>({...p, headline:v}))}/>
              <LabeledInput label="Location" value={profile.location||""} onChange={(v)=>setProfile(p=>({...p, location:v}))}/>
              <LabeledInput label="Website (URL)" value={profile.website||""} onChange={(v)=>setProfile(p=>({...p, website:v}))}/>
            </div>
            <LabeledTextarea label="Bio" value={profile.bio} onChange={(v)=>setProfile(p=>({...p, bio:v}))}/>
            <div className="grid sm:grid-cols-2 gap-3">
              <LabeledInput label="Avatar URL" value={profile.avatar||""} onChange={(v)=>setProfile(p=>({...p, avatar:v}))}/>
              <LabeledInput label="Cover URL" value={profile.cover||""} onChange={(v)=>setProfile(p=>({...p, cover:v}))}/>
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <div className="font-medium">Import from LinkedIn</div>
              <div className="flex gap-2">
                <input className="border rounded-lg px-3 py-2 flex-1" placeholder="https://www.linkedin.com/in/username" value={liUrl} onChange={(e)=>setLiUrl(e.target.value)} />
                <button className="px-3 py-2 rounded-lg border" onClick={async ()=>{
                  const url = liUrl.trim();
                  if (!/^https?:\/\/.+linkedin\.com\/in\//i.test(url)) { alert("Enter a valid LinkedIn URL"); return; }
                  const data = await importLinkedInByUrl(url);
                  const merged = mapLinkedInToProfile(profile, data.unified);
                  setProfile(merged);
                  alert("LinkedIn data fetched and mapped. Review and Save.");
                }}>Fetch & Map</button>
              </div>
              <p className="text-xs text-gray-500">کاربر فقط URL را می‌دهد؛ استخراج/پاک‌سازی داده سمت سرور شما انجام می‌شود.</p>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Create Short */}
      {shortModal && (
        <ModalBase title="Add Short" onClose={() => setShortModal(false)} footer={
          <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }} onClick={addShort}>Add</button>
        }>
          <div className="p-4 space-y-3">
            <LabeledInput label="Title" value={shortTitle} onChange={setShortTitle}/>
            <LabeledInput label="Video URL (optional)" placeholder="https://...mp4" value={shortVideoUrl} onChange={setShortVideoUrl}/>
            <LabeledInput label="Thumbnail URL (optional)" value={shortThumb} onChange={setShortThumb}/>
            <div className="pt-2">
              <label className="text-sm text-gray-600">Or upload a file (MP4/WEBM)</label>
              <input ref={fileRef} type="file" accept="video/mp4,video/webm" className="mt-1 block w-full" onChange={(e)=> setFileName(e.target.files?.[0]?.name || "")}/>
              {fileName && <div className="text-xs text-gray-500 mt-1">Selected: {fileName}</div>}
            </div>
          </div>
        </ModalBase>
      )}

      {/* Create Post */}
      {postModal && (
        <ModalBase title="Create Post" onClose={() => setPostModal(false)} footer={
          <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }} onClick={addPost}>Publish</button>
        }>
          <div className="p-4 space-y-3">
            <LabeledTextarea label="Caption" value={postCaption} onChange={setPostCaption}/>
            <LabeledInput label="Media URL (image or video)" placeholder="https://... (jpg/png/mp4/webm)" value={postMedia} onChange={setPostMedia}/>
          </div>
        </ModalBase>
      )}

      {/* Calendar Modal (height-limited, sticky footer) */}
      {calendarModal && (
        <ModalBase
          title="Book a session"
          onClose={() => setCalendarModal(false)}
          footer={
            <>
              <button className="px-4 py-2 rounded-lg border" onClick={() => setCalendarModal(false)}>Cancel</button>
              <button
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ background: BRAND.deepBlue }}
                disabled={!selectedRange}
                onClick={() => {
                  if (!selectedRange) return;
                  createBookingFromSelection(selectedRange.start, selectedRange.end);
                  setCalendarModal(false); setSelectedRange(null); setBookNote("");
                }}
              >
                Confirm booking
              </button>
            </>
          }
          maxWidth="max-w-4xl"
        >
          <div className="p-3 space-y-3">
            <div className="rounded-lg border overflow-hidden h-[62vh] sm:h-[68vh]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
                height="100%"
                contentHeight="auto"
                handleWindowResize
                expandRows
                allDaySlot={false}
                selectable
                selectMirror
                businessHours={businessHours}
                slotDuration={slotDuration}
                selectConstraint="businessHours"
                select={(arg) => setSelectedRange({ start: arg.startStr, end: arg.endStr })}
                events={bookings.map(b => ({
                  id: b.id,
                  title: b.title || (b.status === "pending" ? "Awaiting approval" : "Session"),
                  start: b.start,
                  end: b.end,
                  color: b.status === "pending" ? "#F59E0B" : b.status === "approved" ? "#2563EB" : "#9CA3AF",
                }))}
                eventClick={(info) => {
                  const id = info.event.id;
                  const target = bookings.find(b => b.id === id);
                  if (!target) return;
                  const choice = window.prompt(`Event ${id}\nStatus: ${target.status}\nChoose: approve | decline | delete`);
                  if (choice === "approve") approveBooking(id, "approved");
                  else if (choice === "decline") approveBooking(id, "declined");
                  else if (choice === "delete") deleteBooking(id);
                }}
              />
            </div>

            {selectedRange && (
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium mb-1">Selected:</div>
                <div className="text-sm">
                  {fmtShort.format(new Date(selectedRange.start))} — {fmtShort.format(new Date(selectedRange.end))}
                </div>
              </div>
            )}
            <LabeledTextarea label="Note (optional)" value={bookNote} onChange={setBookNote}/>
            <div className="text-xs text-gray-500">
              {policy.requireApproval ? "After submission, your booking will await instructor approval." : "Your booking confirms immediately."}
            </div>
          </div>
        </ModalBase>
      )}

      {/* Availability modal (simple business hours editor) */}
      {availModal && (
        <ModalBase
          title="Set availability"
          onClose={()=>setAvailModal(false)}
          footer={
            <>
              <button className="px-4 py-2 rounded-lg border" onClick={()=>setAvailModal(false)}>Close</button>
              <button className="px-4 py-2 rounded-lg text-white" style={{ background: BRAND.deepBlue }} onClick={()=>{
                saveAvailability(username, availability);
                savePolicy(username, policy);
                setAvailModal(false);
              }}>Save</button>
            </>
          }
        >
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="Slot length (min)" type="number" min={5} step={5} value={String(availability.slotMinutes)} onChange={(v)=> setAvailability(a=>({ ...a, slotMinutes: Math.max(5, parseInt(v||"30")||30) }))}/>
              <div className="flex items-end">
                <label className="text-sm text-gray-600 mr-2">Require manual approval</label>
                <input type="checkbox" checked={policy.requireApproval} onChange={e=> setPolicy({ requireApproval: e.target.checked })}/>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="p-2 border-b font-medium" style={{ color: BRAND.deepBlue }}>Weekly business hours</div>
              <div className="p-2 space-y-2">
                {availability.blocks.map((b, idx)=>(
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                    <select className="border rounded-lg px-2 py-1" value={b.dow} onChange={e=>{
                      const next=[...availability.blocks]; next[idx]={...next[idx], dow: parseInt(e.target.value)}; setAvailability(a=>({...a, blocks: next}));
                    }}>
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>(<option key={i} value={i}>{d}</option>))}
                    </select>
                    <input type="time" className="border rounded-lg px-2 py-1" value={b.start} onChange={e=>{
                      const next=[...availability.blocks]; next[idx]={...next[idx], start:e.target.value}; setAvailability(a=>({...a, blocks: next}));
                    }}/>
                    <input type="time" className="border rounded-lg px-2 py-1" value={b.end} onChange={e=>{
                      const next=[...availability.blocks]; next[idx]={...next[idx], end:e.target.value}; setAvailability(a=>({...a, blocks: next}));
                    }}/>
                    <button className="px-2 py-1 rounded-lg border" onClick={()=>{
                      setAvailability(a=>({...a, blocks: a.blocks.filter((_,i)=>i!==idx)}));
                    }}>Remove</button>
                  </div>
                ))}
                <div><button className="px-3 py-1.5 rounded-lg border" onClick={()=>{
                  setAvailability(a=>({...a, blocks:[...a.blocks, { dow: 0, start:"09:00", end:"12:00"}]}));
                }}>+ Add block</button></div>
              </div>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );

  /* ==== small components ==== */
  function LabeledInput(props: { label: string; value: string; onChange: (v:string)=>void; type?: string; placeholder?: string; min?: number; step?: number }) {
    return (
      <div>
        <label className="text-sm text-gray-600">{props.label}</label>
        <input
          className="border rounded-lg px-3 py-2 w-full"
          value={props.value}
          onChange={(e)=>props.onChange(e.target.value)}
          type={props.type||"text"}
          placeholder={props.placeholder}
          min={props.min} step={props.step}
        />
      </div>
    );
  }
  function LabeledTextarea(props: { label: string; value: string; onChange: (v:string)=>void }) {
    return (
      <div>
        <label className="text-sm text-gray-600">{props.label}</label>
        <textarea className="border rounded-lg px-3 py-2 w-full min-h-[80px]" value={props.value} onChange={(e)=>props.onChange(e.target.value)} />
      </div>
    );
  }
}

/* ===== ModalBase: sticky header/footer + scrollable body ===== */
function ModalBase({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-3xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className={`absolute top-0 right-0 bottom-0 w-full ${maxWidth} bg-white shadow-xl rounded-l-2xl flex flex-col`}>
        <div className="shrink-0 sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button className="p-2 rounded hover:bg-gray-100" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.58 13.4l-6.3 6.3-1.41-1.41L9.17 12 2.87 5.71 4.29 4.3 10.58 10.6 16.87 4.3z"/></svg>
          </button>
        </div>
        <div className="grow overflow-y-auto">{children}</div>
        {footer && (
          <div className="shrink-0 sticky bottom-0 bg-white border-t p-3">
            <div className="flex items-center justify-end gap-2">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== VideoFromIDB for Shorts ===== */
function VideoFromIDB({ username, mediaId, ensureObjectUrl }:{ username:string; mediaId:string; ensureObjectUrl:(id:string)=>Promise<string> }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => { ensureObjectUrl(mediaId).then(setUrl); }, [mediaId, username, ensureObjectUrl]);
  if (!url) return <div className="text-xs text-gray-500">Loading…</div>;
  return <video src={url} className="w-full h-full object-cover" muted controls />;
}
