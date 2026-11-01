"use client";

import RekomendasiRangeCard from "../molecules/RekomendasiRangeCard";
import type { Fr021Evaluasi, Fr021Master } from "@/services/smki/evaluasiPenyedia.types";

export default function HasilSection({
  record,
  master,
}: {
  record: Fr021Evaluasi | null | undefined;
  master: Fr021Master;
}) {
  const total = record?.total_nilai ?? null;
  const rekomendasi = record?.rekomendasi ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Nilai</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">
            {total === null ? "—" : total}
          </p>
          <p className="text-xs text-slate-400">dari 400 poin</p>
        </div>
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Rekomendasi Pekerjaan
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-300">
            {rekomendasi?.kategori ?? "—"}
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            {rekomendasi?.keterangan ?? "Hitung nilai terlebih dahulu"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {master.rekomendasi.map((item) => (
          <RekomendasiRangeCard
            key={item.id}
            rekomendasi={item}
            active={rekomendasi?.id === item.id}
          />
        ))}
      </div>
    </div>
  );
}
