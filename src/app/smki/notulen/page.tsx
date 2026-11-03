"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSmkiNotulenList, deleteSmkiNotulen, SmkiNotulenData } from "@/services/api";

export default function DaftarNotulenPage() {
  const router = useRouter();

  // Data states
  const [notulens, setNotulens] = useState<SmkiNotulenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const perPage = 10;

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingItem, setDeletingItem] = useState<SmkiNotulenData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch list
  const fetchNotulens = async () => {
    try {
      setLoading(true);
      const res = await getSmkiNotulenList({
        search: search.trim() || undefined,
        tahun: selectedYear !== "ALL" ? selectedYear : undefined,
        page: currentPage,
        per_page: perPage,
      });

      if (res.success && res.data) {
        setNotulens(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data notulen:", err);
      toast.error(err.response?.data?.message || "Gagal memuat daftar notulen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotulens();
  }, [currentPage, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotulens();
  };

  const handleOpenDelete = (item: SmkiNotulenData) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      setIsDeleting(true);
      const res = await deleteSmkiNotulen(deletingItem.id);
      if (res.success) {
        toast.success(res.message || "Notulen berhasil dihapus.");
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchNotulens();
      }
    } catch (err: any) {
      console.error("Gagal menghapus notulen:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus notulen.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Header Hero Banner - Sesuai Persis Tampilan Screenshot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#065f46] via-[#047857] to-[#059669] text-white p-6 shadow-md border border-emerald-600/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Notulen Management Review SMKI
              </h1>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Modul pencatatan, ringkasan pembahasan, dan tindak lanjut rapat tinjauan manajemen Sistem Manajemen Keamanan Informasi (SMKI)
            </p>
            <div className="pt-1">
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
                  Aktif &amp; Beroperasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Header Bar (+ Tambah Notulen) - Posisi Sesuai Gambar */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/smki/notulen/tambah")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Notulen</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Notulen Management Review</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Catatan rapat terdokumentasi berdasarkan ISO 27001:2013 Clause 9.3.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul rapat atau nomor notulen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="ALL">Semua tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Terapkan
            </button>
          </form>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4">JUDUL RAPAT</th>
                <th className="py-3 px-4">TANGGAL PELAKSANAAN</th>
                <th className="py-3 px-4">NOTULIS</th>
                <th className="py-3 px-4 text-center">PESERTA</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Memuat data notulen...</span>
                  </td>
                </tr>
              ) : notulens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <span>Belum ada data notulen rapat.</span>
                  </td>
                </tr>
              ) : (
                notulens.map((item, index) => {
                  const rowNumber = (currentPage - 1) * perPage + index + 1;
                  const totalPeserta = item.pesertas ? item.pesertas.length : 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{rowNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-white">
                          {item.judul_rapat}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{item.nomor_notulen}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-slate-500">{item.tempat}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.notulis}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {totalPeserta} orang
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/smki/notulen/${item.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors"
                          >
                            <Eye size={13} />
                            <span>Lihat Detail</span>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan {notulens.length > 0 ? (currentPage - 1) * perPage + 1 : 0} -{" "}
            {Math.min(currentPage * perPage, totalItems)} dari {totalItems} notulen
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || loading}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-left">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">
              Hapus Notulen Rapat?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus notulen dengan nomor{" "}
              <strong className="text-slate-800 dark:text-white font-mono">{deletingItem.nomor_notulen}</strong> (
              {deletingItem.judul_rapat})? Data yang dihapus tidak dapat dipulihkan kembali.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingItem(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Notulen"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
