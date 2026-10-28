"use client";

import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import type { AsetSdmExportOptions, AsetSdmExportFormat } from "@/services/smki/exportAsetSdm";

interface AsetSdmExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: AsetSdmExportOptions) => Promise<void>;
  loading?: boolean;
}

export default function AsetSdmExportModal({
  isOpen,
  onClose,
  onExport,
  loading = false,
}: AsetSdmExportModalProps) {
  const [exportMode, setExportMode] = useState<"all" | "filtered">("all");
  const [format, setFormat] = useState<AsetSdmExportFormat>("xlsx");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onExport({
      export_mode: exportMode,
      format,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scaleUp">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Upload size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Ekspor Data Aset SDM
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Save As
            </h4>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Data yang diekspor
              </label>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="radio"
                    name="export_mode"
                    value="all"
                    checked={exportMode === "all"}
                    onChange={() => setExportMode("all")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Semua Data</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="radio"
                    name="export_mode"
                    value="filtered"
                    checked={exportMode === "filtered"}
                    onChange={() => setExportMode("filtered")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Data sesuai filter</span>
                </label>
              </div>
            </div>
          </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Format File
            </label>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="export_format"
                  value="xlsx"
                  checked={format === "xlsx"}
                  onChange={() => setFormat("xlsx")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Excel (.xlsx)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="export_format"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={() => setFormat("pdf")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>PDF (.pdf)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="radio"
                  name="export_format"
                  value="docx"
                  checked={format === "docx"}
                  onChange={() => setFormat("docx")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Word (.docx)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rentang Data <span className="font-normal text-slate-500">(berdasarkan TMT Jabatan, opsional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Dari</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Sampai</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Ekspor Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}