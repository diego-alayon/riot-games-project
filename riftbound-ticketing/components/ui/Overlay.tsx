"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconClose, IconDots } from "@/components/icons";

/* ── Modal ──────────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-darker/50" onClick={onClose} />
      <div role="dialog" aria-modal className="relative w-full max-w-110 bg-surface rounded-lg shadow-overlay">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 className="text-heading-md uppercase text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <IconClose size={18} />
          </button>
        </div>
        <div className="px-6 pt-3 pb-6 text-body text-muted">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 pb-6">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Action menu (three dots) ───────────────────────────────────────────── */

export function ActionMenu({
  label = "More actions",
  items,
  trigger,
}: {
  label?: string;
  /** Custom trigger content (e.g. an avatar). Defaults to the three-dots icon. */
  trigger?: ReactNode;
  items: Array<{ label: string; onSelect: () => void; tone?: "danger"; disabled?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          trigger
            ? "inline-flex items-center gap-2 h-8 rounded-md"
            : "inline-flex items-center justify-center size-8 rounded-md text-muted hover:bg-surface-muted hover:text-ink"
        }
      >
        {trigger ?? <IconDots size={16} />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-48 py-1.5 bg-surface border border-line rounded-md shadow-raised">
          {items.map((i) => (
            <button
              key={i.label}
              type="button"
              disabled={i.disabled}
              onClick={() => {
                setOpen(false);
                i.onSelect();
              }}
              className={cx(
                "block w-full text-left px-3.5 py-2 text-body-sm hover:bg-canvas disabled:text-disabled disabled:hover:bg-surface",
                i.tone === "danger" ? "text-danger" : "text-ink",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Toast ──────────────────────────────────────────────────────────────── */

interface ToastMsg {
  id: number;
  text: ReactNode;
}

const ToastCtx = createContext<(text: ReactNode) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([]);
  const push = useCallback((text: ReactNode) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, text }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {items.map((t) => (
          <div key={t.id} className="px-4 py-2.5 rounded-md bg-surface-dark text-on-dark text-body-sm shadow-overlay">
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
