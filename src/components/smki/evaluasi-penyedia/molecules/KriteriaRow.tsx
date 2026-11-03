"use client";

import type { Fr021Kriteria, Fr021Skala } from "@/services/smki/evaluasiPenyedia.types";

export default function KriteriaRow({
  kriteria,
  skala,
  value,
  empty,
  disabled,
  onChange,
}: {
  kriteria: Fr021Kriteria;
  skala: Fr021Skala[];
  value: number | null;
  empty: boolean;
  disabled?: boolean;
  onChange: (skalaId: number) => void;
}) {
  return (
    <tr className={empty ? "bg-rose-50/60 dark:bg-rose-950/30" : ""}>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-100 align-top">
        <span className="font-semibold text-slate-500 mr-2">{kriteria.urutan}.</span>
        {kriteria.nama_kriteria}
      </td>
      {skala.map((item) => (
        <td key={item.id} className="px-4 py-3 text-center">
          <label className="inline-flex items-center justify-center cursor-pointer">
            <input
              type="radio"
              name={`kriteria-${kriteria.id}`}
              value={item.id}
              checked={value === item.id}
              disabled={disabled}
              onChange={() => onChange(item.id)}
              className="accent-emerald-600 h-4 w-4"
            />
            <span className="ml-1.5 text-xs text-slate-600 dark:text-slate-300">
              {item.label}
              <span className="block text-[10px] text-slate-400">({item.skor})</span>
            </span>
          </label>
        </td>
      ))}
    </tr>
  );
}
