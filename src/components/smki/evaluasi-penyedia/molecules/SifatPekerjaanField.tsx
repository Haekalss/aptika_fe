"use client";

import Input from "@/components/ui/Input";
import { FR021_SIFAT_PEKERJAAN_OPTIONS } from "../constants";
import type { Fr021FormState } from "../types";

export default function SifatPekerjaanField({
  form,
  errors,
  onChange,
  disabled,
}: {
  form: Fr021FormState;
  errors: Record<string, string[]>;
  onChange: (changes: Partial<Fr021FormState>) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
        Sifat Pekerjaan
      </p>
      <div className="flex flex-wrap gap-4">
        {FR021_SIFAT_PEKERJAAN_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-100"
          >
            <input
              type="radio"
              name="sifat_pekerjaan"
              value={option.value}
              checked={form.sifat_pekerjaan === option.value}
              disabled={disabled}
              onChange={() => {
                const changes: Partial<Fr021FormState> = {
                  sifat_pekerjaan: option.value,
                };
                if (option.value !== "lainnya") {
                  changes.sifat_pekerjaan_lainnya = "";
                }
                onChange(changes);
              }}
              className="accent-emerald-600"
            />
            {option.label}
          </label>
        ))}
      </div>
      {errors.sifat_pekerjaan && (
        <p className="text-[10px] font-semibold text-rose-500 mt-1">
          {errors.sifat_pekerjaan[0]}
        </p>
      )}
      {form.sifat_pekerjaan === "lainnya" && (
        <div className="mt-3">
          <Input
            label="Uraian pekerjaan lainnya"
            value={form.sifat_pekerjaan_lainnya}
            onChange={(event) =>
              onChange({ sifat_pekerjaan_lainnya: event.target.value })
            }
            error={errors.sifat_pekerjaan_lainnya?.[0]}
            disabled={disabled}
            required
          />
        </div>
      )}
    </div>
  );
}
