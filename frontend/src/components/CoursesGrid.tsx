import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CourseCard from "./CourseCard";
import { listCourses } from "../lib/api";
import type { Course } from "../types/course";

type FetchState = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 9;
const ORDERING_OPTIONS = new Set(["-created_at", "title", "price_amount", "-price_amount"]);

type CoursesGridProps = {
  initialQuery?: string;
  initialOrdering?: string;
};

const CoursesGrid = ({ initialQuery = "", initialOrdering = "-created_at" }: CoursesGridProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [ordering, setOrdering] = useState<string>(initialOrdering);
  const [query, setQuery] = useState<string>(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState<string>(initialQuery);

  const syncUrl = useCallback(
    ({ nextPage, search, sort }: { nextPage: number; search: string; sort: string }) => {
      const params = new URLSearchParams();
      if (nextPage > 1) {
        params.set("page", String(nextPage));
      }
      if (search) {
        params.set("search", search);
      }
      if (sort && sort !== "-created_at") {
        params.set("ordering", sort);
      }
      const nextSearch = params.toString();
      const normalized = nextSearch ? `?${nextSearch}` : "";
      if (location.search !== normalized) {
        navigate({ pathname: "/", search: normalized }, { replace: true });
      }
    },
    [location.search, navigate],
  );

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
      const normalizedPage = Number.isFinite(targetPage) && targetPage && targetPage > 0 ? targetPage : 1;
      const normalizedSearch = (keyword ?? "").trim();
      const normalizedOrdering = ORDERING_OPTIONS.has(sort ?? "") ? (sort as string) : "-created_at";
      const searchParam = normalizedSearch;

      syncUrl({ nextPage: normalizedPage, search: searchParam, sort: normalizedOrdering });

      try {
        setState("loading");
        const payload = await listCourses({
          page: normalizedPage,
          page_size: PAGE_SIZE,
          search: searchParam || undefined,
          ordering: normalizedOrdering || undefined,
        });
        setCourses(payload.results ?? []);
        setTotalCount(payload.count ?? 0);
        setHasNext(Boolean(payload?.next));
        setHasPrevious(Boolean(payload?.previous));
        setPage(normalizedPage);
        setState("success");
      } catch (error) {
        console.error("Failed to load courses grid", error);
        setState("error");
      }
    },
    [ordering, submittedQuery, syncUrl],
  );

  const hasSyncedRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchValue = params.get("search") ?? "";
    const orderingValue = params.get("ordering") ?? "-created_at";
    const pageValue = Number.parseInt(params.get("page") ?? "1", 10);
    const normalizedOrdering = ORDERING_OPTIONS.has(orderingValue) ? orderingValue : initialOrdering;
    const normalizedPage = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

    setQuery(searchValue);
    setSubmittedQuery(searchValue);
    setOrdering(normalizedOrdering);

    const shouldReload =
      !hasSyncedRef.current || searchValue !== submittedQuery || normalizedOrdering !== ordering || normalizedPage !== page;

    if (shouldReload) {
      hasSyncedRef.current = true;
      void loadCourses({ targetPage: normalizedPage, keyword: searchValue, sort: normalizedOrdering });
    }
  }, [location.search, loadCourses, ordering, page, submittedQuery]);

  useEffect(() => {
    if (!location.search && initialQuery && initialQuery !== submittedQuery) {
      setQuery(initialQuery);
      setSubmittedQuery(initialQuery);
      void loadCourses({ targetPage: 1, keyword: initialQuery, sort: initialOrdering });
    }
  }, [initialOrdering, initialQuery, loadCourses, location.search, submittedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSubmittedQuery(trimmed);
    void loadCourses({ targetPage: 1, keyword: trimmed, sort: ordering });
  };

  const handleReset = () => {
    const nextOrdering = initialOrdering;
    const nextQuery = "";
    setQuery(nextQuery);
    setSubmittedQuery(nextQuery);
    setOrdering(nextOrdering);
    void loadCourses({ targetPage: 1, keyword: nextQuery, sort: nextOrdering });
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
    <section id="courses-grid" className="mx-auto mt-16 w-full max-w-7xl space-y-8 px-4 md:px-6">
      <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-2 text-start">
          <h2 className="text-xl font-semibold text-brand-deep md:text-2xl">{t("catalog.title")}</h2>
          <p className="text-sm text-slate-600 md:text-base">{t("catalog.subtitle")}</p>
          {countLabel ? <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{countLabel}</p> : null}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("catalog.searchPlaceholder") ?? ""}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="golden-click absolute inset-y-2 right-2 inline-flex items-center justify-center rounded-full border border-slate-200 px-3 text-xs uppercase tracking-[0.18em] text-slate-500 hover:border-brand-gold hover:text-brand-gold"
                >
                  {t("catalog.clear")}
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="golden-click inline-flex items-center rounded-full bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-gold/90"
            >
              {t("catalog.searchAction")}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex flex-col text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>{t("catalog.sortLabel")}</span>
              <select
                value={ordering}
                onChange={(event) => {
                  const value = event.target.value;
                  setOrdering(value);
                  void loadCourses({ targetPage: 1, keyword: submittedQuery, sort: value });
                }}
                className="mt-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
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
              className="golden-click inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-brand-gold hover:text-brand-gold"
            >
              {t("catalog.reset")}
            </button>
          </div>
        </form>
      </header>

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
        {state === "loading" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : state === "error" ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{t("catalog.error")}</p>
        ) : !hasCourses ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">{t("catalog.empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
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
              className="golden-click inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("catalog.prev")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext || state === "loading"}
              className="golden-click inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-brand-gold hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("catalog.next")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesGrid;
