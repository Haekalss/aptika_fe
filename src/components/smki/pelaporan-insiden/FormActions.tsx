"use client";

import { Loader2 } from "lucide-react";

/** Molecule: aksi form Batal + Submit. */
export default function FormActions({
  onCancel,
  submitLabel,
  submitting = false,
  note = "Periksa kembali data sebelum menyimpan laporan.",
}: {
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] text-slate-500">{note}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow transition-all"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
