import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PublisherProfile = () => {
  const { t } = useTranslation();
  const { publisherSlug } = useParams<{ publisherSlug: string }>();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 md:px-6">
      <header className="space-y-3 text-start">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
          {t("publisher.badge")}
        </span>
        <h1 className="font-display text-4xl font-semibold text-slate-900 md:text-5xl">
          {t("publisher.title", { slug: publisherSlug ?? "..." })}
        </h1>
        <p className="text-base text-slate-600 md:text-lg">{t("publisher.subtitle")}</p>
      </header>
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <p>{t("publisher.placeholder")}</p>
        <Link
          to="/"
          className="golden-click inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold transition hover:border-brand-gold hover:bg-brand-gold/10"
        >
          {t("publisher.backToCatalog")}
        </Link>
      </div>
    </section>
  );
};

export default PublisherProfile;
