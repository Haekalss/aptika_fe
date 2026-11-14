import type {
  Fr021LogAksi,
  Fr021SifatPekerjaan,
  Fr021Status,
} from "@/services/smki/evaluasiPenyedia.types";

const FR021_STATUS_LABEL: Record<Fr021Status, string> = {
  draft: "Draft",
  diajukan: "Menunggu Persetujuan",
  revisi: "Perlu Revisi",
  selesai: "Selesai",
};

export function fr021StatusLabel(status: Fr021Status): string {
  return FR021_STATUS_LABEL[status] ?? status;
}

/** Pilihan sifat pekerjaan (FR-1.3). */
export const FR021_SIFAT_PEKERJAAN_OPTIONS: {
  value: Fr021SifatPekerjaan;
  label: string;
}[] = [
  { value: "pengadaan_baru", label: "Pengadaan Baru" },
  { value: "maintenance_perawatan", label: "Maintenance/Perawatan" },
  { value: "lainnya", label: "Lainnya" },
];

export function fr021SifatLabel(sifat: Fr021SifatPekerjaan): string {
  return (
    FR021_SIFAT_PEKERJAAN_OPTIONS.find((o) => o.value === sifat)?.label ?? sifat
  );
}

/** Label aksi pada timeline riwayat. */
export const FR021_AKSI_LABEL: Record<Fr021LogAksi, string> = {
  dibuat: "Dibuat",
  diajukan: "Diajukan",
  dikembalikan: "Dikembalikan untuk Revisi",
  diajukan_ulang: "Diajukan Ulang",
  disetujui: "Disetujui",
};

/** Langkah wizard (mockup: 4 langkah). */
export type Fr021Step = "identifikasi" | "penilaian" | "hasil" | "tinjauan";

export const FR021_STEPS: {
  id: Fr021Step;
  label: string;
  hint: string;
}[] = [
  { id: "identifikasi", label: "Identifikasi", hint: "Data penyedia & pekerjaan" },
  { id: "penilaian", label: "Penilaian", hint: "4 kriteria kinerja" },
  { id: "hasil", label: "Hasil & Pengajuan", hint: "Nilai, rekomendasi & tanda tangan" },
  { id: "tinjauan", label: "Persetujuan", hint: "Tinjauan Atasan" },
];

export const FR021_STEP_INDEX: Record<Fr021Step, number> = {
  identifikasi: 0,
  penilaian: 1,
  hasil: 2,
  tinjauan: 3,
};

/** Basis route modul. */
export const FR021_ROUTES = {
  list: "/smki/evaluasi-penyedia",
  baru: "/smki/evaluasi-penyedia/baru",
  detail: (id: number | string) => `/smki/evaluasi-penyedia/${id}`,
} as const;
