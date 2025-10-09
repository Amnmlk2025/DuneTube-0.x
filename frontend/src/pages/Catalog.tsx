import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CourseCard from "../components/CourseCard";
import { getHealth, listCourses } from "../lib/api";
import type { Course } from "../types/course";

type FetchState = "idle" | "loading" | "success" | "error";
type HealthStatus = "idle" | "checking" | "ok" | "fail";

const PAGE_SIZE = 9;
const ORDERING_OPTIONS = new Set(["-created_at", "title", "price_amount", "-price_amount"]);

const Catalog = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [query, setQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [loadingRails, setLoadingRails] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

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
        navigate({ pathname: "/catalog", search: normalized }, { replace: true });
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
        console.error("Failed to load catalog courses", error);
        setState("error");
      }
    },
    [ordering, submittedQuery, syncUrl],
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadRails = async () => {
      try {
        setLoadingRails(true);
        setLoadError(false);
        const payload = await listCourses(
          { page: 1, page_size: 8, ordering: "-created_at" },
          { signal: controller.signal },
        );
        const results = payload?.results ?? [];
        const byRating = [...results].sort((a, b) => {
          const ratingA = Number.parseFloat(String(a.rating_avg ?? 0)) || 0;
          const ratingB = Number.parseFloat(String(b.rating_avg ?? 0)) || 0;
          return ratingB - ratingA;
        });
        setFeaturedCourses(byRating.slice(0, 4));
        setLatestCourses(results.slice(0, 6));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load catalog hero rails", error);
          setLoadError(true);
          setFeaturedCourses([]);
          setLatestCourses([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRails(false);
        }
      }
    };

    void loadRails();
    return () => controller.abort();
  }, []);

  const hasSyncedRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchValue = params.get("search") ?? "";
    const orderingValue = params.get("ordering") ?? "-created_at";
    const pageValue = Number.parseInt(params.get("page") ?? "1", 10);
    const normalizedOrdering = ORDERING_OPTIONS.has(orderingValue) ? orderingValue : "-created_at";
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

  const checkHealth = async () => {
    try {
      setHealthStatus("checking");
      const response = await getHealth();
      if (response?.ok) {
        setHealthStatus("ok");
      } else {
        setHealthStatus("fail");
      }
    } catch (error) {
      console.error("Health check failed", error);
      setHealthStatus("fail");
    }
  };

  const healthMessage = useMemo(() => {
    if (healthStatus === "checking") {
      return t("hero.healthStatus.checking");
    }
    if (healthStatus === "ok") {
      return t("hero.healthStatus.ok");
    }
    if (healthStatus === "fail") {
      return t("hero.healthStatus.fail");
    }
    return t("hero.healthStatus.idle");
  }, [healthStatus, t]);

  const healthButtonClasses = useMemo(() => {
    const base =
      "golden-click inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70";
    if (healthStatus === "ok") {
      return `${base} bg-brand-gold text-white`;
    }
    if (healthStatus === "fail") {
      return `${base} bg-rose-500 text-white`;
    }
    if (healthStatus === "checking") {
      return `${base} bg-brand-gold/70 text-slate-900 animate-pulse`;
    }
    return `${base} border border-slate-200 bg-white text-brand-gold hover:bg-brand-gold/10`;
  }, [healthStatus]);

  const healthIcon = useMemo(() => {
    if (healthStatus === "checking") {
      return (
        <svg
          className="h-4 w-4 animate-spin text-brand-night"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
      );
    }
    if (healthStatus === "ok") {
      return (
        <svg className="h-4 w-4 text-brand-night" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.285 6.708a1 1 0 0 0-1.57-1.245l-7.356 9.279-3.093-3.093a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.502-.074l7.931-10.281Z" />
        </svg>
      );
    }
    if (healthStatus === "fail") {
      return (
        <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm.707 14.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L12 14.586l2.293-2.293a1 1 0 0 1 1.414 1.414Zm0-4.414a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L12 10.172l2.293-2.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 15a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm1-4a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0Z" />
      </svg>
    );
  }, [healthStatus]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 md:text-base">{t("hero.subtitle")}</p>
        </div>
        <button type="button" onClick={checkHealth} className={healthButtonClasses}>
          {healthIcon}
          <span>{t("hero.ctaHealth")}</span>
        </button>
      </header>
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 flex items-center gap-2 text-xs font-medium ${
          healthStatus === "ok"
            ? "text-brand-gold"
            : healthStatus === "fail"
                ? "text-rose-500"
                : healthStatus === "checking"
                    ? "text-brand-gold/80"
                    : "text-slate-500"
        }`}
      >
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            healthStatus === "ok"
              ? "bg-brand-gold shadow-glow-gold"
              : healthStatus === "fail"
                  ? "bg-rose-500"
                  : healthStatus === "checking"
                      ? "bg-brand-gold/70 animate-pulse"
                      : "bg-slate-400"
          }`}
        />
        <span>{healthMessage}</span>
      </p>

      <section className="mt-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">{t("home.rails.featuredTitle")}</h2>
            <p className="text-sm text-slate-500">{t("home.rails.featuredSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="golden-click inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:bg-brand-gold/10"
          >
            {t("home.actions.viewCatalog")}
          </button>
        </div>
        {loadingRails ? (
          <div className="scroll-rail">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {t("home.rails.error")}
          </p>
        ) : featuredCourses.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {t("home.rails.empty")}
          </p>
        ) : (
          <div className="scroll-rail">
            {featuredCourses.map((course) => (
              <div key={course.id} className="min-w-[260px]">
                <CourseCard course={course} layout="horizontal" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">{t("home.rails.latestTitle")}</h2>
            <p className="text-sm text-slate-500">{t("home.rails.latestSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="golden-click inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:bg-brand-gold/10"
          >
            {t("home.actions.viewCatalog")}
          </button>
        </div>
        {loadingRails ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {t("home.rails.error")}
          </p>
        ) : latestCourses.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {t("home.rails.empty")}
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-start">
          <h1 className="font-display text-4xl font-semibold text-slate-900 md:text-5xl">{t("catalog.title")}</h1>
          <p className="text-base text-slate-600 md:text-lg">{t("catalog.subtitle")}</p>
          {countLabel ? <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{countLabel}</p> : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 items-center gap-3">
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

      <div className="mt-12 space-y-6">
        {state === "loading" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : state === "error" ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {t("catalog.error")}
          </p>
        ) : !hasCourses ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            {t("catalog.empty")}
          </p>
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

export default Catalog;
