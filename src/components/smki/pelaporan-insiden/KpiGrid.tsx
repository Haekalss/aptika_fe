"use client";

import React from "react";

export interface KpiItem {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber";
}

const COLORS = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-200/60 dark:border-blue-800/50",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-200/60 dark:border-emerald-800/50",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    border: "border-amber-200/60 dark:border-amber-800/50",
  },
};

/** Molecule: grid KPI. */
export default function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((card, i) => {
        const c = COLORS[card.color];
        return (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {card.label}
              </p>
              <h3 className={`text-2xl font-black ${c.text}`}>{card.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}
            >
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
