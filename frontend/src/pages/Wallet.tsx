import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePreferences } from "../context/PreferencesContext";
import { formatCurrencyForDisplay, formatDateTime } from "../utils/intl";

interface WalletBalance {
  amount: string;
  currency: string;
}

interface WalletTransaction {
  id: string;
  direction: "credit" | "debit";
  amount: string;
  currency: string;
  description: string;
  status: string;
  occurred_at: string;
  course_id?: number | null;
  course_title?: string;
}

interface WalletInvoice {
  id: string;
  amount: string;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string;
  reference: string;
}

type TransactionsResponse = {
  balance: WalletBalance;
  transactions: WalletTransaction[];
};

type InvoicesResponse = {
  invoices: WalletInvoice[];
};

const Wallet = () => {
  const { t, i18n } = useTranslation();
  const { currency, dateStyle } = usePreferences();
  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("dunetube.token");
  }, []);
  const isAuthenticated = Boolean(token);

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [invoices, setInvoices] = useState<WalletInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadWallet = async () => {
      setIsLoading(true);
      try {
        const [txResponse, invoiceResponse] = await Promise.all([
          fetch("/api/wallet/transactions/", {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/wallet/invoices/", {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!txResponse.ok) {
          throw new Error("transactions");
        }
        if (!invoiceResponse.ok) {
          throw new Error("invoices");
        }

        const txData = (await txResponse.json()) as TransactionsResponse;
        const invoiceData = (await invoiceResponse.json()) as InvoicesResponse;
        setBalance(txData.balance);
        setTransactions(txData.transactions);
        setInvoices(invoiceData.invoices);
        setWalletError(null);
        setInvoiceError(null);
      } catch (error) {
        console.error("Failed to load wallet data", error);
        if (error instanceof Error && error.message === "invoices") {
          setInvoiceError(t("wallet.errors.loadInvoices"));
        } else {
          setWalletError(t("wallet.errors.loadTransactions"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadWallet();
  }, [isAuthenticated, t, token]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{t("wallet.title")}</h1>
        <p className="text-lg text-slate-600">{t("wallet.authRequired")}</p>
      </div>
    );
  }

  const formattedBalance = balance
    ? formatCurrencyForDisplay(balance.amount, balance.currency, currency, i18n.language)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <header className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">{t("wallet.title")}</h1>
        <p className="mt-3 text-sm text-slate-600">{t("wallet.subtitle")}</p>
      </header>

      {isLoading ? (
        <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-600">{t("wallet.loading")}</p>
      ) : null}

      {walletError ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{walletError}</p>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{t("wallet.balance.heading")}</h2>
            <p className="mt-2 text-3xl font-bold text-primary">
              {formattedBalance ?? t("wallet.balance.empty")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t("wallet.balance.currencyNotice", { currency })}</p>
          </div>

          <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{t("wallet.invoices.heading")}</h3>
            {invoiceError ? (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600">{invoiceError}</p>
            ) : null}
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">{t("wallet.invoices.empty")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>{invoice.reference}</span>
                      <span className="text-primary">
                        {formatCurrencyForDisplay(invoice.amount, invoice.currency, currency, i18n.language)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      <p>
                        {t("wallet.invoices.issued", {
                          date: formatDateTime(invoice.issued_at, i18n.language, dateStyle),
                        })}
                      </p>
                      <p>
                        {t("wallet.invoices.due", {
                          date: formatDateTime(invoice.due_at, i18n.language, dateStyle),
                        })}
                      </p>
                    </div>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        invoice.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : invoice.status === "overdue"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {t(`wallet.status.${invoice.status}`)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{t("wallet.transactions.heading")}</h2>
          {transactions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">{t("wallet.transactions.empty")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {transactions.map((transaction) => {
                const formattedAmount = formatCurrencyForDisplay(
                  transaction.amount,
                  transaction.currency,
                  currency,
                  i18n.language,
                );
                return (
                  <li key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{transaction.description}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(transaction.occurred_at, i18n.language, dateStyle)}
                        </p>
                        {transaction.course_title ? (
                          <p className="mt-1 text-xs text-primary">{transaction.course_title}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            transaction.direction === "credit" ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {transaction.direction === "credit" ? "+" : "-"}
                          {formattedAmount}
                        </p>
                        <span className="text-xs text-slate-500">{t(`wallet.status.${transaction.status}`)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wallet;
