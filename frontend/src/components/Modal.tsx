import { type ReactNode, useEffect, useId } from "react";

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
};

const Modal = ({ title, description, onClose, children, closeLabel }: ModalProps) => {
  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;
  const closeText = closeLabel ?? "Close";

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const { body } = document;
    const originalOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 id={titleId} className="font-display text-xl font-semibold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="golden-click inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-400 transition hover:border-brand-gold/40 hover:text-brand-gold"
          >
            <span className="sr-only">{closeText}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="m13.414 12 4.95-4.95a1 1 0 0 0-1.414-1.414L12 10.586 7.05 5.636A1 1 0 0 0 5.636 7.05L10.586 12l-4.95 4.95a1 1 0 1 0 1.414 1.414L12 13.414l4.95 4.95a1 1 0 0 0 1.414-1.414Z" />
            </svg>
          </button>
        </div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
