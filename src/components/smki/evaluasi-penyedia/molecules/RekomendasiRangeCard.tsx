"use client";

import type { Fr021Rekomendasi } from "@/services/smki/evaluasiPenyedia.types";

export default function RekomendasiRangeCard({
  rekomendasi,
  active,
}: {
  rekomendasi: Fr021Rekomendasi;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-xs transition-colors ${
        active
          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-600"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
      }`}
    >
      <p className="font-bold">
        {rekomendasi.kategori}
        {active ? " (aktif)" : ""}
      </p>
      <p className="mt-0.5">
        {rekomendasi.nilai_min} – {rekomendasi.nilai_max} poin
      </p>
      <p className="mt-1 text-[11px] opacity-80">{rekomendasi.keterangan}</p>
    </div>
  );
}
