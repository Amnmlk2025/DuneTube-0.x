import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16 md:px-6">
      <header className="space-y-3 text-start">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
          {t("profile.badge")}
        </span>
        <h1 className="font-display text-4xl font-semibold text-slate-900 md:text-5xl">{t("profile.title")}</h1>
        <p className="text-base text-slate-600 md:text-lg">{t("profile.subtitle")}</p>
      </header>
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <p>{t("profile.placeholder")}</p>
      </div>
    </section>
  );
};

export default Profile;
