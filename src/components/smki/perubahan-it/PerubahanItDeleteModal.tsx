"use client";

import React, { useRef } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useModalA11y } from "./useModalA11y";

interface Props {
  open: boolean;
  noRfc: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function PerubahanItDeleteModal({ open, noRfc, deleting, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useModalA11y(open, deleting, onCancel, dialogRef);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="hapus-rfc-title"
        aria-describedby="hapus-rfc-desc"
        aria-busy={deleting}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-7 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50">
          <Trash2 size={24} className="text-rose-600" aria-hidden="true" />
        </div>
        <h3 id="hapus-rfc-title" className="text-base font-extrabold text-slate-800 dark:text-white">
          Hapus Formulir Perubahan TI?
        </h3>
        <p id="hapus-rfc-desc" className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Apakah Anda yakin ingin menghapus draft <strong className="text-slate-800 dark:text-white">{noRfc}</strong>?
          Seluruh lampiran dan riwayatnya ikut terhapus. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-1"
          >
            {deleting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {deleting ? "Menghapus..." : "Ya, Hapus Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
