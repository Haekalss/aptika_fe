import { DatabaseBackup } from "lucide-react";

export function Fr030Header() {
  return <header className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600 p-6 text-white shadow-sm sm:p-8">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider">SMKI · FR-030</p>
    <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl"><DatabaseBackup aria-hidden="true" className="h-7 w-7 shrink-0" />Berita Acara Backup & Restore</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50">Rekap tahunan backup dan restore aset, hasil kegiatan bulanan, serta bukti pendukung keamanan informasi.</p>
  </header>;
}
