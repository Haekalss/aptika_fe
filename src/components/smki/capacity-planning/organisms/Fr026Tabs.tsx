"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Fr026Tab } from "@/services/smki/capacityPlanning.types";

const tabs: Array<{ key: Fr026Tab; label: string; href: string }> = [
  { key: "ringkasan", label: "Ringkasan", href: "/smki/capacity-planning" },
  { key: "server", label: "Server", href: "/smki/capacity-planning/server" },
  { key: "network", label: "Network", href: "/smki/capacity-planning/network" },
];

export function Fr026Tabs({
  active,
  serverCount,
  networkCount,
  action,
}: {
  active: Fr026Tab;
  serverCount?: number;
  networkCount?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
      <nav aria-label="Navigasi Capacity Planning" className="flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.key === "server" ? serverCount : tab.key === "network" ? networkCount : undefined;
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
              {typeof count === "number" && <span className="ml-1.5 font-normal text-slate-400">({count})</span>}
            </Link>
          );
        })}
      </nav>
      {action && <div className="pb-3">{action}</div>}
    </div>
  );
}
