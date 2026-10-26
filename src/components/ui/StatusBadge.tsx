"use client";

const STATUS_STYLE: Record<string, string> = {
  "Menunggu Pemilik Sistem":
    "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Dalam Penanganan":
    "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Selesai:
    "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  // Jenis perangkat TI (FR-045 BYOD)
  Laptop:
    "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  PC: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Tab: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

/** Atom global: badge status. Tambah entri di STATUS_STYLE untuk modul lain. */
export default function StatusBadge({
  status,
  uppercase = false,
}: {
  status: string;
  uppercase?: boolean;
}) {
  const style =
    STATUS_STYLE[status] ??
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md tracking-wider border ${style} ${
        uppercase ? "uppercase" : ""
      }`}
    >
      {status}
    </span>
  );
}
export { StatusBadge };
