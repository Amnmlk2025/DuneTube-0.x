import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import FiltersBar, { type FilterOption } from "../components/FiltersBar";

const topicFilters: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
  { id: "mentat", label: "Mentat" },
  { id: "fremen", label: "Fremen" },
  { id: "strategy", label: "Strategy" },
];

const Home = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const activeLabel = useMemo(() => {
    const found = topicFilters.find((filter) => filter.id === activeFilter);
    return found?.label ?? activeFilter;
  }, [activeFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-semibold text-brand-deep md:text-3xl">
        {t("home.title", { defaultValue: "Stream knowledge from Arrakis" })}
      </h1>
      <p className="mt-2 text-sm text-slate-600 md:text-base">
        {t("home.subtitle", {
          defaultValue: "Choose a topic to tailor the latest courses, shorts, and playlists to your interests.",
        })}
      </p>

      <div className="mt-6">
        <FiltersBar filters={topicFilters} activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-card">
        {t("home.filters.selected", {
          defaultValue: "Currently viewing recommendations for:",
        })}{" "}
        <strong className="text-brand-deep">{activeLabel}</strong>
      </section>
    </div>
  );
};

export default Home;
