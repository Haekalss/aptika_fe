"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Fr026Modal({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  size = "lg",
  darkHeader = false,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
  darkHeader?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    if (open) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current?.close();
    }
  }, [open]);

  const width = size === "md" ? "max-w-xl" : size === "xl" ? "max-w-5xl" : "max-w-3xl";

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={subtitle ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`w-[calc(100vw-2rem)] ${width} overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 dark:border-slate-700 dark:bg-[#0b1e3d]`}
    >
      <div className={darkHeader ? "bg-[#0f223d] px-6 py-5 text-white" : "border-b border-slate-100 px-6 py-5 dark:border-slate-800"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <span className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${darkHeader ? "bg-white/15 text-emerald-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>
                {icon}
              </span>
            )}
            <div>
              <h2 id={`${id}-title`} className={`text-lg font-bold ${darkHeader ? "text-white" : "text-slate-900 dark:text-white"}`}>
                {title}
              </h2>
              {subtitle && (
                <p id={`${id}-description`} className={`mt-1 text-sm ${darkHeader ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className={`rounded-lg p-1.5 transition-colors ${darkHeader ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"}`}
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto px-6 py-5">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
          {footer}
        </div>
      )}
    </dialog>
  );
}
