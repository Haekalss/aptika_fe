"use client";

import { AlertTriangle } from "lucide-react";

/** Banner "Perlu Revisi" — catatan Admin yang mengembalikan. Hanya tampil pada status revisi. */
export default function Fr048RevisionBanner({ adminNama, catatan }: { adminNama: string | null; catatan: string | null }) {
  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex items-start gap-3" role="status">
      <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Perlu Revisi</p>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-200/80 mt-0.5">
          {adminNama ?? "Admin"} mengembalikan pemantauan ini. Identifikasi dikunci; perbaiki Daftar Konfigurasi / Keterangan / Catatan Tindak Lanjut, lalu ajukan ulang.
        </p>
        {catatan && (
          <blockquote className="mt-2 text-[11px] text-amber-900 dark:text-amber-200 border-l-2 border-amber-400 dark:border-amber-700 pl-2 italic whitespace-pre-wrap">
            “{catatan}”
          </blockquote>
        )}
      </div>
    </div>
  );
}
