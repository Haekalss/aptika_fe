"use client";

import { Search, X } from "lucide-react";
import { PERIODE_OPTIONS } from "../constants";
import type { PemantauanStatus, OptionDto } from "@/services/smki/pemantauanKonfigurasiService.types";

export interface Fr048FilterValue {
  q: string;
  periode: number | "";
  jenisId: number | "";
  status: PemantauanStatus | "";
}

export default function Fr048FilterBar({
  value,
  jenisOptions,
  onChange,
}: {
  value: Fr048FilterValue;
  jenisOptions: OptionDto[];
  onChange: (v: Fr048FilterValue) => void;
}) {
  const set = (patch: Partial<Fr048FilterValue>) => onChange({ ...value, ...patch });
  const hasFilter = value.q || value.periode !== "" || value.jenisId !== "" || value.status !== "";

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Cari nama objek atau no. formulir..."
          aria-label="Cari pemantauan"
          className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {value.q && (
          <button type="button" aria-label="Bersihkan pencarian" onClick={() => set({ q: "" })} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      <select
        value={value.periode}
        onChange={(e) => set({ periode: e.target.value === "" ? "" : Number(e.target.value) })}
        aria-label="Filter periode"
        className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value="">Semua Periode</option>
        {PERIODE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <select
        value={value.jenisId}
        onChange={(e) => set({ jenisId: e.target.value === "" ? "" : Number(e.target.value) })}
        aria-label="Filter jenis konfigurasi"
        className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value="">Semua Jenis</option>
        {jenisOptions.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
      </select>
      {hasFilter && (
        <button
          type="button"
          onClick={() => onChange({ q: "", periode: "", jenisId: "", status: "" })}
          className="h-9 px-3 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 inline-flex items-center gap-1"
        >
          <X size={12} /> Reset
        </button>
      )}
    </div>
  );
}
