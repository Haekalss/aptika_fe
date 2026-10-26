"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardCheck, Plus, Search, RotateCcw, Eye, Pencil, Trash2, FileDown, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Hourglass, Building2, ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EvaluasiKepatuhanFormModal from "@/components/smki/EvaluasiKepatuhanFormModal";
import EvaluasiKepatuhanDetailModal from "@/components/smki/EvaluasiKepatuhanDetailModal";
import EvaluasiKepatuhanExportModal from "@/components/smki/EvaluasiKepatuhanExportModal";
import {
  fetchEvaluasiList, fetchEvaluasiDetail, createEvaluasi, updateEvaluasi, deleteEvaluasi, downloadEvaluasiDocx,
  formatTanggalIndo, EVALUASI_STATUS_OPTIONS, EvaluasiKepatuhan, EvaluasiFormPayload,
} from "@/services/smki/evaluasiKepatuhanService";

const kode = (id: number) => `EVK-${String(id).padStart(3, "0")}`;

const errMsg = (err: any, fallback: string) => {
  const data = err?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0] as string;
  return data?.message || fallback;
};

export default function EvaluasiKepatuhanPage() {
  const { bidang } = useAuthStore();

  const [items, setItems] = useState<EvaluasiKepatuhan[]>([]);
  const [stats, setStats] = useState({ total_evaluasi: 0, patuh: 0, tidak_patuh: 0, dalam_proses: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EvaluasiKepatuhan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<EvaluasiKepatuhan | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EvaluasiKepatuhan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [exportTarget, setExportTarget] = useState<EvaluasiKepatuhan | null>(null);
  const [exporting, setExporting] = useState(false);
  const [noDokumen, setNoDokumen] = useState("");
  const [noRevisi, setNoRevisi] = useState("");
  const [tanggalBerlaku, setTanggalBerlaku] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEvaluasiList({ search: search || undefined, status: status || undefined, page, per_page: 10 });
      if (res.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta(res.meta);
      }
    } catch {
      toast.error("Gagal memuat data evaluasi kepatuhan");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleReset = () => { setSearch(""); setStatus(""); setPage(1); };

  // Detail & edit memuat ulang dari server karena daftar tidak membawa rincian dokumen.
  const openDetail = async (item: EvaluasiKepatuhan) => {
    try {
      const res = await fetchEvaluasiDetail(item.id);
      setDetailItem(res.data);
      setIsDetailOpen(true);
    } catch {
      toast.error("Data evaluasi tidak ditemukan");
    }
  };

  const openEdit = async (item: EvaluasiKepatuhan) => {
    try {
      const res = await fetchEvaluasiDetail(item.id);
      setSelectedItem(res.data);
      setIsFormOpen(true);
    } catch {
      toast.error("Data evaluasi tidak ditemukan");
    }
  };

  const handleSave = async (data: EvaluasiFormPayload) => {
    try {
      if (selectedItem) {
        await updateEvaluasi(selectedItem.id, data);
        toast.success("Data evaluasi kepatuhan berhasil diperbarui!");
      } else {
        await createEvaluasi(data);
        toast.success("Data evaluasi kepatuhan berhasil disimpan!");
      }
      loadData();
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan data evaluasi"));
      throw err; // modal tetap terbuka
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteEvaluasi(itemToDelete.id);
      toast.success("Data evaluasi kepatuhan berhasil dihapus!");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus data evaluasi"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    if (!exportTarget) return;
    setExporting(true);
    try {
      const blob = await downloadEvaluasiDocx(exportTarget.id, {
        no_dokumen: noDokumen.trim() || undefined,
        no_revisi: noRevisi.trim() || undefined,
        tanggal_berlaku: tanggalBerlaku.trim() || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-044_Evaluasi_Kepatuhan_${exportTarget.tanggal_evaluasi}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Dokumen FR-044 (.docx) berhasil diunduh!");
      setExportTarget(null);
    } catch {
      toast.error("Gagal mencetak dokumen. Silakan coba beberapa saat lagi.");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    { label: "Total Evaluasi", value: stats.total_evaluasi, sub: "Sesi evaluasi", icon: <ListChecks size={22} />, wrap: "bg-slate-50 border-slate-200/70 text-slate-600 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300", num: "text-slate-700 dark:text-slate-200" },
    { label: "Patuh", value: stats.patuh, sub: "Dokumen", icon: <CheckCircle2 size={22} />, wrap: "bg-emerald-50 border-emerald-200/70 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800/50 dark:text-emerald-400", num: "text-emerald-600 dark:text-emerald-400" },
    { label: "Tidak Patuh", value: stats.tidak_patuh, sub: "Dokumen", icon: <XCircle size={22} />, wrap: "bg-red-50 border-red-200/70 text-red-600 dark:bg-red-950/50 dark:border-red-800/50 dark:text-red-400", num: "text-red-600 dark:text-red-400" },
    { label: "Dalam Proses", value: stats.dalam_proses, sub: "Dokumen", icon: <Hourglass size={22} />, wrap: "bg-amber-50 border-amber-200/70 text-amber-600 dark:bg-amber-950/50 dark:border-amber-800/50 dark:text-amber-400", num: "text-amber-600 dark:text-amber-400" },
  ];

  const th = "text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Evaluasi Kepatuhan</h1>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Pencatatan evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama, sesuai standar formulir SMKI FR-044.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-200" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileDown size={16} className="text-emerald-200" />
                <span>Format Ekspor: <strong className="text-white">Microsoft Word (.docx)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.label}</p>
                <h3 className={`text-2xl font-black ${c.num}`}>{c.value}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${c.wrap}`}>{c.icon}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari dokumen kepatuhan, deskripsi, atau tempat tanda tangan..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">Semua Status</option>
              {EVALUASI_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleReset} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
              <RotateCcw size={14} /> Reset Filter
            </button>
            <button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm">
              <Plus size={16} /> Tambah Evaluasi
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Evaluasi Kepatuhan SMKI</h2>
            <span className="text-xs text-slate-400">Menampilkan {items.length} dari {meta.total} data</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[1040px]">
              <colgroup>
                <col className="w-[5%]" /><col className="w-[10%]" /><col className="w-[16%]" /><col className="w-[14%]" />
                <col className="w-[11%]" /><col className="w-[27%]" /><col className="w-[17%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className={th}>No</th><th className={th}>Kode</th><th className={th}>Tanggal Evaluasi</th>
                  <th className={th}>Ditandatangani di</th><th className={th}>Dokumen</th><th className={th}>Ringkasan Status</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400"><Loader2 size={22} className="animate-spin mx-auto mb-2" />Memuat data evaluasi...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400"><AlertCircle size={22} className="mx-auto mb-2" />{search || status ? "Data tidak ditemukan." : "Belum ada data evaluasi kepatuhan yang tersedia."}</td></tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/70 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 align-middle text-slate-500">{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
                      <td className="px-4 py-3 align-middle">
                        <button onClick={() => openDetail(item)} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap">{kode(item.id)}</button>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">{formatTanggalIndo(item.tanggal_evaluasi)}</td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-600 dark:text-slate-300 truncate">{item.ditandatangani_di || "-"}</td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">{item.total_dokumen ?? 0} dokumen</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300">{item.patuh_count ?? 0} Patuh</span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap bg-red-50 text-red-600 border-red-200/70 dark:bg-red-950/50 dark:text-red-300">{item.tidak_patuh_count ?? 0} Tidak</span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300">{item.dalam_proses_count ?? 0} Proses</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-end gap-0.5 flex-nowrap">
                          <button onClick={() => openDetail(item)} title="Detail" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"><Eye size={16} /></button>
                          <button onClick={() => openEdit(item)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => setExportTarget(item)} title="Export FR-044" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"><FileDown size={16} /></button>
                          <button onClick={() => { setItemToDelete(item); setIsDeleteOpen(true); }} title="Hapus" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && items.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>Halaman {meta.current_page} dari {meta.last_page}</span>
              <div className="flex items-center gap-1">
                <button disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft size={14} /></button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EvaluasiKepatuhanFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} initialData={selectedItem} />
      <EvaluasiKepatuhanDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={detailItem} />
      <EvaluasiKepatuhanExportModal
        isOpen={!!exportTarget}
        onClose={() => setExportTarget(null)}
        onExport={handleExport}
        loading={exporting}
        noDokumen={noDokumen} setNoDokumen={setNoDokumen}
        noRevisi={noRevisi} setNoRevisi={setNoRevisi}
        tanggalBerlaku={tanggalBerlaku} setTanggalBerlaku={setTanggalBerlaku}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Konfirmasi Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data evaluasi ${itemToDelete ? kode(itemToDelete.id) : ""}? Seluruh rincian dokumen kepatuhan di dalamnya akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.`}
      />
    </ServiceRouteGuard>
  );
}
