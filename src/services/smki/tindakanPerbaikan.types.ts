export type Fr009ActionType = "koreksi" | "tindakan_korektif";
export type Fr009SourceCode = "audit_internal" | "laporan_insiden" | "audit_eksternal" | "usulan_saran" | "pengukuran_pemantauan" | "lainnya";
export type Fr009Verification = "Open" | "Close";

export interface Fr009Action {
  id?: number;
  jenis: Fr009ActionType;
  uraian: string;
  pic_id: number | null;
  pic_nama: string;
  batas_waktu: string | null;
  urutan: number;
}

export interface Fr009Payload {
  nomor_laporan: string | null;
  id_unit_kerja: number | null;
  area: string;
  tanggal_laporan: string | null;
  diajukan_kepada_id: number | null;
  diajukan_kepada_nama: string;
  dilaporkan_oleh_id: number | null;
  dilaporkan_oleh_nama: string;
  sumber_codes: Fr009SourceCode[];
  sumber_lainnya: string;
  status_temuan: "Minor" | null;
  deskripsi: string;
  akar_masalah: string;
  id_auditor: number | null;
  auditor_nama: string;
  atasan_id: number | null;
  atasan_nama: string;
  items: Fr009Action[];
  version?: number;
}

export interface Fr009Record extends Fr009Payload {
  id: number;
  status: "draft" | "submitted";
  verifikasi: Fr009Verification | null;
  tanggal_verifikasi: string | null;
  catatan_verifikasi: string | null;
  created_by: number;
  bidang_id: number | null;
  verified_by: number | null;
  version: number;
  template_version: string;
  verifications?: {
    id: number; verifikasi: Fr009Verification; tanggal_verifikasi: string; catatan_verifikasi: string;
    auditor_nama: string | null; atasan_nama: string | null; verified_by: number | null;
    created_at: string; content_version: number;
  }[];
  permissions: { can_update: boolean; can_delete: boolean; can_verify: boolean; can_export: boolean };
}

export interface Fr009Lookup {
  units: { id_unit_kerja: number; nama_unit_kerja: string }[];
  users: { id: number; name: string; position?: string | null }[];
  auditors: { id_auditor: number; nama_auditor: string; nip_auditor?: string | null }[];
  sources: { code: Fr009SourceCode; label: string }[];
  template: { code: string; revision: string; effective_date: string; classification: string };
  export_pdf_available: boolean; // Server converter only; browser PDF works independently.
}

export interface Fr009ListParams {
  search?: string;
  source?: Fr009SourceCode;
  status?: string;
  verifikasi?: string;
  page?: number;
  per_page?: number;
}

export interface Fr009ListResponse {
  data: Fr009Record[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
  summary: { total: number; needs_follow_up: number; closed: number };
}

export interface Fr009VerifyPayload {
  version: number;
  verifikasi: Fr009Verification;
  tanggal_verifikasi: string;
  catatan_verifikasi: string;
  id_auditor: number | null;
  auditor_nama: string;
  atasan_id: number | null;
  atasan_nama: string;
}

export type Fr009Errors = Record<string, string[]>;
