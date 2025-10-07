import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type HealthStatus = "idle" | "ok" | "fail" | "pending";

const Home = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<HealthStatus>("idle");

  const checkHealth = async () => {
    try {
      setStatus("pending");
      const response = await fetch("/healthz");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      const body = await response.json();
      if (body?.ok) {
        setStatus("ok");
      } else {
        setStatus("fail");
      }
    } catch (error) {
      console.error("Health check error", error);
      setStatus("fail");
    }
  };

  const statusMessage = () => {
    if (status === "pending") {
      return "...";
    }
    if (status === "ok") {
      return t("hero.healthStatus.ok");
    }
    if (status === "fail") {
      return t("hero.healthStatus.fail");
    }
    return t("hero.healthStatus.idle");
  };

  return (
    <section className="grid gap-10 py-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-16">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold leading-snug text-slate-900 lg:text-5xl">{t("hero.title")}</h1>
        <p className="text-lg text-slate-700">{t("hero.subtitle")}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/catalog"
            className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-dark"
          >
            {t("hero.ctaCatalog")}
          </Link>
          <button
            type="button"
            onClick={checkHealth}
            className="rounded-full border border-primary px-6 py-3 text-base font-semibold text-primary transition hover:bg-primary/10"
          >
            {t("hero.ctaHealth")}
          </button>
        </div>
        {status !== "idle" ? (
          <p className={`text-sm font-medium ${status === "ok" ? "text-primary" : "text-rose-600"}`}>
            {statusMessage()}
          </p>
        ) : null}
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        <div className="relative rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-primary">Mentat Insights</p>
            <p className="text-lg font-medium text-slate-800">
              "The mind can go either direction under stress--toward positive or toward negative: on or off."
            </p>
            <p className="text-sm text-slate-500">-- Bene Gesserit Truisms</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;

