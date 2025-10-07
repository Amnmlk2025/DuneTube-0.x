import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { usePreferences } from "../context/PreferencesContext";
import { getCourse, listCourseReviews, listLessons } from "../lib/api";
import type { Course } from "../types/course";
import type { Lesson } from "../types/lesson";
import type { Review } from "../types/review";
import { formatCurrencyForDisplay, formatDateTime } from "../utils/intl";

type FetchState = "idle" | "loading" | "success" | "error";

const formatDuration = (value: number) => {
  if (!Number.isFinite(value)) {
    return "00:00";
  }
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const resolveDisplayName = (review: Review) => {
  const firstName = review.user.first_name?.trim();
  const lastName = review.user.last_name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? fullName : review.user.username;
};

const CourseDetail = () => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const { currency, dateStyle } = usePreferences();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setStatus("error");
      setErrorMessage(t("course.errors.notFound"));
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setStatus("loading");
        setErrorMessage(null);

        const [coursePayload, lessonsPayload, reviewsPayload] = await Promise.all([
          getCourse(courseId, { signal: controller.signal }),
          listLessons(courseId, { signal: controller.signal }),
          listCourseReviews(courseId, { signal: controller.signal }),
        ]);

        setCourse(coursePayload);
        setLessons(lessonsPayload ?? []);
        setReviews(reviewsPayload ?? []);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load course detail", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Response && error.status === 404
            ? t("course.errors.notFound")
            : t("course.errors.generic"),
        );
      }
    };

    void load();
    return () => controller.abort();
  }, [courseId, t]);

  const priceDisplay = useMemo(() => {
    if (!course) {
      return "";
    }
    return formatCurrencyForDisplay(course.price_amount, course.price_currency, currency, i18n.language);
  }, [course, currency, i18n.language]);

  const publishedAt = useMemo(() => {
    if (!course?.published_at) {
      return "";
    }
    return formatDateTime(course.published_at, i18n.language, dateStyle);
  }, [course?.published_at, dateStyle, i18n.language]);

  const hasLessons = lessons.length > 0;
  const hasReviews = reviews.length > 0;
  const teacherName = course?.teacher?.name ?? t("course.meta.teacherUnknown");

  if (status === "loading") {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="space-y-8">
          <div className="h-12 w-48 animate-pulse rounded-full bg-surface-subtle" />
          <div className="h-80 animate-pulse rounded-[40px] bg-surface-subtle" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl bg-surface-subtle" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <Link
          to="/catalog"
          className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold hover:bg-brand-gold/10"
        >
          {t("course.actions.backToCatalog")}
        </Link>
        <div className="mt-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/catalog"
          className="golden-click inline-flex items-center rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold hover:bg-brand-gold/10"
        >
          {t("course.actions.backToCatalog")}
        </Link>
        <span className="rounded-full border border-surface-hover/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">
          {course.language.toUpperCase()}
        </span>
      </div>

      <article className="relative mt-10 overflow-hidden rounded-[40px] border border-surface-hover/60 bg-surface/80 p-8 shadow-[0_45px_90px_-60px_rgba(250,204,21,0.6)]">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface/80 to-surface-hover/80" aria-hidden />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-gold">
              {course.publisher.name}
            </span>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">{course.title}</h1>
            <p className="text-sm text-slate-200 md:text-base">{course.description}</p>
            <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <span>
                <span className="font-semibold text-white">{t("course.meta.price", { price: priceDisplay })}</span>
              </span>
              <span>{t("course.meta.learners", { count: course.participants_count })}</span>
              <span>{t("course.meta.rating", { rating: course.rating_avg })}</span>
              <span>{t("course.meta.publishedAt", { date: publishedAt })}</span>
            </div>
            {course.tags?.length ? (
              <ul className="flex flex-wrap gap-2 text-xs text-slate-300">
                {course.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-surface-hover/60 px-3 py-1">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-surface-hover/60 bg-surface-subtle/70 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">{t("course.meta.teacher", { teacher: teacherName })}</p>
              <p className="mt-2 text-sm text-slate-300">{t("course.meta.language", { language: course.language.toUpperCase() })}</p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-surface-hover/60 bg-surface p-4 text-sm text-slate-300">
              <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                {t("course.meta.priceLabelShort")}
              </span>
              <span className="text-lg font-bold text-brand-gold">{priceDisplay}</span>
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {t("course.meta.footer")}
            </p>
          </aside>
        </div>
      </article>

      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-white">{t("course.lessons.title")}</h2>
          <span className="text-xs uppercase tracking-[0.26em] text-slate-400">
            {t("course.lessons.count", { count: lessons.length })}
          </span>
        </div>
        {!hasLessons ? (
          <p className="rounded-3xl border border-surface-hover/50 bg-surface/60 px-4 py-4 text-sm text-slate-300">
            {t("course.lessons.empty")}
          </p>
        ) : (
          <ol className="space-y-4">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="rounded-3xl border border-surface-hover/60 bg-surface/70 p-5 transition hover:border-brand-gold/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-gold">
                      {t("course.lessons.lessonLabel", { order: lesson.order })}
                    </p>
                    <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                    {lesson.description ? <p className="text-sm text-slate-300">{lesson.description}</p> : null}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{formatDuration(lesson.duration_seconds)}</span>
                      {lesson.is_free_preview ? (
                        <span className="rounded-full border border-brand-gold/40 px-3 py-1 text-brand-gold">
                          {t("course.lessons.preview")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {lesson.video_url ? (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="golden-click inline-flex items-center justify-center rounded-full border border-brand-gold/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold hover:bg-brand-gold/10"
                    >
                      {t("course.lessons.watch")}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-white">{t("course.reviews.title")}</h2>
          <span className="text-xs uppercase tracking-[0.26em] text-slate-400">
            {t("course.reviews.count", { count: reviews.length })}
          </span>
        </div>
        {!hasReviews ? (
          <p className="rounded-3xl border border-surface-hover/50 bg-surface/60 px-4 py-4 text-sm text-slate-300">
            {t("course.reviews.empty")}
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-3xl border border-surface-hover/60 bg-surface/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
                  <span className="font-semibold text-white">{resolveDisplayName(review)}</span>
                  <span className="rounded-full border border-brand-gold/30 px-3 py-1 text-xs text-brand-gold">
                    {t("course.reviews.rating", { rating: review.rating })}
                  </span>
                  <span className="text-xs uppercase tracking-[0.26em] text-slate-500">
                    {formatDateTime(review.created_at, i18n.language, "medium")}
                  </span>
                </div>
                {review.text ? <p className="mt-3 text-sm text-slate-300">{review.text}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default CourseDetail;
