"use client";

import { useEffect, useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { getAdminOptions } from "@/services/smki/pemantauanKonfigurasiService";
import type { AdminOptionDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Dropdown Admin peninjau — dari lookup khusus (admin aktif), pelaksana dikecualikan. */
export default function Fr048AdminSelect({
  value,
  excludeId,
  onChange,
  required = true,
}: {
  value: number | null;
  excludeId?: number;
  onChange: (id: number | null) => void;
  required?: boolean;
}) {
  const [options, setOptions] = useState<AdminOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAdminOptions()
      .then((data) => mounted && setOptions(data.filter((a) => a.id !== excludeId)))
      .catch(() => mounted && setError("Gagal memuat daftar admin."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [excludeId]);

  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Admin yang Mengetahui {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="relative">
        <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          aria-label="Pilih admin"
          disabled={loading}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
        >
          <option value="">{loading ? "Memuat daftar admin..." : "Pilih Admin..."}</option>
          {options.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}{a.position ? ` — ${a.position}` : ""}
            </option>
          ))}
        </select>
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
      </div>
      {error && <span className="mt-1 block text-[11px] font-medium text-rose-600" role="alert">{error}</span>}
      <span className="mt-1 block text-[10px] text-slate-400">Hanya admin aktif yang tampil. Admin yang sama dengan Pelaksana tidak dapat dipilih.</span>
    </label>
  );
}
