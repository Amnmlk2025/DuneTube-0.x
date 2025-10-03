import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Course } from "../types/course";
import type { Lesson, LessonNote } from "../types/lesson";
import { usePreferences } from "../context/PreferencesContext";
import { formatCurrencyForDisplay } from "../utils/intl";

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

type TabKey = "overview" | "lessons" | "notes";

type NoteFormState = {
  lesson: string;
  body: string;
  timestamp: string;
};

const INITIAL_NOTE_STATE: NoteFormState = {
  lesson: "",
  body: "",
  timestamp: "",
};

const CourseDetail = () => {
  const { t, i18n } = useTranslation();
  const { currency } = usePreferences();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormState>(INITIAL_NOTE_STATE);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimeout = useRef<number | null>(null);
  const pendingProgress = useRef<number | null>(null);
  const lastPersistedProgress = useRef<number>(0);

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("dunetube.token");
  }, []);

  const isAuthenticated = Boolean(token);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? null,
    [activeLessonId, lessons],
  );
  const activeLessonSource = useMemo(
    () => activeLesson?.stream_url ?? activeLesson?.video_url ?? "",
    [activeLesson],
  );
  const hasLessonMedia = Boolean(activeLessonSource);

  const resetProgressTimer = () => {
    if (progressTimeout.current) {
      window.clearTimeout(progressTimeout.current);
      progressTimeout.current = null;
    }
  };

  const persistProgress = useCallback(
    async (position: number) => {
      if (!isAuthenticated || !activeLesson || !courseId) {
        return;
      }

      try {
        const response = await fetch(`/api/lessons/${activeLesson.id}/progress/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ last_position: position }),
        });

        if (!response.ok) {
          throw new Error("failed-to-save");
        }

        const data = (await response.json()) as { last_position: number; updated_at: string };
        lastPersistedProgress.current = data.last_position;
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === activeLesson.id
              ? {
                  ...lesson,
                  progress: {
                    last_position: data.last_position,
                    updated_at: data.updated_at,
                  },
                }
              : lesson,
          ),
        );
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    },
    [activeLesson, courseId, isAuthenticated, token],
  );

  const flushPendingProgress = useCallback(async () => {
    if (pendingProgress.current === null) {
      return;
    }
    const position = pendingProgress.current;
    pendingProgress.current = null;
    resetProgressTimer();
    if (position === lastPersistedProgress.current) {
      return;
    }
    await persistProgress(position);
  }, [persistProgress]);

  const scheduleProgressPersist = useCallback(
    (position: number) => {
      if (!isAuthenticated) {
        return;
      }
      pendingProgress.current = position;
      if (progressTimeout.current) {
        return;
      }
      progressTimeout.current = window.setTimeout(async () => {
        if (pendingProgress.current === null) {
          progressTimeout.current = null;
          return;
        }
        const pending = pendingProgress.current;
        pendingProgress.current = null;
        progressTimeout.current = null;
        if (pending !== lastPersistedProgress.current) {
          await persistProgress(pending);
        }
      }, 1500);
    },
    [isAuthenticated, persistProgress],
  );

  useEffect(() => {
    return () => {
      resetProgressTimer();
    };
  }, []);

  useEffect(() => {
    if (!courseId) {
      setCourseError(t("course.errors.notFound"));
      return;
    }

    let cancelled = false;
    setCourseError(null);
    setCourse(null);

    fetch(`/api/courses/${courseId}/`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        return (await response.json()) as Course;
      })
      .then((data) => {
        if (!cancelled) {
          setCourse(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load course", error);
        if (!cancelled) {
          if (error instanceof Error && error.message === "404") {
            setCourseError(t("course.errors.notFound"));
          } else {
            setCourseError(t("course.errors.generic"));
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, t]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    let cancelled = false;
    setLessonsError(null);
    setLessons([]);

    fetch(`/api/courses/${courseId}/lessons/`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        return (await response.json()) as Lesson[];
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        setLessons(data);
        if (data.length > 0) {
          setActiveLessonId((prev) => prev ?? data[0].id);
          setNoteForm((prev) => ({ ...prev, lesson: String(prev.lesson || data[0].id) }));
        }
      })
      .catch((error) => {
        console.error("Failed to load lessons", error);
        if (!cancelled) {
          setLessonsError(t("course.errors.lessons"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, t]);

  useEffect(() => {
    if (!courseId || !isAuthenticated || !token) {
      setNotes([]);
      return;
    }

    let cancelled = false;
    setIsLoadingNotes(true);
    setNotesError(null);

    fetch(`/api/notes/?course=${courseId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          throw new Error("unauthorized");
        }
        if (!response.ok) {
          throw new Error("failed");
        }
        return (await response.json()) as LessonNote[];
      })
      .then((data) => {
        if (!cancelled) {
          setNotes(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load notes", error);
        if (!cancelled) {
          if (error instanceof Error && error.message === "unauthorized") {
            setNotesError(t("course.errors.notesAuth"));
          } else {
            setNotesError(t("course.errors.notes"));
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingNotes(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, isAuthenticated, t, token]);

  useEffect(() => {
    lastPersistedProgress.current = activeLesson?.progress?.last_position ?? 0;
    pendingProgress.current = null;
    resetProgressTimer();
  }, [activeLesson]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleBeforeUnload = () => {
      void flushPendingProgress();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void flushPendingProgress();
    };
  }, [flushPendingProgress, isAuthenticated]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    const video = videoRef.current;
    if (!video || !hasLessonMedia || !video.currentSrc) {
      return;
    }
    const current = Math.floor(video.currentTime);
    if (current < 0) {
      return;
    }
    scheduleProgressPersist(current);
  }, [isAuthenticated, scheduleProgressPersist, hasLessonMedia]);

  const handleVideoPause = useCallback(() => {
    if (!isAuthenticated || !hasLessonMedia) {
      return;
    }
    void flushPendingProgress();
  }, [flushPendingProgress, hasLessonMedia, isAuthenticated]);

  const handleVideoLoaded = useCallback(() => {
    if (!videoRef.current || !activeLesson || !hasLessonMedia) {
      return;
    }
    if (activeLesson.progress?.last_position) {
      try {
        videoRef.current.currentTime = activeLesson.progress.last_position;
      } catch (error) {
        console.warn("Unable to set playback position", error);
      }
    }
  }, [activeLesson, hasLessonMedia]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handleLessonSelect = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setActiveTab("lessons");
    setNoteForm((prev) => ({ ...prev, lesson: String(lessonId) }));
  };

  const handleNoteChange = (field: keyof NoteFormState, value: string) => {
    setNoteForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseCurrentTimestamp = () => {
    const video = videoRef.current;
    if (!video || !hasLessonMedia) {
      return;
    }
    const seconds = Math.floor(video.currentTime);
    handleNoteChange("timestamp", seconds.toString());
  };

  const handleSubmitNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated || !token || !noteForm.lesson || !noteForm.body.trim()) {
      return;
    }

    setIsSubmittingNote(true);
    setNotesError(null);

    const lessonId = Number.parseInt(noteForm.lesson, 10);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          body: noteForm.body,
          timestamp: noteForm.timestamp ? Number.parseInt(noteForm.timestamp, 10) : null,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("unauthorized");
      }
      if (!response.ok) {
        throw new Error("failed");
      }

      const data = (await response.json()) as LessonNote;
      setNotes((prev) => [data, ...prev]);
      setNoteForm((prev) => ({ ...INITIAL_NOTE_STATE, lesson: prev.lesson }));
    } catch (error) {
      console.error("Failed to create note", error);
      if (error instanceof Error && error.message === "unauthorized") {
        setNotesError(t("course.errors.notesAuth"));
      } else {
        setNotesError(t("course.errors.notesCreate"));
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (note: LessonNote) => {
    if (!isAuthenticated || !token) {
      return;
    }
    try {
      const response = await fetch(`/api/lessons/${note.lesson}/notes/${note.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("failed");
      }

      setNotes((prev) => prev.filter((item) => item.id !== note.id));
    } catch (error) {
      console.error("Failed to delete note", error);
      setNotesError(t("course.errors.notesDelete"));
    }
  };

  if (courseError) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-red-600">{courseError}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          {t("course.actions.back")}
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p>{t("course.state.loading")}</p>
      </div>
    );
  }

  const coursePriceDisplay = formatCurrencyForDisplay(
    course.price_amount,
    course.price_currency,
    currency,
    i18n.language,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <header className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">{course.publisher}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-3 text-sm text-slate-600">
              {t("course.meta.language", { language: course.language.toUpperCase() })} · {coursePriceDisplay}
            </p>
          </div>
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-36 w-36 rounded-2xl object-cover shadow-lg"
            />
          ) : null}
        </div>
      </header>

      <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100">
        <nav className="flex flex-wrap gap-3">
          {(["overview", "lessons", "notes"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary-dark"
              }`}
            >
              {t(`course.tabs.${tab}`)}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {activeTab === "overview" ? (
            <section className="space-y-6">
              <p className="text-base leading-relaxed text-slate-700">{course.description}</p>
              <div className="grid gap-4 rounded-2xl bg-slate-50/80 p-6 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("course.meta.publisher")}</p>
                  <p className="mt-1 text-sm text-slate-700">{course.publisher}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("course.meta.languageLabel")}</p>
                  <p className="mt-1 text-sm text-slate-700">{course.language.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("course.meta.priceLabel")}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {course.price_amount} {course.price_currency}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "lessons" ? (
            <section className="grid gap-8 md:grid-cols-[2fr_3fr]">
              <div className="space-y-4">
                {lessonsError ? (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{lessonsError}</p>
                ) : null}
                {lessons.length === 0 ? (
                  <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.state.noLessons")}</p>
                ) : (
                  <ul className="space-y-3">
                    {lessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      const progressSeconds = lesson.progress?.last_position ?? 0;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => handleLessonSelect(lesson.id)}
                            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-primary bg-primary/10 shadow-lg"
                                : "border-transparent bg-slate-50 hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                              <span className="truncate">{lesson.title}</span>
                              <span className="text-xs text-slate-500">{formatDuration(lesson.duration_seconds)}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{lesson.description}</p>
                            {!lesson.stream_url && !lesson.video_url ? (
                              <p className="mt-2 text-xs font-semibold text-amber-600">{t("course.player.uploadPending")}</p>
                            ) : null}
                            {isAuthenticated ? (
                              <p className="mt-2 text-xs text-primary-dark">
                                {progressSeconds > 0
                                  ? t("course.player.resume", { time: formatDuration(progressSeconds) })
                                  : t("course.player.start")}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="space-y-4">
                {activeLesson ? (
                  <div className="rounded-2xl bg-black/90 p-4 shadow-2xl ring-1 ring-black/20">
                    <video
                      key={activeLesson.id}
                      ref={videoRef}
                      controls
                      className="aspect-video w-full rounded-xl bg-black"
                      src={activeLessonSource}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onPause={handleVideoPause}
                      onLoadedMetadata={handleVideoLoaded}
                    >
                      {t("course.player.noSupport")}
                    </video>
                    {!hasLessonMedia ? (
                      <p className="mt-3 text-xs text-amber-200">{t("course.player.noMedia")}</p>
                    ) : null}
                    {!isAuthenticated ? (
                      <p className="mt-3 text-xs text-slate-200">{t("course.player.authHint")}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-600">{t("course.state.selectLesson")}</p>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "notes" ? (
            <section className="grid gap-8 md:grid-cols-[2fr_3fr]">
              <div>
                {!isAuthenticated ? (
                  <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.notes.authRequired")}</p>
                ) : (
                  <form onSubmit={handleSubmitNote} className="space-y-4 rounded-2xl bg-slate-50 p-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="note-lesson">
                        {t("course.notes.lessonLabel")}
                      </label>
                      <select
                        id="note-lesson"
                        value={noteForm.lesson}
                        onChange={(event) => handleNoteChange("lesson", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="" disabled>
                          {t("course.notes.selectLesson")}
                        </option>
                        {lessons.map((lesson) => (
                          <option value={lesson.id} key={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="note-body">
                        {t("course.notes.bodyLabel")}
                      </label>
                      <textarea
                        id="note-body"
                        value={noteForm.body}
                        onChange={(event) => handleNoteChange("body", event.target.value)}
                        className="mt-1 h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={t("course.notes.placeholder") ?? ""}
                        required
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-primary" htmlFor="note-timestamp">
                          {t("course.notes.timestampLabel")}
                        </label>
                        <input
                          id="note-timestamp"
                          type="number"
                          min={0}
                          value={noteForm.timestamp}
                          onChange={(event) => handleNoteChange("timestamp", event.target.value)}
                          className="mt-1 w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUseCurrentTimestamp}
                        className="mt-5 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                        disabled={!videoRef.current || !hasLessonMedia}
                      >
                        {t("course.notes.useCurrentTime")}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={isSubmittingNote || !noteForm.lesson}
                    >
                      {isSubmittingNote ? t("course.notes.saving") : t("course.notes.save")}
                    </button>
                  </form>
                )}
              </div>
              <div className="space-y-4">
                {isLoadingNotes ? (
                  <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.notes.loading")}</p>
                ) : null}
                {notesError && isAuthenticated ? (
                  <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600">{notesError}</p>
                ) : null}
                {!isLoadingNotes && notes.length === 0 ? (
                  <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{t("course.notes.empty")}</p>
                ) : null}
                <ul className="space-y-3">
                  {notes.map((note) => (
                    <li key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                        <span>{note.lesson_title}</span>
                        {note.timestamp !== null && note.timestamp !== undefined ? (
                          <span className="text-xs text-primary-dark">{formatDuration(note.timestamp)}</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{note.body}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note)}
                        className="mt-3 text-xs font-semibold text-red-500 transition hover:text-red-600"
                      >
                        {t("course.notes.delete")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
