import { Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "./components/Header";
import { PreferencesProvider } from "./context/PreferencesContext";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import PublisherProfile from "./pages/PublisherProfile";
import TeacherProfile from "./pages/TeacherProfile";
import WatchLesson from "./pages/WatchLesson";
import Home from "./pages/Home";

const AppShell = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("layout.tabTitle");
  }, [t]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
        <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">{t("catalog.loading")}</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/publishers/:publisherSlug" element={<PublisherProfile />} />
            <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
            <Route path="/watch/:lessonId" element={<WatchLesson />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <PreferencesProvider>
    <AppShell />
  </PreferencesProvider>
);

export default App;
