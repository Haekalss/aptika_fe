import type { Fr025Option } from "@/services/smki/removableMedia.types";
import { Fr025Field, fr025Control } from "./Fr025Field";

export function MasterChoice({ id, label, options, selectedId, name, onChange, error, disabled, compact }: {
  id: string; label: string; options: Fr025Option[]; selectedId: number | null; name: string;
  onChange: (id: number | null, name: string) => void; error?: string; disabled?: boolean; compact?: boolean;
}) {
  const choices = selectedId && !options.some((option) => option.id === selectedId) ? [...options, { id: selectedId, name }] : options;
  return <div className="space-y-2">
    <Fr025Field id={id} label={label} error={selectedId ? error : undefined} compact={compact}>
      <select className={fr025Control} disabled={disabled} value={selectedId ?? ""} onChange={(event) => {
        const option = choices.find((value) => value.id === Number(event.target.value));
        onChange(option?.id ?? null, option?.name ?? name);
      }}>
        <option value="">Isi manual</option>
        {choices.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </Fr025Field>
    {!selectedId && <Fr025Field id={`${id}-manual`} label={`${label} (manual)`} error={error} compact>
      <input className={fr025Control} value={name} disabled={disabled} placeholder={label} maxLength={255} onChange={(event) => onChange(null, event.target.value)} />
    </Fr025Field>}
  </div>;
}
