import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getHealth } from "../lib/api";

type HealthStatus = "idle" | "checking" | "ok" | "fail";

const Hero = () => {
  const { t } = useTranslation();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");

  const checkHealth = useCallback(async () => {
    try {
      setHealthStatus("checking");
      const payload = await getHealth();
      if (payload?.ok) {
        setHealthStatus("ok");
      } else {
        setHealthStatus("fail");
      }
    } catch (error) {
      console.error("Failed to check API health", error);
      setHealthStatus("fail");
    }
  }, []);

  const healthMessage = useMemo(() => {
    switch (healthStatus) {
      case "checking":
        return t("hero.healthStatus.checking");
      case "ok":
        return t("hero.healthStatus.ok");
      case "fail":
        return t("hero.healthStatus.fail");
      default:
        return t("hero.healthStatus.idle");
    }
  }, [healthStatus, t]);

  const healthIcon = useMemo(() => {
    if (healthStatus === "checking") {
      return (
        <svg
          className="h-4 w-4 animate-spin text-brand-night"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
      );
    }
    if (healthStatus === "ok") {
      return (
        <svg className="h-4 w-4 text-brand-night" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.285 6.708a1 1 0 0 0-1.57-1.245l-7.356 9.279-3.093-3.093a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.502-.074l7.931-10.281Z" />
        </svg>
      );
    }
    if (healthStatus === "fail") {
      return (
        <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm.707 14.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L12 14.586l2.293-2.293a1 1 0 0 1 1.414 1.414Zm0-4.414a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L12 10.172l2.293-2.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4 text-brand-gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 15a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm1-4a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0Z" />
      </svg>
    );
  }, [healthStatus]);

  const focusGrid = useCallback(() => {
    const grid = document.querySelector<HTMLElement>("#courses-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl rounded-3xl bg-gradient-to-br from-brand-gold/15 via-white to-white px-6 py-12 text-brand-night shadow-lg md:px-10 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-brand-night/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-sand">
            {t("hero.badge")}
          </span>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{t("hero.title")}</h1>
          <p className="max-w-2xl text-sm text-brand-night/80 md:text-base">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={focusGrid}
              className="golden-click inline-flex items-center justify-center rounded-full bg-brand-night px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-sand transition hover:bg-brand-night/90"
            >
              {t("home.actions.viewCatalog")}
            </button>
            <button
              type="button"
              onClick={checkHealth}
              className={`golden-click inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                healthStatus === "fail"
                  ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-500/90"
                  : healthStatus === "ok"
                      ? "border-brand-gold text-brand-night hover:border-brand-night"
                      : "border-brand-night text-brand-night hover:border-brand-gold"
              }`}
            >
              {healthIcon}
              <span>{t("hero.ctaHealth")}</span>
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-brand-night/10 bg-white/80 p-6 text-sm text-brand-night/80 shadow-inner backdrop-blur">
          <p className="font-semibold uppercase tracking-[0.2em] text-brand-night">{t("hero.sidebar.title")}</p>
          <p className="mt-3 leading-relaxed">{t("hero.sidebar.help")}</p>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-brand-night/70">{t("hero.sidebar.tipLabel")}</p>
          <p className="mt-1 text-sm">{t("hero.sidebar.tipBody")}</p>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          healthStatus === "ok"
            ? "bg-brand-gold/20 text-brand-night"
            : healthStatus === "fail"
                ? "bg-rose-500/10 text-rose-600"
                : healthStatus === "checking"
                    ? "bg-brand-gold/10 text-brand-night"
                    : "bg-brand-night/5 text-brand-night/70"
        }`}
      >
        <span
          className={`inline-flex h-2 w-2 rounded-full ${
            healthStatus === "ok"
              ? "bg-brand-gold shadow-glow-gold"
              : healthStatus === "fail"
                  ? "bg-rose-500"
                  : healthStatus === "checking"
                      ? "bg-brand-gold/70 animate-pulse"
                      : "bg-brand-night/40"
          }`}
        />
        <span>{healthMessage}</span>
      </p>
    </section>
  );
};

export default Hero;
