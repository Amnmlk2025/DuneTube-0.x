import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CourseCard from "../components/CourseCard";
import { getHealth, listCourses } from "../lib/api";
import type { Course } from "../types/course";

type HealthStatus = "idle" | "checking" | "ok" | "fail";

const Home = () => {
  const { t } = useTranslation();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [loadingRails, setLoadingRails] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

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
          console.error("Failed to load home rails", error);
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
      "golden-click inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70";
    if (healthStatus === "ok") {
      return `${base} bg-emerald-500 text-slate-900`;
    }
    if (healthStatus === "fail") {
      return `${base} bg-rose-600 text-white`;
    }
    if (healthStatus === "checking") {
      return `${base} bg-brand-gold/70 text-slate-900 animate-pulse`;
    }
    return `${base} border border-brand-gold/60 bg-transparent text-brand-gold hover:bg-brand-gold/20`;
  }, [healthStatus]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12">
      <section className="grid items-center gap-10 rounded-3xl border border-surface-hover/60 bg-gradient-to-br from-surface via-surface-subtle to-surface-hover px-8 py-12 shadow-[0_35px_80px_-45px_rgba(250,204,21,0.45)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold">
            {t("hero.badge")}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-2xl text-base text-slate-300 md:text-lg">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/catalog"
              className="golden-click inline-flex items-center justify-center rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-surface transition hover:shadow-glow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
            >
              {t("hero.ctaCatalog")}
            </Link>
            <button type="button" onClick={checkHealth} className={healthButtonClasses}>
              {t("hero.ctaHealth")}
            </button>
          </div>
          <p
            className={`text-sm font-semibold ${
              healthStatus === "ok"
                ? "text-emerald-400"
                : healthStatus === "fail"
                  ? "text-rose-300"
                  : "text-slate-300"
            }`}
          >
            {healthMessage}
          </p>
        </div>

        <div className="relative flex min-h-[280px] items-center justify-center">
          <div className="absolute -inset-10 rounded-[40px] border border-brand-gold/20 bg-brand-gold/10 blur-3xl" aria-hidden />
          <div className="relative flex w-full max-w-md flex-col gap-4 rounded-[32px] border border-surface-hover/60 bg-surface-subtle/80 p-8 shadow-xl backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                {t("hero.infocard.title")}
              </p>
              <p className="mt-3 text-sm text-slate-200">{t("hero.infocard.subtitle")}</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-surface-hover bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("hero.infocard.metricsTitle")}</p>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-brand-gold">42K</span>
                <span className="text-xs text-slate-400">{t("hero.infocard.learners")}</span>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              {t("hero.infocard.caption")}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">{t("home.rails.featuredTitle")}</h2>
            <p className="text-sm text-slate-400">{t("home.rails.featuredSubtitle")}</p>
          </div>
          <Link
            to="/catalog"
            className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold hover:bg-brand-gold/10"
          >
            {t("home.actions.viewCatalog")}
          </Link>
        </div>
        {loadingRails ? (
          <div className="scroll-rail">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-surface-hover/60 bg-surface-subtle"
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {t("home.rails.error")}
          </p>
        ) : featuredCourses.length === 0 ? (
          <p className="rounded-2xl border border-surface-hover/40 bg-surface/40 px-4 py-3 text-sm text-slate-300">
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

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">{t("home.rails.latestTitle")}</h2>
            <p className="text-sm text-slate-400">{t("home.rails.latestSubtitle")}</p>
          </div>
          <Link
            to="/catalog"
            className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold hover:bg-brand-gold/10"
          >
            {t("home.actions.viewCatalog")}
          </Link>
        </div>
        {loadingRails ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-surface-hover/60 bg-surface-subtle"
              />
            ))}
          </div>
        ) : loadError ? (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {t("home.rails.error")}
          </p>
        ) : latestCourses.length === 0 ? (
          <p className="rounded-2xl border border-surface-hover/40 bg-surface/40 px-4 py-3 text-sm text-slate-300">
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
    </div>
  );
};

export default Home;
