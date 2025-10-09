const toNumber = (value: number | string): number => {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const conversionRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  IRR: 42000,
  AED: 3.67,
};

const convertCurrency = (value: number | string, fromCurrency: string, toCurrency: string): number => {
  const amount = toNumber(value);
  const fromRate = conversionRates[fromCurrency] ?? conversionRates.USD;
  const toRate = conversionRates[toCurrency] ?? conversionRates.USD;
  if (!fromRate || !toRate) {
    return amount;
  }
  const valueInUsd = amount / fromRate;
  return valueInUsd * toRate;
};

const formatCurrency = (value: number | string, currency: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(toNumber(value));
  } catch (error) {
    console.warn("Unable to format currency", error);
    return `${value} ${currency}`;
  }
};

const formatCurrencyForDisplay = (
  value: number | string,
  fromCurrency: string,
  displayCurrency: string,
  locale: string,
) => {
  if (fromCurrency === displayCurrency) {
    return formatCurrency(value, displayCurrency, locale);
  }
  const converted = convertCurrency(value, fromCurrency, displayCurrency);
  return formatCurrency(converted, displayCurrency, locale);
};

const formatDateTime = (value: string, locale: string, dateStyle: "short" | "medium" | "long") => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    console.warn("Unable to format date", error);
    return value;
  }
};

const formatRelativeTimeFromNow = (value: string, locale: string) => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const now = Date.now();
    const diff = date.getTime() - now;
    const seconds = Math.round(diff / 1000);
    const units: Array<["year" | "month" | "week" | "day" | "hour" | "minute" | "second", number]> = [
      ["year", 60 * 60 * 24 * 365],
      ["month", 60 * 60 * 24 * 30],
      ["week", 60 * 60 * 24 * 7],
      ["day", 60 * 60 * 24],
      ["hour", 60 * 60],
      ["minute", 60],
      ["second", 1],
    ];

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    for (const [unit, unitSeconds] of units) {
      if (Math.abs(seconds) >= unitSeconds || unit === "second") {
        const valueInUnit = Math.round(seconds / unitSeconds);
        return rtf.format(valueInUnit, unit);
      }
    }
    return value;
  } catch (error) {
    console.warn("Unable to format relative time", error);
    return value;
  }
};

export { convertCurrency, formatCurrency, formatCurrencyForDisplay, formatDateTime, formatRelativeTimeFromNow };
