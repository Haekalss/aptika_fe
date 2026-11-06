import Link from "next/link";
import { Network } from "lucide-react";
import type { Fr026NetworkUsage } from "@/services/smki/capacityPlanning.types";
import { fr026Number } from "../form";

export function Fr026NetworkUsageCard({ rows, year }: { rows: Fr026NetworkUsage[]; year: number }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pemakaian Network</h2>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <Network size={18} />
        </span>
      </div>
      <div className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.asset_id}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{row.asset_name}</span>
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {row.has_log
                  ? `${fr026Number(row.max_usage_mbps)} / ${fr026Number(row.capacity_mbps)} Mbps • ${fr026Number(row.usage_pct, 2)}%`
                  : "Belum diisi"}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-400"
                style={{ width: `${Math.max(0, Math.min(100, row.usage_pct ?? 0))}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada aset Network. Tambahkan aset pada tab Network.</p>}
      </div>
      <Link href={`/smki/capacity-planning/network?year=${year}`} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
        Lihat matriks Network →
      </Link>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Pemakaian bandwidth berbeda dari capaian SLA.</p>
    </section>
  );
}
