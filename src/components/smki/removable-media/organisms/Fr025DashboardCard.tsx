import { ArrowRight, Usb } from "lucide-react";
import { Fr025Link } from "../atoms/Fr025Link";

export function Fr025DashboardCard() {
  return (
    <Fr025Link
      href="/smki/removable-media"
      aria-label="Daftar Removable Media"
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Usb size={24} aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FR-025</span>
        </div>
        <h3 className="mb-2 text-base font-bold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
          Daftar Removable Media
        </h3>
        <p className="mb-4 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Kelola inventaris removable media, PIC pemegang inventaris, kondisi barang, serta ekspor daftar resmi FR-025 ke PDF.
        </p>
      </div>
      <div className="flex items-center border-t border-slate-100 pt-4 text-xs font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
        <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
          Buka Layanan <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Fr025Link>
  );
}
