"use client";

import type { LucideIcon } from "lucide-react";

export default function Fr048StatCard({
  icon: Icon,
  label,
  value,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-2xl border p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        active
          ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20"
          : "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-violet-300 hover:shadow-md"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-violet-100" : "text-slate-500 dark:text-slate-400"}`}>
          {label}
        </span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? "bg-white/15 text-white" : "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400"}`}>
          <Icon size={16} />
        </span>
      </span>
      <span className={`block mt-2 text-2xl font-extrabold tabular-nums ${active ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>
        {value}
      </span>
    </button>
  );
}
