"use client";

import React from "react";
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Flame } from "lucide-react";

interface RiskMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskMatrixModal({ isOpen, onClose }: RiskMatrixModalProps) {
  if (!isOpen) return null;

  // 5x5 Likelihood x Impact definitions based on official sheet
  // Likelihood (Rows from 5 to 1):
  // 5: Sangat Tinggi
  // 4: Tinggi
  // 3: Menengah
  // 2: Rendah
  // 1: Sangat Rendah

  const rows = [
    {
      level: 5,
      label: "5 — Sangat Tinggi",
      cols: [
        { l: 5, i: 1, score: 5, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 5, i: 2, score: 10, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 5, i: 3, score: 15, cat: "Tinggi", color: "bg-orange-100 text-orange-800 border-orange-300 font-bold" },
        { l: 5, i: 4, score: 20, cat: "Sangat Tinggi", color: "bg-red-100 text-red-800 border-red-300 font-bold" },
        { l: 5, i: 5, score: 25, cat: "Ekstrim", color: "bg-rose-600 text-white border-rose-700 font-black animate-pulse" },
      ],
    },
    {
      level: 4,
      label: "4 — Tinggi",
      cols: [
        { l: 4, i: 1, score: 4, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 4, i: 2, score: 8, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 4, i: 3, score: 12, cat: "Tinggi", color: "bg-orange-100 text-orange-800 border-orange-300 font-bold" },
        { l: 4, i: 4, score: 16, cat: "Sangat Tinggi", color: "bg-red-100 text-red-800 border-red-300 font-bold" },
        { l: 4, i: 5, score: 20, cat: "Sangat Tinggi", color: "bg-red-100 text-red-800 border-red-300 font-bold" },
      ],
    },
    {
      level: 3,
      label: "3 — Menengah",
      cols: [
        { l: 3, i: 1, score: 3, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 3, i: 2, score: 6, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 3, i: 3, score: 9, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 3, i: 4, score: 12, cat: "Tinggi", color: "bg-orange-100 text-orange-800 border-orange-300 font-bold" },
        { l: 3, i: 5, score: 15, cat: "Tinggi", color: "bg-orange-100 text-orange-800 border-orange-300 font-bold" },
      ],
    },
    {
      level: 2,
      label: "2 — Rendah",
      cols: [
        { l: 2, i: 1, score: 2, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 2, i: 2, score: 4, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 2, i: 3, score: 6, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 2, i: 4, score: 8, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
        { l: 2, i: 5, score: 10, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
      ],
    },
    {
      level: 1,
      label: "1 — Sangat Rendah",
      cols: [
        { l: 1, i: 1, score: 1, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 1, i: 2, score: 2, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 1, i: 3, score: 3, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 1, i: 4, score: 4, cat: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
        { l: 1, i: 5, score: 5, cat: "Menengah", color: "bg-amber-100 text-amber-800 border-amber-300" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Matriks Analisis Risiko ($5 \times 5$)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format Standar FR-002: Kemungkinan (Likelihood) $\times$ Dampak (Impact)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Matriks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-xl w-36"
                  >
                    Kemungkinan \ Dampak
                  </th>
                  <th
                    colSpan={5}
                    className="p-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-slate-700"
                  >
                    DAMPAK (CONSEQUENCES)
                  </th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <th className="p-2 border border-slate-200 dark:border-slate-700">1 — Tidak Signifikan</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">2 — Kecil</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">3 — Menengah</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">4 — Besar</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">5 — Sangat Besar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.level}>
                    <td className="p-2.5 text-xs font-semibold text-left text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      {r.label}
                    </td>
                    {r.cols.map((c, idx) => (
                      <td
                        key={idx}
                        className={`p-2.5 border border-slate-200 dark:border-slate-700 transition hover:scale-105 ${c.color}`}
                      >
                        <div className="text-base font-extrabold leading-tight">{c.score}</div>
                        <div className="text-[10px] uppercase tracking-wider opacity-90">{c.cat}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kriteria & Aksi Kendali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/30">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Kriteria Keberterimaan Risiko
              </h3>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><span className="font-semibold text-emerald-700 dark:text-emerald-400">Rendah (1-4):</span> Dapat Diterima (Dipantau berkala oleh staf/Kasi).</li>
                <li><span className="font-semibold text-amber-700 dark:text-amber-400">Menengah (5-11):</span> Masalah Kecil (Disarankan dikendalikan bila ada alokasi daya).</li>
                <li><span className="font-semibold text-orange-700 dark:text-orange-400">Tinggi (12-15):</span> Masalah Besar (Wajib mitigasi, laporan ke Kepala Bidang).</li>
                <li><span className="font-semibold text-red-700 dark:text-red-400">Sangat Tinggi / Ekstrim (&ge;16):</span> Sangat Besar (Mitigasi segera, persetujuan Kepala Dinas).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/30">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Penanggung Jawab Kendali
              </h3>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><span className="font-semibold text-slate-800 dark:text-slate-200">Kepala Seksi / Tim Teknis:</span> Pengendalian tingkat Rendah.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-200">Kepala Bidang:</span> Pengendalian tingkat Menengah & Tinggi.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-200">Kepala Dinas:</span> Pengendalian tingkat Sangat Tinggi & Ekstrim.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 text-white dark:bg-emerald-600 px-5 py-2 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-700 transition"
          >
            Tutup Matriks
          </button>
        </div>
      </div>
    </div>
  );
}
