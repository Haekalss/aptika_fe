"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getHakAksesFisikList,
  getHakAksesFisikLookup,
  deleteHakAksesFisik,
  exportHakAksesFisikDocx,
  HakAksesFisikItem,
  HakAksesFisikLookupData,
} from "@/services/api";
import HakAksesFisikFormModal from "@/components/smki/hak-akses-fisik/HakAksesFisikFormModal";
import HakAksesFisikExportModal from "@/components/smki/hak-akses-fisik/HakAksesFisikExportModal";
import HakAksesFisikPreviewModal from "@/components/smki/hak-akses-fisik/HakAksesFisikPreviewModal";

export default function HakAksesFisikPage() {
  const [items, setItems] = useState<HakAksesFisikItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    hari_ini: 0,
    dihapus: 0,
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState<HakAksesFisikLookupData | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HakAksesFisikItem | null>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSingleId, setExportSingleId] = useState<number | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<HakAksesFisikItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<HakAksesFisikItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLookups = async () => {
    try {
      const res = await getHakAksesFisikLookup();
      if (res?.success) {
        setLookups(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat lookup hak akses fisik:", err);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getHakAksesFisikList({
        search: search || undefined,
        page,
        per_page: 10,
      });
      if (res?.success) {
        setItems(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat daftar pengajuan hak akses fisik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchList();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: HakAksesFisikItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenPreview = (item: HakAksesFisikItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleDirectDownload = async (item: HakAksesFisikItem) => {
    try {
      const blob = await exportHakAksesFisikDocx({ id: item.id });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-019_${(item.nama_pemohon || "Dokumen").replace(/\s+/g, "_")}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Dokumen Word (.docx) berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh dokumen Word.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setDeleting(true);
    try {
      await deleteHakAksesFisik(deleteTarget.id);
      toast.success("Data pengajuan berhasil dihapus.");
      setDeleteTarget(null);
      fetchList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus data pengajuan.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner Emerald Card (Sesuai Mockup Image 9) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Formulir Hak Akses Fisik (FR-019)
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Kelola data pengajuan dan izin hak akses fisik ruangan terbatas sesuai formulir FR-019 SMKI dengan mudah dan terstruktur.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-md border border-white/20">
              Unit Kerja: Bidang Aplikasi Informatika
            </span>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-md border border-white/20">
              Format Export: Microsoft Word (.docx) / PDF
            </span>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Three Metric Cards (Sesuai Mockup Image 9) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Data */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            TOTAL DATA
          </span>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Pengajuan tersimpan
            </div>
          </div>
        </div>

        {/* Data Hari Ini */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            DATA HARI INI
          </span>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.hari_ini}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Status Pending
            </div>
          </div>
        </div>

        {/* Data Dihapus */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            DATA DIHAPUS
          </span>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.dihapus}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Dalam periode ini
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table Section Card (Sesuai Mockup Image 9) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Daftar Pengajuan Hak Akses Fisik
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Riwayat dokumen formulir hak akses fisik standar FR019–SMKI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama pemohon, area, no dokum..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Button Ekspor (DOCX/PDF) */}
            <button
              onClick={() => {
                setExportSingleId(null);
                setIsExportOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs transition-all"
            >
              <Download size={14} />
              Ekspor (DOCX/PDF)
            </button>

            {/* Button + Tambah Data */}
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={15} />
              Tambah Data
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">NO</th>
                <th className="py-3.5 px-4">NO. DOKUMEN</th>
                <th className="py-3.5 px-4">NAMA PEMOHON</th>
                <th className="py-3.5 px-4">UNIT KERJA / JABATAN</th>
                <th className="py-3.5 px-4">JENIS & SIFAT AKSES</th>
                <th className="py-3.5 px-4">AREA / RUANGAN</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    Memuat data formulir hak akses fisik...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    Belum ada pengajuan hak akses fisik yang tercatat.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const ruanganArr = Array.isArray(item.ruangan_akses) ? item.ruangan_akses : [];
                  const ruanganText = ruanganArr.length > 0 ? ruanganArr.join(", ") : "-";

                  const jenis = item.jenis_permintaan || "Pendaftaran";
                  const sifat = item.sifat_akses || "Permanen";

                  const isApproved = item.status_pengajuan === "Approved";
                  const isRejected = item.status_pengajuan === "Rejected";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* NO */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                        {(meta.current_page - 1) * meta.per_page + index + 1}
                      </td>

                      {/* NO DOKUMEN */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.nomor_dokumen}
                      </td>

                      {/* NAMA PEMOHON */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {item.nama_pemohon}
                        {item.nip && (
                          <div className="text-[10px] font-normal text-slate-400">
                            NIP. {item.nip}
                          </div>
                        )}
                      </td>

                      {/* UNIT KERJA / JABATAN */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.unit_kerja || "Bidang Aplikasi Informatika"}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.jabatan || "Pegawai"}
                        </span>
                      </td>

                      {/* JENIS & SIFAT AKSES */}
                      <td className="py-3.5 px-4 font-medium">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          {sifat}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {jenis === "Pendaftaran" ? "Baru" : "Tutup"}
                        </span>
                      </td>

                      {/* AREA / RUANGAN */}
                      <td className="py-3.5 px-4 max-w-xs truncate" title={ruanganText}>
                        {ruanganText}
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isRejected
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {item.status_pengajuan || "Approved"}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 text-slate-400">
                          {/* Direct Download Word */}
                          <button
                            type="button"
                            onClick={() => handleDirectDownload(item)}
                            title="Unduh Microsoft Word (.docx)"
                            className="p-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <Download size={14} />
                          </button>

                          {/* Preview Dokumen Resmi */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(item)}
                            title="Preview Dokumen Resmi FR-019"
                            className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Data */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Pengajuan"
                            className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Hapus Data */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus Data Pengajuan"
                            className="p-1.5 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
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

        {/* Table Footer Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan halaman <strong>{meta.current_page}</strong> dari <strong>{meta.last_page}</strong> ({meta.total} data)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Modals */}
      {/* Modal Form Tambah / Edit */}
      <HakAksesFisikFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchList}
        item={editingItem}
        lookups={lookups}
      />

      {/* Modal Konfigurasi Header Ekspor Word */}
      <HakAksesFisikExportModal
        open={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        singleId={exportSingleId}
        defaultHeader={lookups?.default_header}
      />

      {/* Modal Preview Dokumen Resmi (Format Kertas A4 + 4 TTE Spesimen) */}
      <HakAksesFisikPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewItem}
      />

      {/* Modal Konfirmasi Hapus (Sesuai Mockup Image 1) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Konfirmasi Hapus
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pengajuan milik <strong>{deleteTarget.nama_pemohon}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
