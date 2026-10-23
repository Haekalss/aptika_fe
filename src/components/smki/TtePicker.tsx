"use client";

import { useEffect, useState } from "react";
import { PenTool, RefreshCw } from "lucide-react";
import { getTteOptions, TteOption } from "@/services/tteService";

interface Props {
  /** Label di atas dropdown, mis. "Penanda Tangan". */
  label?: string;
  /** Nilai awal (key "master:1" / "pegawai:2"). */
  value?: string | null;
  onChange: (option: TteOption | null) => void;
  /** Sembunyikan saat mencetak. */
  className?: string;
}

/**
 * Pemilih penanda tangan untuk halaman cetak / unduh.
 *
 * Menampilkan master spesimen TTE lebih dulu, lalu pegawai yang belum
 * punya spesimen. Tidak perlu mengetik NIP — cukup pilih dari daftar.
 */
export default function TtePicker({ label = "Penanda Tangan", value, onChange, className }: Props) {
  const [options, setOptions] = useState<TteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(value ?? "");

  const load = async () => {
    setLoading(true);
    try {
      const items = await getTteOptions();
      setOptions(items);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (value !== undefined) setSelected(value ?? "");
  }, [value]);

  const handleChange = (key: string) => {
    setSelected(key);
    const found = options.find((o) => o.key === key) ?? null;
    onChange(found);
  };

  const masterCount = options.filter((o) => o.source === "master").length;
  const pegawaiCount = options.filter((o) => o.source === "pegawai").length;

  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <PenTool
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={selected}
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-60"
          >
            <option value="">
              {loading ? "Memuat daftar…" : "— Ikuti data dokumen (otomatis) —"}
            </option>
            {masterCount > 0 && (
              <optgroup label="Spesimen TTE (Data Master)">
                {options
                  .filter((o) => o.source === "master")
                  .map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            )}
            {pegawaiCount > 0 && (
              <optgroup label="Daftar Pegawai">
                {options
                  .filter((o) => o.source === "pegawai")
                  .map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          title="Muat ulang daftar"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
