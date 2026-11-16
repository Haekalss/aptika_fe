"use client";

import Input from "@/components/ui/Input";
import type { Fr021SectionProps } from "../types";

/**
 * Identitas dokumen (No. Dokumen, No. Revisi, Tanggal Berlaku).
 * Metadata kop formulir — terpisah dari identifikasi evaluasi.
 */
export default function IdentitasDokumenSection({
  form,
  errors,
  onChange,
  disabled,
}: Fr021SectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div>
        <h2 className="font-bold text-slate-800 dark:text-slate-100">
          Identitas Dokumen
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Nomor dokumen, revisi, dan tanggal berlaku yang tercantum pada kop formulir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="No. Dokumen"
          placeholder="FR-021/KOM.03.05/SANDIKAMI"
          value={form.nomor_dokumen}
          onChange={(event) => onChange({ nomor_dokumen: event.target.value })}
          error={errors.nomor_dokumen?.[0]}
          disabled={disabled}
          required
        />
        <Input
          label="No. Revisi"
          placeholder="1.1"
          value={form.nomor_revisi}
          onChange={(event) => onChange({ nomor_revisi: event.target.value })}
          error={errors.nomor_revisi?.[0]}
          disabled={disabled}
          required
        />
        <Input
          label="Tanggal Berlaku"
          type="date"
          value={form.tanggal_berlaku}
          onChange={(event) => onChange({ tanggal_berlaku: event.target.value })}
          error={errors.tanggal_berlaku?.[0]}
          disabled={disabled}
          required
        />
      </div>
    </section>
  );
}
