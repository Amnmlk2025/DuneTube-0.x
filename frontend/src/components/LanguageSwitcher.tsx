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
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-600">{t("languageSwitcher.label")}</span>
      <div className="inline-flex rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        {supportedLanguages.map((lang) => {
          const isActive = i18n.language.startsWith(lang.code);
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`px-3 py-1 text-sm transition-colors duration-150 first:rounded-l-full last:rounded-r-full ${
                isActive
                  ? "bg-primary text-white shadow-inner"
                  : "text-slate-600 hover:bg-slate-100"
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
