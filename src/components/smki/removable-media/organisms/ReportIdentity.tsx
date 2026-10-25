import Card from "@/components/ui/Card";
import type { Fr025Lookup } from "@/services/smki/removableMedia.types";
import type { Fr025FormState } from "../form";
import { Fr025Field, fr025Control } from "../molecules/Fr025Field";

export function ReportIdentity({ form, lookup, onChange, errors, disabled }: { form: Fr025FormState; lookup: Fr025Lookup; onChange: (value: Partial<Fr025FormState>) => void; errors: Record<string, string>; disabled: boolean }) {
  return <Card hoverable={false} title="1. Identitas Dokumen">
    <div className="mb-6 grid grid-cols-3 gap-5 rounded-xl bg-slate-50 p-4">
      <Fr025Field id="fr025-number" label="No. Dokumen" error={errors.nomor_dokumen}><input className={fr025Control} value={form.nomor_dokumen} maxLength={255} required disabled={disabled} onChange={(event) => onChange({ nomor_dokumen: event.target.value })} /></Fr025Field>
      <Fr025Field id="fr025-revision" label="No. Revisi" error={errors.nomor_revisi}><input className={fr025Control} value={form.nomor_revisi} maxLength={50} required disabled={disabled} onChange={(event) => onChange({ nomor_revisi: event.target.value })} /></Fr025Field>
      <Fr025Field id="fr025-effective-date" label="Tanggal Berlaku" error={errors.tanggal_berlaku}><input type="date" className={fr025Control} value={form.tanggal_berlaku} required disabled={disabled} onChange={(event) => onChange({ tanggal_berlaku: event.target.value })} /></Fr025Field>
    </div>
    <div className="grid grid-cols-3 gap-5">
      <Fr025Field id="fr025-unit" label="Unit Kerja" hint="Mengikuti bidang pemilik dokumen; tidak dapat dipindahkan melalui form."><input className={fr025Control} value={lookup.unit.name} readOnly /></Fr025Field>
      <Fr025Field id="fr025-date" label="Tanggal Dokumen" error={errors.tanggal_dokumen} hint="Tanggal penyusunan, berbeda dari Tanggal Berlaku pada kop surat."><input type="date" className={fr025Control} value={form.tanggal_dokumen} disabled={disabled} onChange={(event) => onChange({ tanggal_dokumen: event.target.value })} /></Fr025Field>
      <Fr025Field id="fr025-place" label="Tempat Penyusunan" error={errors.tempat}><input className={fr025Control} value={form.tempat} disabled={disabled} maxLength={100} onChange={(event) => onChange({ tempat: event.target.value })} /></Fr025Field>
    </div>
  </Card>;
}
