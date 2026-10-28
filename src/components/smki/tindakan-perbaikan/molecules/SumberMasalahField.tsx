"use client";

import Input from "@/components/ui/Input";
import type { Fr009SectionProps } from "../types";

export default function SumberMasalahField({ form, lookup, errors, onChange }: Fr009SectionProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-slate-800 dark:text-slate-100">Sumber Masalah / Potensial Masalah</legend>
      <p className="text-xs text-slate-500">Pilih sumber yang sesuai. Lebih dari satu sumber dapat dipilih.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lookup.sources.map((source) => <label key={source.code} className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs cursor-pointer">
          <input type="checkbox" checked={form.sumber_codes.includes(source.code)} onChange={(event) => onChange({ sumber_codes: event.target.checked ? [...form.sumber_codes, source.code] : form.sumber_codes.filter((code) => code !== source.code) })} className="accent-emerald-600" />
          <span>{source.label}</span>
        </label>)}
      </div>
      {errors.sumber_codes && <p role="alert" className="text-xs text-rose-600">{errors.sumber_codes[0]}</p>}
      {form.sumber_codes.includes("lainnya") && <Input label="Penjelasan sumber lainnya" value={form.sumber_lainnya} onChange={(event) => onChange({ sumber_lainnya: event.target.value })} error={errors.sumber_lainnya?.[0]} className="rounded-xl" />}
    </fieldset>
  );
}
