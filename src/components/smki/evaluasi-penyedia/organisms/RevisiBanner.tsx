"use client";

import type { Fr021Evaluasi } from "@/services/smki/evaluasiPenyedia.types";

export default function RevisiBanner({
  record,
}: {
  record: Fr021Evaluasi | null | undefined;
}) {
  if (!record || record.status !== "revisi") return null;
  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-rose-50 dark:bg-rose-950/60 p-2 text-rose-600 dark:text-rose-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
            Perlu Revisi
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
            Dikembalikan oleh {record.admin?.name ?? "Atasan"} pada{" "}
            {record.updated_at
              ? new Date(record.updated_at).toLocaleString("id-ID")
              : "—"}
          </p>
          {record.catatan_revisi && (
            <p className="mt-2 rounded-lg bg-white/60 dark:bg-slate-900/40 p-3 text-sm text-rose-950 dark:text-rose-50">
              {record.catatan_revisi}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-rose-700 dark:text-rose-300">
        Identifikasi terkunci. Hanya penilaian yang dapat diubah. Hitung ulang &
        tandatangani kembali untuk mengajukan ulang.
      </p>
    </div>
  );
}
