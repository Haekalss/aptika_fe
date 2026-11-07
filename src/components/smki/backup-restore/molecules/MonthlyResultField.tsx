import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import type { BackupRestoreEntry } from "@/services/smki/backupRestore.types";

export function MonthlyResultField({ entry, year, errors, prefix, onChange, readOnly }: { entry: BackupRestoreEntry; year: number; errors: Record<string, string[]>; prefix: string; onChange: (entry: BackupRestoreEntry) => void; readOnly?: boolean }) {
  const label = entry.operation === "backup" ? "Backup" : "Restore";
  const month = String(entry.month).padStart(2, "0");
  const end = new Date(Date.UTC(year, entry.month, 0)).getUTCDate();
  return <fieldset disabled={readOnly} className="space-y-4 min-w-0">
    <legend className="mb-3 font-semibold text-slate-900 dark:text-white">{label}</legend>
    <FormField label={`Hasil ${label}`} error={errors[`${prefix}.result`]?.[0]}>
      <select id={`fr030-${prefix}.result`} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-violet-500" value={entry.result ?? ""} onChange={e => onChange({ ...entry, result: e.target.value as BackupRestoreEntry["result"] || null })}>
        <option value="">Belum dicatat</option><option value="berhasil">Berhasil</option><option value="gagal">Gagal</option>
      </select>
    </FormField>
    <Input id={`fr030-${prefix}.performed_on`} label={`Tanggal ${label}`} type="date" min={`${year}-${month}-01`} max={`${year}-${month}-${end}`} value={entry.performed_on ?? ""} error={errors[`${prefix}.performed_on`]?.[0]} onChange={e => onChange({ ...entry, performed_on: e.target.value || null })} />
    <Input id={`fr030-${prefix}.notes`} label={`Catatan ${label}`} textarea rows={4} maxLength={2000} value={entry.notes ?? ""} error={errors[`${prefix}.notes`]?.[0]} onChange={e => onChange({ ...entry, notes: e.target.value || null })} />
  </fieldset>;
}
