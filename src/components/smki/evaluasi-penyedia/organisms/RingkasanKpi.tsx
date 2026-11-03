"use client";

import type { Fr021ListSummary } from "@/services/smki/evaluasiPenyedia.types";

export default function RingkasanKpi({
  summary,
}: {
  summary?: Fr021ListSummary;
}) {
  const cards: { label: string; value: number | undefined }[] = [
    { label: "Total", value: summary?.total },
    { label: "Draft", value: summary?.draft },
    { label: "Menunggu Persetujuan", value: summary?.diajukan },
    { label: "Perlu Revisi", value: summary?.revisi },
    { label: "Selesai", value: summary?.selesai },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
        >
          <p className="text-xs text-slate-500">{card.label}</p>
          <p className="text-2xl font-bold mt-2">{card.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
