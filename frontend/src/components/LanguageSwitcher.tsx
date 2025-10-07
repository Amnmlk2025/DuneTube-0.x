import { supportedLanguages } from "../i18n";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (code: string) => {
    if (i18n.language !== code) {
      i18n.changeLanguage(code);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
      <span>{t("languageSwitcher.label")}</span>
      <div className="inline-flex overflow-hidden rounded-full border border-surface-hover bg-surface-subtle/80 backdrop-blur">
        {supportedLanguages.map((lang) => {
          const isActive = i18n.language.startsWith(lang.code);
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`golden-click px-3 py-1 text-xs transition-colors duration-150 ${
                isActive
                  ? "bg-brand-gold text-surface font-bold text-surface shadow-glow-gold"
                  : "text-slate-300 hover:bg-surface-hover"
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
