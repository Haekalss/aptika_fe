// Konstanta tampilan modul FR-048.
import type { AksiRiwayat, PemantauanStatus, Kesesuaian } from "@/services/smki/pemantauanKonfigurasiService.types";

export const STATUS_MAP: Record<PemantauanStatus, { label: string; badgeClass: string; dotClass: string }> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  diajukan: {
    label: "Menunggu Persetujuan",
    badgeClass: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  revisi: {
    label: "Perlu Revisi",
    badgeClass: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500",
  },
  selesai: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
};

export const AKSI_LABEL: Record<AksiRiwayat, string> = {
  dibuat: "Pemantauan dibuat",
  diajukan: "Diajukan untuk peninjauan",
  diajukan_ulang: "Diajukan ulang setelah revisi",
  dikembalikan: "Dikembalikan untuk revisi",
  disetujui: "Disetujui & disahkan",
  diperbarui: "Diperbarui",
};

export const KESESUAIAN_MAP: Record<Kesesuaian, { label: string; badgeClass: string }> = {
  sesuai: {
    label: "Sesuai",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  tidak_sesuai: {
    label: "Tidak Sesuai",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  },
};

export const PERIODE_OPTIONS = [
  { value: 1, label: "Triwulan 1" },
  { value: 2, label: "Triwulan 2" },
  { value: 3, label: "Triwulan 3" },
  { value: 4, label: "Triwulan 4" },
];

export const periodeLabel = (p: number) => PERIODE_OPTIONS.find((o) => o.value === p)?.label ?? `Periode ${p}`;

/** Hasil pemantauan untuk tampilan. */
export const hasilLabel = (h: "sesuai_seluruhnya" | "ada_ketidaksesuaian" | null | undefined) =>
  h === "sesuai_seluruhnya" ? "Sesuai Seluruhnya" : h === "ada_ketidaksesuaian" ? "Ada Ketidaksesuaian" : "Belum diperiksa";

export const formatTanggal = (iso: string | null | undefined) => {  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};
export const formatWaktu = (iso: string | null | undefined) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
