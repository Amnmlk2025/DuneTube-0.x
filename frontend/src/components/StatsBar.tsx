import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const StatsBar = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        id: "learners",
        value: t("home.stats.learners.value"),
        label: t("home.stats.learners.label"),
      },
      {
        id: "courses",
        value: t("home.stats.courses.value"),
        label: t("home.stats.courses.label"),
      },
      {
        id: "languages",
        value: t("home.stats.languages.value"),
        label: t("home.stats.languages.label"),
      },
    ],
    [t],
  );

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl">
      <div className="grid gap-4 rounded-3xl border border-brand-night/10 bg-white/70 p-6 text-center shadow-lg backdrop-blur md:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <p className="text-3xl font-semibold text-brand-night">{item.value}</p>
            <p className="text-sm text-brand-night/70">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
