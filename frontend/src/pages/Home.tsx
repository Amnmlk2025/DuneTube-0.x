import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import FiltersBar, { type FilterOption } from "../components/FiltersBar";
import CourseCard from "../components/CourseCard";
import { listCourses } from "../lib/api";
import type { Course } from "../types/course";
import { formatRelativeTimeFromNow } from "../utils/intl";

const topicFilters: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
  { id: "mentat", label: "Mentat" },
  { id: "fremen", label: "Fremen" },
  { id: "strategy", label: "Strategy" },
];

const Home = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [shorts, setShorts] = useState<Course[]>([]);
  const [examPrep, setExamPrep] = useState<Course[]>([]);
  const [feed, setFeed] = useState<Course[]>([]);
  const [feedPage, setFeedPage] = useState<number>(1);
  const [feedHasMore, setFeedHasMore] = useState<boolean>(true);
  const [loadingFeed, setLoadingFeed] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadRails = async () => {
      try {
        const [{ results: latest = [] }, { results: popular = [] }] = await Promise.all([
          listCourses({ page: 1, page_size: 8, ordering: "-created_at" }),
          listCourses({ page: 1, page_size: 8, ordering: "-participants_count" }),
        ]);
        if (ignore) {
          return;
        }
        setShorts(latest.slice(0, 6));
        setExamPrep(popular.slice(0, 6));
      } catch (error) {
        console.error("Failed to load home rails", error);
      }
    };

    void loadRails();
    return () => {
      ignore = true;
    };
  }, []);

  const loadFeedPage = useCallback(
    async (page: number) => {
      try {
        setLoadingFeed(true);
        const payload = await listCourses({
          page,
          page_size: 9,
          ordering: activeFilter === "new" ? "-created_at" : undefined,
        });
        const results = payload.results ?? [];
        setFeed((previous) => (page === 1 ? results : [...previous, ...results]));
        setFeedHasMore(Boolean(payload.next));
        setFeedPage(page);
      } catch (error) {
        console.error("Failed to load course feed", error);
        setFeedHasMore(false);
      } finally {
        setLoadingFeed(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    void loadFeedPage(1);
  }, [activeFilter, loadFeedPage]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const element = sentinelRef.current;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingFeed && feedHasMore) {
          void loadFeedPage(feedPage + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [feedHasMore, feedPage, loadFeedPage, loadingFeed]);

  const activeLabel = useMemo(() => {
    const found = topicFilters.find((filter) => filter.id === activeFilter);
    return found?.label ?? activeFilter;
  }, [activeFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 md:px-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-deep md:text-3xl">
          {t("home.title", { defaultValue: "Stream knowledge from Arrakis" })}
        </h1>
        <p className="mt-2 text-sm text-slate-600 md:text-base">
          {t("home.subtitle", {
            defaultValue: "Choose a topic to tailor the latest courses, shorts, and playlists to your interests.",
          })}
        </p>
        <div className="mt-4">
          <FiltersBar filters={topicFilters} activeFilter={activeFilter} onChange={setActiveFilter} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {t("home.filters.selected", {
            defaultValue: "Currently viewing recommendations for:",
          })}{" "}
          <strong className="text-brand-deep">{activeLabel}</strong>
        </p>
      </header>

      <section aria-labelledby="shorts-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="shorts-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.shortsTitle", { defaultValue: "Latest Shorts" })}
          </h2>
          <Link to="/catalog" className="text-xs font-semibold text-brand-deep hover:text-brand-sand">
            {t("home.actions.viewAll", { defaultValue: "View all" })}
          </Link>
        </div>
        <div className="scroll-rail">
          {shorts.map((course) => {
            const timeAgo = formatRelativeTimeFromNow(course.published_at, i18n.language);
            return (
              <Link
                key={course.id}
                to={`/watch/${course.id}`}
                className="flex min-w-[220px] flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-card transition hover:-translate-y-[2px] hover:shadow-lg"
              >
                <div className="aspect-[9/16] w-full overflow-hidden rounded-lg bg-slate-100">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <span className="line-clamp-2 text-sm font-semibold text-brand-deep">{course.title}</span>
                <span className="text-xs text-slate-500">{timeAgo}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="feed-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="feed-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.feedTitle", { defaultValue: "Course Feed" })}
          </h2>
          <span className="text-xs text-slate-500">
            {t("home.rails.feedHint", { defaultValue: "Scroll to load more recommendations" })}
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {feed.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div ref={sentinelRef} className="h-8">
          {loadingFeed ? (
            <div className="flex items-center justify-center text-xs text-slate-500">
              {t("home.rails.loading", { defaultValue: "Loading…" })}
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="exam-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="exam-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.examTitle", { defaultValue: "Exam Prep" })}
          </h2>
          <Link to="/catalog" className="text-xs font-semibold text-brand-deep hover:text-brand-sand">
            {t("home.actions.viewAll", { defaultValue: "View all" })}
          </Link>
        </div>
        <div className="scroll-rail">
          {examPrep.map((course) => (
            <CourseCard key={course.id} course={course} layout="horizontal" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
