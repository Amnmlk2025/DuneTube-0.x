import { Suspense, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./components/LanguageSwitcher";
import { PreferencesProvider, usePreferences } from "./context/PreferencesContext";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Wallet from "./pages/Wallet";

const App = () => {
  const { t, i18n } = useTranslation();
  const { currency, dateStyle, setCurrency, setDateStyle } = usePreferences();
  const currencyOptions = ["USD", "EUR", "IRR", "AED"];
  const dateOptions: { value: "short" | "medium" | "long"; label: string }[] = [
    { value: "short", label: t("preferences.dateStyles.short") },
    { value: "medium", label: t("preferences.dateStyles.medium") },
    { value: "long", label: t("preferences.dateStyles.long") },
  ];

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
            <NavLink
              to="/studio"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                }`
              }
            >
              {t("nav.studio")}
            </NavLink>
            <NavLink
              to="/wallet"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-primary/10"
                }`
              }
            >
              {t("nav.wallet")}
            </NavLink>
          </nav>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex flex-col text-slate-600">
              <label htmlFor="currency-select" className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t("preferences.currency")}
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col text-slate-600">
              <label htmlFor="date-style-select" className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                {t("preferences.dateStyle")}
              </label>
              <select
                id="date-style-select"
                value={dateStyle}
                onChange={(event) => setDateStyle(event.target.value as typeof dateStyle)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1">
          <Suspense fallback={<p className="py-20 text-center text-slate-600">{t("catalog.loading")}</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/wallet" element={<Wallet />} />
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

const AppWithProviders = () => (
  <PreferencesProvider>
    <App />
  </PreferencesProvider>
);

export default AppWithProviders;
