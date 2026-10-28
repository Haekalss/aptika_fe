import type { ReactNode } from "react";

export default function FormSection({ number, title, hint, children }: { number: number; title: string; hint?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
    <div className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-bold">{number}</span><div><h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>{hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}</div></div>
    {children}
  </section>;
}
