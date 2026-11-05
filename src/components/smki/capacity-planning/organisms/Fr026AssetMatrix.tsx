import type { Fr026Asset, Fr026Category } from "@/services/smki/capacityPlanning.types";
import { fr026CategoryLabel, fr026Number } from "../form";

function Cell({ value, active, title }: { value: string; active: boolean; title?: string }) {
  return (
    <td
      title={title}
      className={`border-b border-slate-100 px-2 py-2.5 text-center text-[13px] tabular-nums dark:border-slate-800 ${
        active ? "bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "text-slate-600 dark:text-slate-300"
      }`}
    >
      {value}
    </td>
  );
}

function ParameterRow({
  label,
  assets,
  activeMonth,
  render,
}: {
  label: string;
  assets: Fr026Asset[];
  activeMonth: number;
  render: (asset: Fr026Asset, month: number) => { value: string; title?: string };
}) {
  return (
    <tr className="group">
      <th scope="row" className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 group-hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0b1e3d] dark:text-slate-300">
        {label}
      </th>
      {assets.map((asset) =>
        Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const cell = render(asset, month);
          return <Cell key={`${asset.id}-${month}`} value={cell.value} title={cell.title} active={month === activeMonth} />;
        })
      )}
    </tr>
  );
}

export function Fr026AssetMatrix({
  assets,
  category,
  activeMonth,
  year,
  canManage,
  onLog,
  onDelete,
}: {
  assets: Fr026Asset[];
  category: Fr026Category;
  activeMonth: number;
  year: number;
  canManage: boolean;
  onLog: (asset: Fr026Asset) => void;
  onDelete: (asset: Fr026Asset) => void;
}) {
  const categoryAssets = assets.filter((asset) => asset.category === category);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1260px] border-collapse text-left text-sm">
          <caption className="sr-only">Matriks {fr026CategoryLabel(category)} tahun {year}</caption>
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <th scope="col" className="sticky left-0 z-10 w-[220px] bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-800">Kelompok / parameter</th>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <th
                  key={month}
                  scope="col"
                  className={`min-w-[66px] px-2 py-3 text-center font-semibold ${month === activeMonth ? "bg-emerald-700 text-white dark:bg-emerald-600" : ""}`}
                >
                  {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][month - 1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryAssets.map((asset, assetIndex) => {
              const activeLog = asset.logs.find((log) => log.month === activeMonth);
              return [
                <tr key={`group-${asset.id}`} className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40">
                  <th scope="rowgroup" colSpan={13} className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-100">
                        <span className="text-slate-400">No. {String(assetIndex + 1).padStart(2, "0")}</span>
                        <span>{asset.asset_name}</span>
                        <span className="font-normal text-slate-500 dark:text-slate-400">IP: {asset.ip_address || "—"}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-3 text-xs">
                        {activeLog ? (
                          <span className="rounded-md bg-emerald-100 px-2 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                            {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][activeMonth - 1]} terisi
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-100 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                            {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][activeMonth - 1]} belum diisi
                          </span>
                        )}
                        {canManage && (
                          <button type="button" onClick={() => onLog(asset)} className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
                            {activeLog ? `Ubah log ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][activeMonth - 1]}` : `+ Tambah log ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][activeMonth - 1]}`}
                          </button>
                        )}
                        {canManage && (
                          <button type="button" onClick={() => onDelete(asset)} aria-label={`Hapus ${asset.asset_name}`} className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                          </button>
                        )}
                      </span>
                    </div>
                  </th>
                </tr>,
                category === "server" ? (
                  <ServerRows key={`rows-${asset.id}`} asset={asset} activeMonth={activeMonth} />
                ) : (
                  <NetworkRows key={`rows-${asset.id}`} asset={asset} activeMonth={activeMonth} />
                ),
              ];
            })}
            {!categoryAssets.length && (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  Belum ada aset {fr026CategoryLabel(category)}. Gunakan tombol Tambah Aset untuk mendaftarkan perangkat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ServerRows({ asset, activeMonth }: { asset: Fr026Asset; activeMonth: number }) {
  const metric = (month: number, key: "current_storage_gb" | "current_memory_pct" | "current_cpu_pct" | "projection_storage_gb" | "projection_memory_pct" | "projection_cpu_pct", suffix = "") => {
    const log = asset.logs.find((item) => item.month === month);
    return { value: log?.[key] == null ? "—" : `${fr026Number(log[key])}${suffix}` };
  };
  return (
    <>
      <ParameterRow label="Current · Storage (GB)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "current_storage_gb")} />
      <ParameterRow label="Current · Memory (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "current_memory_pct", "%")} />
      <ParameterRow label="Current · CPU Usage (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "current_cpu_pct", "%")} />
      <ParameterRow label="Projection · Storage (GB)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "projection_storage_gb")} />
      <ParameterRow label="Projection · Memory (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "projection_memory_pct", "%")} />
      <ParameterRow label="Projection · CPU Usage (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => metric(month, "projection_cpu_pct", "%")} />
    </>
  );
}

function NetworkRows({ asset, activeMonth }: { asset: Fr026Asset; activeMonth: number }) {
  const logAt = (month: number) => asset.logs.find((item) => item.month === month);
  return (
    <>
      <ParameterRow label="Bandwidth · Kapasitas (Mbps)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        return { value: log?.bandwidth_capacity_mbps == null ? "—" : fr026Number(log.bandwidth_capacity_mbps) };
      }} />
      <ParameterRow label="Bandwidth · Max Pemakaian (Mbps)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        return { value: log?.bandwidth_max_usage_mbps == null ? "—" : fr026Number(log.bandwidth_max_usage_mbps) };
      }} />
      <ParameterRow label="Bandwidth · % Pemakaian" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        return { value: log?.bandwidth_usage_pct == null ? "—" : `${fr026Number(log.bandwidth_usage_pct, 1)}%` };
      }} />
      <ParameterRow label="Up Time · Perjanjian SLA (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        return { value: log?.sla_agreement_pct == null ? "—" : fr026Number(log.sla_agreement_pct, 2) };
      }} />
      <ParameterRow label="Up Time · Capaian SLA (%)" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        return { value: log?.sla_achievement_pct == null ? "—" : fr026Number(log.sla_achievement_pct, 2) };
      }} />
      <ParameterRow label="Keterangan" assets={[asset]} activeMonth={activeMonth} render={(_, month) => {
        const log = logAt(month);
        const notes = log?.notes || "—";
        return { value: notes.length > 26 ? `${notes.slice(0, 26)}…` : notes, title: log?.notes ?? undefined };
      }} />
    </>
  );
}
