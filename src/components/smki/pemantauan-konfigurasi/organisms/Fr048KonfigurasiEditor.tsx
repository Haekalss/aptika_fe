"use client";

import Fr048ObjectSection from "../molecules/Fr048ObjectSection";
import { hitungProgres } from "../form";
import type { KonfigurasiRowState } from "../types";

export interface KonfigurasiSectionState {
  objekId: number;
  objekNama: string;
  rows: KonfigurasiRowState[];
}

/** Step 2 — Editor Daftar Konfigurasi (UC-02, UC-03). */
export default function Fr048KonfigurasiEditor({
  sections,
  readonly = false,
  onRowChange,
  onRowRemove,
  onAddRow,
}: {
  sections: KonfigurasiSectionState[];
  readonly?: boolean;
  onRowChange: (key: string, patch: Partial<KonfigurasiRowState>) => void;
  onRowRemove: (key: string) => void;
  onAddRow: (objekId: number) => void;
}) {
  const allRows = sections.flatMap((s) => s.rows);
  const { total, terisi, persen } = hitungProgres(allRows);

  return (
    <div className="flex flex-col gap-3">
      {/* Progres */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Progres Pengisian</span>
            <span className="text-[10px] font-extrabold text-violet-700 dark:text-violet-300 tabular-nums">{terisi}/{total} baris ({persen}%)</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${persen}%` }} />
          </div>
        </div>
      </div>

      {sections.map((s) => (
        <Fr048ObjectSection
          key={s.objekId}
          objekNama={s.objekNama}
          rows={s.rows}
          readonly={readonly}
          onRowChange={onRowChange}
          onRowRemove={onRowRemove}
          onAddRow={() => onAddRow(s.objekId)}
        />
      ))}
    </div>
  );
}
