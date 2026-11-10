import Link from "next/link";
import type { Fr026ServerComparison } from "@/services/smki/capacityPlanning.types";
import { fr026Number, fr026Signed } from "../form";

export function Fr026ServerComparisonCard({
  rows,
  periodLabel,
  year,
}: {
  rows: Fr026ServerComparison[];
  periodLabel: string;
  year: number;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current vs Projection · Server</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Storage (GB), {periodLabel}. Projection adalah estimasi pengguna.
          </p>
        </div>
        <Link href={`/smki/capacity-planning/server?year=${year}`} className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
          Lihat matriks Server →
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th scope="col" className="rounded-l-lg px-4 py-3 font-semibold">Perangkat / Aset ID</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Current</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Projection</th>
              <th scope="col" className="rounded-r-lg px-4 py-3 text-right font-semibold">Selisih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.asset_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{row.asset_name}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                  {row.has_log ? `${fr026Number(row.current_storage_gb)} GB` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                  {row.has_log ? `${fr026Number(row.projection_storage_gb)} GB` : "—"}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${row.has_log ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400"}`}>
                  {row.has_log ? fr026Signed(row.difference_gb) : "Belum diisi"}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Belum ada aset Server. Tambahkan aset pada tab Server.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
