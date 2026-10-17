"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MonitorSmartphone, Plus, Search, RotateCcw, Eye, Pencil, Trash2, Printer, Loader2,
  ChevronLeft, ChevronRight, Building2, FileText, Laptop, Tablet, ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  fetchPerangkatPribadiList, deletePerangkatPribadi, formatTanggalIndo, ringkasJenis, perangkatErrMsg,
  JENIS_PERANGKAT_OPTIONS, PerangkatPribadi, PerangkatPribadiStats,
} from "@/services/smki/perangkatPribadiService";

const kode = (id: number) => `BYOD-${String(id).padStart(3, "0")}`;

export default function PerangkatPribadiPage() {
  const router = useRouter();
  const { bidang } = useAuthStore();

  const [items, setItems] = useState<PerangkatPribadi[]>([]);
  const [stats, setStats] = useState<PerangkatPribadiStats>({ total_formulir: 0, total_perangkat: 0, laptop: 0, pc: 0, tab: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  const [itemToDelete, setItemToDelete] = useState<PerangkatPribadi | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPerangkatPribadiList({
        search: search || undefined,
        jenis_perangkat: jenis || undefined,
        page,
        per_page: 10,
      });
      if (res?.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta((m) => ({ ...m, ...res.meta }));
      }
    } catch (err) {
      toast.error(perangkatErrMsg(err, "Gagal memuat daftar formulir BYOD"));
    } finally {
      setLoading(false);
    }
  }, [search, jenis, page]);

  useEffect(() => {
    const t = setTimeout(loadData, 250);
    return () => clearTimeout(t);
  }, [loadData]);

  const resetFilter = () => {
    setSearch("");
    setJenis("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deletePerangkatPribadi(itemToDelete.id);
      toast.success("Formulir BYOD berhasil dihapus.");
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(perangkatErrMsg(err, "Gagal menghapus formulir BYOD"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const statCards = [
    { label: "Total Formulir", value: stats.total_formulir, sub: "Surat pernyataan", icon: <ListChecks size={22} />, wrap: "bg-slate-50 border-slate-200/70 text-slate-600 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300", num: "text-slate-700 dark:text-slate-200" },
    { label: "Total Perangkat", value: stats.total_perangkat, sub: "Terdaftar", icon: <MonitorSmartphone size={22} />, wrap: "bg-sky-50 border-sky-200/70 text-sky-600 dark:bg-sky-950/50 dark:border-sky-800/50 dark:text-sky-400", num: "text-sky-600 dark:text-sky-400" },
    { label: "Laptop / PC", value: stats.laptop + stats.pc, sub: "Perangkat", icon: <Laptop size={22} />, wrap: "bg-emerald-50 border-emerald-200/70 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800/50 dark:text-emerald-400", num: "text-emerald-600 dark:text-emerald-400" },
    { label: "Tablet", value: stats.tab, sub: "Perangkat", icon: <Tablet size={22} />, wrap: "bg-amber-50 border-amber-200/70 text-amber-600 dark:bg-amber-950/50 dark:border-amber-800/50 dark:text-amber-400", num: "text-amber-600 dark:text-amber-400" },
  ];

  const th = "text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";
  const inputCls =
    "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MonitorSmartphone size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Formulir BYOD – Perangkat Pribadi (FR-045)</h1>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Surat pernyataan Kepala Unit Kerja atas penggunaan perangkat pribadi (Bring Your Own Device): identitas pejabat, daftar perangkat TI, dan ketentuan sanksi.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-200" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Printer size={16} className="text-emerald-200" />
                <span>Output: <strong className="text-white">Cetak / PDF (A4)</strong></span>
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
                <p className={`text-3xl font-extrabold ${c.num}`}>{c.value}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{c.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${c.wrap}`}>{c.icon}</div>
            </div>
          ))}
        </div>

        {/* Filter + Action */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama, NIP, unit kerja, merek/tipe, atau nomor seri..."
                className={`${inputCls} pl-10`}
              />
            </div>
            <select value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1); }} className={`${inputCls} lg:w-52`}>
              <option value="">Semua Jenis Perangkat</option>
              {JENIS_PERANGKAT_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button onClick={resetFilter} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={() => router.push("/smki/perangkat-pribadi/form")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap">
                <Plus size={15} /> Tambah Formulir BYOD
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className={`${th} text-center w-14`}>No</th>
                  <th className={th}>Kepala Unit Kerja</th>
                  <th className={th}>Jabatan</th>
                  <th className={th}>Unit Kerja</th>
                  <th className={`${th} text-center`}>Perangkat</th>
                  <th className={th}>Rincian</th>
                  <th className={th}>Tanggal</th>
                  <th className={`${th} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-emerald-600 mx-auto" /></td></tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <FileText size={32} className="text-slate-300" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada formulir BYOD</p>
                        <p className="text-xs text-slate-400">Tambahkan formulir baru atau ubah filter pencarian.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama}</div>
                        <div className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">{item.nip ? `NIP ${item.nip}` : kode(item.id)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.jabatan}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.unit_kerja}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10.5px] font-bold border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
                          {item.total_perangkat ?? 0} perangkat
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{ringkasJenis(item)}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{formatTanggalIndo(item.tanggal_ttd || item.created_at)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => router.push(`/smki/perangkat-pribadi/detail/${item.id}`)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200/80 dark:border-blue-800/60" title="Lihat Detail"><Eye size={13} /></button>
                          <button onClick={() => router.push(`/smki/perangkat-pribadi/print/${item.id}`)} className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200/80 dark:border-teal-800/60" title="Cetak Formulir"><Printer size={13} /></button>
                          <button onClick={() => router.push(`/smki/perangkat-pribadi/edit/${item.id}`)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-200/80 dark:border-amber-800/60" title="Ubah Data"><Pencil size={13} /></button>
                          <button onClick={() => setItemToDelete(item)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-800/60" title="Hapus"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {items.length === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1}–{(meta.current_page - 1) * meta.per_page + items.length} dari {meta.total} data
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.current_page <= 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold">
                <ChevronLeft size={13} /> Sebelumnya
              </button>
              <span className="px-2 font-bold text-slate-600 dark:text-slate-300">{meta.current_page} / {meta.last_page}</span>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={meta.current_page >= meta.last_page} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold">
                Selanjutnya <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Hapus Formulir BYOD?"
        message={`Formulir ${itemToDelete ? kode(itemToDelete.id) : ""} atas nama ${itemToDelete?.nama ?? ""} beserta seluruh daftar perangkatnya akan dihapus.`}
      />
    </ServiceRouteGuard>
  );
}
