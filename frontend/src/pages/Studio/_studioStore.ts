// استور سبک با LocalStorage (پایداری ساده در مرورگر)

export type Status = "draft" | "published" | "paused";

export type AttachmentType = "video" | "pdf" | "slide" | "exercise" | "other";

export type Attachment = {
  id: string;
  type: AttachmentType;
  name: string;
  // برای دمو می‌تونیم ObjectURL بسازیم؛ در LocalStorage ذخیره نمی‌کنیم
  tempUrl?: string;
};

export type Lesson = {
  lid: string;           // شناسه یکتای درس
  title: string;         // عنوان قابل ویرایش
  attachments: Attachment[]; // فایل‌های هر درس (ویدیو/پی‌دی‌اف/...)
};

export type Course = {
  uid: string;           // شناسه یکتای یکتا و دائمی دوره
  title: string;
  status: Status;
  lessons: Lesson[];     // ترتیب آرایه = ترتیب نمایش؛ شماره‌ها از روی index محاسبه می‌شود
  students?: number;     // فقط published/paused
  rating?: number;       // فقط published/paused
  updated_at: string;
};

const LS_KEY = "dt_studio_courses_v2";

function uuid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

let cache: Course[] | null = null;

function seed(): Course[] {
  const arr: Course[] = [];
  for (let i = 1; i <= 8; i++) {
    const status: Status = i % 3 === 1 ? "published" : i % 3 === 2 ? "paused" : "draft";
    const lessons: Lesson[] = Array.from({ length: 5 + (i % 4) }).map((_, j) => ({
      lid: uuid("l"),
      title: `Lesson ${j + 1}`,
      attachments: [],
    }));
    arr.push({
      uid: uuid("c"),
      title: `My Course #${i}`,
      status,
      lessons,
      students: status === "draft" ? undefined : 200 * i,
      rating: status === "draft" ? undefined : 4 + ((i % 5) / 10),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return arr;
}

function load(): Course[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache!;
    }
  } catch {}
  cache = seed();
  persist();
  return cache!;
}

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {}
}

export function listCourses(): Course[] {
  return [...load()];
}

export function getCourse(uid: string): Course | undefined {
  return load().find((c) => c.uid === uid);
}

export function upsertCourse(c: Course) {
  const arr = load();
  const i = arr.findIndex((x) => x.uid === c.uid);
  if (i >= 0) arr[i] = c;
  else arr.unshift(c);
  cache = arr;
  persist();
}

export function createDraftLike(source?: Course): Course {
  const now = new Date().toISOString();
  const next: Course = source
    ? {
        ...source,
        uid: uuid("c"),
        status: "draft",
        students: undefined,
        rating: undefined,
        lessons: source.lessons.map((ls) => ({
          ...ls,
          lid: uuid("l"),
          attachments: [], // فایل‌ها کپی نمی‌شوند (قوانین کپی حقیقی به بعد موکول)
        })),
        updated_at: now,
      }
    : {
        uid: uuid("c"),
        title: "Untitled Course",
        status: "draft",
        lessons: [],
        updated_at: now,
      };
  upsertCourse(next);
  return next;
}

export function duplicateCourse(uid: string): Course | undefined {
  const src = getCourse(uid);
  if (!src) return;
  return createDraftLike(src);
}

export function publishCourse(uid: string) {
  const c = getCourse(uid);
  if (!c) return;
  c.status = "published";
  c.students ??= 0;
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
}

export function pauseCourse(uid: string) {
  const c = getCourse(uid);
  if (!c) return;
  c.status = "paused"; // دسترسی دانشجویان حفظ می‌شود
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
}

export function resumeCourse(uid: string) {
  const c = getCourse(uid);
  if (!c) return;
  c.status = "published";
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
}

/* عملیات روی درس‌ها (برای Editor) */
export function addLesson(uid: string, title = "New lesson"): Course | undefined {
  const c = getCourse(uid);
  if (!c) return;
  c.lessons.push({ lid: uuid("l"), title, attachments: [] });
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
  return c;
}

export function removeLesson(uid: string, lid: string): Course | undefined {
  const c = getCourse(uid);
  if (!c) return;
  c.lessons = c.lessons.filter((x) => x.lid !== lid);
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
  return c;
}

export function moveLesson(uid: string, from: number, to: number): Course | undefined {
  const c = getCourse(uid);
  if (!c) return;
  const arr = [...c.lessons];
  const [it] = arr.splice(from, 1);
  arr.splice(to, 0, it);
  c.lessons = arr;
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
  return c;
}

export function renameLesson(uid: string, lid: string, title: string): Course | undefined {
  const c = getCourse(uid);
  if (!c) return;
  const L = c.lessons.find((x) => x.lid === lid);
  if (L) L.title = title;
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
  return c;
}

export function attachToLesson(
  uid: string,
  lid: string,
  files: { type: AttachmentType; file: File }[]
): { tmpUrls: string[] } | undefined {
  const c = getCourse(uid);
  if (!c) return;
  const L = c.lessons.find((x) => x.lid === lid);
  if (!L) return;
  const urls: string[] = [];
  for (const { type, file } of files) {
    const a: Attachment = {
      id: uuid("a"),
      type,
      name: file.name,
      tempUrl: URL.createObjectURL(file), // فقط برای دمو / پیش‌نمایش
    };
    L.attachments.push(a);
    urls.push(a.tempUrl!);
  }
  c.updated_at = new Date().toISOString();
  upsertCourse(c);
  return { tmpUrls: urls };
}
