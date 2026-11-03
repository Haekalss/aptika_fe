"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  Building2,
  FileText,
  Loader2,
  X,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  KomunikasiItem,
  HeaderInfoFR010,
  fetchKomunikasiList,
  createKomunikasi,
  updateKomunikasi,
  deleteKomunikasi,
  updateKomunikasiHeader,
} from "@/services/smki/komunikasiService";
import { exportKomunikasiToPdf, exportKomunikasiToExcel } from "@/utils/smkiKomunikasiExport";
import KomunikasiFormModal from "@/components/smki/KomunikasiFormModal";
import KomunikasiDetailModal from "@/components/smki/KomunikasiDetailModal";
import KomunikasiDeleteModal from "@/components/smki/KomunikasiDeleteModal";
import HeaderFormModal from "@/components/smki/HeaderFormModal";

const PERIODS = ["2022", "2023", "2024", "2025", "2026"];
const KLASIFIKASI_FILTER = ["Semua klasifikasi", "Internal", "Terbatas", "Publik", "Rahasia"];

export default function KomunikasiFR010Page() {
  const router = useRouter();

  // State Data Utama
  const [internalItems, setInternalItems] = useState<KomunikasiItem[]>([]);
  const [eksternalItems, setEksternalItems] = useState<KomunikasiItem[]>([]);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfoFR010>({
    no_dokumen: "FR-010/KOM.03.05/SANDIKAMI",
    no_revisi: "1.1",
    tanggal_berlaku: "07 Juli 2022",
    periode: "2026",
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // State Filters UI
  const [search, setSearch] = useState("");
  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState("Semua klasifikasi");
  const [selectedPeriode, setSelectedPeriode] = useState("2026");

  // State Modals CRUD
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<KomunikasiItem | null>(null);

  // State Modal Export
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);
  const [exportData, setExportData] = useState<HeaderInfoFR010>(headerInfo);
  const [isExporting, setIsExporting] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchKomunikasiList({
        search,
        klasifikasi: selectedKlasifikasi,
        periode: selectedPeriode,
      });
      if (res.success) {
        setInternalItems(res.internal);
        setEksternalItems(res.eksternal);
        setHeaderInfo(res.header);
        setTotalCount(res.stats.total);
      }
    } catch {
      toast.error("Gagal memuat data komunikasi SMKI.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedKlasifikasi, selectedPeriode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions CRUD
  const handleCreate = async (data: Omit<KomunikasiItem, "id" | "created_at" | "updated_at">) => {
    try {
      await createKomunikasi(data);
      toast.success("Data komunikasi berhasil ditambahkan!");
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menambahkan data");
      throw e;
    }
  };

  const handleUpdate = async (data: Omit<KomunikasiItem, "id" | "created_at" | "updated_at">) => {
    if (!activeItem) return;
    try {
      await updateKomunikasi(activeItem.id, data);
      toast.success("Perubahan data komunikasi berhasil disimpan!");
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan perubahan");
      throw e;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteKomunikasi(id);
      toast.success("Data komunikasi berhasil dihapus.");
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menghapus data");
      throw e;
    }
  };



  // Actions EXPORT
  const openExportModal = (type: 'pdf' | 'excel') => {
    setExportType(type);
    setExportData({ ...headerInfo, periode: selectedPeriode });
    setIsExportModalOpen(true);
  };

  const processExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const res = await fetchKomunikasiList({
        search: "",
        klasifikasi: "Semua klasifikasi",
        periode: exportData.periode,
      });

      if (res.success) {
        if (exportType === 'pdf') {
          await exportKomunikasiToPdf({
            header: exportData,
            internalItems: res.internal,
            eksternalItems: res.eksternal,
          });
          toast.success(`Dokumen PDF Periode ${exportData.periode} berhasil diunduh.`);
        } else {
          await exportKomunikasiToExcel({
            header: exportData,
            internalItems: res.internal,
            eksternalItems: res.eksternal,
          });
          toast.success(`Dokumen Excel Periode ${exportData.periode} berhasil diunduh.`);
        }

        setHeaderInfo(exportData);
        if (selectedPeriode !== exportData.periode) {
          setSelectedPeriode(exportData.periode);
        }
        setIsExportModalOpen(false);
      }
    } catch (error) {
      toast.error("Gagal melakukan proses ekspor.");
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedKlasifikasi("Semua klasifikasi");
    setSelectedPeriode("2026");
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-5 md:gap-6 w-full text-slate-800 dark:text-slate-100">

        {/* 1. Hero Banner */}
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-8 text-white shadow-sm">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 backdrop-blur-sm shadow-inner">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white mb-2">
                  Komunikasi Internal & Eksternal
                </h1>
                <p className="text-[13px] sm:text-[14px] text-emerald-50/90 leading-relaxed">
                  Kelola pencatatan komunikasi Sistem Manajemen Keamanan Informasi (FR-010/KOM.03.05/SANDIKAMI) sesuai standar SMKI Diskominfo Jawa Barat.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-[13px] font-medium transition-colors hover:bg-white/20">
                <Building2 size={16} className="text-emerald-200" />
                <span>Unit Kerja: <strong className="text-white font-semibold">Bidang Aplikasi Informatika</strong></span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-[13px] font-medium transition-colors hover:bg-white/20">
                <FileText size={16} className="text-emerald-200" />
                <span>Format Standar: <strong className="text-white font-semibold">FR-010 (PDF & Excel)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Toolbar Pencarian & Filter */}
        <div className="bg-white dark:bg-[#0d1d36] rounded-[20px] p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, pengirim, atau penerima..."
                className="w-full pl-11 pr-4 py-2.5 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0f8b58] focus:border-[#0f8b58] placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <div className="flex items-center bg-white border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => openExportModal('pdf')}
                  title="Ekspor PDF"
                  className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700"
                >
                  <FileText size={16} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => openExportModal('excel')}
                  title="Ekspor Excel"
                  className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-[#0f8b58] hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-950/30 transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={16} />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveItem(null);
                  setIsAddModalOpen(true);
                }}
                className="px-5 py-2.5 text-[14px] font-semibold text-white bg-[#0f8b58] hover:bg-[#0c7449] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Tambah Komunikasi</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-[220px]">
              <select
                value={selectedKlasifikasi}
                onChange={(e) => setSelectedKlasifikasi(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-2 text-[13px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0f8b58] focus:border-[#0f8b58] cursor-pointer transition-all"
              >
                {KLASIFIKASI_FILTER.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Filter Periode Aktif di Toolbar */}
            <div className="relative w-full sm:w-[180px]">
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-2 text-[13px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0f8b58] focus:border-[#0f8b58] cursor-pointer transition-all"
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    Periode {p}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {(search || selectedKlasifikasi !== "Semua klasifikasi" || selectedPeriode !== "2026") && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 bg-white flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Area Tabel Konten */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 rounded-[20px] bg-white dark:bg-[#0d1d36] border border-slate-200/60 dark:border-slate-800">
            <Loader2 size={32} className="animate-spin text-[#0f8b58]" />
            <p className="text-[14px] font-semibold text-slate-500">Memuat data komunikasi SMKI...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* TABLE 1: KOMUNIKASI INTERNAL */}
            <div className="bg-white dark:bg-[#0d1d36] rounded-[20px] p-5 md:p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[15px] font-bold text-[#0f2540] dark:text-white">
                    Daftar Komunikasi Internal SMKI
                  </h2>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-[#0f8b58] border border-emerald-100/60 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 rounded-lg">
                    {internalItems.length} Data
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                  <span>Menampilkan {internalItems.length} dari {internalItems.length} data</span>
                  <button onClick={loadData} title="Muat Ulang" className="p-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-[#071733]/50 text-slate-500 dark:text-slate-400 border-y border-slate-200/80 dark:border-slate-800">
                      <th className="py-3.5 px-4 w-12 text-center text-[11px] font-bold uppercase tracking-wider">No.</th>
                      <th className="py-3.5 px-4 min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Judul Informasi</th>
                      <th className="py-3.5 px-4 min-w-[110px] text-[11px] font-bold uppercase tracking-wider">Klasifikasi</th>
                      <th className="py-3.5 px-4 min-w-[120px] text-[11px] font-bold uppercase tracking-wider">Pengirim</th>
                      <th className="py-3.5 px-4 min-w-[130px] text-[11px] font-bold uppercase tracking-wider">Penerima</th>
                      <th className="py-3.5 px-4 min-w-[110px] text-[11px] font-bold uppercase tracking-wider">Frekuensi</th>
                      <th className="py-3.5 px-4 min-w-[140px] text-[11px] font-bold uppercase tracking-wider">Metode</th>
                      <th className="py-3.5 px-4 w-28 text-center text-[11px] font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {internalItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-[13px] text-slate-400 italic">
                          Belum ada data komunikasi internal untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      internalItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {item.judul}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              {item.klasifikasi}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                            {item.pengirim}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.penerima}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.frekuensi}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.metode}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                title="Lihat Detail"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                title="Edit Komunikasi"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                title="Hapus Komunikasi"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: KOMUNIKASI EKSTERNAL */}
            <div className="bg-white dark:bg-[#0d1d36] rounded-[20px] p-5 md:p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[15px] font-bold text-[#0f2540] dark:text-white">
                    Daftar Komunikasi Eksternal SMKI
                  </h2>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100/60 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 rounded-lg">
                    {eksternalItems.length} Data
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                  <span>Menampilkan {eksternalItems.length} dari {eksternalItems.length} data</span>
                  <button onClick={loadData} title="Muat Ulang" className="p-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-[#071733]/50 text-slate-500 dark:text-slate-400 border-y border-slate-200/80 dark:border-slate-800">
                      <th className="py-3.5 px-4 w-12 text-center text-[11px] font-bold uppercase tracking-wider">No.</th>
                      <th className="py-3.5 px-4 min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Judul Informasi</th>
                      <th className="py-3.5 px-4 min-w-[110px] text-[11px] font-bold uppercase tracking-wider">Klasifikasi</th>
                      <th className="py-3.5 px-4 min-w-[120px] text-[11px] font-bold uppercase tracking-wider">Pengirim</th>
                      <th className="py-3.5 px-4 min-w-[130px] text-[11px] font-bold uppercase tracking-wider">Penerima</th>
                      <th className="py-3.5 px-4 min-w-[110px] text-[11px] font-bold uppercase tracking-wider">Frekuensi</th>
                      <th className="py-3.5 px-4 min-w-[140px] text-[11px] font-bold uppercase tracking-wider">Metode</th>
                      <th className="py-3.5 px-4 w-28 text-center text-[11px] font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {eksternalItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-[13px] text-slate-400 italic">
                          Belum ada data komunikasi eksternal untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      eksternalItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {item.judul}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              {item.klasifikasi}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                            {item.pengirim}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.penerima}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.frekuensi}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {item.metode}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                title="Lihat Detail"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                title="Edit Komunikasi"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                title="Hapus Komunikasi"
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL EXPORT FORM */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1d36] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {exportType === 'pdf' ? <FileText size={20} className="text-rose-500" /> : <FileSpreadsheet size={20} className="text-emerald-600" />}
                Pengaturan Ekspor {exportType === 'pdf' ? 'PDF' : 'Excel'}
              </h2>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={processExport} className="p-6 flex flex-col gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl text-[13px] font-medium mb-2 border border-blue-100 dark:border-blue-800">
                Silakan sesuaikan identitas formulir dan pilih <strong>periode data</strong> yang ingin diekspor.
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nomor Dokumen</label>
                <input
                  type="text"
                  required
                  value={exportData.no_dokumen}
                  onChange={(e) => setExportData({ ...exportData, no_dokumen: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. Revisi</label>
                  <input
                    type="text"
                    required
                    value={exportData.no_revisi}
                    onChange={(e) => setExportData({ ...exportData, no_revisi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Periode Data</label>
                  <div className="relative">
                    <select
                      value={exportData.periode}
                      onChange={(e) => setExportData({ ...exportData, periode: e.target.value })}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none cursor-pointer"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Berlaku</label>
                <input
                  type="text"
                  required
                  value={exportData.tanggal_berlaku}
                  onChange={(e) => setExportData({ ...exportData, tanggal_berlaku: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#0f8b58] hover:bg-[#0c7449] active:scale-[0.98] rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isExporting ? "Memproses Ekspor..." : (
                    <>
                      <Download size={16} />
                      Ekspor Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTHER MODALS */}
      <KomunikasiFormModal
        isOpen={isAddModalOpen}
        mode="add"
        currentPeriode={selectedPeriode}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreate}
      />

      <KomunikasiFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        initialData={activeItem}
        currentPeriode={selectedPeriode}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
      />

      <KomunikasiDetailModal
        isOpen={isDetailModalOpen}
        item={activeItem}
        header={headerInfo}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(it) => {
          setActiveItem(it);
          setIsEditModalOpen(true);
        }}
      />

      <KomunikasiDeleteModal
        isOpen={isDeleteModalOpen}
        item={activeItem}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </ServiceRouteGuard>
  );
}