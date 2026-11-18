"use client";

import { Plus, Server } from "lucide-react";
import Fr048BarisKonfigurasi from "./Fr048BarisKonfigurasi";
import type { KonfigurasiRowState } from "../types";

/** Satu section per objek: header + baris konfigurasi + tambah baris manual. */
export default function Fr048ObjectSection({
  objekNama,
  rows,
  readonly = false,
  onRowChange,
  onRowRemove,
  onAddRow,
}: {
  objekNama: string;
  rows: KonfigurasiRowState[];
  readonly?: boolean;
  onRowChange: (key: string, patch: Partial<KonfigurasiRowState>) => void;
  onRowRemove: (key: string) => void;
  onAddRow: () => void;
}) {
  const filled = rows.filter((r) => r.namaKonfigurasi.trim() && String(r.nilaiAktual).trim()).length;

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <Server size={16} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{objekNama}</h4>
            <p className="text-[10px] text-slate-500">{filled}/{rows.length} baris terisi</p>
          </div>
        </div>
        {!readonly && (
          <button
            type="button"
            onClick={onAddRow}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-bold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
          >
            <Plus size={13} /> Tambah Baris
          </button>
        )}
      </header>
      <div className="p-3 flex flex-col gap-2">
        {/* Header kolom (desktop) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <span className="col-span-3">Nama Konfigurasi</span>
          <span className="col-span-2">Nilai Aktual</span>
          <span className="col-span-2">Nilai Standar</span>
          <span className="col-span-2">Kesesuaian</span>
          <span className="col-span-2">Keterangan</span>
          <span className="col-span-1 text-center">Aksi</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic py-4 text-center">
            Belum ada baris konfigurasi. Klik “Tambah Baris” untuk menambahkan secara manual.
          </p>
        ) : (
          rows.map((row) => (
            <Fr048BarisKonfigurasi key={row.key} row={row} readonly={readonly} onChange={onRowChange} onRemove={onRowRemove} />
          ))
        )}
      </div>
    </section>
  );
}
