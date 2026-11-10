"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import Card from "../atoms/Fr030Section";
import Pagination from "@/components/ui/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { BackupRestoreFilters, BackupRestoreReport } from "@/services/smki/backupRestore.types";
import { backupRestoreService, readFr030Error } from "@/services/smki/backupRestoreService";
import { useFr030List, useRefreshFr030 } from "../hooks/useFr030Queries";
import { downloadFr030Blob } from "../downloads";

const actionButtonClass = "!h-11 !w-11 shrink-0 !rounded-xl shadow-none";

export function Fr030ListTemplate() {
  const router = useRouter();
  const [filters, setFilters] = useState<BackupRestoreFilters>({ page: 1 });
  const query = useFr030List(filters);
  const refresh = useRefreshFr030();
  const [remove, setRemove] = useState<BackupRestoreReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function destroy() {
    if (!remove || busy) return;
    setBusy(true); setError("");
    try { await backupRestoreService.delete(remove.id, remove.version); setRemove(null); await refresh(); }
    catch (cause) { setError((await readFr030Error(cause)).message); setRemove(null); }
    finally { setBusy(false); }
  }
  async function exportDocx(report: BackupRestoreReport) {
    setBusy(true); setError("");
    try { downloadFr030Blob(await backupRestoreService.exportDocx(report.id), `FR-030-${report.tahun}-${report.id}.docx`); }
    catch (cause) { setError((await readFr030Error(cause)).message); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-700 dark:text-slate-200">Rekap tahunan aset, kegiatan bulanan, dan bukti backup–restore bidang Anda.</p><Button onClick={() => router.push("/smki/backup-restore/tambah")} variant="success" aria-label="Tambah laporan"><Plus aria-hidden="true" />Tambah laporan</Button></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
    <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">Daftar Laporan FR-030</h2>}>
      <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
        <Input label="Cari laporan" placeholder="Nomor dokumen atau nama aset" maxLength={100} value={filters.search ?? ""} onChange={e => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })} />
        <Input label="Filter tahun" type="number" min={1900} max={2100} value={filters.year ?? ""} onChange={e => setFilters({ ...filters, year: e.target.value ? Number(e.target.value) : undefined, page: 1 })} />
        <FormField label="Filter status"><select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:bg-slate-900 dark:border-slate-600" value={filters.status ?? ""} onChange={e => setFilters({ ...filters, status: e.target.value as BackupRestoreFilters["status"] || undefined, page: 1 })}><option value="">Semua status</option><option value="draft">Draf</option><option value="final">Final</option></select></FormField>
      </div>
      {query.isPending ? <p role="status">Memuat daftar FR-030…</p> : query.isError ? <div role="alert">Daftar laporan tidak dapat dimuat. <Button variant="outline" onClick={() => query.refetch()}>Coba lagi</Button></div> : !query.data?.data.length ? <p className="rounded-lg bg-slate-50 p-5 dark:bg-slate-800">Belum ada laporan yang sesuai. Buat laporan atau ubah filter.</p> : <>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 dark:bg-slate-800"><tr>{["No. Dokumen", "Tahun", "Unit Kerja", "Status", "Aksi"].map(label => <th key={label} scope="col" className={`p-3 font-semibold ${label === "Aksi" ? "w-[224px] text-center" : ""}`}>{label}</th>)}</tr></thead><tbody>{query.data.data.map(report => <tr key={report.id} className="border-b border-slate-100 dark:border-slate-700">
          <td className="p-3 break-words">{report.nomor_dokumen || `Draf #${report.id}`}</td><td className="p-3">{report.tahun}</td><td className="p-3">{report.unit_kerja_nama}</td><td className="p-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{report.status === "final" ? "Final" : "Draf"}</span></td>
          <td className="p-3 align-middle"><div role="group" aria-label={`Aksi laporan ${report.id}`} className="flex flex-nowrap items-center justify-center gap-2">
            <Button variant="outline" size="icon" className={actionButtonClass} title="Lihat laporan" aria-label={`Lihat laporan ${report.id}`} onClick={() => router.push(`/smki/backup-restore/${report.id}`)}><Eye aria-hidden="true" /></Button>
            {report.permissions.can_update && <Button variant="outline" size="icon" className={actionButtonClass} title="Edit laporan" aria-label={`Edit laporan ${report.id}`} onClick={() => router.push(`/smki/backup-restore/${report.id}/edit`)}><Pencil aria-hidden="true" /></Button>}
            {report.permissions.can_delete && <Button variant="outline" className={`${actionButtonClass} border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300`} size="icon" disabled={busy} title="Hapus laporan" aria-label={`Hapus laporan ${report.id}`} onClick={() => setRemove(report)}><Trash2 aria-hidden="true" /></Button>}
            {report.permissions.can_export && <Button variant="outline" size="icon" className={actionButtonClass} disabled={busy} title="Ekspor DOCX" aria-label={`Ekspor DOCX laporan ${report.id}`} onClick={() => void exportDocx(report)}><Download aria-hidden="true" /></Button>}
          </div></td>
        </tr>)}</tbody></table></div>
        <Pagination currentPage={query.data.current_page} totalPages={query.data.last_page} totalItems={query.data.total} itemsPerPage={query.data.per_page} onPageChange={page => setFilters({ ...filters, page })} />
      </>}
    </Card>
    <ConfirmModal isOpen={Boolean(remove)} onClose={() => setRemove(null)} onConfirm={destroy} loading={busy} title="Hapus laporan FR-030?" message="Laporan tidak lagi tampil setelah dihapus. Bukti privat tetap disimpan sesuai kebijakan arsip." />
  </div>;
}
