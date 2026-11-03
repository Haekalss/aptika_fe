"use client";

import * as React from "react";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/** Atom global: wrapper label + hint + error untuk semua form SMKI. */
export default function FormField({
  label,
  required,
  hint,
  error,
  children,
  className = "",
  htmlFor,
}: FormFieldProps) {
  const generatedId = React.useId();
  const child = React.isValidElement<React.HTMLAttributes<HTMLElement>>(children) ? children : null;
  const isControl = child && typeof child.type === "string" && ["input", "select", "textarea"].includes(child.type);
  const controlId = htmlFor ?? child?.props.id ?? (isControl ? generatedId : undefined);
  const describedBy = [child?.props["aria-describedby"], hint && `${generatedId}-hint`, error && `${generatedId}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={controlId} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {hint && <p id={`${generatedId}-hint`} className="text-[10px] text-slate-400 mb-1.5">{hint}</p>}
      {isControl && child ? React.cloneElement(child, { id: controlId, "aria-describedby": describedBy, "aria-invalid": error ? true : child.props["aria-invalid"] }) : children}
      {error && <p id={`${generatedId}-error`} className="text-[10px] font-semibold text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
export { FormField };
