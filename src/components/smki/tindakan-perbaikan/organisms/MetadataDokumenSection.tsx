"use client";

import Input from "@/components/ui/Input";
import type { Fr009SectionProps } from "../types";

export default function MetadataDokumenSection({ form, lookup, errors, onChange }: Fr009SectionProps) {
  return <section aria-labelledby="fr009-document-metadata" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
    <h2 id="fr009-document-metadata" className="font-bold text-slate-900 dark:text-white">Identitas Dokumen</h2>
    <p className="mt-1 mb-5 text-xs text-slate-500">Dapat diisi manual untuk laporan ini dan akan digunakan pada ekspor DOCX/PDF. No. Dokumen berbeda dari nomor laporan.</p>
    <div className="grid gap-5 md:grid-cols-3">
      <Input label="No. Dokumen" required maxLength={255} value={form.nomor_dokumen} onChange={(event) => onChange({ nomor_dokumen: event.target.value })} error={errors.nomor_dokumen?.[0]} className="rounded-xl" />
      <Input label="No. Revisi" required maxLength={50} value={form.nomor_revisi} onChange={(event) => onChange({ nomor_revisi: event.target.value })} error={errors.nomor_revisi?.[0]} className="rounded-xl" />
      <Input label="Tanggal Berlaku" required type="date" value={form.tanggal_berlaku} onChange={(event) => onChange({ tanggal_berlaku: event.target.value })} error={errors.tanggal_berlaku?.[0]} helperText="Dokumen baru menggunakan tanggal hari ini (WIB); sesuaikan dengan tanggal mulai berlakunya dokumen." className="rounded-xl" />
    </div>
    <p className="mt-4 text-xs text-slate-500">Klasifikasi: <span className="font-semibold">{lookup.template.classification}</span></p>
  </section>;
}
