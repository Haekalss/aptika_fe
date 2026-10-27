import { cloneElement, type ReactElement } from "react";

export const fr025Control = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-500 aria-[invalid=true]:border-red-500";

export function Fr025Field({ id, label, error, hint, children, compact = false }: {
  id: string; label: string; error?: string; hint?: string; compact?: boolean;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}) {
  return <div className="space-y-1.5">
    <label htmlFor={id} className={compact ? "sr-only" : "block text-xs font-semibold text-slate-700"}>{label}</label>
    {cloneElement(children, { id, "aria-invalid": !!error, "aria-describedby": error || hint ? `${id}-description` : undefined })}
    {(error || hint) && <p id={`${id}-description`} className={`text-xs ${error ? "text-red-600" : "text-slate-500"}`}>{error || hint}</p>}
  </div>;
}
