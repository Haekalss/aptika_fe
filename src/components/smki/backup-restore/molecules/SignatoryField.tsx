"use client";

import { useState } from "react";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { TtePegawai } from "@/services/tteService";
import type { BackupRestoreReport, BackupRestoreSignatory } from "@/services/smki/backupRestore.types";
import { fr030SignerIdentity } from "../form";
import { SignatorySpecimen } from "./SignatorySpecimen";

export function SignatoryField({ role, value, onChange, options, saved, error, refresh, onRefresh, refreshing }: {
  role: BackupRestoreSignatory; value: number | null; onChange: (value: number | null) => void;
  options: TtePegawai[]; saved?: BackupRestoreReport; error?: string; refresh: boolean; onRefresh: () => Promise<void>; refreshing: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const prefix = role === "pelaksana" ? "pelaksana" : "penanggung_jawab";
  const label = role === "pelaksana" ? "Pelaksana" : "Penanggung Jawab";
  const identity = fr030SignerIdentity(prefix, value, options, saved, refresh);
  return <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
    <FormField label={label} error={error}>
      <select id={`fr030-${prefix}_pegawai_id`} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-emerald-500" value={value ?? ""} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">{identity.historical && value === null ? `${identity.nama || "Pegawai historis"} (tersimpan)` : "Belum dipilih"}</option>
        {value && !options.some(option => option.id === value) && <option value={value}>{identity.nama || "Pegawai historis"} (tersimpan)</option>}
        {options.map(option => <option key={option.id} value={option.id}>{option.nama} · {option.nip || "Tanpa NIP"}</option>)}
      </select>
    </FormField>
    {(identity.historical || value !== null) && <>
      <dl className="space-y-2 text-sm">{[["Nama", identity.nama], ["NIP", identity.nip], ["Jabatan", identity.jabatan], ["Pangkat", identity.pangkat]].map(([field, content]) => <div key={field} className="grid grid-cols-[70px_1fr] gap-3"><dt className="text-slate-500 dark:text-slate-400">{field}</dt><dd className="min-w-0 break-words font-medium text-slate-900 dark:text-white">{content?.trim() || "Belum tersedia"}</dd></div>)}</dl>
      {identity.missing.length > 0 ? <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">Belum lengkap: {identity.missing.join(", ")}. Lengkapi master pegawai agar dapat difinalisasi. Draf tetap dapat disimpan.</p> : <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Identitas lengkap untuk finalisasi.</p>}
      {identity.historical && <p className="text-xs text-slate-500 dark:text-slate-400">Identitas tersimpan pada dokumen; perubahan master tidak menggantinya secara otomatis.</p>}
      {saved?.status === "draft" && value !== null && value === saved[`${prefix}_pegawai_id`] && <Button type="button" variant="outline" size="sm" disabled={refreshing || refresh} onClick={() => setConfirm(true)}>{refresh ? "Identitas akan diperbarui saat disimpan" : refreshing ? "Memuat master…" : "Perbarui identitas dari master"}</Button>}
      <SignatorySpecimen key={`${role}:${identity.historical ? `snapshot-${saved?.id}-${saved?.version}` : `${value}-${refresh}`}`} role={role} pegawaiId={value} reportId={identity.historical ? saved?.id : undefined} />
    </>}
    <ConfirmModal isOpen={confirm} isDanger={false} title={`Perbarui identitas ${label}?`} message="Identitas pada draf akan diganti dari master pegawai terbaru saat laporan disimpan. Dokumen Final tidak diubah." confirmText="Ambil identitas terbaru" loading={refreshing} onClose={() => setConfirm(false)} onConfirm={async () => { await onRefresh(); setConfirm(false); }} />
  </div>;
}
