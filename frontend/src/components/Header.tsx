import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { supportedLanguages, type LanguageCode } from "../i18n";

const primaryLanguages = supportedLanguages.filter((lang) => lang.code === "fa" || lang.code === "en");

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(timeout);
  }, [searchOpen]);

  const navigateToCatalog = (search?: string) => {
    const normalized = search?.trim() ?? "";
    const searchPart = normalized ? `?search=${encodeURIComponent(normalized)}` : "";
    const isAlreadyTarget = location.pathname === "/" && location.search === searchPart;
    if (!isAlreadyTarget) {
      navigate({ pathname: "/", search: searchPart });
    }
    window.setTimeout(() => {
      const element = document.querySelector("#courses-grid");
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigateToCatalog(query);
    setSearchValue("");
    setSearchOpen(false);
  };

  const changeLanguage = (code: LanguageCode) => {
    if (i18n.language.startsWith(code)) {
      return;
    }
    void i18n.changeLanguage(code);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div dir="ltr" className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-6 w-9 overflow-hidden rounded-lg ring-1 ring-slate-200">
            <div className="h-2/3 w-full bg-brand-deep" />
            <div className="h-1/3 w-full bg-brand-sand" />
          </div>
          <span dir="auto" className="font-semibold tracking-tight">
            Dunetube
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-card"
            >
              <input
                ref={inputRef}
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={t("header.searchPlaceholder") ?? ""}
                className="w-36 bg-transparent text-sm text-slate-700 focus:outline-none md:w-48"
              />
              <button
                type="submit"
                aria-label={t("header.searchSubmit")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-deep transition hover:bg-brand-sand/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="h-4 w-4 stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 5 5" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
                aria-label={t("header.searchClose")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                &times;
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setSearchOpen(true);
              }}
              aria-label={t("header.searchOpen")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="h-5 w-5 stroke-2">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 5 5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <div className="flex overflow-hidden rounded-full border border-slate-200">
            {primaryLanguages.map((lang) => {
              const isActive = i18n.language.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={[
                    "px-3 py-1 text-xs font-semibold uppercase transition",
                    isActive ? "bg-brand-deep text-white" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {lang.code}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label={t("header.openSettings")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="h-5 w-5 stroke-2">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label={t("header.openProfile")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-brand-sand text-brand-deep font-semibold transition hover:bg-brand-sand/80"
          >
            {i18n.language.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
