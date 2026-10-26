"use client";

import React from "react";
import { X, ClipboardCheck, CalendarDays, MapPin } from "lucide-react";
import { EvaluasiKepatuhan, formatTanggalIndo, statusBadgeClass } from "@/services/smki/evaluasiKepatuhanService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: EvaluasiKepatuhan | null;
}

export default function EvaluasiKepatuhanDetailModal({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;
  const items = data.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 text-[11px] font-bold mb-1">ID: EVK-{String(data.id).padStart(3, "0")}</span>
              <h3 className="text-base font-bold">Detail Evaluasi Kepatuhan</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Hasil evaluasi kepatuhan terhadap regulasi dan aturan lain.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><CalendarDays size={12} /> Tanggal Evaluasi</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatTanggalIndo(data.tanggal_evaluasi)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><MapPin size={12} /> Ditandatangani di</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.ditandatangani_di || "-"}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><CalendarDays size={12} /> Tanggal Tanda Tangan</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatTanggalIndo(data.tanggal_ttd)}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3">Rincian Dokumen Kepatuhan ({items.length})</h4>
            <div className="flex flex-col gap-3">
              {items.map((it, idx) => (
                <div key={it.id ?? idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white">{it.dokumen_kepatuhan}</h5>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap ${statusBadgeClass(it.evaluasi_status)}`}>{it.evaluasi_status}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line pl-8">{it.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">Terakhir diperbarui: {formatTanggalIndo(data.updated_at)}</p>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">Tutup Detail</button>
          </div>
        </div>
      </div>
    </div>
  );
}
