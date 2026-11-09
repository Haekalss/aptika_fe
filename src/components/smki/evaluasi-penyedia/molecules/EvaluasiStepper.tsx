"use client";

import { Check } from "lucide-react";
import { FR021_STEPS, FR021_STEP_INDEX } from "../constants";
import type { Fr021Step } from "../constants";

export default function EvaluasiStepper({
  active,
  completed,
  locked,
  onSelect,
}: {
  active: Fr021Step;
  completed: Record<string, boolean>;
  locked?: boolean;
  onSelect: (step: Fr021Step) => void;
}) {
  return (
    <ol className="flex items-center gap-1">
      {FR021_STEPS.map((step, index) => {
        const isActive = active === step.id;
        const isCompleted = Boolean(completed[step.id]);
        const isReachable =
          !locked && (isCompleted || index <= FR021_STEP_INDEX[active]);
        return (
          <li key={step.id} className="flex flex-1 items-center">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onSelect(step.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                isReachable
                  ? "hover:bg-slate-50 dark:hover:bg-slate-800"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {isCompleted && !isActive ? <Check size={13} /> : index + 1}
              </span>
              <span className="hidden sm:block">
                <span
                  className={`block text-xs font-semibold ${
                    isActive
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {step.label}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {step.hint}
                </span>
              </span>
            </button>
            {index < FR021_STEPS.length - 1 && (
              <div className="mx-1 h-px flex-1 bg-slate-100 dark:bg-slate-700" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
