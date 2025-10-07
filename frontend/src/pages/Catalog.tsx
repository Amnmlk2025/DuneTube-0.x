import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import CourseCard from "../components/CourseCard";
import type { Course, PaginatedCourses } from "../types/course";

type FetchState = "idle" | "loading" | "success" | "error";

const Catalog = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [state, setState] = useState<FetchState>("idle");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setState("loading");
        const response = await fetch("/api/courses/");
        if (!response.ok) {
          throw new Error("Failed to load courses");
        }
        const payload = (await response.json()) as PaginatedCourses;
        setCourses(payload.results);
        setTotal(payload.count);
        setState("success");
      } catch (error) {
        console.error("Catalog fetch failed", error);
        setState("error");
      }
    };

    void fetchCourses();
  }, []);

  const hasCourses = courses.length > 0;
  const countLabel = useMemo(() => {
    if (!hasCourses) {
      return null;
    }
    return t("catalog.count", { count: total });
  }, [hasCourses, t, total]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-slate-900">{t("catalog.title")}</h1>
        <p className="mt-3 text-lg text-slate-600">{t("catalog.subtitle")}</p>
        {countLabel ? <p className="mt-2 text-sm font-medium text-primary">{countLabel}</p> : null}
      </div>

      <div className="mt-12">
        {state === "loading" && <p className="text-center text-slate-600">{t("catalog.loading")}</p>}
        {state === "error" && <p className="text-center text-rose-600">{t("catalog.error")}</p>}
        {state === "success" && !hasCourses && (
          <p className="text-center text-slate-600">{t("catalog.empty")}</p>
        )}

        {hasCourses && (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Catalog;
