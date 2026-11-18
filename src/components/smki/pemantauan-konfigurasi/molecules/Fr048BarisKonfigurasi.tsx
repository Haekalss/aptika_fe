"use client";

import { memo } from "react";
import { Trash2, Lock } from "lucide-react";
import { KESESUAIAN_MAP } from "../constants";
import type { KonfigurasiRowState } from "../types";

interface Props {
  row: KonfigurasiRowState;
  readonly?: boolean;
  onChange: (key: string, patch: Partial<KonfigurasiRowState>) => void;
  onRemove: (key: string) => void;
}

function Fr048BarisKonfigurasiInner({ row, readonly = false, onChange, onRemove }: Props) {
  const kesesuaian = row.kesesuaian ? KESESUAIAN_MAP[row.kesesuaian] : null;
  const inputBase =
    "w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5">
      {/* Nama Konfigurasi */}
      <div className="lg:col-span-3 min-w-0">
        <span className="lg:hidden text-[9px] font-bold uppercase text-slate-400">Nama Konfigurasi</span>
        <div className="relative">
          <input
            value={row.namaKonfigurasi}
            readOnly={row.isStandar || readonly}
            disabled={row.isStandar || readonly}
            onChange={(e) => onChange(row.key, { namaKonfigurasi: e.target.value })}
            placeholder="Nama konfigurasi..."
            aria-label="Nama Konfigurasi"
            className={inputBase}
          />
          {row.isStandar && <Lock size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        </div>
      </div>
      {/* Nilai aktual */}
      <div className="lg:col-span-2">
        <span className="lg:hidden text-[9px] font-bold uppercase text-slate-400">Nilai Aktual</span>
        <input
          value={row.nilaiAktual}
          readOnly={readonly}
          disabled={readonly}
          onChange={(e) => onChange(row.key, { nilaiAktual: e.target.value })}
          placeholder="Nilai..."
          aria-label="Nilai aktual"
          className={inputBase}
        />
      </div>
      {/* Nilai standar */}
      <div className="lg:col-span-2">
        <span className="lg:hidden text-[9px] font-bold uppercase text-slate-400">Nilai Standar</span>
        <input
          value={row.nilaiStandar ?? "—"}
          readOnly
          disabled
          aria-label="Nilai standar"
          title={row.nilaiStandar ? `Nilai standar: ${row.nilaiStandar}` : "Baris manual (tanpa nilai standar)"}
          className={`${inputBase} italic text-slate-400`}
        />
      </div>
      {/* Kesesuaian */}
      <div className="lg:col-span-2">
        <span className="lg:hidden text-[9px] font-bold uppercase text-slate-400">Kesesuaian</span>
        {row.isStandar ? (
          <div className="h-9 flex items-center">
            {kesesuaian ? (
              <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md border ${kesesuaian.badgeClass}`}>
                {kesesuaian.label}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 italic">Belum diperiksa</span>
            )}
          </div>
        ) : (
          <select
            value={row.kesesuaian ?? ""}
            disabled={readonly}
            onChange={(e) => onChange(row.key, { kesesuaian: (e.target.value || null) as KonfigurasiRowState["kesesuaian"] })}
            aria-label="Kesesuaian"
            className={inputBase}
          >
            <option value="">Pilih...</option>
            <option value="sesuai">Sesuai</option>
            <option value="tidak_sesuai">Tidak Sesuai</option>
          </select>
        )}
      </div>
      {/* Keterangan */}
      <div className="lg:col-span-2">
        <span className="lg:hidden text-[9px] font-bold uppercase text-slate-400">Keterangan</span>
        <input
          value={row.keterangan}
          readOnly={readonly && row.kesesuaian !== "tidak_sesuai"}
          disabled={readonly && row.kesesuaian !== "tidak_sesuai"}
          required={row.kesesuaian === "tidak_sesuai"}
          onChange={(e) => onChange(row.key, { keterangan: e.target.value })}
          placeholder={row.kesesuaian === "tidak_sesuai" ? "Wajib (tidak sesuai)..." : "Keterangan..."}
          aria-label="Keterangan"
          className={`${inputBase} ${row.kesesuaian === "tidak_sesuai" && !row.keterangan.trim() ? "border-amber-400" : ""}`}
        />
      </div>
      {/* Hapus */}
      <div className="lg:col-span-1 flex lg:justify-center items-start">
        {!readonly && !row.isStandar ? (
          <button
            type="button"
            onClick={() => onRemove(row.key)}
            aria-label="Hapus baris"
            title="Hapus baris"
            className="h-9 w-9 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <span className="h-9 w-9 hidden lg:block" />
        )}
      </div>
    </div>
  );
}

export default memo(Fr048BarisKonfigurasiInner);
