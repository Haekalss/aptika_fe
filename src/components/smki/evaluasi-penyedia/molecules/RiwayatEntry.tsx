"use client";

import { FR021_AKSI_LABEL } from "../constants";
import type { Fr021Log } from "@/services/smki/evaluasiPenyedia.types";

export default function RiwayatEntry({
  log,
  onOpenSnapshot,
}: {
  log: Fr021Log;
  onOpenSnapshot: (log: Fr021Log) => void;
}) {
  const hasSnapshot = log.aksi === "diajukan" || log.aksi === "diajukan_ulang";

  return (
    <li className="relative pl-6 pb-4 last:pb-0">
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-emerald-50 dark:ring-emerald-950/40" />
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {FR021_AKSI_LABEL[log.aksi] ?? log.aksi}
            <span className="ml-2 text-xs font-normal text-slate-500">
              (siklus {log.siklus})
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            {new Date(log.created_at).toLocaleString("id-ID")}
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Oleh: {log.user?.name ?? "—"}
        </p>
        {log.total_nilai !== null && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Total: <span className="font-semibold">{log.total_nilai}</span>
            {log.rekomendasi?.kategori ? ` · ${log.rekomendasi.kategori}` : ""}
          </p>
        )}
        {log.catatan && (
          <p className="mt-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2 text-xs text-rose-800 dark:text-rose-200">
            {log.catatan}
          </p>
        )}
        {hasSnapshot && (
          <button
            type="button"
            onClick={() => onOpenSnapshot(log)}
            className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
          >
            Lihat nilai per kriteria
          </button>
        )}
      </div>
    </li>
  );
}
