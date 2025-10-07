import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { usePreferences } from "../context/PreferencesContext";
import type { Course } from "../types/course";
import { formatCurrencyForDisplay } from "../utils/intl";

type CourseCardLayout = "grid" | "horizontal";

type CourseCardProps = {
  course: Course;
  layout?: CourseCardLayout;
};

const normalizeRating = (value: Course["rating_avg"]): string => {
  const parsed = Number.parseFloat(String(value ?? 0));
  if (Number.isNaN(parsed)) {
    return "0.0";
  }
  return parsed.toFixed(1);
};

const CourseCard = ({ course, layout = "grid" }: CourseCardProps) => {
  const { t, i18n } = useTranslation();
  const { currency } = usePreferences();

  const priceDisplay = useMemo(
    () => formatCurrencyForDisplay(course.price_amount, course.price_currency, currency, i18n.language),
    [course.price_amount, course.price_currency, currency, i18n.language],
  );
  const teacherName = course.teacher?.name ?? t("catalog.teacherUnknown");

  const containerClasses =
    layout === "horizontal"
      ? "golden-click group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-[28px] border border-surface-hover/60 bg-surface-subtle/80 p-5 shadow-[0_25px_55px_-38px_rgba(250,204,21,0.45)] transition hover:-translate-y-1 hover:shadow-glow-gold"
      : "golden-click group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[32px] border border-surface-hover/60 bg-surface-subtle/80 p-6 shadow-[0_35px_72px_-50px_rgba(250,204,21,0.6)] transition hover:-translate-y-1 hover:shadow-glow-gold";

  return (
    <Link to={`/courses/${course.id}`} className={containerClasses} aria-label={course.title}>
      <div className="relative overflow-hidden rounded-2xl border border-surface-hover/60 bg-surface">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-40 w-full object-cover transition duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-gold/10 via-surface-hover to-surface">
            <span className="text-4xl font-semibold text-brand-gold">DT</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-80 mix-blend-soft-light" />
        <div className="absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-brand-gold shadow-lg">
          ★ {normalizeRating(course.rating_avg)}
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold">
            {course.publisher.name}
          </p>
          <h3 className="line-clamp-2 text-lg font-semibold text-white transition group-hover:text-brand-gold">
            {course.title}
          </h3>
          <p className="line-clamp-3 text-sm text-slate-300">{course.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full border border-surface-hover/70 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-slate-300">
            {course.language.toUpperCase()}
          </span>
          <span>{t("catalog.teacherLabel", { teacher: teacherName })}</span>
          <span>{t("catalog.learners", { count: course.participants_count })}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-semibold text-brand-gold">
          <span>{priceDisplay}</span>
          <span>{t("catalog.priceLabel")}</span>
        </div>

        {course.tags?.length ? (
          <ul className="flex flex-wrap gap-2 text-xs text-slate-300" aria-label={t("catalog.tags")}>
            {course.tags.slice(0, 4).map((tag) => (
              <li key={tag} className="rounded-full border border-surface-hover/60 px-3 py-1">
                #{tag}
              </li>
            ))}
            {course.tags.length > 4 ? (
              <li className="rounded-full border border-surface-hover/60 px-3 py-1">+{course.tags.length - 4}</li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Link>
  );
};

export default CourseCard;
