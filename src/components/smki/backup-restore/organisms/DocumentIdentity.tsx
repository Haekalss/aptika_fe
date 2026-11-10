import Card from "../atoms/Fr030Section";
import Input from "@/components/ui/Input";
import type { Fr030FormState } from "@/services/smki/backupRestore.types";

export function DocumentIdentity({ form, change, errors, unit }: { form: Fr030FormState; change: (value: Partial<Fr030FormState>) => void; errors: Record<string, string[]>; unit?: string }) {
  return <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">1. Identitas Dokumen</h2>}>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Input id="fr030-tahun" label="Tahun laporan" type="number" min={1900} max={2100} value={form.tahun} error={errors.tahun?.[0]} onChange={e => change({ tahun: Number(e.target.value) })} />
      <Input id="fr030-nomor_dokumen" label="No. Dokumen" maxLength={255} value={form.nomor_dokumen} error={errors.nomor_dokumen?.[0]} onChange={e => change({ nomor_dokumen: e.target.value })} />
      <Input id="fr030-nomor_revisi" label="No. Revisi" maxLength={30} value={form.nomor_revisi} error={errors.nomor_revisi?.[0]} onChange={e => change({ nomor_revisi: e.target.value })} />
      <Input id="fr030-tanggal_terbit" label="Tanggal terbit" type="date" value={form.tanggal_terbit} error={errors.tanggal_terbit?.[0]} onChange={e => change({ tanggal_terbit: e.target.value })} />
    </div>
    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Unit kerja: <strong>{unit || "Sesuai bidang akun Anda"}</strong>. Metadata dapat diisi manual. Draf boleh disimpan sebelum seluruh isian lengkap.</p>
  </Card>;
}
