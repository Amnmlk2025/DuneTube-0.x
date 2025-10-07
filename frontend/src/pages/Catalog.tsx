import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import CourseCard from "../components/CourseCard";
import { listCourses } from "../lib/api";
import type { Course } from "../types/course";

type FetchState = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 9;

const Catalog = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [query, setQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");

  const loadCourses = useCallback(
    async ({
      targetPage = 1,
      keyword = submittedQuery,
      sort = ordering,
    }: {
      targetPage?: number;
      keyword?: string;
      sort?: string;
    } = {}) => {
      try {
        setState("loading");
        const payload = await listCourses({
          page: targetPage,
          page_size: PAGE_SIZE,
          search: keyword || undefined,
          ordering: sort || undefined,
        });
        setCourses(payload.results ?? []);
        setTotalCount(payload.count ?? 0);
        setHasNext(Boolean(payload?.next));
        setHasPrevious(Boolean(payload?.previous));
        setPage(targetPage);
        setState("success");
      } catch (error) {
        console.error("Failed to load catalog courses", error);
        setState("error");
      }
    },
    [ordering, submittedQuery],
  );

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      void loadCourses();
    }
  }, [loadCourses]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSubmittedQuery(trimmed);
    void loadCourses({ targetPage: 1, keyword: trimmed, sort: ordering });
  };

  const handleReset = () => {
    setQuery("");
    setSubmittedQuery("");
    setOrdering("-created_at");
    void loadCourses({ targetPage: 1, keyword: "", sort: "-created_at" });
  };

  const handleNext = () => {
    if (hasNext) {
      void loadCourses({ targetPage: page + 1 });
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      void loadCourses({ targetPage: Math.max(1, page - 1) });
    }
  };

  const totalPages = useMemo(() => {
    if (totalCount === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [totalCount]);

  const hasCourses = courses.length > 0;
  const countLabel = useMemo(
    () => (hasCourses ? t("catalog.count", { count: totalCount }) : ""),
    [hasCourses, t, totalCount],
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-left">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">{t("catalog.title")}</h1>
          <p className="text-base text-slate-300 md:text-lg">{t("catalog.subtitle")}</p>
          {countLabel ? <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">{countLabel}</p> : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl border border-surface-hover/60 bg-surface/70 p-6 backdrop-blur md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("catalog.searchPlaceholder") ?? ""}
                className="w-full rounded-2xl border border-surface-hover bg-surface-subtle px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="golden-click absolute inset-y-2 right-2 flex items-center justify-center rounded-full border border-surface-hover/80 px-3 text-xs uppercase tracking-[0.24em] text-slate-400 hover:text-white"
                >
                  {t("catalog.clear")}
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="golden-click inline-flex items-center rounded-full bg-brand-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-surface hover:shadow-glow-gold"
            >
              {t("catalog.searchAction")}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex flex-col text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
              <span>{t("catalog.sortLabel")}</span>
              <select
                value={ordering}
                onChange={(event) => {
                  const value = event.target.value;
                  setOrdering(value);
                  void loadCourses({ targetPage: 1, keyword: submittedQuery, sort: value });
                }}
                className="mt-1 rounded-2xl border border-surface-hover bg-surface-subtle px-3 py-2 text-sm text-slate-100 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              >
                <option value="-created_at">{t("catalog.sortOptions.newest")}</option>
                <option value="title">{t("catalog.sortOptions.title")}</option>
                <option value="price_amount">{t("catalog.sortOptions.priceAsc")}</option>
                <option value="-price_amount">{t("catalog.sortOptions.priceDesc")}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={handleReset}
              className="golden-click inline-flex items-center rounded-full border border-brand-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold hover:bg-brand-gold/10"
            >
              {t("catalog.reset")}
            </button>
          </div>
        </form>
      </header>

      <div className="mt-12 space-y-6">
        {state === "loading" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[32px] border border-surface-hover/60 bg-surface-subtle"
              />
            ))}
          </div>
        ) : state === "error" ? (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {t("catalog.error")}
          </p>
        ) : !hasCourses ? (
          <p className="rounded-2xl border border-surface-hover/40 bg-surface/40 px-4 py-4 text-sm text-slate-300">
            {t("catalog.empty")}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-surface-hover/60 bg-surface/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          <span>
            {t("catalog.paginationStatus", {
              page,
              totalPages,
            })}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!hasPrevious || state === "loading"}
              className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("catalog.prev")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext || state === "loading"}
              className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("catalog.next")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Catalog;
