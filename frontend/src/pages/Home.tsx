import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import CoursesGrid from "../components/CoursesGrid";
import CourseCard from "../components/CourseCard";
import FiltersBar, { type FilterOption } from "../components/FiltersBar";
import Hero from "../components/Hero";
import StatsBar from "../components/StatsBar";
import { listCourses } from "../lib/api";
import type { Course } from "../types/course";
import { formatRelativeTimeFromNow } from "../utils/intl";

const Home = () => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [shorts, setShorts] = useState<Course[]>([]);
  const [examPrep, setExamPrep] = useState<Course[]>([]);

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

  const filterOptions = useMemo<FilterOption[]>(
    () => [
      { id: "all", label: t("home.filters.all") },
      { id: "popular", label: t("home.filters.popular") },
      { id: "new", label: t("home.filters.new") },
      { id: "mentat", label: t("home.filters.mentat") },
      { id: "fremen", label: t("home.filters.fremen") },
      { id: "strategy", label: t("home.filters.strategy") },
    ],
    [t],
  );

  const activeLabel = useMemo(() => {
    const found = filterOptions.find((filter) => filter.id === activeFilter);
    return found?.label ?? activeFilter;
  }, [activeFilter, filterOptions]);

  const filteredShorts = useMemo(() => {
    if (activeFilter === "all") {
      return shorts;
    }
    return shorts.filter((course) => course.tags?.includes(activeFilter));
  }, [activeFilter, shorts]);

  const filteredExamPrep = useMemo(() => {
    if (activeFilter === "all") {
      return examPrep;
    }
    return examPrep.filter((course) => course.tags?.includes(activeFilter));
  }, [activeFilter, examPrep]);

  const scrollToGrid = () => {
    const element = document.querySelector("#courses-grid");
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      <Hero />
      <StatsBar />

      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-6">
        <header className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold text-brand-deep md:text-3xl">
              {t("home.title", { defaultValue: "Stream knowledge from Arrakis" })}
            </h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              {t("home.subtitle", {
                defaultValue: "Choose a topic to tailor the latest courses, shorts, and playlists to your interests.",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <FiltersBar filters={filterOptions} activeFilter={activeFilter} onChange={setActiveFilter} />
            <p className="text-xs text-slate-500">
              {t("home.filters.selected", {
                defaultValue: "Currently viewing recommendations for:",
              })}{" "}
              <strong className="text-brand-deep">{activeLabel}</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scrollToGrid}
              className="golden-click inline-flex items-center rounded-full bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-gold/90"
            >
              {t("home.actions.viewCatalog")}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="golden-click inline-flex items-center rounded-full border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-gold hover:text-brand-gold"
            >
              {t("home.actions.resetFilters")}
            </button>
          </div>
        </header>
      </section>

      <CoursesGrid key={activeFilter} />

      <section aria-labelledby="shorts-heading" className="space-y-3 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <h2 id="shorts-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.shortsTitle", { defaultValue: "Latest Shorts" })}
          </h2>
          <button
            type="button"
            onClick={scrollToGrid}
            className="text-xs font-semibold text-brand-deep transition hover:text-brand-sand"
          >
            {t("home.actions.viewAll", { defaultValue: "View all" })}
          </button>
        </div>
        <div className="scroll-rail">
          {filteredShorts.map((course) => {
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

      <section aria-labelledby="feed-heading" className="space-y-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <h2 id="feed-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.feedTitle", { defaultValue: "Course Feed" })}
          </h2>
          <span className="text-xs text-slate-500">
            {t("home.rails.feedHint", { defaultValue: "Scroll to load more recommendations" })}
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredShorts.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section aria-labelledby="exam-heading" className="space-y-3 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <h2 id="exam-heading" className="text-lg font-semibold text-brand-deep">
            {t("home.rails.examTitle", { defaultValue: "Exam Prep" })}
          </h2>
          <button
            type="button"
            onClick={scrollToGrid}
            className="text-xs font-semibold text-brand-deep transition hover:text-brand-sand"
          >
            {t("home.actions.viewAll", { defaultValue: "View all" })}
          </button>
        </div>
        <div className="scroll-rail">
          {filteredExamPrep.map((course) => (
            <CourseCard key={course.id} course={course} layout="horizontal" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
