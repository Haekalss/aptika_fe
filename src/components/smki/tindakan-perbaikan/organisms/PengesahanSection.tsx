"use client";

import { isAuditSource } from "../form";
import PersonField from "../molecules/PersonField";
import FormSection from "./FormSection";
import type { Fr009SectionProps } from "../types";

export default function PengesahanSection({ form, lookup, errors, onChange }: Fr009SectionProps) {
  const audit = isAuditSource(form.sumber_codes);
  return <FormSection number={6} title="Auditor & Atasan Terkait" hint="Nama pengesah merupakan data dokumen; pemilihan nama bukan tanda tangan elektronik atau persetujuan otomatis.">
    <div className="grid gap-5 md:grid-cols-2">
      {audit ? <PersonField label="Auditor" id={form.id_auditor} name={form.auditor_nama} options={lookup.auditors.map((auditor) => ({ id: auditor.id_auditor, name: auditor.nama_auditor, label: `${auditor.nama_auditor}${auditor.nip_auditor ? ` (${auditor.nip_auditor})` : ""}` }))} onChange={(id_auditor, auditor_nama) => onChange({ id_auditor, auditor_nama })} error={errors.id_auditor?.[0] || errors.auditor_nama?.[0]} /> : <p className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs text-slate-500">Kolom auditor hanya perlu diisi untuk kegiatan audit.</p>}
      <PersonField label="Atasan terkait" id={form.atasan_id} name={form.atasan_nama} options={lookup.users} onChange={(atasan_id, atasan_nama) => onChange({ atasan_id, atasan_nama })} error={errors.atasan_id?.[0] || errors.atasan_nama?.[0]} />
    </div>
  </FormSection>;
}
