import { Suspense, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./components/LanguageSwitcher";
import { PreferencesProvider, usePreferences } from "./context/PreferencesContext";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import Home from "./pages/Home";

const App = () => {
  const { t, i18n } = useTranslation();
  const { currency, dateStyle, setCurrency, setDateStyle } = usePreferences();

  useEffect(() => {
    document.documentElement.dir = i18n.dir(i18n.language);
    document.documentElement.lang = i18n.language;
  }, [i18n.language, i18n]);

  const currencyOptions = ["USD", "EUR", "IRR", "AED"];
  const dateOptions: { value: "short" | "medium" | "long"; label: string }[] = [
    { value: "short", label: t("preferences.dateStyles.short") },
    { value: "medium", label: t("preferences.dateStyles.medium") },
    { value: "long", label: t("preferences.dateStyles.long") },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "golden-click inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
      isActive
        ? "bg-surface-hover text-brand-gold shadow-glow-gold"
        : "text-slate-300 hover:bg-surface-hover/70 hover:text-white",
    ].join(" ");

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-100">
      <header className="border-b border-surface-hover bg-surface/80 shadow-[0_10px_60px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3 text-left">
            <span className="golden-click inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold via-amber-400 to-brand-ember font-display text-base font-black text-surface">
              DT
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg font-bold uppercase tracking-[0.18em] text-white">
                DuneTube
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.32em] text-slate-400">
                {t("layout.tagline")}
              </span>
            </span>
          </NavLink>
          <nav className="flex flex-1 items-center justify-center gap-2 text-sm md:justify-start">
            <NavLink to="/" end className={navLinkClasses}>
              {t("nav.home")}
            </NavLink>
            <NavLink to="/catalog" className={navLinkClasses}>
              {t("nav.catalog")}
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              <span>{t("preferences.currency")}</span>
              <select
                id="currency-select"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="rounded-lg border border-surface-hover bg-surface-subtle px-2 py-1 text-sm text-slate-100 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              <span>{t("preferences.dateStyle")}</span>
              <select
                id="date-style-select"
                value={dateStyle}
                onChange={(event) => setDateStyle(event.target.value as typeof dateStyle)}
                className="rounded-lg border border-surface-hover bg-surface-subtle px-2 py-1 text-sm text-slate-100 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-transparent via-surface/30 to-surface/60">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32 text-lg text-slate-400">
              {t("catalog.loading")}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-surface-hover bg-surface/80 py-6 text-center text-xs uppercase tracking-[0.28em] text-slate-400">
        © {new Date().getFullYear()} DuneTube · {t("footer.rights")}
      </footer>
    </div>
  );
};

const AppWithProviders = () => (
  <PreferencesProvider>
    <App />
  </PreferencesProvider>
);

export default AppWithProviders;
