import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ConfirmInput = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmState = ConfirmInput & { open: boolean; resolve?: (v: boolean) => void };

type CtxT = {
  confirm: (opts: ConfirmInput) => Promise<boolean>;
};

const Ctx = createContext<CtxT | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<ConfirmState>({ open: false, title: "" });

  const confirm = useCallback((opts: ConfirmInput) => {
    return new Promise<boolean>((resolve) => {
      setSt({ open: true, ...opts, resolve });
    });
  }, []);

  const onClose = (v: boolean) => {
    st.resolve?.(v);
    setSt((s) => ({ ...s, open: false }));
  };

  const ctx = useMemo<CtxT>(() => ({ confirm }), [confirm]);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {st.open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
          <div className="relative z-[86] w-[min(92vw,460px)] rounded-xl bg-white border shadow-lg p-4">
            <h3 className="text-base font-semibold">{st.title}</h3>
            {st.message && <p className="text-sm text-gray-600 mt-1">{st.message}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => onClose(false)}>
                {st.cancelText ?? "Cancel"}
              </button>
              <button className="px-3 py-2 rounded text-white" style={{ background: "#0A355C" }} onClick={() => onClose(true)}>
                {st.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useConfirm() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return v;
}
