"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Printer,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getAsetInformasiDetail,
  exportAsetInformasiExcel,
  FormulirAsetInformasiItem,
} from "@/services/smki/asetInformasiService";

export default function DetailAsetInformasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formulir, setFormulir] = useState<FormulirAsetInformasiItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getAsetInformasiDetail(id);
        if (res.status === "success" && res.data) {
          setFormulir(res.data);
        }
      } catch (err: any) {
        console.error("Gagal memuat detail aset informasi:", err);
        toast.error("Gagal memuat dokumen aset informasi.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    if (!formulir || !formulir.id) return;
    setIsExportingExcel(true);
    try {
      const blob = await exportAsetInformasiExcel(formulir.id);
      const cleanNomor = (formulir.no_formulir || "FR-028").replace(/[^a-zA-Z0-9_\-]/g, "_");
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-028_${cleanNomor}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File Excel berhasil diunduh!");
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      toast.error("Gagal mengunduh dokumen Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const formatTanggalIndo = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <span className="text-sm">Menyiapkan lembar dokumen fisik FR-028...</span>
        </div>
      </ServiceRouteGuard>
    );
  }

  if (!formulir) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="py-20 text-center text-slate-500">
          <AlertCircle size={36} className="mx-auto mb-2 text-rose-500" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            Dokumen Formulir Tidak Ditemukan
          </h3>
          <button
            onClick={() => router.push("/smki/aset-informasi")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Kembali ke Daftar
          </button>
        </div>
      </ServiceRouteGuard>
    );
  }

  const unitKerjaList = formulir.unit_kerja_details || [];
  const intangibleList = formulir.intangible_details || [];

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950/40 py-6 px-4 print:bg-white print:p-0 print:m-0">
        {/* CSS Khusus Print A4 Landscape */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 8mm 10mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print-page {
              page-break-after: always;
              break-after: page;
              min-height: 100%;
              box-sizing: border-box;
            }
            .print-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
          }
        `}</style>

        {/* 1. Floating Action Bar (Mirip FR-011, disesuaikan ke Excel & PDF Landscape) */}
        <div className="max-w-[297mm] mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => router.push("/smki/aset-informasi")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push(`/smki/aset-informasi/edit/${formulir.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <Pencil size={14} />
              <span>Edit Formulir</span>
            </button>

            {/* Ekspor Excel 2-Sheet (Perbedaan 2) */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {isExportingExcel ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={15} />
              )}
              <span>Unduh Excel (.xlsx)</span>
            </button>

            {/* Cetak Dokumen PDF Landscape (Perbedaan 2) */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak Dokumen (Print / PDF Landscape)</span>
            </button>
          </div>
        </div>

        {/* 2. Lembar Dokumen Fisik FR-028 Sesuai Template Asli Excel (A4 Landscape) */}
        <div className="max-w-[297mm] mx-auto bg-white p-8 sm:p-10 print:p-0 print:m-0 print:w-full print:max-w-none text-slate-900 font-sans text-[9pt] leading-normal shadow-lg print:shadow-none space-y-12 print:space-y-0">
          
          {/* ========================================================= */}
          {/* BAGIAN 1: SHEET 1 - ASET INFORMASI UNIT KERJA            */}
          {/* Sesuai Template Excel FR-028 Sheet 1: Tanpa Logo/Header   */}
          {/* Row 1: DAFTAR ASET INFORMASI, Row 2: BIDANG: APTIKA       */}
          {/* ========================================================= */}
          <div className="print-page">
            <div className="mb-6 text-center">
              <h1 className="text-base font-bold uppercase tracking-wider text-black">
                DAFTAR ASET INFORMASI
              </h1>
              <p className="text-sm font-bold uppercase text-black mt-1">
                BIDANG: {formulir.bidang_nama || "APTIKA"}
              </p>
            </div>

            {/* Tabel 12 Kolom Aset Informasi Unit Kerja */}
            <table className="w-full border-collapse border border-black text-[8pt] text-left">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-1.5 w-7">No</th>
                  <th className="border border-black p-1.5 w-20">Kode</th>
                  <th className="border border-black p-1.5">Nama Aset Informasi</th>
                  <th className="border border-black p-1.5 w-16">Klasifikasi</th>
                  <th className="border border-black p-1.5 w-16">Tahun Pembuatan</th>
                  <th className="border border-black p-1.5 w-16">Tahun Update Terakhir</th>
                  <th className="border border-black p-1.5">Deskripsi</th>
                  <th className="border border-black p-1.5 w-16">Format Penyimpanan</th>
                  <th className="border border-black p-1.5 w-16">Masa Simpan</th>
                  <th className="border border-black p-1.5">Lokasi Penyimpanan</th>
                  <th className="border border-black p-1.5">Pemilik Asset Informasi</th>
                  <th className="border border-black p-1.5 w-16">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {unitKerjaList.length === 0 ? (
                  <tr>
                    <td className="border border-black p-2 text-center">1</td>
                    <td className="border border-black p-2 text-center">-</td>
                    <td colSpan={10} className="border border-black p-2 text-center font-semibold italic text-slate-500">
                      NIHIL (Belum ada data aset informasi dokumen terdaftar)
                    </td>
                  </tr>
                ) : (
                  unitKerjaList.map((item, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-mono text-center">{item.kode_aset || "-"}</td>
                      <td className="border border-black p-1.5 font-semibold">{item.nama_aset}</td>
                      <td className="border border-black p-1.5 text-center">{item.klasifikasi}</td>
                      <td className="border border-black p-1.5 text-center">{item.tahun_pembuatan || "-"}</td>
                      <td className="border border-black p-1.5 text-center">{item.tahun_update || "-"}</td>
                      <td className="border border-black p-1.5">{item.deskripsi || "-"}</td>
                      <td className="border border-black p-1.5 text-center">{item.format_penyimpanan}</td>
                      <td className="border border-black p-1.5 text-center">{item.masa_simpan || "-"}</td>
                      <td className="border border-black p-1.5">{item.lokasi_penyimpanan || "-"}</td>
                      <td className="border border-black p-1.5">{item.pemilik_aset || "-"}</td>
                      <td className="border border-black p-1.5 text-center">{item.keterangan || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ========================================================= */}
          {/* BAGIAN 2: SHEET 2 - ASET INTANGIBLE & CIA RISK MATRIX     */}
          {/* Sesuai Template Excel FR-028 Sheet 2: Header Metadata     */}
          {/* No Formulir, Rev, Tanggal, Klasifikasi: Intangible, dll   */}
          {/* ========================================================= */}
          <div className="print-page pt-4 print:pt-0">
            {/* Header Metadata Kiri & Judul DAFTAR ASET Sejajar di Tengah */}
            <div className="mb-4 relative flex items-center justify-between">
              {/* Metadata Kiri (Teks Bersih Sesuai Format Sebelumnya) */}
              <div className="text-[9pt] leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">No Formulir</span>
                  <span>: {formulir.no_formulir || "FR-028"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Rev</span>
                  <span>: {formulir.revisi || "0"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Tanggal</span>
                  <span>: {formatTanggalIndo(formulir.tanggal) || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Klasifikasi</span>
                  <span>: Intangible</span>
                </div>
                <div className="mt-1 font-bold text-black">
                  Dokumen Terbatas
                </div>
              </div>

              {/* Judul DAFTAR ASET di Tengah Sejajar dengan Bagian Kiri */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className="text-base font-bold uppercase tracking-wider text-black">
                  DAFTAR ASET
                </h1>
              </div>
            </div>

            {/* Tabel 10 Kolom Aset Intangible & Matriks CIA */}
            <table className="w-full border-collapse border border-black text-[8pt] text-left">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-1.5 w-10">No</th>
                  <th className="border border-black p-1.5">Layanan</th>
                  <th className="border border-black p-1.5">Nama Aset</th>
                  <th className="border border-black p-1.5">Sub Klasifikasi</th>
                  <th className="border border-black p-1.5">Pemilik Aset</th>
                  <th className="border border-black p-1.5 w-24">Kerahasiaan</th>
                  <th className="border border-black p-1.5 w-24">Integritas</th>
                  <th className="border border-black p-1.5 w-24">Ketersediaan</th>
                  <th className="border border-black p-1.5 w-16">Nilai</th>
                  <th className="border border-black p-1.5 w-28">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {intangibleList.length === 0 ? (
                  <tr>
                    <td className="border border-black p-2 text-center">1</td>
                    <td colSpan={9} className="border border-black p-2 text-center font-semibold italic text-slate-500">
                      NIHIL (Belum ada data aset intangible terdaftar)
                    </td>
                  </tr>
                ) : (
                  intangibleList.map((item, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5">{item.layanan || "-"}</td>
                      <td className="border border-black p-1.5 font-semibold">{item.nama_aset}</td>
                      <td className="border border-black p-1.5">{item.sub_klasifikasi || "-"}</td>
                      <td className="border border-black p-1.5">{item.pemilik_aset || "-"}</td>
                      <td className="border border-black p-1.5 text-center font-bold">{item.kerahasiaan}</td>
                      <td className="border border-black p-1.5 text-center font-bold">{item.integritas}</td>
                      <td className="border border-black p-1.5 text-center font-bold">{item.ketersediaan}</td>
                      <td className="border border-black p-1.5 text-center font-bold">{item.nilai}</td>
                      <td className="border border-black p-1.5 text-center font-semibold">{item.keterangan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
