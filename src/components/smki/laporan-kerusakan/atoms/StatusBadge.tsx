import React, { memo } from "react";

interface StatusBadgeProps {
  status: "Baru" | "Diproses" | "Selesai" | "Closed" | string;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps) => {
  let badgeStyle = "bg-slate-50 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";

  switch (status) {
    case "Baru":
      badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
      dotColor = "bg-sky-500";
      break;
    case "Diproses":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
      break;
    case "Selesai":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;
    case "Closed":
      badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
      dotColor = "bg-purple-500";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";
