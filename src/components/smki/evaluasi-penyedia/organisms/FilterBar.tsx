"use client";

import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import { FR021_SIFAT_PEKERJAAN_OPTIONS } from "../constants";

const SELECT_CLASS =
  "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "draft", label: "Draft" },
  { value: "diajukan", label: "Menunggu Persetujuan" },
  { value: "revisi", label: "Perlu Revisi" },
  { value: "selesai", label: "Selesai" },
];

export default function FilterBar({
  search,
  sifat,
  status,
  onSearchChange,
  onSifatChange,
  onStatusChange,
  onReset,
}: {
  search: string;
  sifat: string;
  status: string;
  onSearchChange: (value: string) => void;
  onSifatChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
      <SearchBar
        aria-label="Cari nama penyedia atau nomor kontrak"
        placeholder="Cari nama penyedia atau nomor kontrak..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange("")}
      />
      <select
        aria-label="Filter sifat pekerjaan"
        value={sifat}
        onChange={(event) => onSifatChange(event.target.value)}
        className={`${SELECT_CLASS} md:max-w-48`}
      >
        <option value="">Semua sifat pekerjaan</option>
        {FR021_SIFAT_PEKERJAAN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter status evaluasi"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className={`${SELECT_CLASS} md:max-w-48`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset filter
      </Button>
    </div>
  );
}
