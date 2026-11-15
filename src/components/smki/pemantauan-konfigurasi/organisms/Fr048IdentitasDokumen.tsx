"use client";

import { FileText } from "lucide-react";
import Fr048Field from "../atoms/Fr048Field";
import type { IdentifikasiFormState, IdentifikasiErrors } from "../form";

const inputBase =
  "w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-500 disabled:cursor-not-allowed";

/** Identitas Dokumen (kop formulir) — No. Dokumen, No. Revisi, Tanggal Berlaku. Terpisah dari Identifikasi Pemantauan. */
export default function Fr048IdentitasDokumen({
  value,
  errors,
  onChange,
  locked = false,
}: {
  value: IdentifikasiFormState;
  errors: IdentifikasiErrors;
  onChange: (patch: Partial<IdentifikasiFormState>) => void;
  locked?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-violet-600 dark:text-violet-400" />
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Identitas Dokumen</h3>
          <p className="text-[10px] text-slate-500">Nomor dokumen, revisi, dan tanggal berlaku yang tercantum pada kop formulir.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Fr048Field label="No. Dokumen" required error={errors.noFormulir} hint="Nomor sesuai dokumen yang berlaku, mis. FR-048/KOM.03.05/SANDIKAMI">
          <input value={value.noFormulir} disabled={locked} onChange={(e) => onChange({ noFormulir: e.target.value })} placeholder="FR-048/KOM.03.05/SANDIKAMI" className={inputBase} />
        </Fr048Field>

        <Fr048Field label="No. Revisi" required error={errors.noRevisi} hint="Nomor revisi dokumen, mis. 0.0">
          <input value={value.noRevisi} disabled={locked} onChange={(e) => onChange({ noRevisi: e.target.value })} placeholder="0.0" className={inputBase} />
        </Fr048Field>

        <Fr048Field label="Tanggal Berlaku" required error={errors.tanggalBerlaku} hint="Tanggal dokumen mulai berlaku">
          <input type="date" value={value.tanggalBerlaku} disabled={locked} onChange={(e) => onChange({ tanggalBerlaku: e.target.value })} className={inputBase} />
        </Fr048Field>
      </div>
    </div>
  );
}
