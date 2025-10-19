import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- صفحات فعلی (همان قبلی‌ها) ---
import Home from "./pages/Home";
import CourseDetail from "./pages/CourseDetail";
import Catalog from "./pages/Catalog";
import LessonPlayer from "./pages/LessonPlayer";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// --- استودیو (lazy-loaded) ---
const StudioLayout     = lazy(() => import("./layouts/StudioLayout"));
const StudioCourses    = lazy(() => import("./pages/studio/StudioCourses"));
const StudioLessons    = lazy(() => import("./pages/studio/StudioLessons"));
const StudioFiles      = lazy(() => import("./pages/studio/StudioFiles"));
const StudioAssistants = lazy(() => import("./pages/studio/StudioAssistants"));
const StudioReports    = lazy(() => import("./pages/studio/StudioReports"));
const StudioSettings   = lazy(() => import("./pages/studio/StudioSettings"));
const CourseEditor     = lazy(() => import("./pages/studio/CourseEditor"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- مسیرهای قبلی شما --- */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/:id/lesson/:lessonId" element={<LessonPlayer />} />
        <Route path="/course/:id/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/u/:username" element={<Profile />} />

        {/* --- Teacher Studio (layout + صفحات داخلی) --- */}
        <Route
          path="/studio"
          element={
            <Suspense fallback={<div style={{ padding: 16 }}>Loading studio…</div>}>
              <StudioLayout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioCourses />
              </Suspense>
            }
          />
          <Route
            path="lessons"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioLessons />
              </Suspense>
            }
          />
          <Route
            path="files"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioFiles />
              </Suspense>
            }
          />
          <Route
            path="assistants"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioAssistants />
              </Suspense>
            }
          />
          <Route
            path="reports"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioReports />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <StudioSettings />
              </Suspense>
            }
          />

          {/* ✅ صفحهٔ فقط-نمایش (Read-only + Duplicate) */}
          <Route
            path="course/:id"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <CourseEditor />
              </Suspense>
            }
          />
          {/* ✅ صفحهٔ ویرایش (فقط برای Draft) */}
          <Route
            path="course/:id/edit"
            element={
              <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
                <CourseEditor />
              </Suspense>
            }
          />
        </Route>

        {/* اگر خواستی 404 هم اضافه کن
        <Route path="*" element={<NotFound/>} />
        */}
      </Routes>
    </BrowserRouter>
  );
}
