import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { usePreferences } from "../context/PreferencesContext";
import { getCourse, listCourseReviews, listLessons } from "../lib/api";
import type { Course } from "../types/course";
import type { Lesson } from "../types/lesson";
import type { Review } from "../types/review";
import { formatCurrencyForDisplay, formatDateTime, formatRelativeTimeFromNow } from "../utils/intl";
import { ApiError } from "../types/api";

type FetchState = "idle" | "loading" | "success" | "error";
type DetailTab = "overview" | "lessons" | "reviews";

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

const normalizeRating = (value: Course["rating_avg"]): string => {
  const parsed = Number.parseFloat(String(value ?? 0));
  if (Number.isNaN(parsed)) {
    return "0.0";
  }
  return parsed.toFixed(1);
};

const CourseDetail = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { currency, dateStyle } = usePreferences();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [bookmarkActive, setBookmarkActive] = useState(false);

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
        setLessons(Array.isArray(lessonsPayload) ? lessonsPayload : lessonsPayload ?? []);
        setReviews(Array.isArray(reviewsPayload) ? reviewsPayload : reviewsPayload ?? []);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load course detail", error);
        setStatus("error");
        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage(t("course.errors.notFound"));
        } else {
          setErrorMessage(
            error instanceof ApiError && error.payload?.detail
              ? error.payload.detail
              : t("course.errors.generic"),
          );
        }
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

  const publishedRelative = useMemo(() => {
    if (!course?.published_at) {
      return "";
    }
    return formatRelativeTimeFromNow(course.published_at, i18n.language);
  }, [course?.published_at, i18n.language]);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => a.order - b.order),
    [lessons],
  );

  const firstLesson = sortedLessons[0] ?? null;
  const teacherName = course?.teacher?.name ?? t("course.meta.teacherUnknown");
  const ratingValue = course ? normalizeRating(course.rating_avg) : "0.0";
  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: "overview", label: t("course.tabs.overview") },
    { id: "lessons", label: t("course.tabs.lessons") },
    { id: "reviews", label: t("course.tabs.reviews") },
  ];

  const handleJoinCourse = () => {
    if (firstLesson) {
      navigate(`/watch/${firstLesson.id}`);
    } else if (course) {
      navigate(`/courses/${course.id}`);
    }
  };

  if (status === "loading") {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 md:px-6 py-16">
        <div className="space-y-6">
          <div className="h-12 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-80 animate-pulse rounded-[36px] bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 md:px-6 py-16">
        <div className="space-y-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-slate-600">
          <p>{errorMessage}</p>
          <Link
            to="/"
            className="golden-click inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:bg-brand-gold/10"
          >
            {t("course.actions.backToCatalog")}
          </Link>
        </div>
      </section>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-10 px-4 md:px-6 py-16">
      <article className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white" aria-hidden />
        <div className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
          <div className="space-y-4 text-start">
            <div className="flex items-center gap-3 text-sm text-brand-gold">
              <Link
                to={`/publishers/${course.publisher.slug}`}
                className="golden-click inline-flex items-center gap-2 rounded-full bg-brand-gold/10 px-3 py-1 font-semibold text-brand-gold transition hover:bg-brand-gold/20"
              >
                {course.publisher.name}
              </Link>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
                {course.language.toUpperCase()}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              {course.title}
            </h1>
            <p className="max-w-3xl text-sm text-slate-600 md:text-base">{course.description}</p>
            {course.tags?.length ? (
              <ul className="flex flex-wrap gap-2 text-xs text-slate-600">
                {course.tags.slice(0, 6).map((tag) => (
                  <li key={tag} className="rounded-full bg-white px-3 py-1">
                    #{tag}
                  </li>
                ))}
                {course.tags.length > 6 ? (
                  <li className="rounded-full bg-white px-3 py-1">+{course.tags.length - 6}</li>
                ) : null}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col items-stretch gap-3 rounded-3xl border border-brand-gold/20 bg-white p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-brand-gold">{priceDisplay}</span>
              <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {t("course.meta.priceLabelShort")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.086 0-9 1.543-9 4.63V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1.37C21 15.543 15.086 14 12 14Z" />
                </svg>
                <Link
                  to={course.teacher?.id ? `/teachers/${course.teacher.id}` : "#"}
                  className="transition hover:text-brand-gold"
                >
                  {t("course.meta.teacher", { teacher: teacherName })}
                </Link>
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2-10 5v2h1v11h18V9h1V7Zm7 16H5V9h14Zm-7-7a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
                </svg>
                {t("course.meta.language", { language: course.language.toUpperCase() })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1.555.832L12 16.202l8.445 4.63A1 1 0 0 0 22 20V4a1 1 0 0 0-1-1Z" />
                </svg>
                {t("course.meta.participants", { count: course.participants_count })}
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0-6a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a7.956 7.956 0 0 1-5.272-2h10.544A7.956 7.956 0 0 1 12 20Z" />
                </svg>
                {publishedRelative
                  ? t("course.meta.publishedRelative", { time: publishedRelative })
                  : t("course.meta.publishedAt", { date: publishedAt })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {t("course.meta.rating", { rating: ratingValue })}
              </span>
              <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{publishedAt}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleJoinCourse}
                className="golden-click inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-brand-gold/90"
              >
                <span>▶</span>
                {firstLesson ? t("course.cta.watchFirst") : t("course.cta.join")}
              </button>
              <button
                type="button"
                onClick={() => setBookmarkActive((value) => !value)}
                aria-pressed={bookmarkActive}
                className={`golden-click inline-flex h-10 w-10 items-center justify-center rounded-full border ${bookmarkActive ? "border-brand-gold bg-brand-gold/15 text-brand-gold" : "border-slate-200 text-brand-gold"} transition hover:border-brand-gold/50`}
                title={t("course.actions.bookmark")}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H7a2 2 0 0 0-2 2v16l7-4 7 4V5a2 2 0 0 0-2-2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>

      <div className="flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-gold shadow-glow-gold" />
          {t("catalog.metadata.viewComments")}
        </span>
        <span className="inline-flex items-center gap-2 text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          {t("catalog.metadata.joinCourse")}
        </span>
      </div>

      <nav className="flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white p-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`golden-click inline-flex items-center rounded-full px-4 py-2 transition ${
              activeTab === tab.id ? "bg-brand-gold text-brand-night" : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
            }`}
            aria-pressed={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">{t("course.overview.title")}</h2>
          <p className="text-sm text-slate-600">{course.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{t("course.meta.price", { price: priceDisplay })}</span>
            <span>{t("course.meta.teacher", { teacher: teacherName })}</span>
            <span>{t("course.meta.participants", { count: course.participants_count })}</span>
          </div>
        </section>
      ) : null}

      {activeTab === "lessons" ? (
        <section className="space-y-6">
          <header className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-slate-900">{t("course.lessons.title")}</h2>
            <span className="text-xs uppercase tracking-[0.26em] text-slate-500">
              {t("course.lessons.count", { count: sortedLessons.length })}
            </span>
          </header>
          {!sortedLessons.length ? (
            <p className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {t("course.lessons.empty")}
            </p>
          ) : (
            <ol className="space-y-4">
              {sortedLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-brand-gold/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-gold">
                        {t("course.lessons.lessonLabel", { order: lesson.order })}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                      {lesson.description ? (
                        <p className="text-sm text-slate-600">{lesson.description}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
      ) : null}

      {activeTab === "reviews" ? (
        <section className="space-y-6">
          <header className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-slate-900">{t("course.reviews.title")}</h2>
            <span className="text-xs uppercase tracking-[0.26em] text-slate-500">
              {t("course.reviews.count", { count: reviews.length })}
            </span>
          </header>
          {!reviews.length ? (
            <p className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {t("course.reviews.empty")}
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{resolveDisplayName(review)}</span>
                    <span className="rounded-full border border-brand-gold/30 px-3 py-1 text-xs text-brand-gold">
                      {t("course.reviews.rating", { rating: review.rating })}
                    </span>
                    <span className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      {formatDateTime(review.created_at, i18n.language, "medium")}
                    </span>
                  </div>
                  {review.text ? <p className="mt-3 text-sm text-slate-600">{review.text}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </section>
  );
};

export default CourseDetail;
