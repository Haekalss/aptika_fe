"use client";

import { formatWaktu, hasilLabel, AKSI_LABEL } from "../constants";
import type { RiwayatItemDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const AKSI_DOT: Record<RiwayatItemDto["aksi"], string> = {
  dibuat: "bg-slate-400",
  diajukan: "bg-blue-500",
  diajukan_ulang: "bg-indigo-500",
  dikembalikan: "bg-amber-500",
  disetujui: "bg-emerald-500",
  diperbarui: "bg-violet-500",
};

export default function Fr048TimelineItem({ item }: { item: RiwayatItemDto }) {
  return (
    <li className="relative pl-6 pb-4 last:pb-0">
      {/* Garis vertikal */}
      <span className="absolute left-[5px] top-3 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
      <span className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow ${AKSI_DOT[item.aksi] ?? "bg-slate-400"}`} />
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">{AKSI_LABEL[item.aksi]}</p>
          <span className="text-[9px] font-bold text-slate-400">Siklus #{item.siklus}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {item.pelaku} · {formatWaktu(item.waktu)}
          {item.hasil ? ` · ${hasilLabel(item.hasil)}` : ""}
        </p>
        {item.catatan && <p className="mt-1.5 text-[10px] text-slate-600 dark:text-slate-300 border-l-2 border-slate-200 dark:border-slate-700 pl-2 whitespace-pre-wrap">{item.catatan}</p>}
      </div>
    </li>
  );
}
