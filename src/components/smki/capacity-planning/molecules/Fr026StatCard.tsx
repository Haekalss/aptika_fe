import type { ReactNode } from "react";

export function Fr026StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: ReactNode;
  helper: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{icon}</span>
      </div>
      <p className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}
