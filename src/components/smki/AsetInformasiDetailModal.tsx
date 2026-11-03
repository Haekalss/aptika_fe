"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Layers,
  Sparkles,
  Calendar,
  Building2,
  Lock,
  Globe,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { FormulirAsetInformasiItem } from "@/services/smki/asetInformasiService";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FormulirAsetInformasiItem | null;
}

export default function AsetInformasiDetailModal({
  isOpen,
  onClose,
  data,
}: DetailModalProps) {
  const [activeTab, setActiveTab] = useState<"unit_kerja" | "intangible">("unit_kerja");

  if (!isOpen || !data) return null;

  const unitKerjaList = data.unit_kerja_details || [];
  const intangibleList = data.intangible_details || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {data.no_formulir}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  Rev {data.revisi}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formulir SMKI ISO 27001 (FR-028) &bull; Dibuat pada {data.tanggal}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Bidang / Unit Kerja
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {data.bidang_nama || "Bidang APTIKA"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Klasifikasi Dokumen
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {data.klasifikasi_dokumen || "Dokumen Terbatas"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Aset Dokumen
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {unitKerjaList.length} Item
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Aset Intangible
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {intangibleList.length} Item
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("unit_kerja")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "unit_kerja"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Layers size={15} />
              <span>Tab 1: Aset Informasi Dokumen ({unitKerjaList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("intangible")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "intangible"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Sparkles size={15} />
              <span>Tab 2: Aset Intangible & CIA ({intangibleList.length})</span>
            </button>
          </div>

          {/* Tab 1 Content */}
          {activeTab === "unit_kerja" && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {unitKerjaList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  NIHIL (Tidak ada data aset dokumen terdaftar pada formulir ini)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3 min-w-[100px]">Kode</th>
                        <th className="p-3 min-w-[180px]">Nama Aset Informasi</th>
                        <th className="p-3 min-w-[110px]">Klasifikasi</th>
                        <th className="p-3 min-w-[80px]">Pembuatan</th>
                        <th className="p-3 min-w-[80px]">Update</th>
                        <th className="p-3 min-w-[160px]">Deskripsi</th>
                        <th className="p-3 min-w-[100px]">Format</th>
                        <th className="p-3 min-w-[100px]">Masa Simpan</th>
                        <th className="p-3 min-w-[140px]">Lokasi</th>
                        <th className="p-3 min-w-[140px]">Pemilik Aset</th>
                        <th className="p-3 min-w-[100px]">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {unitKerjaList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="p-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                            {row.kode_aset || "-"}
                          </td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-white">
                            {row.nama_aset}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                row.klasifikasi === "Rahasia"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : row.klasifikasi === "Internal"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {row.klasifikasi}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{row.tahun_pembuatan || "-"}</td>
                          <td className="p-3 text-slate-500">{row.tahun_update || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.deskripsi || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.format_penyimpanan}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.masa_simpan || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.lokasi_penyimpanan || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.pemilik_aset || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.keterangan || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2 Content */}
          {activeTab === "intangible" && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {intangibleList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  NIHIL (Tidak ada data aset intangible terdaftar pada formulir ini)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3 min-w-[100px]">Kode</th>
                        <th className="p-3 min-w-[140px]">Layanan</th>
                        <th className="p-3 min-w-[180px]">Nama Aset</th>
                        <th className="p-3 min-w-[140px]">Sub Klasifikasi</th>
                        <th className="p-3 min-w-[140px]">Pemilik Aset</th>
                        <th className="p-3 w-20 text-center">Kerahasiaan</th>
                        <th className="p-3 w-20 text-center">Integritas</th>
                        <th className="p-3 w-20 text-center">Ketersediaan</th>
                        <th className="p-3 w-16 text-center">Nilai</th>
                        <th className="p-3 w-24 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {intangibleList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="p-3 font-mono font-medium text-purple-600 dark:text-purple-400">
                            {row.kode_aset || "-"}
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{row.layanan || "-"}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-white">{row.nama_aset}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.sub_klasifikasi || "-"}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{row.pemilik_aset || "-"}</td>
                          <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-200">
                            {row.kerahasiaan}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-200">
                            {row.integritas}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-200">
                            {row.ketersediaan}
                          </td>
                          <td className="p-3 text-center">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-white">
                              {row.nilai}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                row.nilai === 3
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : row.nilai === 2
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {row.keterangan || (row.nilai === 3 ? "Tinggi" : row.nilai === 2 ? "Sedang" : "Rendah")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
