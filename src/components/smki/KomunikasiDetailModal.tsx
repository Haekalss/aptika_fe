"use client";

import React from "react";
import { X, MessageSquare, Edit, Lock } from "lucide-react";
import { KomunikasiItem, HeaderInfoFR010 } from "@/services/smki/komunikasiService";

interface KomunikasiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: KomunikasiItem) => void;
  item: KomunikasiItem | null;
  header: HeaderInfoFR010;
}

export default function KomunikasiDetailModal({
  isOpen,
  onClose,
  onEdit,
  item,
  header,
}: KomunikasiDetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-[#0d1d36] sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              FORMULIR SMKI / FR-010
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
              Detail Komunikasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informasi lengkap catatan komunikasi · Mode baca saja
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Metadata FR-010 Header Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071733]/60 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">No. Dokumen</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{header.no_dokumen}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">No. Revisi</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{header.no_revisi}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tanggal Berlaku</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{header.tanggal_berlaku}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Periode</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{item.periode || header.periode}</p>
            </div>
          </div>

          {/* Main Card View */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
            {/* Tag & Judul */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 uppercase tracking-wide">
                  KOMUNIKASI {item.tipe}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{item.judul}</span>
              </h4>
            </div>

            {/* Grid Detail Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Tipe</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{item.tipe}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Klasifikasi</p>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                  {item.klasifikasi}
                </span>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Judul Informasi</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.judul}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Pengirim</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.pengirim}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Penerima</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.penerima}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Frekuensi</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.frekuensi}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Metode</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.metode}</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            * Catatan komunikasi SMKI resmi tersimpan di basis data sistem.
          </p>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Lock size={13} className="text-slate-400" />
              <span>Baca saja · Tidak ada perubahan pada data</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <Edit size={14} />
                <span>Edit Komunikasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
