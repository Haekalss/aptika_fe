"use client";

import { History } from "lucide-react";
import Fr048TimelineItem from "../molecules/Fr048TimelineItem";
import type { RiwayatItemDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Timeline riwayat append-only (UC-07): dibuat → diajukan → dikembalikan/disetujui → diulang. */
export default function Fr048Timeline({ items }: { items: RiwayatItemDto[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1"><History size={14} /> Riwayat</h3>
        <p className="text-[11px] text-slate-400 italic">Belum ada riwayat.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
      <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
        <History size={14} className="text-violet-600 dark:text-violet-400" /> Riwayat Pengajuan
        <span className="text-[9px] font-bold text-slate-400">(append-only)</span>
      </h3>
      <ol className="flex flex-col">
        {[...items].reverse().map((item) => (
          <Fr048TimelineItem key={item.id} item={item} />
        ))}
      </ol>
    </div>
  );
}
