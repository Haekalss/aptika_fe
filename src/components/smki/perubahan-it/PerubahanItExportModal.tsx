"use client";

import React, { useRef, useState } from "react";
import { FileDown, Loader2, X } from "lucide-react";
import { useModalA11y } from "./useModalA11y";

export type PerubahanItExportMode = "all" | "filtered";

interface Props {
  open: boolean;
  loading: boolean;
  /** Ringkasan filter yang sedang aktif, mis. ["Status: Draft"]. Kosong = tidak ada filter. */
  filterAktif: string[];
  onClose: () => void;
  onExport: (mode: PerubahanItExportMode) => void;
}

export default function PerubahanItExportModal({ open, loading, filterAktif, onClose, onExport }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PerubahanItExportMode>("all");

  useModalA11y(open, loading, onClose, dialogRef);

  if (!open) return null;

  const radio = (value: PerubahanItExportMode, label: string, desc: string) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600 ${
        mode === value
          ? "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <input
        type="radio"
        name="export_mode"
        checked={mode === value}
        onChange={() => setMode(value)}
        className="mt-0.5 h-4 w-4 text-emerald-700 focus:outline-none"
      />
      <span>
        <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="block text-[11px] text-slate-600 dark:text-slate-400">{desc}</span>
      </span>
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ekspor-rfc-title"
        aria-busy={loading}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileDown size={18} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <h3 id="ekspor-rfc-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
              Ekspor Formulir Perubahan TI
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Setiap permintaan diekspor sebagai satu halaman formulir FR-015 dalam satu berkas Microsoft Word (.docx).
          </p>
          <div className="space-y-2.5">
            {radio("all", "Semua data", "Seluruh permintaan perubahan TI yang tersedia.")}
            {radio(
              "filtered",
              "Data sesuai filter",
              filterAktif.length > 0 ? filterAktif.join(" · ") : "Belum ada filter aktif, hasilnya sama dengan semua data."
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onExport(mode)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              {loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {loading ? "Mengekspor..." : "Ekspor Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
