"use client";

import React, { useState } from "react";
import { X, FileText, Download, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { exportHakAksesFisikDocx } from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  singleId?: number | null;
  defaultHeader?: {
    no_dokumen: string;
    no_revisi: string;
    tanggal_berlaku: string;
  };
}

export default function HakAksesFisikExportModal({
  open,
  onClose,
  singleId = null,
  defaultHeader,
}: Props) {
  const [noDokumen, setNoDokumen] = useState(
    defaultHeader?.no_dokumen || "FR-019//KOM.03.05/ SANDIKAMI"
  );
  const [noRevisi, setNoRevisi] = useState(defaultHeader?.no_revisi || "1.1");
  const [tanggalBerlaku, setTanggalBerlaku] = useState(
    defaultHeader?.tanggal_berlaku || "07 Juli 2022"
  );
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const triggerDownload = (blobData: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await exportHakAksesFisikDocx({
        id: singleId || undefined,
        no_dokumen: noDokumen || undefined,
        no_revisi: noRevisi || undefined,
        tanggal_berlaku: tanggalBerlaku || undefined,
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      triggerDownload(blob, `FR-019_Formulir_Hak_Akses_Fisik_${dateStr}.docx`);
      toast.success("Dokumen FR-019 (.docx) berhasil diunduh!");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengunduh dokumen Word FR-019.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Detail Dokumen FR-019 Sebelum Ekspor
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
            <p className="leading-relaxed">
              Informasi ini akan terisi pada header tabel dokumen Word FR-019.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              No. Dokumen
            </label>
            <input
              type="text"
              value={noDokumen}
              onChange={(e) => setNoDokumen(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              No. Revisi
            </label>
            <input
              type="text"
              value={noRevisi}
              onChange={(e) => setNoRevisi(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Berlaku
            </label>
            <input
              type="text"
              value={tanggalBerlaku}
              onChange={(e) => setTanggalBerlaku(e.target.value)}
              placeholder="Contoh: 07 Juli 2022"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyiapkan...
              </>
            ) : (
              <>
                <Download size={14} />
                Unduh Dokumen (.docx)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
