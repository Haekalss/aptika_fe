import { cloneElement, type ReactElement } from "react";

export function Fr026Field({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": error || hint ? `${id}-description` : undefined,
      })}
      {(error || hint) && (
        <p id={`${id}-description`} className={`text-xs leading-relaxed ${error ? "text-red-600" : "text-slate-500 dark:text-slate-400"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
