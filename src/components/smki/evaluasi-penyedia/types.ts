import type {
  Fr021Errors,
  Fr021Master,
  Fr021SifatPekerjaan,
  Fr021Status,
} from "@/services/smki/evaluasiPenyedia.types";

/** Satu baris penilaian saat masih diedit (skala boleh belum dipilih). */
export interface Fr021PenilaianDraft {
  kriteria_id: number;
  skala_id: number | null;
}

/**
 * State form gabungan Step 1–4.
 * Identifikasi + penilaian + pilihan Atasan + catatan tinjauan.
 */
export interface Fr021FormState {
  penyedia_id: number | null;
  /** Nama penyedia baru (dipakai bila `penyedia_id` kosong). */
  penyedia_nama: string;
  contact_person: string;
  email: string;
  no_kontrak: string;
  nomor_dokumen: string;
  nomor_revisi: string;
  tanggal_berlaku: string;
  sifat_pekerjaan: Fr021SifatPekerjaan;
  sifat_pekerjaan_lainnya: string;
  tanggal_evaluasi: string;
  tempat: string;
  penilaian: Fr021PenilaianDraft[];
  admin_id: number | null;
  catatan_tinjauan: string;
  version?: number;
}

/** Props baku untuk setiap section form (identifikasi, penilaian, dst). */
export interface Fr021SectionProps {
  form: Fr021FormState;
  master: Fr021Master;
  errors: Fr021Errors;
  onChange: (changes: Partial<Fr021FormState>) => void;
  disabled?: boolean;
}

/** Identitas record yang sedang diedit (untuk mode create/edit). */
export interface Fr021FormIdentity {
  id?: number;
  version?: number;
  status?: Fr021Status;
}
