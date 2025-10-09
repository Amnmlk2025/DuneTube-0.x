import { type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { rtlLanguages, supportedLanguages } from "../i18n";

type LanguageSwitcherProps = {
  onOpenAllLanguages: () => void;
};

const LanguageSwitcher = ({ onOpenAllLanguages }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const currentCode = i18n.language.slice(0, 2) as typeof supportedLanguages[number]["code"];
  const currentLanguage = supportedLanguages.find((lang) => lang.code === currentCode) ?? supportedLanguages[0];

  const quickLanguages = useMemo(
    () => supportedLanguages.filter((lang) => lang.code !== currentLanguage.code).slice(0, 2),
    [currentLanguage.code],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickAway = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const changeLanguage = (code: string) => {
    if (i18n.language !== code) {
      void i18n.changeLanguage(code);
    }
    setOpen(false);
  };

  const handleSwitcherClick = () => {
    setOpen((value) => !value);
  };

  const handleOpenAll = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpen(false);
    onOpenAllLanguages();
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center" aria-haspopup="menu">
      <button
        type="button"
        onClick={handleSwitcherClick}
        aria-expanded={open}
        lang={currentLanguage.code}
        dir={rtlLanguages.has(currentLanguage.code) ? "rtl" : "ltr"}
        className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-brand-gold hover:text-brand-gold"
        title={t("languageSwitcher.label")}
      >
        <span className="sr-only">{t("languageSwitcher.label")}</span>
        <span className="uppercase">{currentLanguage.code}</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-auto top-12 min-w-[200px] rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.28em] text-brand-gold">
              {t("languageSwitcher.current")}
            </span>
            <span className="font-semibold text-slate-900">{currentLanguage.label}</span>
          </div>
          <div className="mt-3 space-y-2">
            {quickLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className="golden-click flex w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 px-3 py-2 text-start font-medium text-slate-700 transition hover:border-brand-gold/40 hover:text-brand-gold"
              >
                <span>{lang.label}</span>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{lang.code}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleOpenAll}
              className="golden-click flex w-full items-center justify-between rounded-xl border border-brand-gold/30 bg-transparent px-3 py-2 text-start text-brand-gold transition hover:bg-brand-gold/10"
            >
              <span>{t("languageSwitcher.more")}</span>
              <span className="text-xs uppercase tracking-[0.24em]">…</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LanguageSwitcher;
