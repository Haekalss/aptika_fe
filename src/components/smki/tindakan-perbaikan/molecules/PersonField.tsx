"use client";

import { useId } from "react";
import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";

export const selectClass = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none disabled:opacity-60";

export default function PersonField({ label, id, name, options, onChange, error, required = false }: {
  label: string;
  id: number | null;
  name: string;
  options: { id: number; name: string; label?: string }[];
  onChange: (id: number | null, name: string) => void;
  error?: string;
  required?: boolean;
}) {
  const inputId = useId();
  const selectedExists = options.some((option) => option.id === id);
  return (
    <div className="space-y-2">
      <FormField label={label} required={required} error={error}>
        <select id={inputId} aria-label={label} value={id ?? ""} onChange={(event) => {
          const selected = options.find((option) => option.id === Number(event.target.value));
          onChange(selected?.id ?? null, selected?.name ?? "");
        }} className={selectClass}>
          <option value="">Isi nama manual / belum dipilih</option>
          {id !== null && !selectedExists && <option value={id}>{name || `Referensi #${id}`}</option>}
          {options.map((option) => <option key={option.id} value={option.id}>{option.label ?? option.name}</option>)}
        </select>
      </FormField>
      {id === null && <Input aria-label={`${label} (nama manual)`} value={name} onChange={(event) => onChange(null, event.target.value)} placeholder="Nama lengkap" className="rounded-xl focus:border-emerald-600 focus:ring-emerald-600" />}
    </div>
  );
}
