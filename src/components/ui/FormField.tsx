"use client";

import * as React from "react";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/** Atom global: wrapper label + hint + error untuk semua form SMKI. */
export default function FormField({
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {hint && <p className="text-[10px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
      {error && <p className="text-[10px] font-semibold text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
export { FormField };
