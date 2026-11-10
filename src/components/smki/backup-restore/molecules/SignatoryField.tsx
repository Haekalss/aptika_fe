import FormField from "@/components/ui/FormField";
import type { TteOption } from "@/services/tteService";
import type { BackupRestoreReport, BackupRestoreSignatory } from "@/services/smki/backupRestore.types";
import { SignatorySpecimen } from "./SignatorySpecimen";

export function SignatoryField({ role, value, onChange, options, saved, error }: { role: BackupRestoreSignatory; value: number | null; onChange: (value: number | null) => void; options: TteOption[]; saved?: BackupRestoreReport; error?: string }) {
  const prefix = role === "pelaksana" ? "pelaksana" : "penanggung_jawab";
  const label = role === "pelaksana" ? "Pelaksana" : "Penanggung Jawab";
  const historical = Boolean(saved?.[`${prefix}_nama`] && value === saved?.[`${prefix}_pegawai_id`]);
  const selected = options.find(option => option.id === value);
  const name = historical ? saved?.[`${prefix}_nama`] : selected?.nama;
  const nip = historical ? saved?.[`${prefix}_nip`] : selected?.nip;
  const jabatan = historical ? saved?.[`${prefix}_jabatan`] : selected?.jabatan;
  return <div className="space-y-4">
    <FormField label={label} error={error}>
      <select id={`fr030-${prefix}_pegawai_id`} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-violet-500" value={value ?? ""} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">{historical ? `${name} (snapshot historis)` : "Belum dipilih"}</option>
        {value && !selected && <option value={value}>{name || "Pegawai historis"} (snapshot)</option>}
        {options.map(option => <option key={option.id} value={option.id}>{option.label || `${option.nama} · ${option.nip || "Tanpa NIP"}`}</option>)}
      </select>
    </FormField>
    {name && <p className="text-sm text-slate-700 dark:text-slate-200"><strong>{name}</strong><br />NIP: {nip || "Belum tersedia"}<br />{jabatan || "Jabatan belum tersedia"}{historical && <span className="block mt-1 text-xs">Identitas tersimpan; perubahan master tidak mengganti dokumen ini.</span>}</p>}
    {(historical || value) && <SignatorySpecimen key={`${role}:${historical ? `snapshot-${saved?.id}-${saved?.version}` : value}`} role={role} pegawaiId={value} reportId={historical ? saved?.id : undefined} />}
  </div>;
}
