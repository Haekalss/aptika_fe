import type { Fr026Asset, Fr026Category, Fr026Log, Fr026ServerLogPayload, Fr026NetworkLogPayload } from "@/services/smki/capacityPlanning.types";

export const fr026Control =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-500 aria-[invalid=true]:border-red-500 dark:border-slate-700 dark:bg-[#0b1630] dark:text-white";

export const fr026CategoryLabel = (category: Fr026Category) =>
  category === "server" ? "Server" : "Network";

export function fr026MonthLabel(month: number): string {
  return ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][month - 1] ?? "";
}

export function fr026ShortMonth(month: number): string {
  return ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][month - 1] ?? "";
}

export function fr026Date(value?: string | null): string {
  if (!value) return "Belum diisi";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function fr026Number(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fr026Percent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function fr026Signed(value: number | null | undefined, suffix = " GB"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })}${suffix}`;
}

export function fr026LogFor(asset: Fr026Asset | undefined, month: number): Fr026Log | undefined {
  return asset?.logs.find((log) => log.month === month);
}

export function fr026ServerPayload(log: Fr026Log): Fr026ServerLogPayload {
  return {
    year: log.year,
    month: log.month,
    current_storage_gb: log.current_storage_gb ?? 0,
    current_memory_pct: log.current_memory_pct ?? 0,
    current_cpu_pct: log.current_cpu_pct ?? 0,
    projection_storage_gb: log.projection_storage_gb ?? 0,
    projection_memory_pct: log.projection_memory_pct ?? 0,
    projection_cpu_pct: log.projection_cpu_pct ?? 0,
  };
}

export function fr026NetworkPayload(log: Fr026Log): Fr026NetworkLogPayload {
  return {
    year: log.year,
    month: log.month,
    bandwidth_capacity_mbps: log.bandwidth_capacity_mbps ?? 0,
    bandwidth_max_usage_mbps: log.bandwidth_max_usage_mbps ?? 0,
    sla_agreement_pct: log.sla_agreement_pct ?? 0,
    sla_achievement_pct: log.sla_achievement_pct ?? 0,
    notes: log.notes ?? "",
  };
}

export const fr026YearOptions = (): number[] => {
  const current = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, index) => current - 3 + index);
};
