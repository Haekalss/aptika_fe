"use client";

export default function CatatanTinjauan({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
        Catatan Tinjauan
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={4}
        placeholder="Tuliskan catatan tinjauan (wajib saat mengembalikan)..."
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:opacity-60"
      />
      {error && (
        <p className="text-[10px] font-semibold text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
}
