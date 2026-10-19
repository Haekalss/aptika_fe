import React, { memo } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  iconBgClass: string;
}

export const StatCard = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  iconBgClass,
}: StatCardProps) => (
  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-[11px] text-slate-400">{subtitle}</p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";
