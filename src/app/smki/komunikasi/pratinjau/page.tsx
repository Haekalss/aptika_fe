"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  FileSpreadsheet,
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  KomunikasiItem,
  HeaderInfoFR010,
  fetchKomunikasiList,
} from "@/services/smki/komunikasiService";
import { exportKomunikasiToPdf, exportKomunikasiToExcel } from "@/utils/smkiKomunikasiExport";

export default function PratinjauKomunikasiPage() {
  const router = useRouter();
  const [internalItems, setInternalItems] = useState<KomunikasiItem[]>([]);
  const [eksternalItems, setEksternalItems] = useState<KomunikasiItem[]>([]);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfoFR010>({
    no_dokumen: "FR-010/KOM.03.05/SANDIKAMI",
    no_revisi: "1.1",
    tanggal_berlaku: "07 Juli 2022",
    periode: "2022",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchKomunikasiList();
        if (res.success) {
          setInternalItems(res.internal);
          setEksternalItems(res.eksternal);
          setHeaderInfo(res.header);
        }
      } catch {
        toast.error("Gagal memuat pratinjau dokumen.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      await exportKomunikasiToPdf({
        header: headerInfo,
        internalItems,
        eksternalItems,
      });
      toast.success("Dokumen PDF berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen PDF.");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await exportKomunikasiToExcel({
        header: headerInfo,
        internalItems,
        eksternalItems,
      });
      toast.success("Dokumen Excel / XLSX berhasil diunduh.");
    } catch {
      toast.error("Gagal mengekspor berkas Excel.");
    }
  };

  const handlePrintBrowser = () => {
    window.print();
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#070f1e] text-slate-800 dark:text-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Top Header Controls (Hidden on print) */}
          <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                FORMULIR SMKI / FR-010
              </span>
              <h1 className="text-xl font-extrabold text-[#0f2540] dark:text-white mt-0.5">
                Pratinjau Cetak & Ekspor
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dokumen FR-010 · Struktur formulir komunikasi SMKI
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/smki/komunikasi")}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#0d1d36] border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Daftar</span>
              </button>

              <button
                type="button"
                onClick={handlePrintBrowser}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0d1d36] hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer size={14} className="text-slate-500" />
                <span>Cetak Browser</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0d1d36] hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Ekspor Excel</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download size={14} />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>

          {/* Paper Document Preview Container */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-[#0d1d36] border border-slate-200">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500">Menyiapkan pratinjau dokumen...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-white text-slate-900 rounded-xl shadow-md border border-slate-200 p-8 sm:p-12 overflow-x-auto print:p-0 print:border-none print:shadow-none">
              {/* Document Sub-Header info bar inside page */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 text-xs text-slate-500 mb-6 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">FR-010_Komunikasi_{headerInfo.periode}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Lanskap</span>
                  <span>100%</span>
                  <span>Halaman 1 / 1</span>
                </div>
              </div>

              {/* Official FR-010 Header Box (sama seperti template xlsx) */}
              <div className="border border-slate-900 grid grid-cols-12 mb-5">
                {/* Kotak logo Jabar (A1:B3 template) */}
                <div className="col-span-2 p-2 border-r border-slate-900 flex items-center justify-center">
                  <img
                    src="/logo-jabar.png"
                    alt="Logo Jawa Barat"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                {/* Judul (C1:E3 template) */}
                <div className="col-span-6 p-4 border-r border-slate-900 flex flex-col justify-center items-center text-center">
                  <h2 className="text-xl font-extrabold tracking-wide text-slate-900 uppercase">
                    KOMUNIKASI SMKI
                  </h2>
                </div>

                {/* Right metadata table */}
                <div className="col-span-4 p-3 flex flex-col justify-center text-[11px] leading-relaxed">
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">No. Dokumen</span>
                    <span className="col-span-7 font-bold text-slate-900">: {headerInfo.no_dokumen}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">No. Revisi</span>
                    <span className="col-span-7 font-bold text-slate-900">: {headerInfo.no_revisi}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-slate-700">Tanggal Berlaku</span>
                    <span className="col-span-7 font-bold text-slate-900">: {headerInfo.tanggal_berlaku}</span>
                  </div>
                </div>
              </div>

              {/* Periode row */}
              <div className="flex items-center justify-between mb-4 text-xs font-bold">
                <div>Periode : {headerInfo.periode}</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Sistem Manajemen Keamanan Informasi (SMKI)
                </div>
              </div>

              {/* Table 1: Komunikasi Internal */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-900 mb-2">Komunikasi Internal</h3>
                <table className="w-full text-left border-collapse border border-slate-900 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                      <th className="py-2 px-2.5 w-10 text-center border-r border-slate-900">No.</th>
                      <th className="py-2 px-3 border-r border-slate-900 min-w-[180px]">Judul Informasi</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-28">Klasifikasi</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-36">Pengirim</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-40">Penerima</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-32">Frekuensi</th>
                      <th className="py-2 px-3 w-40">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internalItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-900">
                        <td className="py-2 px-2.5 text-center font-medium border-r border-slate-900">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold border-r border-slate-900">{item.judul}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.klasifikasi}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.pengirim}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.penerima}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.frekuensi}</td>
                        <td className="py-2 px-3">{item.metode}</td>
                      </tr>
                    ))}
                    {/* Minimum empty rows for official look */}
                    {Array.from({ length: Math.max(0, 5 - internalItems.length) }).map((_, i) => (
                      <tr key={`empty-int-${i}`} className="border-b border-slate-900 h-7">
                        <td className="py-1 px-2.5 text-center font-medium border-r border-slate-900 text-slate-400">
                          {internalItems.length + i + 1}
                        </td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 2: Komunikasi Eksternal */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-900 mb-2">Komunikasi Eksternal</h3>
                <table className="w-full text-left border-collapse border border-slate-900 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                      <th className="py-2 px-2.5 w-10 text-center border-r border-slate-900">No.</th>
                      <th className="py-2 px-3 border-r border-slate-900 min-w-[180px]">Judul Informasi</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-28">Klasifikasi</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-36">Pengirim</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-40">Penerima</th>
                      <th className="py-2 px-3 border-r border-slate-900 w-32">Frekuensi</th>
                      <th className="py-2 px-3 w-40">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eksternalItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-900">
                        <td className="py-2 px-2.5 text-center font-medium border-r border-slate-900">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold border-r border-slate-900">{item.judul}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.klasifikasi}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.pengirim}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.penerima}</td>
                        <td className="py-2 px-3 border-r border-slate-900">{item.frekuensi}</td>
                        <td className="py-2 px-3">{item.metode}</td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - eksternalItems.length) }).map((_, i) => (
                      <tr key={`empty-eks-${i}`} className="border-b border-slate-900 h-7">
                        <td className="py-1 px-2.5 text-center font-medium border-r border-slate-900 text-slate-400">
                          {eksternalItems.length + i + 1}
                        </td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Block — sama dengan template FR-010 xlsx */}
              <div className="grid grid-cols-2 pt-2 text-xs">
                <div className="text-center">
                  <p className="text-[11px] text-slate-600 mb-1">Bandung, __________________</p>
                  <p className="font-semibold text-slate-800">Disusun,</p>
                  <div className="h-20"></div>
                  <p className="pt-1 font-bold text-slate-700">
                    (.......................................)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-slate-600 mb-1">&nbsp;</p>
                  <p className="font-semibold text-slate-800">Mengetahui,</p>
                  <div className="h-20"></div>
                  <p className="pt-1 font-bold text-slate-700">
                    (..................................)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="print:hidden flex items-center justify-between text-xs text-slate-400 pt-2">
            <button
              type="button"
              onClick={() => router.push("/smki/komunikasi")}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Kembali ke Daftar</span>
            </button>
            <span>PDF untuk cetak · Excel untuk lembar kerja</span>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
