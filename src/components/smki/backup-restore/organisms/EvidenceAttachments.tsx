"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { BackupRestoreAttachment, BackupRestoreEntry, BackupRestoreReport } from "@/services/smki/backupRestore.types";
import { backupRestoreService, readFr030Error } from "@/services/smki/backupRestoreService";
import { downloadFr030Blob } from "../downloads";

export function EvidenceAttachments({ entry, report, dirty, busy, setBusy, onSaved, readOnly }: { entry: BackupRestoreEntry; report?: BackupRestoreReport; dirty: boolean; busy: boolean; setBusy: (busy: boolean) => void; onSaved: (report: BackupRestoreReport) => void; readOnly?: boolean }) {
  const [error, setError] = useState("");
  const [remove, setRemove] = useState<BackupRestoreAttachment | null>(null);
  const label = entry.operation === "backup" ? "Backup" : "Restore";
  const canUpload = Boolean(report && entry.id && !dirty && !busy);
  async function upload(file?: File) {
    if (!file || !report || !entry.id || !canUpload) return;
    if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Gunakan PNG/JPEG, maksimal 5 MiB per file."); return; }
    setBusy(true); setError("");
    try {
      await backupRestoreService.uploadEvidence(report.id, entry.id, file, report.version);
      onSaved(await backupRestoreService.get(report.id));
    } catch (cause) { setError((await readFr030Error(cause)).message); }
    finally { setBusy(false); }
  }
  async function deleteFile() {
    if (!remove || !report || !canUpload) return;
    setBusy(true); setError("");
    try {
      await backupRestoreService.deleteEvidence(report.id, remove.id, report.version);
      onSaved(await backupRestoreService.get(report.id)); setRemove(null);
    } catch (cause) { setError((await readFr030Error(cause)).message); }
    finally { setBusy(false); }
  }
  async function download(file: BackupRestoreAttachment) {
    if (!report) return;
    try { downloadFr030Blob(await backupRestoreService.downloadEvidence(report.id, file.id), file.original_name); }
    catch (cause) { setError((await readFr030Error(cause)).message); }
  }
  return <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
    {!readOnly && <Input label={`Bukti ${label}`} type="file" accept="image/png,image/jpeg" disabled={!canUpload || entry.attachments.length >= 5} helperText="PNG/JPEG, maksimal 5 MiB dan 6000 × 6000 px; 5 file/kegiatan, 50 file/laporan." onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void upload(file); }} />}
    {!readOnly && !canUpload && <p className="text-xs text-slate-600 dark:text-slate-300">Simpan Draf terlebih dahulu. Unggah/hapus bukti hanya saat kegiatan tersimpan dan tidak ada perubahan belum disimpan.</p>}
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {entry.attachments.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">Belum ada bukti.</p>}
    <ul className="space-y-2">{entry.attachments.map(file => <li key={file.id} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="min-w-0 flex-1 break-words text-slate-700 dark:text-slate-200">{file.original_name}</span>
      <Button type="button" variant="outline" size="sm" onClick={() => void download(file)}>Unduh bukti</Button>
      {!readOnly && <Button type="button" variant="destructive" size="sm" disabled={!canUpload} onClick={() => setRemove(file)}>Hapus bukti</Button>}
    </li>)}</ul>
    <ConfirmModal isOpen={Boolean(remove)} onClose={() => setRemove(null)} onConfirm={deleteFile} loading={busy} title="Hapus bukti kegiatan?" message="Bukti ini akan dihapus dari kegiatan setelah perubahan berhasil disimpan." />
  </div>;
}
