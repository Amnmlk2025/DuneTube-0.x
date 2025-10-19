import React, { createContext, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  title: string;
  desc?: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms
};

type ToastCtx = {
  push: (t: Omit<Toast, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const ctx = useMemo<ToastCtx>(() => ({
    push: (t) => {
      const id = uuid();
      const toast: Toast = { id, duration: 3000, type: "success", ...t };
      setItems((a) => [...a, toast]);
      // auto-dismiss
      setTimeout(() => setItems((a) => a.filter((x) => x.id !== id)), toast.duration);
    },
  }), []);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {/* Viewport */}
      <div className="fixed z-[90] right-3 top-3 space-y-2 w-[min(92vw,360px)]">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border bg-white shadow-sm p-3"
            style={{
              borderColor: t.type === "error" ? "#fecaca" : t.type === "info" ? "#bfdbfe" : "#bbf7d0",
              boxShadow: "0 6px 24px rgba(0,0,0,.08)",
            }}
          >
            <div className="font-medium">{t.title}</div>
            {t.desc && <div className="text-sm text-gray-600 mt-0.5">{t.desc}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used within <ToastProvider>");
  return v;
}
