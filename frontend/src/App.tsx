import { Suspense, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./components/LanguageSwitcher";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import Home from "./pages/Home";

const App = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir(i18n.language);
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sand/40 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex flex-wrap items-center justify-between gap-6 py-8">
          <NavLink to="/" className="text-2xl font-bold text-primary-dark">
            DuneTube
          </NavLink>
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                }`
              }
            >
              {t("nav.home")}
            </NavLink>
            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                }`
              }
            >
              {t("nav.catalog")}
            </NavLink>
          </nav>
          <LanguageSwitcher />
        </header>

        <main className="flex-1">
          <Suspense fallback={<p className="py-20 text-center text-slate-600">{t("catalog.loading")}</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} DuneTube · {t("footer.rights")}
        </footer>
      </div>
    </div>
  );
};

export default App;
