import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { BackupRestoreReport, Fr030FormState } from "@/services/smki/backupRestore.types";
import { SignatoryField } from "../molecules/SignatoryField";
import { useFr030Pegawai } from "../hooks/useFr030Queries";

export function ReportSignatories({ form, change, saved, errors }: { form: Fr030FormState; change: (changes: Partial<Fr030FormState>) => void; saved?: BackupRestoreReport; errors: Record<string, string[]> }) {
  const options = useFr030Pegawai();
  return <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">3. Pelaksana & Penanggung Jawab</h2>}>
    <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">Sumber identitas: master Pegawai. Spesimen bukan persetujuan akun atau tanda tangan elektronik tersertifikasi.</p>
    {options.isLoading && <p role="status">Memuat master pegawai…</p>}
    {options.isError && <p role="alert">Master pegawai tidak dapat dimuat. <Button variant="outline" type="button" onClick={() => options.refetch()}>Coba lagi</Button></p>}
    <div className="grid gap-6 md:grid-cols-2">
      <SignatoryField role="pelaksana" value={form.pelaksana_pegawai_id} options={options.data ?? []} onChange={value => change({ pelaksana_pegawai_id: value })} saved={saved} error={errors.pelaksana_pegawai_id?.[0]} />
      <SignatoryField role="penanggung-jawab" value={form.penanggung_jawab_pegawai_id} options={options.data ?? []} onChange={value => change({ penanggung_jawab_pegawai_id: value })} saved={saved} error={errors.penanggung_jawab_pegawai_id?.[0]} />
    </div>
  </Card>;
}
