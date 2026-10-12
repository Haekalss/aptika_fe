"use client";

import React from "react";
import { X, FileDown, Loader2, FileText, Hash, CalendarDays } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => Promise<void>;
  loading: boolean;
  noDokumen: string;
  setNoDokumen: (v: string) => void;
  noRevisi: string;
  setNoRevisi: (v: string) => void;
  tanggalBerlaku: string;
  setTanggalBerlaku: (v: string) => void;
}

const field = "w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40";

export default function EvaluasiKepatuhanExportModal(p: Props) {
  if (!p.isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={p.loading ? undefined : p.onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center"><FileDown size={18} /></div>
            <div>
              <h3 className="text-base font-bold">Detail Dokumen FR-044</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Isi informasi header sebelum ekspor</p>
            </div>
          </div>
          <button type="button" onClick={p.loading ? undefined : p.onClose} className="text-white/80 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
            <p className="font-bold mb-0.5">Informasi ini akan terisi pada kop dokumen Word.</p>
            <p>Kosongkan jika ingin menggunakan nilai default dari template FR-044.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">No. Dokumen</label>
            <div className="relative"><FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={p.noDokumen} onChange={(e) => p.setNoDokumen(e.target.value)} placeholder="FR-044/KOM.03.05/SANDIKAMI" className={field} /></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">No. Revisi</label>
            <div className="relative"><Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={p.noRevisi} onChange={(e) => p.setNoRevisi(e.target.value)} placeholder="Contoh: 0.0" className={field} /></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tanggal Berlaku</label>
            <div className="relative"><CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={p.tanggalBerlaku} onChange={(e) => p.setTanggalBerlaku(e.target.value)} placeholder="Contoh: 14 Oktober 2022" className={field} /></div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" disabled={p.loading} onClick={p.onClose} className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Batal</button>
            <button type="button" disabled={p.loading} onClick={p.onExport} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-60">
              {p.loading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Unduh Dokumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
