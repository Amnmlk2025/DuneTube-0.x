import { useEffect, useRef, useState } from "react";

import Header from "../components/Header";
import CourseCard from "../components/CourseCard";
import type { Course } from "../types/course";

const PAGE_SIZE = 50;
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const ShortsCarousel = () => (
  <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
    <h3 className="mb-2 font-semibold">ویدیوهای کوتاه</h3>
    <div className="flex gap-3 overflow-x-auto pb-1">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="aspect-[9/16] w-40 shrink-0 rounded-2xl bg-slate-200" />
      ))}
    </div>
  </section>
);

const Home = () => {
  const [items, setItems] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE}/courses/?page=${page}&page_size=${PAGE_SIZE}&ordering=-created`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load courses: ${response.status}`);
        }
        const payload = (await response.json()) as { results?: Course[]; next?: string | null };
        if (ignore) {
          return;
        }
        const nextItems = payload?.results ?? [];
        setItems((previous) => (page === 1 ? nextItems : [...previous, ...nextItems]));
        setHasMore(Boolean(payload?.next));
      } catch (error) {
        console.error("Failed to load home courses", error);
        setHasMore(false);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [page]);

  useEffect(() => {
    if (!loadRef.current) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((previous) => previous + 1);
      }
    });

    observer.observe(loadRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <>
      <Header />

      <ShortsCarousel />

      <main className="mx-auto max-w-7xl px-3 pb-12 sm:px-6">
        <h3 className="mb-3 font-semibold">فهرست دوره‌ها</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div ref={loadRef} className="h-10" />
      </main>
    </>
  );
};

export default Home;
