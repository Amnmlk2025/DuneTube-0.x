import { useTranslation } from "react-i18next";

import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};

const CourseCard = ({ course }: CourseCardProps) => {
  const { t } = useTranslation();

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="space-y-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary">{t("catalog.publisher")}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{course.title}</h3>
          <p className="text-sm text-slate-600">{course.publisher}</p>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{course.description}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-x-4 text-sm text-slate-600">
          <span>
            <strong className="font-medium text-slate-800">{t("catalog.price")}:</strong> {course.price_amount} {course.price_currency}
          </span>
          <span>
            <strong className="font-medium text-slate-800">{t("catalog.language")}:</strong> {course.language.toUpperCase()}
          </span>
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
    </article>
  );
};

export default CourseCard;
