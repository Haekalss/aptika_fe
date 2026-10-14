"use client";

import { Check } from "lucide-react";

export interface StepItem {
  id: string;
  label: string;
  hint?: string;
}

/** Atom global reusable: header tab stepper. */
export default function StepTabs({
  steps,
  active,
  onChange,
  completed = {},
}: {
  steps: StepItem[];
  active: string;
  onChange: (id: string) => void;
  completed?: Record<string, boolean>;
}) {
  const activeIdx = Math.max(
    0,
    steps.findIndex((s) => s.id === active)
  );
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        {steps.map((s, i) => {
          const isActive = s.id === active;
          const isDone = completed[s.id];
          const isPast = i < activeIdx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : isPast || isDone
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isPast || isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                }`}
              >
                {isPast || isDone ? <Check size={14} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold truncate">{s.label}</span>
                {s.hint && (
                  <span
                    className={`block text-[10px] truncate ${
                      isActive ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    {s.hint}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export { StepTabs };
