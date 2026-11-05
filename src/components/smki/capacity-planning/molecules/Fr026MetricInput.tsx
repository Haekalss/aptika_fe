import { fr026Control } from "../form";
import { Fr026Field } from "./Fr026Field";

export function Fr026MetricInput({
  id,
  label,
  value,
  onChange,
  suffix,
  hint,
  error,
  required = true,
  placeholder = "Masukkan nilai",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <Fr026Field id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <input
          className={`${fr026Control} pr-16`}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value.replace(",", "."))}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {suffix}
        </span>
      </div>
    </Fr026Field>
  );
}
