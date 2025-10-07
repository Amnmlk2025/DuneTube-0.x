import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { usePreferences } from "../context/PreferencesContext";
import type { Course } from "../types/course";
import { formatCurrencyForDisplay } from "../utils/intl";

type CourseCardProps = {
  course: Course;
};

const CourseCard = ({ course }: CourseCardProps) => {
  const { t, i18n } = useTranslation();
  const { currency } = usePreferences();
  const priceDisplay = formatCurrencyForDisplay(course.price_amount, course.price_currency, currency, i18n.language);

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex h-full flex-col justify-between rounded-2xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary">{t("catalog.publisher")}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900 group-hover:text-primary-dark">{course.title}</h3>
            <p className="text-sm text-slate-600">{course.publisher.name}</p>
          </div>
          {course.teacher?.avatar_url ? (
            <img
              src={course.teacher.avatar_url}
              alt={course.teacher.name}
              className="h-12 w-12 rounded-full border border-primary/20 object-cover shadow-sm"
              loading="lazy"
            />
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{course.description}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          <span>
            <strong className="font-medium text-slate-800">{t("catalog.price")}:</strong> {priceDisplay}
          </span>
          <span>
            <strong className="font-medium text-slate-800">{t("catalog.language")}:</strong> {course.language.toUpperCase()}
          </span>
          <span>
            <strong className="font-medium text-slate-800">{t("catalog.teacher")}:</strong> {course.teacher.name}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>{t("catalog.learners", { count: course.participants_count })}</span>
          <span>{t("catalog.rating", { rating: course.rating_avg })}</span>
        </div>
        {course.tags?.length ? (
          <ul className="flex flex-wrap gap-2" aria-label={t("catalog.tags")}>
            {course.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
};

export default CourseCard;
