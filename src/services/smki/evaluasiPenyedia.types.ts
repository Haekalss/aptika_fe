/**
 * Tipe data FR-021 — Evaluasi Kinerja Penyedia Barang/Jasa.
 *
 * Kontrak API mengikuti PRD FR-021 §9 dan mengikuti konvensi
 * service SMKI lain (lihat `tindakanPerbaikan.types.ts`).
 */

export type Fr021Status = "draft" | "diajukan" | "revisi" | "selesai";

export type Fr021SifatPekerjaan =
  | "pengadaan_baru"
  | "maintenance_perawatan"
  | "lainnya";

export type Fr021LogAksi =
  | "dibuat"
  | "diajukan"
  | "dikembalikan"
  | "diajukan_ulang"
  | "disetujui";

/* ───────────────────────── Master data ───────────────────────── */

export interface Fr021Kriteria {
  id: number;
  urutan: number;
  nama_kriteria: string;
}

export interface Fr021Skala {
  id: number;
  label: string;
  skor: number;
}

export interface Fr021Rekomendasi {
  id: number;
  kategori: string;
  nilai_min: number;
  nilai_max: number;
  keterangan: string;
}

export interface Fr021Master {
  kriteria: Fr021Kriteria[];
  skala: Fr021Skala[];
  rekomendasi: Fr021Rekomendasi[];
  template: {
    nomor_dokumen: string;
    nomor_revisi: string;
    tanggal_berlaku: string;
  };
}

/* ───────────────────────── Entitas ───────────────────────── */

export interface Fr021Penyedia {
  id: number;
  nama_penyedia: string;
  contact_person: string | null;
  email: string | null;
}

export interface Fr021UserRef {
  id: number;
  name: string;
  position?: string | null;
}

export interface Fr021Penilaian {
  id?: number;
  kriteria_id: number;
  skala_id: number;
  skor: number;
  kriteria?: Fr021Kriteria | null;
  skala?: Fr021Skala | null;
}

export interface Fr021Evaluasi {
  id: number;
  /** Pemilik/pembuat laporan. Evaluator adalah perwakilan vendor (tanpa akun). */
  created_by?: number;
  penyedia_id: number;
  penyedia?: Fr021Penyedia | null;
  admin_id: number | null;
  admin?: Fr021UserRef | null;
  rekomendasi_id: number | null;
  rekomendasi?: Fr021Rekomendasi | null;
  no_kontrak: string;
  nomor_dokumen?: string | null;
  nomor_revisi?: string | null;
  tanggal_berlaku?: string | null;
  sifat_pekerjaan: Fr021SifatPekerjaan;
  sifat_pekerjaan_lainnya: string | null;
  total_nilai: number | null;
  status: Fr021Status;
  catatan_revisi: string | null;
  siklus: number;
  tempat: string | null;
  tanggal_evaluasi: string;

  /* Snapshot TTE Evaluator */
  ttd_evaluator_nama: string | null;
  ttd_evaluator_nip: string | null;
  ttd_evaluator_jabatan: string | null;
  tanggal_ttd_evaluator: string | null;

  /* Snapshot TTE Atasan (Mengetahui) */
  ttd_admin_nama: string | null;
  ttd_admin_nip: string | null;
  ttd_admin_jabatan: string | null;
  tanggal_ttd_admin: string | null;

  penilaian: Fr021Penilaian[];

  permissions: {
    can_update: boolean;
    can_delete: boolean;
    can_ajukan: boolean;
    can_approve: boolean;
    can_export: boolean;
  };

  version: number;
  created_at?: string;
  updated_at?: string;
}

/* ───────────────────────── Payload ───────────────────────── */

export interface Fr021IdentifikasiPayload {
  penyedia_id: number | null;
  /** Nama penyedia baru; dipakai bila `penyedia_id` masih kosong. */
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
  version?: number;
}

export interface Fr021PenilaianItemPayload {
  kriteria_id: number;
  skala_id: number;
}

export interface Fr021PenilaianPayload {
  penilaian: Fr021PenilaianItemPayload[];
  version?: number;
}

export interface Fr021AjukanPayload {
  admin_id: number;
  version?: number;
}

export interface Fr021KembalikanPayload {
  catatan: string;
  version?: number;
}

export interface Fr021PenyediaPayload {
  nama_penyedia: string;
  contact_person?: string;
  email?: string;
}

/* ───────────────────────── Riwayat ───────────────────────── */

interface Fr021LogPenilaian {
  kriteria_id: number;
  skala_id: number;
  skor: number;
  kriteria?: Fr021Kriteria | null;
  skala?: Fr021Skala | null;
}

export interface Fr021Log {
  id: number;
  aksi: Fr021LogAksi;
  siklus: number;
  catatan: string | null;
  total_nilai: number | null;
  rekomendasi_id: number | null;
  rekomendasi?: Fr021Rekomendasi | null;
  user?: Fr021UserRef | null;
  created_at: string;
  penilaian?: Fr021LogPenilaian[];
}

/* ───────────────────────── Daftar & lookup ───────────────────────── */

export interface Fr021ListParams {
  q?: string;
  sifat?: Fr021SifatPekerjaan | "";
  status?: Fr021Status | "";
  page?: number;
  per_page?: number;
}

export interface Fr021ListSummary {
  total: number;
  draft: number;
  diajukan: number;
  revisi: number;
  selesai: number;
}

export interface Fr021ListResponse {
  data: Fr021Evaluasi[];
  summary: Fr021ListSummary;
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export type Fr021Errors = Record<string, string[]>;
