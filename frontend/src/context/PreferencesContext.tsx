import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

const CURRENCY_STORAGE_KEY = "dunetube.currency";
const DATE_STYLE_STORAGE_KEY = "dunetube.datestyle";

type DateStyle = "short" | "medium" | "long";

type PreferencesContextValue = {
  currency: string;
  dateStyle: DateStyle;
  setCurrency: (value: string) => void;
  setDateStyle: (value: DateStyle) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const loadCurrency = (): string => {
  if (typeof window === "undefined") {
    return "USD";
  }
  return window.localStorage.getItem(CURRENCY_STORAGE_KEY) || "USD";
};

const loadDateStyle = (): DateStyle => {
  if (typeof window === "undefined") {
    return "medium";
  }
  const stored = window.localStorage.getItem(DATE_STYLE_STORAGE_KEY) as DateStyle | null;
  return stored ?? "medium";
};

type PreferencesProviderProps = {
  children: ReactNode;
};

const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const [currency, setCurrencyState] = useState<string>(loadCurrency);
  const [dateStyle, setDateStyleState] = useState<DateStyle>(loadDateStyle);

  const setCurrency = (value: string) => {
    setCurrencyState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, value);
    }
  };

  const setDateStyle = (value: DateStyle) => {
    setDateStyleState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DATE_STYLE_STORAGE_KEY, value);
    }
  };

  const value = useMemo(
    () => ({
      currency,
      dateStyle,
      setCurrency,
      setDateStyle,
    }),
    [currency, dateStyle],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

export type { DateStyle, PreferencesContextValue };
export { PreferencesProvider, usePreferences };
