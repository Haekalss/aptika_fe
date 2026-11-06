import type { Fr026Summary } from "@/services/smki/capacityPlanning.types";

export function Fr026CompletenessChart({ summary, year }: { summary: Fr026Summary; year: number }) {
  const denominator = Math.max(1, summary.total_assets);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kelengkapan log bulanan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Jumlah aset dengan log tersimpan dari total {summary.total_assets} aset.
          </p>
        </div>
        <span className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Tahun {year}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-12 items-end gap-1.5 sm:gap-2">
        {summary.monthly.map((item) => {
          const height = Math.max(6, Math.round((item.logged / denominator) * 104));
          const complete = item.total > 0 && item.logged >= item.total;
          return (
            <div key={item.month} className="flex min-w-0 flex-col items-center">
              <span className={`mb-1.5 text-[11px] font-semibold ${item.is_active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}`}>
                {item.logged}/{item.total}
              </span>
              <div
                className={`w-full max-w-[42px] rounded-t-md transition-colors ${
                  item.is_active
                    ? "bg-emerald-800 dark:bg-emerald-400"
                    : complete
                      ? "bg-emerald-500/85 dark:bg-emerald-500/80"
                      : item.logged > 0
                        ? "bg-emerald-300 dark:bg-emerald-700"
                        : "bg-slate-200 dark:bg-slate-700"
                }`}
                style={{ height }}
                aria-hidden="true"
              />
              <span className={`mt-2 text-[11px] ${item.is_active ? "font-bold text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Log tercatat</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />Belum diisi</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-800 dark:bg-emerald-400" />Bulan aktif</span>
      </div>
    </section>
  );
}
