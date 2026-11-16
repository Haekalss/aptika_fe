"use client";

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export default function Fr048EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-14 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 flex items-center justify-center text-violet-500">
        <Inbox size={26} />
      </div>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
