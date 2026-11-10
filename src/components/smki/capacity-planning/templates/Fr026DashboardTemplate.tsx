"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import type { Fr026MissingAsset } from "@/services/smki/capacityPlanning.types";
import { fr026Error } from "@/services/smki/capacityPlanningService";
import { fr026MonthLabel, fr026YearOptions } from "../form";
import { useFr026Dashboard } from "../hooks/useFr026Queries";
import { Fr026Tabs } from "../organisms/Fr026Tabs";
import { Fr026SummaryCards } from "../organisms/Fr026SummaryCards";
import { Fr026CompletenessChart } from "../organisms/Fr026CompletenessChart";
import { Fr026AttentionCard } from "../organisms/Fr026AttentionCard";
import { Fr026ServerComparisonCard } from "../organisms/Fr026ServerComparisonCard";
import { Fr026NetworkUsageCard } from "../organisms/Fr026NetworkUsageCard";
import { Fr026ServerLogModal } from "../organisms/Fr026ServerLogModal";
import { Fr026NetworkLogModal } from "../organisms/Fr026NetworkLogModal";
import { Fr026Feedback } from "../molecules/Fr026Feedback";

const exportLinkClass =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export function Fr026DashboardTemplate({ initialYear, initialMonth }: { initialYear?: number; initialMonth?: number } = {}) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth() + 1);
  const [logTarget, setLogTarget] = useState<Fr026MissingAsset | null>(null);
  const query = useFr026Dashboard(year, month);
  const data = query.data;
  const serverAssets = data?.assets.filter((asset) => asset.category === "server") ?? [];
  const networkAssets = data?.assets.filter((asset) => asset.category === "network") ?? [];
  const monthLabel = data?.meta.month_label ?? fr026MonthLabel(month);

  return (
    <>
      <Fr026Tabs
        active="ringkasan"
        serverCount={data?.summary.server_count}
        networkCount={data?.summary.network_count}
        action={
          <Link href={`/smki/capacity-planning/export?year=${year}&month=${month}`} className={exportLinkClass}>
            <Download size={16} />Ekspor Laporan
          </Link>
        }
      />

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pemantauan {monthLabel} {year}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {data ? `${data.summary.total_assets} aset terdaftar. Nilai pemantauan berasal dari log bulanan yang diisi pengguna.` : "Tinjau kelengkapan pencatatan dan kapasitas infrastruktur dalam satu tempat."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            Bulan
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="block h-10 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-[#0b1630] dark:text-white"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{fr026MonthLabel(value)}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            Tahun
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="block h-10 min-w-[110px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-[#0b1630] dark:text-white"
            >
              {Array.from(new Set([year, ...fr026YearOptions()])).sort((a, b) => a - b).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {query.isPending ? (
        <Fr026Feedback message="Memuat ringkasan capacity planning..." />
      ) : query.isError ? (
        <Fr026Feedback message={fr026Error(query.error).message} error onRetry={() => void query.refetch()} />
      ) : data ? (
        <>
          <Fr026SummaryCards summary={data.summary} monthLabel={monthLabel} year={year} />

          {!data.summary.total_assets ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-[#0b1e3d]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada aset capacity planning</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Daftarkan aset Server atau Network terlebih dahulu. Setelah itu log bulanan dapat dicatat dan ringkasan akan dihitung otomatis.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/smki/capacity-planning/server" className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">Tambah Aset Server</Link>
                <Link href="/smki/capacity-planning/network" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Tambah Aset Network</Link>
              </div>
            </section>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
                <Fr026CompletenessChart summary={data.summary} year={year} />
                <Fr026AttentionCard
                  missing={data.summary.missing_current_month}
                  month={month}
                  year={year}
                  canManage={data.permissions.can_manage}
                  onAddLog={setLogTarget}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
                <Fr026ServerComparisonCard rows={data.summary.server_comparison} periodLabel={data.meta.period_label} year={year} />
                <Fr026NetworkUsageCard rows={data.summary.network_usage} year={year} />
              </div>
            </>
          )}

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 flex-shrink-0 text-emerald-700 dark:text-emerald-300" />
              <div className="grid flex-1 gap-4 sm:grid-cols-[1.1fr_2fr]">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Dasar rancangan FR-026</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Spreadsheet • Use case • Flowchart</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Alur: daftar aset → pilih aset &amp; bulan → simpan / ubah log → ekspor PDF atau Excel. Hapus aset juga menghapus seluruh lognya.
                  Metadata tanggal sumber belum diisi. Nomor Network FR-029 dipertahankan sesuai lembar sumber.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <Fr026ServerLogModal
        open={!!logTarget && logTarget.category === "server"}
        assets={serverAssets}
        initialAssetId={logTarget?.asset_id}
        initialYear={year}
        initialMonth={month}
        onClose={() => setLogTarget(null)}
      />
      <Fr026NetworkLogModal
        open={!!logTarget && logTarget.category === "network"}
        assets={networkAssets}
        initialAssetId={logTarget?.asset_id}
        initialYear={year}
        initialMonth={month}
        onClose={() => setLogTarget(null)}
      />
    </>
  );
}
