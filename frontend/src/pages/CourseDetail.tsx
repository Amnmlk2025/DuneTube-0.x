import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { usePreferences } from "../context/PreferencesContext";
import type { Course } from "../types/course";
import type { Lesson } from "../types/lesson";
import type { Review } from "../types/review";
import { formatCurrencyForDisplay } from "../utils/intl";

type FetchState = "idle" | "loading" | "success" | "error";

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const resolveDisplayName = (review: Review) => {
  const firstName = review.user.first_name?.trim();
  const lastName = review.user.last_name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? fullName : review.user.username;
};

const formatDate = (value: string, language: string, options?: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(language, options).format(new Date(value));
  } catch (_error) {
    return value;
  }
};

const CourseDetail = () => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const { currency, dateStyle } = usePreferences();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setStatus("error");
      setError(t("course.errors.notFound"));
      return;
    }

    const controller = new AbortController();

    const loadCourseData = async () => {
      try {
        setStatus("loading");
        setError(null);

        const courseResponse = await fetch(`/api/courses/${courseId}/`, { signal: controller.signal });
        if (!courseResponse.ok) {
          if (controller.signal.aborted) {
            return;
          }
          setStatus("error");
          setError(courseResponse.status === 404 ? t("course.errors.notFound") : t("course.errors.generic"));
          return;
        }

        const coursePayload = (await courseResponse.json()) as Course;

        let lessonPayload: Lesson[] = [];
        try {
          const lessonsResponse = await fetch(`/api/lessons/?course=${courseId}&ordering=order`, {
            signal: controller.signal,
          });
          if (lessonsResponse.ok) {
            lessonPayload = (await lessonsResponse.json()) as Lesson[];
          }
        } catch (lessonsError) {
          if (!controller.signal.aborted) {
            console.warn("Failed to load lessons", lessonsError);
          }
        }

        let reviewPayload: Review[] = [];
        try {
          const reviewsResponse = await fetch(`/api/courses/${courseId}/reviews/`, {
            signal: controller.signal,
          });
          if (reviewsResponse.ok) {
            const raw = await reviewsResponse.json();
            if (Array.isArray(raw)) {
              reviewPayload = raw as Review[];
            } else if (Array.isArray(raw?.results)) {
              reviewPayload = raw.results as Review[];
            }
          }
        } catch (reviewsError) {
          if (!controller.signal.aborted) {
            console.warn("Failed to load reviews", reviewsError);
          }
        }

        if (controller.signal.aborted) {
          return;
        }

        setCourse(coursePayload);
        setLessons(lessonPayload);
        setReviews(reviewPayload);
        setStatus("success");
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load course detail", fetchError);
        setError(t("course.errors.generic"));
        setStatus("error");
      }
    };

    void loadCourseData();

    return () => {
      controller.abort();
    };
  }, [courseId, t]);

  const priceDisplay = useMemo(() => {
    if (!course) {
      return "";
    }
    return formatCurrencyForDisplay(course.price_amount, course.price_currency, currency, i18n.language);
  }, [course, currency, i18n.language]);

  const publishedAtLabel = useMemo(() => {
    if (!course) {
      return "";
    }
    return formatDate(course.published_at, i18n.language, { dateStyle });
  }, [course, dateStyle, i18n.language]);

  const hasLessons = lessons.length > 0;
  const hasReviews = reviews.length > 0;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          <span aria-hidden="true">←</span>
          {t("course.actions.backToCatalog")}
        </Link>

        {status === "loading" ? (
          <p className="text-center text-slate-600">{t("course.loading")}</p>
        ) : null}

        {status === "error" && error ? (
          <div className="rounded-3xl bg-rose-50 p-8 text-center text-rose-600">
            <p className="text-lg font-semibold">{t("course.titleFallback")}</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : null}

        {status === "success" && course ? (
          <div className="space-y-12">
            <article className="rounded-3xl bg-white/95 p-8 shadow-lg ring-1 ring-slate-100">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary">
                    <span>{course.publisher.name}</span>
                    <span className="text-slate-400">•</span>
                    <span>{t("course.meta.teacher", { teacher: course.teacher.name })}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
                  <p className="text-base leading-relaxed text-slate-700">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span>{t("course.meta.price", { price: priceDisplay })}</span>
                    <span>{t("course.meta.language", { language: course.language.toUpperCase() })}</span>
                    <span>{t("course.meta.learners", { count: course.participants_count })}</span>
                    <span>{t("course.meta.rating", { rating: course.rating_avg })}</span>
                    <span>{t("course.meta.publishedAt", { date: publishedAtLabel })}</span>
                  </div>
                  {course.tags.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <li key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark">
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-48 w-full max-w-xs rounded-2xl object-cover shadow-md"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </article>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">{t("course.lessons.title")}</h2>
              {!hasLessons ? (
                <p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.lessons.empty")}</p>
              ) : (
                <ol className="mt-6 space-y-4">
                  {lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {t("course.lessons.lessonLabel", { order: lesson.order })}
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
                        {lesson.description ? <p className="mt-1 text-sm text-slate-600">{lesson.description}</p> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{formatDuration(lesson.duration_seconds)}</span>
                        {lesson.is_free_preview ? (
                          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                            {t("course.lessons.preview")}
                          </span>
                        ) : null}
                        {lesson.video_url ? (
                          <a
                            href={lesson.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-primary transition hover:text-primary-dark"
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

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">{t("course.reviews.title")}</h2>
              {!hasReviews ? (
                <p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.reviews.empty")}</p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
                        <span>{resolveDisplayName(review)}</span>
                        <span className="text-primary">{t("course.reviews.rating", { rating: review.rating })}</span>
                        <span className="text-xs font-normal uppercase tracking-wide text-slate-400">
                          {formatDate(review.created_at, i18n.language, { dateStyle: "medium" })}
                        </span>
                      </div>
                      {review.text ? <p className="mt-2 text-sm text-slate-600">{review.text}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CourseDetail;
