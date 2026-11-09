"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { backupRestoreService, readFr030Error } from "@/services/smki/backupRestoreService";
import { useFr030Report, useRefreshFr030 } from "../hooks/useFr030Queries";
import { AnnualAssetMatrix } from "../organisms/AnnualAssetMatrix";
import { SignatorySpecimen } from "../molecules/SignatorySpecimen";
import { downloadFr030Blob } from "../downloads";

export function Fr030DetailTemplate({ id }: { id: number }) {
  const query = useFr030Report(id);
  const refresh = useRefreshFr030();
  const router = useRouter();
  const [busy, setBusy] = useState(false), [remove, setRemove] = useState(false), [error, setError] = useState("");
  const report = query.data;
  async function destroy() {
    if (!report || busy) return;
    setBusy(true);
    try { await backupRestoreService.delete(report.id, report.version); await refresh(); router.push("/smki/backup-restore"); }
    catch (cause) { setError((await readFr030Error(cause)).message); }
    finally { setBusy(false); setRemove(false); }
  }
  async function exportDocx() {
    if (!report) return;
    setBusy(true); setError("");
    try { downloadFr030Blob(await backupRestoreService.exportDocx(report.id), `FR-030-${report.tahun}-${report.id}.docx`); }
    catch (cause) { setError((await readFr030Error(cause)).message); }
    finally { setBusy(false); }
  }
  if (query.isPending) return <p role="status">Memuat laporan FR-030…</p>;
  if (query.isError || !report) return <div role="alert">Laporan tidak tersedia atau Anda tidak memiliki akses. <Button variant="outline" onClick={() => query.refetch()}>Coba lagi</Button></div>;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={() => router.push("/smki/backup-restore")}>Kembali ke daftar</Button><div className="flex flex-wrap gap-2">{report.permissions.can_update && <Button variant="outline" disabled={busy} onClick={() => router.push(`/smki/backup-restore/${id}/edit`)}>Edit laporan</Button>}{report.permissions.can_delete && <Button variant="destructive" disabled={busy} onClick={() => setRemove(true)}>Hapus laporan</Button>}{report.permissions.can_export && <Button variant="success" disabled={busy} onClick={() => void exportDocx()}>Ekspor DOCX</Button>}</div></div>
    {error && <p role="alert" className="text-red-700 dark:text-red-300">{error}</p>}
    <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">Identitas Dokumen · {report.status === "final" ? "Final" : "Draf"} · Versi {report.version}</h2>}><dl className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[["No. Dokumen", report.nomor_dokumen], ["No. Revisi", report.nomor_revisi], ["Tanggal terbit", report.tanggal_terbit], ["Tahun laporan", report.tahun], ["Unit kerja", report.unit_kerja_nama]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-600 dark:text-slate-300">{label}</dt><dd className="mt-1 break-words font-medium text-slate-900 dark:text-white">{value || "Belum diisi"}</dd></div>)}</dl></Card>
    <AnnualAssetMatrix readOnly assets={report.assets} year={report.tahun} report={report} dirty={false} busy={busy} setBusy={setBusy} onSaved={() => void query.refetch()} onChange={() => {}} />
    <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">Pelaksana & Penanggung Jawab</h2>}><p className="mb-5 text-sm text-slate-600 dark:text-slate-300">Identitas tersimpan saat dokumen dibuat. Spesimen bukan persetujuan akun atau tanda tangan elektronik tersertifikasi.</p><div className="grid gap-6 md:grid-cols-2">{(["pelaksana", "penanggung_jawab"] as const).map(role => <div key={role} className="space-y-3"><h3 className="font-semibold text-slate-900 dark:text-white">{role === "pelaksana" ? "Pelaksana" : "Penanggung Jawab"}</h3><p className="text-slate-700 dark:text-slate-200">{report[`${role}_nama`] || "Belum dipilih"}<br />NIP: {report[`${role}_nip`] || "—"}<br />{report[`${role}_jabatan`] || ""}</p>{report[`${role}_nama`] && <SignatorySpecimen key={`${role}:${report.version}`} reportId={report.id} role={role === "pelaksana" ? "pelaksana" : "penanggung-jawab"} pegawaiId={report[`${role}_pegawai_id`]} />}</div>)}</div></Card>
    <ConfirmModal isOpen={remove} onClose={() => setRemove(false)} onConfirm={destroy} loading={busy} title="Hapus laporan FR-030?" />
  </div>;
}
