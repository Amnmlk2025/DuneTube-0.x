import { type MouseEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { usePreferences } from "../context/PreferencesContext";
import { listLessons } from "../lib/api";
import type { Course } from "../types/course";
import { ApiError } from "../types/api";
import { formatCurrencyForDisplay, formatRelativeTimeFromNow } from "../utils/intl";

type CourseCardLayout = "grid" | "horizontal";

type CourseCardProps = {
  course: Course;
  layout?: CourseCardLayout;
};

const CourseCard = ({ course, layout = "grid" }: CourseCardProps) => {
  const { t, i18n } = useTranslation();
  const { currency } = usePreferences();
  const navigate = useNavigate();

  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [firstLessonId, setFirstLessonId] = useState<number | null>(null);

  const priceDisplay = useMemo(
    () => formatCurrencyForDisplay(course.price_amount, course.price_currency, currency, i18n.language),
    [course.price_amount, course.price_currency, currency, i18n.language],
  );
  const publishedAgo = useMemo(
    () => formatRelativeTimeFromNow(course.published_at, i18n.language),
    [course.published_at, i18n.language],
  );

  const ratingValue = useMemo(() => {
    const parsed = Number.parseFloat(String(course.rating_avg ?? 0));
    if (Number.isNaN(parsed)) {
      return "0.0";
    }
    return parsed.toFixed(1);
  }, [course.rating_avg]);

  const publisherInitials = useMemo(() => {
    const parts = course.publisher.name.split(" ").filter(Boolean);
    if (parts.length === 0) {
      return "DT";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [course.publisher.name]);

  const cardBase =
    "group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card transition hover:-translate-y-[2px] hover:shadow-lg";
  const containerClasses = layout === "horizontal" ? `${cardBase} md:flex-row md:items-stretch` : cardBase;
  const thumbnailWrapperClasses = layout === "horizontal" ? "w-full md:w-64" : "w-full";

  const handlePreview = useCallback(async () => {
    if (isFetchingPreview) {
      return;
    }
    if (firstLessonId) {
      navigate(`/watch/${firstLessonId}`);
      return;
    }
    try {
      setIsFetchingPreview(true);
      const lessons = await listLessons(course.id);
      const first = lessons?.[0];
      if (first?.id) {
        setFirstLessonId(first.id);
        navigate(`/watch/${first.id}`);
      } else {
        navigate(`/courses/${course.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 404) {
        console.error("Failed to resolve preview target", error);
      }
      navigate(`/courses/${course.id}`);
    } finally {
      setIsFetchingPreview(false);
    }
  }, [course.id, firstLessonId, isFetchingPreview, navigate]);

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const origin = event.target as HTMLElement;
    if (origin.closest("[data-no-card]")) {
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  const teacherName = course.teacher?.name ?? t("catalog.teacherUnknown");
  const languageCode = course.language?.toUpperCase() ?? "N/A";

  return (
    <article className={containerClasses} onClick={handleCardClick}>
      <div className={thumbnailWrapperClasses}>
        <button
          type="button"
          onClick={handlePreview}
          data-no-card
          className="relative block aspect-video w-full overflow-hidden focus:outline-none"
          aria-label={t("catalog.ctaPreview", { title: course.title })}
        >
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-lg font-semibold text-slate-500">
              DT
            </div>
          )}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/5 transition duration-200 group-hover:bg-transparent">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-deep shadow-sm">
              {isFetchingPreview ? (
                <svg className="h-4 w-4 animate-spin text-brand-deep" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.143A1.143 1.143 0 0 1 9.714 4.2l8.572 6.857a1.143 1.143 0 0 1 0 1.8l-8.572 6.857A1.143 1.143 0 0 1 8 17.77Z" />
                </svg>
              )}
            </span>
          </span>
        </button>
      </div>

      <div className={`flex flex-1 flex-col gap-4 px-5 py-4 ${layout === "horizontal" ? "md:px-5 md:py-4" : ""}`}>
        <div className="flex items-start gap-3">
          <Link
            to={`/publishers/${course.publisher.slug}`}
            data-no-card
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 transition hover:border-brand-deep hover:text-brand-deep"
            aria-label={t("catalog.publisherLink", { publisher: course.publisher.name })}
          >
            {course.publisher.avatar_url ? (
              <img src={course.publisher.avatar_url} alt={course.publisher.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              publisherInitials
            )}
          </Link>
          <div className="flex-1 space-y-1">
            <Link
              to={`/courses/${course.id}`}
              data-no-card
              className="line-clamp-2 text-base font-semibold text-brand-deep transition hover:text-brand-sand"
            >
              {course.title}
            </Link>
            <p className="text-sm text-slate-500">{teacherName}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{t("catalog.metadata.publishedAgo", { time: publishedAgo })}</span>
              <span aria-hidden="true">·</span>
              <span>{t("catalog.learners", { count: course.participants_count })}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-brand-deep">
                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4a8 8 0 1 0 8 8 8.009 8.009 0 0 0-8-8Zm0 12.333a4.333 4.333 0 1 1 4.333-4.333A4.333 4.333 0 0 1 12 16.333Z" />
                </svg>
                {ratingValue}
              </span>
            </div>
          </div>
        </div>

        {course.description ? <p className="line-clamp-2 text-sm text-slate-600">{course.description}</p> : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 uppercase tracking-wide text-[10px] text-slate-600">
            {languageCode}
          </span>
          <Link
            to={course.teacher?.id ? `/teachers/${course.teacher.id}` : "#"}
            data-no-card
            className="inline-flex items-center gap-1 text-slate-600 transition hover:text-brand-deep"
          >
            <svg className="h-3.5 w-3.5 text-brand-deep" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.086 0-9 1.543-9 4.63V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1.37C21 15.543 15.086 14 12 14Z" />
            </svg>
            <span>{teacherName}</span>
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
          <span className="font-semibold text-brand-deep">{priceDisplay}</span>
          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course.id}`}
              data-no-card
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-deep hover:text-brand-deep"
            >
              {t("catalog.metadata.joinCourse")}
            </Link>
            <Link
              to={`/courses/${course.id}#comments`}
              data-no-card
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-deep hover:text-brand-deep"
            >
              {t("catalog.metadata.viewComments")}
            </Link>
          </div>
        </div>

        {course.tags?.length ? (
          <ul className="flex flex-wrap gap-2 text-xs text-slate-500" aria-label={t("catalog.tags")}>
            {course.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="rounded-full bg-slate-100 px-3 py-1" data-no-card>
                #{tag}
              </li>
            ))}
            {course.tags.length > 3 ? (
              <li className="rounded-full bg-slate-100 px-3 py-1" data-no-card>
                +{course.tags.length - 3}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
};

export default CourseCard;
