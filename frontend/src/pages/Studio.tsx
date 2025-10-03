import type { FormEvent, ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Course } from "../types/course";
import type { Lesson } from "../types/lesson";

type CourseFormState = {
  id: number | null;
  title: string;
  description: string;
  price_amount: string;
  price_currency: string;
  language: string;
  tags: string;
  thumbnail_url: string;
  publisher: string;
};

const INITIAL_COURSE_FORM: CourseFormState = {
  id: null,
  title: "",
  description: "",
  price_amount: "0",
  price_currency: "USD",
  language: "en",
  tags: "",
  thumbnail_url: "",
  publisher: "",
};

type LessonFormState = {
  id: number | null;
  title: string;
  description: string;
  video_url: string;
  duration_seconds: string;
  position: string;
};

const INITIAL_LESSON_FORM: LessonFormState = {
  id: null,
  title: "",
  description: "",
  video_url: "",
  duration_seconds: "0",
  position: "0",
};

const parseTags = (input: string) =>
  input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const Studio = () => {
  const { t } = useTranslation();
  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("dunetube.token");
  }, []);
  const isAuthenticated = Boolean(token);

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseForm, setCourseForm] = useState<CourseFormState>(INITIAL_COURSE_FORM);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(INITIAL_LESSON_FORM);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [uploadingLessonId, setUploadingLessonId] = useState<number | null>(null);

  const clearCourseForm = useCallback(() => {
    setCourseForm(INITIAL_COURSE_FORM);
    setSelectedCourseId(null);
    setLessons([]);
    setLessonForm(INITIAL_LESSON_FORM);
  }, []);

  const loadCourses = useCallback(async () => {
    if (!token) {
      setCourses([]);
      return;
    }
    try {
      setStudioError(null);
      const response = await fetch("/api/studio/courses/", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      const data: Course[] = await response.json();
      setCourses(data);
      if (data.length === 0) {
        clearCourseForm();
      }
    } catch (error) {
      console.error("Failed to load studio courses", error);
      setStudioError(t("studio.errors.loadCourses"));
    }
  }, [clearCourseForm, t, token]);

  const loadLessons = useCallback(
    async (courseId: number) => {
      if (!token) {
        setLessons([]);
        return;
      }
      try {
        setLessonError(null);
        const response = await fetch(`/api/studio/lessons/?course=${courseId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("failed");
        }
        const data: Lesson[] = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Failed to load studio lessons", error);
        setLessonError(t("studio.errors.loadLessons"));
      }
    },
    [t, token],
  );

  useEffect(() => {
    if (isAuthenticated) {
      void loadCourses();
    }
  }, [isAuthenticated, loadCourses]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (selectedCourseId) {
      void loadLessons(selectedCourseId);
    } else if (courses.length > 0) {
      const course = courses[0];
      setSelectedCourseId(course.id);
      setCourseForm({
        id: course.id,
        title: course.title,
        description: course.description,
        price_amount: String(course.price_amount),
        price_currency: course.price_currency,
        language: course.language,
        tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
        thumbnail_url: course.thumbnail_url ?? "",
        publisher: course.publisher,
      });
      void loadLessons(course.id);
    }
  }, [courses, isAuthenticated, loadLessons, selectedCourseId]);

  const handleCourseFormChange = (field: keyof CourseFormState, value: string) => {
    setCourseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLessonFormChange = (field: keyof LessonFormState, value: string) => {
    setLessonForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourseId(course.id);
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description,
      price_amount: String(course.price_amount),
      price_currency: course.price_currency,
      language: course.language,
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
      thumbnail_url: course.thumbnail_url ?? "",
      publisher: course.publisher,
    });
    setLessonForm(INITIAL_LESSON_FORM);
    void loadLessons(course.id);
  };

  const handleCourseSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    const isUpdate = Boolean(courseForm.id);
    const url = isUpdate ? `/api/studio/courses/${courseForm.id}/` : "/api/studio/courses/";
    const method = isUpdate ? "PATCH" : "POST";

    const payload = {
      title: courseForm.title,
      description: courseForm.description,
      price_amount: Number.parseFloat(courseForm.price_amount || "0"),
      price_currency: courseForm.price_currency,
      language: courseForm.language,
      tags: parseTags(courseForm.tags),
      thumbnail_url: courseForm.thumbnail_url || "",
      publisher: courseForm.publisher,
    };

    try {
      setIsSavingCourse(true);
      setStudioError(null);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      await loadCourses();
      if (!isUpdate) {
        setCourseForm(INITIAL_COURSE_FORM);
      }
    } catch (error) {
      console.error("Failed to save course", error);
      setStudioError(t("studio.errors.saveCourse"));
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleCourseDelete = async (courseId: number) => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(`/api/studio/courses/${courseId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("failed");
      }
      await loadCourses();
      if (selectedCourseId === courseId) {
        clearCourseForm();
      }
    } catch (error) {
      console.error("Failed to delete course", error);
      setStudioError(t("studio.errors.deleteCourse"));
    }
  };

  const handleLessonSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !selectedCourseId) {
      return;
    }

    const isUpdate = Boolean(lessonForm.id);
    const url = isUpdate
      ? `/api/studio/lessons/${lessonForm.id}/`
      : "/api/studio/lessons/";
    const method = isUpdate ? "PATCH" : "POST";

    const payload = {
      course: selectedCourseId,
      title: lessonForm.title,
      description: lessonForm.description,
      video_url: lessonForm.video_url || "",
      duration_seconds: Number.parseInt(lessonForm.duration_seconds || "0", 10),
      position: Number.parseInt(lessonForm.position || "0", 10),
    };

    try {
      setIsSavingLesson(true);
      setLessonError(null);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      await loadLessons(selectedCourseId);
      if (!isUpdate) {
        setLessonForm(INITIAL_LESSON_FORM);
      }
    } catch (error) {
      console.error("Failed to save lesson", error);
      setLessonError(t("studio.errors.saveLesson"));
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setLessonForm({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url ?? "",
      duration_seconds: String(lesson.duration_seconds ?? 0),
      position: String(lesson.position ?? 0),
    });
  };

  const handleLessonDelete = async (lessonId: number) => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(`/api/studio/lessons/${lessonId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("failed");
      }
      if (selectedCourseId) {
        await loadLessons(selectedCourseId);
      }
      if (lessonForm.id === lessonId) {
        setLessonForm(INITIAL_LESSON_FORM);
      }
    } catch (error) {
      console.error("Failed to delete lesson", error);
      setLessonError(t("studio.errors.deleteLesson"));
    }
  };

  const handleLessonUpload = async (lessonId: number, event: ChangeEvent<HTMLInputElement>) => {
    if (!token || !selectedCourseId) {
      return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingLessonId(lessonId);
      setLessonError(null);
      const response = await fetch(`/api/studio/lessons/${lessonId}/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      await loadLessons(selectedCourseId);
    } catch (error) {
      console.error("Failed to upload lesson media", error);
      setLessonError(t("studio.errors.uploadLesson"));
    } finally {
      setUploadingLessonId(null);
      event.target.value = "";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{t("studio.title")}</h1>
        <p className="text-lg text-slate-600">{t("studio.authRequired")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <header className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">{t("studio.title")}</h1>
        <p className="mt-3 text-sm text-slate-600">{t("studio.subtitle")}</p>
      </header>

      {studioError ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{studioError}</p>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <form onSubmit={handleCourseSubmit} className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {courseForm.id ? t("studio.courses.editLabel") : t("studio.courses.createNew")}
              </h2>
              {courseForm.id ? (
                <button
                  type="button"
                  onClick={clearCourseForm}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  {t("studio.courses.form.cancel")}
                </button>
              ) : null}
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-title">
                {t("studio.courses.form.title")}
              </label>
              <input
                id="course-title"
                value={courseForm.title}
                onChange={(event) => handleCourseFormChange("title", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-description">
                {t("studio.courses.form.description")}
              </label>
              <textarea
                id="course-description"
                value={courseForm.description}
                onChange={(event) => handleCourseFormChange("description", event.target.value)}
                className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-price-amount">
                  {t("studio.courses.form.priceAmount")}
                </label>
                <input
                  id="course-price-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={courseForm.price_amount}
                  onChange={(event) => handleCourseFormChange("price_amount", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-price-currency">
                  {t("studio.courses.form.priceCurrency")}
                </label>
                <input
                  id="course-price-currency"
                  value={courseForm.price_currency}
                  onChange={(event) => handleCourseFormChange("price_currency", event.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-language">
                  {t("studio.courses.form.language")}
                </label>
                <input
                  id="course-language"
                  value={courseForm.language}
                  onChange={(event) => handleCourseFormChange("language", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-tags">
                {t("studio.courses.form.tags")}
              </label>
              <input
                id="course-tags"
                value={courseForm.tags}
                onChange={(event) => handleCourseFormChange("tags", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-thumbnail">
                  {t("studio.courses.form.thumbnail")}
                </label>
                <input
                  id="course-thumbnail"
                  value={courseForm.thumbnail_url}
                  onChange={(event) => handleCourseFormChange("thumbnail_url", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="course-publisher">
                  {t("studio.courses.form.publisher")}
                </label>
                <input
                  id="course-publisher"
                  value={courseForm.publisher}
                  onChange={(event) => handleCourseFormChange("publisher", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSavingCourse}
            >
              {courseForm.id ? t("studio.courses.form.submitUpdate") : t("studio.courses.form.submitCreate")}
            </button>
          </form>

          <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{t("studio.courses.heading")}</h2>
            {courses.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">{t("studio.courses.empty")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {courses.map((course) => (
                  <li key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <button
                        type="button"
                        onClick={() => handleCourseSelect(course)}
                        className="flex-1 text-left hover:text-primary"
                      >
                        {course.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCourseDelete(course.id)}
                        className="ml-4 text-xs font-semibold text-red-500 transition hover:text-red-600"
                      >
                        {t("studio.courses.delete")}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{course.language.toUpperCase()} · {course.price_currency}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleLessonSubmit} className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{t("studio.lessons.heading")}</h2>
              {lessonForm.id ? (
                <button
                  type="button"
                  onClick={() => setLessonForm(INITIAL_LESSON_FORM)}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  {t("studio.courses.form.cancel")}
                </button>
              ) : null}
            </div>
            {lessonError ? (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{lessonError}</p>
            ) : null}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="lesson-title">
                {t("studio.lessons.form.title")}
              </label>
              <input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(event) => handleLessonFormChange("title", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="lesson-description">
                {t("studio.lessons.form.description")}
              </label>
              <textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(event) => handleLessonFormChange("description", event.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="lesson-video-url">
                {t("studio.lessons.form.videoUrl")}
              </label>
              <input
                id="lesson-video-url"
                value={lessonForm.video_url}
                onChange={(event) => handleLessonFormChange("video_url", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="https://"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="lesson-duration">
                  {t("studio.lessons.form.duration")}
                </label>
                <input
                  id="lesson-duration"
                  type="number"
                  min={0}
                  value={lessonForm.duration_seconds}
                  onChange={(event) => handleLessonFormChange("duration_seconds", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="lesson-position">
                  {t("studio.lessons.form.position")}
                </label>
                <input
                  id="lesson-position"
                  type="number"
                  min={0}
                  value={lessonForm.position}
                  onChange={(event) => handleLessonFormChange("position", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSavingLesson || !selectedCourseId}
            >
              {lessonForm.id ? t("studio.lessons.form.submitUpdate") : t("studio.lessons.form.submitCreate")}
            </button>
          </form>

          <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            {selectedCourseId ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900">{t("studio.lessons.heading")}</h3>
                {lessons.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">{t("studio.lessons.empty")}</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {lessons.map((lesson) => (
                      <li key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                          <button
                            type="button"
                            onClick={() => handleLessonSelect(lesson)}
                            className="flex-1 text-left hover:text-primary"
                          >
                            {lesson.title}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLessonDelete(lesson.id)}
                            className="ml-4 text-xs font-semibold text-red-500 transition hover:text-red-600"
                          >
                            {t("studio.lessons.delete")}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {lesson.stream_url || lesson.video_url ? t("course.player.start") : t("studio.lessons.noMedia")}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white">
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(event) => handleLessonUpload(lesson.id, event)}
                            />
                            {t("studio.lessons.uploadLabel")}
                          </label>
                          {uploadingLessonId === lesson.id ? (
                            <span className="text-xs text-slate-500">{t("studio.lessons.uploading")}</span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">{t("studio.courses.selectPrompt")}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Studio;
