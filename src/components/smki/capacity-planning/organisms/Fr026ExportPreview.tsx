import { ShieldCheck } from "lucide-react";
import type { Fr026Asset, Fr026Category, Fr026Dashboard } from "@/services/smki/capacityPlanning.types";
import { fr026CategoryLabel, fr026Date, fr026Number } from "../form";

const shortMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function metricRows(category: Fr026Category): Array<{ label: string; value: (asset: Fr026Asset, month: number) => string }> {
  const cell = (asset: Fr026Asset, month: number) => asset.logs.find((log) => log.month === month);
  if (category === "server") {
    return [
      { label: "Current · Storage (GB)", value: (asset, month) => fr026Number(cell(asset, month)?.current_storage_gb) },
      { label: "Current · Memory (%)", value: (asset, month) => fr026Number(cell(asset, month)?.current_memory_pct) },
      { label: "Current · CPU Usage (%)", value: (asset, month) => fr026Number(cell(asset, month)?.current_cpu_pct) },
      { label: "Projection · Storage (GB)", value: (asset, month) => fr026Number(cell(asset, month)?.projection_storage_gb) },
      { label: "Projection · Memory (%)", value: (asset, month) => fr026Number(cell(asset, month)?.projection_memory_pct) },
      { label: "Projection · CPU Usage (%)", value: (asset, month) => fr026Number(cell(asset, month)?.projection_cpu_pct) },
    ];
  }
  return [
    { label: "Bandwidth · Kapasitas (Mbps)", value: (asset, month) => fr026Number(cell(asset, month)?.bandwidth_capacity_mbps) },
    { label: "Bandwidth · Max Pemakaian (Mbps)", value: (asset, month) => fr026Number(cell(asset, month)?.bandwidth_max_usage_mbps) },
    { label: "Bandwidth · % Pemakaian", value: (asset, month) => {
      const value = cell(asset, month)?.bandwidth_usage_pct;
      return value == null ? "—" : `${fr026Number(value, 1)}%`;
    } },
    { label: "Up Time · Perjanjian SLA (%)", value: (asset, month) => {
      const value = cell(asset, month)?.sla_agreement_pct;
      return value == null ? "—" : fr026Number(value, 2);
    } },
    { label: "Up Time · Capaian SLA (%)", value: (asset, month) => {
      const value = cell(asset, month)?.sla_achievement_pct;
      return value == null ? "—" : fr026Number(value, 2);
    } },
    { label: "Keterangan", value: (asset, month) => cell(asset, month)?.notes || "—" },
  ];
}

export function Fr026ExportPreview({
  data,
  category,
  month,
  page,
  totalPages,
}: {
  data: Fr026Dashboard;
  category: Fr026Category;
  month: number;
  page: number;
  totalPages: number;
}) {
  const assets = data.assets.filter((asset) => asset.category === category);
  const meta = data.meta.documents[category];
  const rows = metricRows(category);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-white">
      <div className="p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-emerald-800 pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
              <ShieldCheck size={26} />
            </span>
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 sm:text-xl">Formulir Capacity Planning</h3>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {fr026CategoryLabel(category)} • Tahun {data.meta.year}
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">Revisi {meta.revision}</p>
        </header>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 pb-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Nomor dokumen</p>
            <p className="mt-1 font-mono text-[13px] font-bold text-slate-900">{meta.code}</p>
          </div>
          <div className="flex flex-wrap gap-10">
            <div>
              <p className="text-xs text-slate-500">Tanggal</p>
              <p className="mt-1 font-semibold text-slate-800">{fr026Date(meta.tanggal)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Last Update</p>
              <p className="mt-1 font-semibold text-slate-800">{fr026Date(meta.last_update)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-400 text-[11px] font-semibold text-slate-600">
                <th scope="col" className="w-[220px] py-2 pr-3 font-semibold">Kelompok / parameter</th>
                {shortMonths.map((label, index) => {
                  const active = index + 1 === month;
                  return (
                    <th
                      key={label}
                      scope="col"
                      className={`min-w-[58px] px-2 py-2 text-center font-semibold ${active ? "bg-emerald-700 text-white" : ""}`}
                    >
                      {label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, assetIndex) => (
                <FragmentRows key={asset.id} asset={asset} assetIndex={assetIndex} month={month} rows={rows} />
              ))}
              {!assets.length && (
                <tr>
                  <td colSpan={13} className="border-b border-slate-200 py-8 text-center text-sm text-slate-500">
                    Belum ada aset {fr026CategoryLabel(category)} pada tahun {data.meta.year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <span>{assets.length} aset • Jan–Des {data.meta.year} • {fr026CategoryLabel(category)}</span>
          <span>Halaman {page} dari {totalPages}</span>
        </footer>
      </div>
    </article>
  );
}

function FragmentRows({
  asset,
  assetIndex,
  month,
  rows,
}: {
  asset: Fr026Asset;
  assetIndex: number;
  month: number;
  rows: Array<{ label: string; value: (asset: Fr026Asset, month: number) => string }>;
}) {
  return (
    <>
      <tr className="border-b border-slate-200 bg-slate-50/80">
        <th scope="rowgroup" colSpan={13} className="px-2 py-2 text-left">
          <span className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-slate-800">
            <span className="text-slate-400">No. {String(assetIndex + 1).padStart(2, "0")}</span>
            <span>{asset.asset_name}</span>
            <span className="font-normal text-slate-500">IP: {asset.ip_address || "—"}</span>
          </span>
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-b border-slate-200">
          <th scope="row" className="py-2 pr-3 text-left text-[11.5px] font-medium text-slate-600">{row.label}</th>
          {Array.from({ length: 12 }, (_, index) => {
            const value = row.value(asset, index + 1);
            return (
              <td
                key={index}
                className={`px-2 py-2 text-center text-[11.5px] tabular-nums ${
                  index + 1 === month ? "bg-emerald-50 font-semibold text-emerald-900" : "text-slate-700"
                }`}
              >
                {value}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
