"use client";

import { KeyRound } from "lucide-react";
import type { Errors, ReviewInput } from "./model";
import type { MasterOption } from "./useMasters";
import { control } from "./ui";

interface Props {
  input: ReviewInput;
  employees: MasterOption[];
  errors: Errors;
  onChange: (values: Partial<ReviewInput>) => void;
}

const signatories = [
  { name: "preparedBy", id: "preparedById", nip: "preparedByNip", label: "Dibuat Oleh" },
  { name: "acknowledgedBy", id: "acknowledgedById", nip: "acknowledgedByNip", label: "Mengetahui" },
] as const;

export default function ReviewSignatories({ input, employees, errors, onChange }: Props) {
  return <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-5">
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mb-4">
      <h3 className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-300"><KeyRound size={17} aria-hidden="true"/> Penanda Tangan &amp; Spesimen TTE</h3>
      <p className="text-[11px] text-slate-500 sm:max-w-xs">Pilih dari master pegawai. Identitas penanda tangan tercantum di dalam kotak spesimen TTE.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {signatories.map((signer, index) => <fieldset key={signer.name} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
        <legend className="px-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">{index + 1}. {signer.label}<span className="text-red-500" aria-hidden="true"> *</span><span className="sr-only"> Pegawai wajib dipilih sebelum Simpan</span></legend>
        <label htmlFor={`review-${signer.id}`} className="sr-only">Pegawai {signer.label}</label>
        <select id={`review-${signer.id}`} value={input[signer.id]} className={control} aria-invalid={!!(errors[signer.id] || errors[signer.name] || errors[signer.nip])} aria-describedby={[signer.id, signer.name, signer.nip].filter(key => errors[key]).map(key => `review-${key}-error`).join(" ") || undefined} onChange={event => {
          const employee = employees.find(item => item.id === event.target.value);
          onChange({ [signer.id]: employee?.id ?? "", [signer.name]: employee?.name ?? "", [signer.nip]: employee?.nip ?? "" });
        }}>
          <option value="">— Pilih dari Master Pegawai —</option>
          {input[signer.id] && !employees.some(employee => employee.id === input[signer.id]) && <option value={input[signer.id]}>{input[signer.name]} (referensi lama)</option>}
          {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
        </select>
        {errors[signer.id] && <p id={`review-${signer.id}-error`} role="alert" className="text-[11px] text-red-600">{errors[signer.id]}</p>}
        {errors[signer.name] && <p id={`review-${signer.name}-error`} role="alert" className="text-[11px] text-red-600">{errors[signer.name]}</p>}
        {errors[signer.nip] && <p id={`review-${signer.nip}-error`} role="alert" className="text-[11px] text-red-600">{errors[signer.nip]}</p>}
      </fieldset>)}
    </div>
  </div>;
}
