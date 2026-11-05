import Link from "next/link";
import { CheckCircle2, Plus, TriangleAlert } from "lucide-react";
import type { Fr026MissingAsset } from "@/services/smki/capacityPlanning.types";
import { fr026CategoryLabel, fr026MonthLabel } from "../form";
import { Fr026Button } from "../atoms/Fr026Button";

export function Fr026AttentionCard({
  missing,
  month,
  year,
  canManage,
  onAddLog,
}: {
  missing: Fr026MissingAsset[];
  month: number;
  year: number;
  canManage: boolean;
  onAddLog: (asset: Fr026MissingAsset) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="flex items-center gap-2">
        <TriangleAlert size={18} className="text-amber-600 dark:text-amber-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perlu dilengkapi</h2>
      </div>
      {!missing.length ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
          <p>Semua aset sudah memiliki log untuk {fr026MonthLabel(month)} {year}.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            {missing.length} log {fr026MonthLabel(month)} belum diisi
          </span>
          <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
            {missing.map((asset) => (
              <div key={`${asset.category}-${asset.asset_id}`} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">{asset.asset_name}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {fr026CategoryLabel(asset.category)} • {asset.ip_address ? `IP ${asset.ip_address}` : "IP —"}
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Lengkapi 3 metrik Current dan 3 metrik Projection untuk {fr026MonthLabel(month)} {year}.
                </p>
                {canManage && (
                  <Fr026Button className="mt-3" size="sm" onClick={() => onAddLog(asset)}>
                    <Plus size={15} />Tambah Log Bulanan
                  </Fr026Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <Link href="/smki/capacity-planning/server" className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
        Lihat matriks Server →
      </Link>
    </section>
  );
}
