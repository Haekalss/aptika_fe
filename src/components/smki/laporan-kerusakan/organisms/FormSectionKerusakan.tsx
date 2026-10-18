import React, { memo } from "react";

interface FormSectionKerusakanProps {
  jenisKerusakan: string;
  penyebab: string;
  onChange: (field: string, value: string) => void;
}

export const FormSectionKerusakan = memo(({
  jenisKerusakan,
  penyebab,
  onChange,
}: FormSectionKerusakanProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">
          2
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Uraian & Gejala Kerusakan
        </h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Jenis / Gejala Kerusakan <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Uraikan kondisi aset, gejala kerusakan, indikator alarm perangkat..."
          value={jenisKerusakan}
          onChange={(e) => onChange("jenis_kerusakan", e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Dugaan Penyebab
        </label>
        <textarea
          rows={2}
          placeholder="Diduga terjadi fluktuasi listrik, modul aus, degradasi disk RAID, suhu ruangan..."
          value={penyebab}
          onChange={(e) => onChange("penyebab", e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
    </div>
  );
});

FormSectionKerusakan.displayName = "FormSectionKerusakan";
