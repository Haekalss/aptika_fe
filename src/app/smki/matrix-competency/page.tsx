"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ChevronLeft, ChevronRight, FileDown, FileSpreadsheet,
  Loader2, Pencil, Plus, RotateCcw, Search, Trash2, Eye, X, Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getMatrixList, getMatrixDetail, deleteMatrix, errMsg,
  type MatrixDocumentSummary,
} from "@/services/smki/matrixCompetencyService";
import { exportMatrixCompetencyXlsx } from "@/utils/smkiMatrixCompetencyXlsx";
import MatrixDocModal from "@/components/smki/matrix-competency/MatrixDocModal";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

export default function MatrixCompetencyPage() {
  const router = useRouter();
  const [items, setItems] = useState<MatrixDocumentSummary[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MatrixDocumentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [stats, setStats] = useState({ total_dokumen: 0, total_roles: 0, total_employees: 0 });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMatrixList({ search: debounced || undefined, page, per_page: 10 });
      setItems(res.data);
      setMeta(res.meta);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      toast.error(errMsg(err, "Gagal memuat matriks kompetensi."));
    } finally {
      setLoading(false);
    }
  }, [debounced, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleExport = async (id: number) => {
    setExportingId(id);
    try {
      const doc = await getMatrixDetail(id);
      await exportMatrixCompetencyXlsx(doc);
      toast.success("File Excel FR-031 berhasil diunduh.");
    } catch (err) {
      toast.error(errMsg(err, "Gagal mengekspor Excel."));
    } finally {
      setExportingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMatrix(deleteTarget.id);
      toast.success("Dokumen berhasil dihapus.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus dokumen."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex min-w-0 flex-col gap-5 pb-2">
        {/* Ringkasan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="status" aria-label="Ringkasan matriks kompetensi">
          {[
            { label: "Total Dokumen", value: stats.total_dokumen, sub: "Matriks kompetensi tersimpan" },
            { label: "Total Baris Peran", value: stats.total_roles, sub: "Standar Kordinator / Team Teknis" },
            { label: "Total Pegawai", value: stats.total_employees, sub: "Pegawai yang dinilai" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{s.label}</p>
                <p className="mt-1 text-3xl font-black text-emerald-700 tabular-nums dark:text-emerald-300" aria-live="polite">
                  {loading ? "–" : s.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{s.sub}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300" aria-hidden="true">
                <Layers size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari unit kerja..."
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-medium dark:border-slate-700 dark:bg-slate-800/60 ${focus}`}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Hapus kata kunci"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-800">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="button" onClick={openCreate}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 ${focus}`}>
              <Plus size={15} /> Buat Matriks
            </button>
          </div>
          {(search) && (
            <button type="button" onClick={() => { setSearch(""); setDebounced(""); setPage(1); }}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline">
              <RotateCcw size={12} /> Reset filter
            </button>
          )}
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-extrabold">Dokumen Matriks Kompetensi (FR-031)</h2>            <span className="text-xs text-slate-500">{meta.total} dokumen</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs" aria-label="Daftar dokumen matriks kompetensi">
              <thead className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  {["Unit Kerja", "Isi", "Diperbarui", "Aksi"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800/70" aria-hidden="true">
                      <td className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-64 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" /></td>
                      <td className="px-4 py-3"><div className="flex gap-1">{[0, 1, 2, 3].map((j) => <div key={j} className="h-8 w-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  debounced ? (
                    <tr><td colSpan={4} className="py-14 text-center">
                      <Search size={28} className="mx-auto text-slate-300" aria-hidden="true" />
                      <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada hasil untuk &ldquo;{debounced}&rdquo;</p>
                      <p className="mt-0.5 text-xs text-slate-500">Coba kata kunci lain atau buat matriks baru.</p>
                      <button type="button" onClick={() => { setSearch(""); setDebounced(""); setPage(1); }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                        <RotateCcw size={13} /> Tampilkan semua
                      </button>
                    </td></tr>
                  ) : (
                    <tr><td colSpan={4} className="py-14 text-center">
                      <AlertCircle size={28} className="mx-auto text-amber-500" aria-hidden="true" />
                      <p className="mt-2 text-sm font-bold">Belum ada dokumen</p>
                      <p className="text-xs text-slate-500">Buat matriks pertama untuk mulai mengisi Roles, Employee, Gap, dan Training.</p>
                    </td></tr>
                  )
                ) : items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50/70 dark:border-slate-800/70">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => router.push(`/smki/matrix-competency/${it.id}`)}
                        className="font-bold text-emerald-700 hover:underline text-left">
                        {it.nama_unit_kerja || `Matriks #${it.id}`}
                      </button>
                      <div className="text-[11px] text-slate-500">ID #{it.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[11px] text-slate-600">
                        {it.jumlah_kompetensi} kompetensi • {it.roles_count} peran • {it.employees_count} pegawai • {it.trainings_count} training
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      {it.updated_at ? new Date(it.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label={`Buka editor ${it.nama_unit_kerja || `matriks ${it.id}`}`} title="Buka editor" onClick={() => router.push(`/smki/matrix-competency/${it.id}`)}
                          className="rounded-lg p-2 hover:bg-emerald-50 hover:text-emerald-700"><Eye size={15} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Ubah unit dan kompetensi ${it.nama_unit_kerja || `matriks ${it.id}`}`} title="Ubah metadata" onClick={() => openEdit(it.id)}
                          className="rounded-lg p-2 hover:bg-amber-50 hover:text-amber-700"><Pencil size={15} aria-hidden="true" /></button>
                        <button type="button" aria-label={`Ekspor Excel ${it.nama_unit_kerja || `matriks ${it.id}`}`} title="Ekspor Excel" disabled={exportingId === it.id} onClick={() => handleExport(it.id)}
                          className="rounded-lg p-2 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50">
                          {exportingId === it.id ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <FileSpreadsheet size={15} aria-hidden="true" />}
                        </button>
                        <button type="button" aria-label={`Hapus ${it.nama_unit_kerja || `matriks ${it.id}`}`} title="Hapus" onClick={() => setDeleteTarget(it)}
                          className="rounded-lg p-2 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs dark:border-slate-800">
            <span className="text-slate-500">Halaman {meta.current_page} dari {Math.max(1, meta.last_page)}</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border p-1.5 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <span className="min-w-[32px] rounded-lg bg-emerald-700 px-2.5 py-1.5 text-center font-bold text-white">{meta.current_page}</span>
              <button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border p-1.5 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
          <FileDown size={13} className="mt-0.5 shrink-0" />
          Ekspor menghasilkan 1 file .xlsx berisi 4 sheet (Roles Matrix, Employee Matrix, Gap Analisis, Rencana Training)
          dengan tata letak mengikuti file Excel FR-031 aslinya.
        </p>
      </div>

      <MatrixDocModal
        open={modalOpen}
        editingId={editingId}
        onClose={() => setModalOpen(false)}
        onSaved={(id) => {
          setModalOpen(false);
          load();
          router.push(`/smki/matrix-competency/${id}`);
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus dokumen matriks?"
        message={`Matriks ${deleteTarget?.nama_unit_kerja || `#${deleteTarget?.id}`} beserta seluruh data peran, pegawai, dan training akan dihapus.`}
        confirmText="Ya, hapus"
        cancelText="Batal"
        isDanger
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </ServiceRouteGuard>
  );
}
