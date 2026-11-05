"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  RotateCcw,
  Trash2,
  Eye,
  Layers,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getAsetInformasiList,
  deleteAsetInformasi,
  FormulirAsetInformasiItem,
} from "@/services/smki/asetInformasiService";

export default function AsetInformasiPage() {
  const router = useRouter();
  const { user, isAdminAptika } = useAuthStore();

  const [items, setItems] = useState<FormulirAsetInformasiItem[]>([]);
  const [stats, setStats] = useState({
    total_dokumen: 0,
    total_unit_kerja: 0,
    total_intangible: 0,
    total_rahasia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FormulirAsetInformasiItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch list data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAsetInformasiList({
        search,
        page,
        per_page: 10,
      });
      if (res.status === "success") {
        setItems(res.data);
        setMeta(res.meta);
        setStats(res.stats);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat data formulir aset");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleResetSearch = () => {
    setSearch("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteAsetInformasi(itemToDelete.id);
      toast.success("Dokumen aset informasi berhasil dihapus");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus dokumen");
    } finally {
      setDeleting(false);
    }
  };

  const [selectedBidang, setSelectedBidang] = useState("Semua Unit");
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Filtered items based on Unit Kerja
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchBidang =
        selectedBidang === "Semua Unit" ||
        item.bidang_nama?.toLowerCase().includes(selectedBidang.toLowerCase());
      return matchBidang;
    });
  }, [items, selectedBidang]);

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-12 max-w-7xl mx-auto p-4 sm:p-6">
        {/* 1. Header Hero Banner - Persis Desain Resmi SMKI Laporan Audit */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#065f46] via-[#047857] to-[#059669] text-white p-6 shadow-md border border-emerald-600/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Aset Informasi SMKI
                </h1>
              </div>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Modul pencatatan, inventarisasi dokumen data, dan penilaian risiko aset tak berwujud (intangible) Sistem Manajemen Keamanan Informasi (SMKI)
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200 hover:text-white transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Info/Bantuan</span>
                </button>
              </div>
            </div>

            {/* Right Banner Badges */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[200px]">
                <Layers className="w-5 h-5 text-emerald-200 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">
                    BIDANG
                  </div>
                  <div className="text-xs font-bold text-white">
                    Bidang Aplikasi Informatika
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[190px]">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">
                    STATUS LAYANAN
                  </div>
                  <div className="text-xs font-bold text-emerald-200">
                    Aktif & Beroperasi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 4 Stat Cards - Persis Sesuai Mockup SMKI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Formulir */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL FORMULIR
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_dokumen}
              </h3>
              <p className="text-xs text-slate-500 font-medium">+2 dari bulan lalu</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Aset Dokumen (Sheet 1) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ASET DOKUMEN
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_unit_kerja}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Sheet 1: Dokumen/Data unit</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Aset Intangible (Sheet 2) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ASET INTANGIBLE
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_intangible}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Sheet 2: Penilaian risiko CIA</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Aset Rahasia */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ASET RAHASIA
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_rahasia}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Klasifikasi rahasia/terbatas</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. Action Header Bar (+ Tambah Aset Informasi) */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/smki/aset-informasi/input")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset Informasi</span>
          </button>
        </div>

        {/* 4. Table Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-5 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Daftar Aset Informasi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan semua formulir rekaman aset informasi dan intangible periode berjalan
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Unit Kerja Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                    Unit Kerja:
                  </span>
                  <select
                    value={selectedBidang}
                    onChange={(e) => {
                      setSelectedBidang(e.target.value);
                      setPage(1);
                    }}
                    className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  >
                    <option value="Semua Unit">Semua Unit</option>
                    <option value="Bidang Aplikasi Informatika">Bidang Aplikasi Informatika</option>
                  </select>
                </div>

                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nomor formulir, nama aset, bidang..."
                    className="w-64 md:w-80 text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-3 text-emerald-600" size={32} />
              <p className="text-sm font-medium">Memuat data formulir aset informasi...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <FileText size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                Belum ada data formulir yang tersedia.
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan klik "+ Tambah Aset Informasi" untuk membuat formulir baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nomor Formulir</th>
                    <th className="py-3 px-4">Unit Kerja / Bidang</th>
                    <th className="py-3 px-4">Tanggal Dokumen</th>
                    <th className="py-3 px-4 text-center">Revisi</th>
                    <th className="py-3 px-4">Rincian Tab Data</th>
                    <th className="py-3 px-4 text-center">Klasifikasi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, idx) => {
                    const rowNumber = (meta.current_page - 1) * meta.per_page + idx + 1;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* No */}
                        <td className="py-4 px-4 text-center text-slate-500 font-medium">
                          {rowNumber}
                        </td>

                        {/* Nomor Formulir */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#065f46]">
                            {item.no_formulir}
                          </div>
                          <div className="text-[11px] text-slate-400">FR-028 &bull; SMKI</div>
                        </td>

                        {/* Unit Kerja / Bidang */}
                        <td className="py-4 px-4 font-medium text-slate-700">
                          {item.bidang_nama || "Bidang Aplikasi Informatika"}
                        </td>

                        {/* Tanggal */}
                        <td className="py-4 px-4 text-slate-600">
                          {item.tanggal}
                        </td>

                        {/* Revisi */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                            Rev {item.revisi}
                          </span>
                        </td>

                        {/* Rincian Tab Data */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {item.unit_kerja_details_count || 0} Dokumen
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              {item.intangible_details_count || 0} Intangible
                            </span>
                          </div>
                        </td>

                        {/* Klasifikasi */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                            {item.klasifikasi_dokumen || "Dokumen Terbatas"}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Tombol Lihat Dokumen (Menuju Halaman Detail Kertas Fisik A4 Landscape) */}
                            <button
                              onClick={() => router.push(`/smki/aset-informasi/${item.id}`)}
                              title="Buka Dokumen Resmi"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Lihat</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Hapus Formulir"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && meta.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Halaman {meta.current_page} dari {meta.last_page} ({meta.total} total data)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Info/Bantuan */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base">Panduan Modul FR-028</h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Formulir FR-028 (Form Aset Informasi)</strong> adalah rekaman resmi SMKI ISO 27001 khusus internal <strong>Bidang Aplikasi Informatika (APTIKA)</strong>.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Aset Dokumen (Sheet 1)</strong>: Inventarisasi SOP, Source Code, Database, dan berkas penting unit kerja.</li>
                  <li><strong>Aset Intangible (Sheet 2)</strong>: Penilaian reputasi & layanan dengan parameter Kerahasiaan (C), Integritas (I), dan Ketersediaan (A) skala 1 - 3.</li>
                </ul>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Hapus Dokumen Aset Informasi?"
          message={`Seluruh data aset dokumen dan aset intangible di dalam nomor formulir "${itemToDelete?.no_formulir}" akan terhapus secara permanen.`}
          loading={deleting}
        />
      </div>
    </ServiceRouteGuard>
  );
}
