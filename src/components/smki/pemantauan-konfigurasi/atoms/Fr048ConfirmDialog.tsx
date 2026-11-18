"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

type Variant = "primary" | "danger" | "warning";

const VARIANT_BTN: Record<Variant, string> = {
  primary: "bg-violet-600 hover:bg-violet-700 text-white",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  warning: "bg-amber-500 hover:bg-amber-600 text-white",
};

/** Dialog konfirmasi terkontrol (ajukan / selesaikan / kembalikan / hapus). */
export default function Fr048ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "primary",
  loading = false,
  children,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${variant === "danger" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
              <AlertTriangle size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {message && <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-xs font-bold rounded-xl disabled:opacity-50 ${VARIANT_BTN[variant]}`}>
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
