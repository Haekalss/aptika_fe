import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { risikoLabel, statusLabel, type StatusPerubahan, type TingkatRisiko } from "@/services/smki/perubahanIt";

export const STATUS_TONE: Record<StatusPerubahan, string> = {
  draft:
    "bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  diajukan:
    "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  dikembalikan:
    "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
  diterima:
    "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  ditolak:
    "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  disetujui:
    "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  dilaksanakan:
    "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
};

const RISIKO_TONE: Record<TingkatRisiko, string> = {
  malapetaka: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  sangat_berat: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900",
  berat: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
  agak_berat: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900",
  tidak_berat: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const base = "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap";

export function StatusBadge({ status }: { status: StatusPerubahan }) {
  return <span className={`${base} ${STATUS_TONE[status] ?? STATUS_TONE.draft}`}>{statusLabel(status)}</span>;
}

export function RisikoBadge({ tingkat }: { tingkat: TingkatRisiko | null }) {
  if (!tingkat) return <span className="text-slate-500">-</span>;
  const Icon = tingkat === "tidak_berat" || tingkat === "agak_berat" ? ShieldCheck : ShieldAlert;
  return (
    <span className={`${base} ${RISIKO_TONE[tingkat]}`}>
      <Icon size={12} aria-hidden="true" />
      {risikoLabel(tingkat)}
    </span>
  );
}
