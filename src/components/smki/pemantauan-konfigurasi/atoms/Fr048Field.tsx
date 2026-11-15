"use client";

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/** Label + input + pesan error inline (atomic). Child tunggal: input/select/textarea. */
export default function Fr048Field({
  label,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const withErrorClass = (child: ReactNode): ReactNode => {
    if (!error || !isValidElement(child)) return child;
    const el = child as ReactElement<{ className?: string }>;
    const existing = el.props.className ?? "";
    return cloneElement(el, { className: `${existing} border-rose-400 focus:ring-rose-500`.trim() });
  };

  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {withErrorClass(children)}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-rose-600 dark:text-rose-400" role="alert">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
