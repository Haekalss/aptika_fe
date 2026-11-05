"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Info, Plus } from "lucide-react";
import type { Fr026Asset, Fr026Category } from "@/services/smki/capacityPlanning.types";
import { fr026Error } from "@/services/smki/capacityPlanningService";
import { fr026CategoryLabel, fr026MonthLabel, fr026YearOptions } from "../form";
import { useFr026Dashboard } from "../hooks/useFr026Queries";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Feedback } from "../molecules/Fr026Feedback";
import { Fr026Tabs } from "../organisms/Fr026Tabs";
import { Fr026DocumentMetaCard } from "../organisms/Fr026DocumentMetaCard";
import { Fr026AssetMatrix } from "../organisms/Fr026AssetMatrix";
import { Fr026AssetModal } from "../organisms/Fr026AssetModal";
import { Fr026DeleteDialog } from "../organisms/Fr026DeleteDialog";
import { Fr026ServerLogModal } from "../organisms/Fr026ServerLogModal";
import { Fr026NetworkLogModal } from "../organisms/Fr026NetworkLogModal";

const exportLinkClass =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const selectClass =
  "block h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-[#0b1630] dark:text-white";

export function Fr026MatrixTemplate({ category, initialYear, initialMonth }: { category: Fr026Category; initialYear?: number; initialMonth?: number }) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth() + 1);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [logAssetId, setLogAssetId] = useState<number | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<Fr026Asset | null>(null);
  const query = useFr026Dashboard(year, month);
  const data = query.data;
  const assets = data?.assets ?? [];
  const categoryAssets = assets.filter((asset) => asset.category === category);
  const label = fr026CategoryLabel(category);
  const canManage = data?.permissions.can_manage ?? false;

  const openLog = (asset: Fr026Asset) => setLogAssetId(asset.id);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">FR-026 / Capacity Planning</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Formulir Capacity Planning</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pantau kapasitas aset dan catat hasil pemantauan bulanan dalam matriks tahunan.
          </p>
        </div>
        <Link href={`/smki/capacity-planning/export?year=${year}&month=${month}`} className={exportLinkClass}>
          <Download size={16} />Ekspor Laporan
        </Link>
      </section>

      <Fr026Tabs
        active={category}
        serverCount={data?.summary.server_count}
        networkCount={data?.summary.network_count}
      />

      {query.isPending ? (
        <Fr026Feedback message={`Memuat matriks ${label}...`} />
      ) : query.isError ? (
        <Fr026Feedback message={fr026Error(query.error).message} error onRetry={() => void query.refetch()} />
      ) : data ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
            <Fr026DocumentMetaCard category={category} meta={data.meta} />
          </section>

          {category === "network" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <Info size={17} className="mt-0.5 flex-shrink-0" />
              <p>
                Catatan sumber: lembar Network menggunakan nomor FR-029/KOM.03.05/SANDIKAMI. Nomor ini dipertahankan; modul dan alur kerja tetap FR-026 Capacity Planning.
              </p>
            </div>
          )}

          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Matriks {label} • {year}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pilih aset dan bulan untuk menambah atau mengubah log.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                Tahun
                <select value={year} onChange={(event) => setYear(Number(event.target.value))} className={`${selectClass} min-w-[120px]`}>
                  {Array.from(new Set([year, ...fr026YearOptions()])).sort((a, b) => a - b).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                Bulan aktif
                <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className={`${selectClass} min-w-[150px]`}>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{fr026MonthLabel(value)}</option>
                  ))}
                </select>
              </label>
              {canManage && (
                <Fr026Button onClick={() => setAssetModalOpen(true)}>
                  <Plus size={16} />Tambah Aset
                </Fr026Button>
              )}
            </div>
          </section>

          <Fr026AssetMatrix
            assets={assets}
            category={category}
            activeMonth={month}
            year={year}
            canManage={canManage}
            onLog={openLog}
            onDelete={setDeleteAsset}
          />

          <section className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700 dark:bg-emerald-500" />
                {fr026MonthLabel(month)}: bulan aktif
              </span>
              <span className="inline-flex items-center gap-1.5">— Belum ada log</span>
              {category === "server" && <span>Projection: estimasi kapasitas</span>}
            </div>
            <span>{categoryAssets.length} aset • Jan–Des {year}</span>
          </section>

          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Info size={17} className="mt-0.5 flex-shrink-0" />
            <p>
              {category === "server"
                ? "Current adalah hasil pengukuran; Projection adalah estimasi yang dicatat pengguna. Tidak ada ambang batas resmi yang ditetapkan dalam mockup ini."
                : "% Pemakaian = Max Pemakaian ÷ Kapasitas × 100. Perjanjian dan Capaian SLA dipantau terpisah dari pemakaian bandwidth."}
            </p>
          </div>
        </>
      ) : null}

      <Fr026AssetModal
        open={assetModalOpen}
        defaultCategory={category}
        onClose={() => setAssetModalOpen(false)}
      />
      {category === "server" ? (
        <Fr026ServerLogModal
          open={logAssetId !== null}
          assets={categoryAssets}
          initialAssetId={logAssetId ?? undefined}
          initialYear={year}
          initialMonth={month}
          onClose={() => setLogAssetId(null)}
        />
      ) : (
        <Fr026NetworkLogModal
          open={logAssetId !== null}
          assets={categoryAssets}
          initialAssetId={logAssetId ?? undefined}
          initialYear={year}
          initialMonth={month}
          onClose={() => setLogAssetId(null)}
        />
      )}
      <Fr026DeleteDialog asset={deleteAsset} year={year} onClose={() => setDeleteAsset(null)} />
    </>
  );
}
