import Card from "@/components/ui/Card";
import type { Fr025Lookup } from "@/services/smki/removableMedia.types";
import type { Fr025FormState } from "../form";
import { MasterChoice } from "../molecules/MasterChoice";

export function ReportSignatories({ form, lookup, onChange, errors, disabled }: { form: Fr025FormState; lookup: Fr025Lookup; onChange: (value: Partial<Fr025FormState>) => void; errors: Record<string, string>; disabled: boolean }) {
  return <Card hoverable={false} title="3. Pengurus Barang & Kepala Unit Kerja">
    <p className="mb-5 text-sm text-slate-500">Nama merupakan identitas dokumen. Pemilihan nama bukan persetujuan akun, tanda tangan elektronik, atau bukti telah dilakukan audit.</p>
    <div className="grid grid-cols-2 gap-8">
      <MasterChoice id="fr025-head" label="Kepala Unit Kerja (Mengetahui)" options={lookup.users} selectedId={form.kepala_unit_user_id} name={form.kepala_unit_nama} disabled={disabled} error={errors.kepala_unit_nama || errors.kepala_unit_user_id} onChange={(kepala_unit_user_id, kepala_unit_nama) => onChange({ kepala_unit_user_id, kepala_unit_nama })} />
      <MasterChoice id="fr025-custodian" label="Pengurus Barang" options={lookup.users} selectedId={form.pengurus_barang_user_id} name={form.pengurus_barang_nama} disabled={disabled} error={errors.pengurus_barang_nama || errors.pengurus_barang_user_id} onChange={(pengurus_barang_user_id, pengurus_barang_nama) => onChange({ pengurus_barang_user_id, pengurus_barang_nama })} />
    </div>
  </Card>;
}
