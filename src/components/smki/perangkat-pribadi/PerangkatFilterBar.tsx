"use client";

import { Plus, RotateCcw } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";

/** Molecule: toolbar search + filter + aksi (pola FilterBar FR-016). */
export default function PerangkatFilterBar({
  search,
  onSearch,
  onClearSearch,
  jenis,
  onJenis,
  onReset,
  onAdd,
  jenisOptions,
}: {
  search: string;
  onSearch: (v: string) => void;
  onClearSearch: () => void;
  jenis: string;
  onJenis: (v: string) => void;
  onReset: () => void;
  onAdd: () => void;
  jenisOptions: string[];
}) {
  const selectCls =
    "w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200";
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onClear={onClearSearch}
          placeholder="Cari nama, NIP, unit kerja, merek/tipe, atau nomor seri..."
          className="rounded-xl"
        />
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Formulir BYOD</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            Jenis Perangkat TI:
          </label>
          <select value={jenis} onChange={(e) => onJenis(e.target.value)} className={selectCls}>
            <option value="">Semua Jenis</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
        <div className="hidden md:block" />
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
