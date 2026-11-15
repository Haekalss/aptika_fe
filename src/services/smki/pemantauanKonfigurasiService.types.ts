// Tipe kontrak API untuk modul FR-048 — Pemantauan Manajemen Konfigurasi.
// Selaras dengan Use_Case_Scenario_Rapi.docx (FR-048) dan ERD_FR-048.png.

export type PemantauanStatus = "draft" | "diajukan" | "revisi" | "selesai";
export type Kesesuaian = "sesuai" | "tidak_sesuai";
export type HasilPemantauan = "sesuai_seluruhnya" | "ada_ketidaksesuaian" | null;
export type AksiRiwayat =
  | "dibuat"
  | "diajukan"
  | "diajukan_ulang"
  | "dikembalikan"
  | "disetujui"
  | "diperbarui";

// ─── Master ───────────────────────────────────────────────────────────────
export interface JenisKonfigurasiDto {
  id: number;
  nama: string;
  keterangan: string | null;
  isActive: boolean;
}
export interface ObjekDto {
  id: number;
  jenisKonfigurasiId: number;
  jenisKonfigurasiNama: string | null;
  nama: string;
  isActive: boolean;
}
export interface NilaiStandarDto {
  id: number;
  objekId: number;
  objekNama: string | null;
  namaKonfigurasi: string;
  nilaiStandar: string;
  isActive: boolean;
}
export interface OptionDto {
  id: number;
  nama: string;
}
export interface AdminOptionDto {
  id: number;
  name: string;
  email?: string;
  position?: string | null;
}

// ─── Pemantauan ───────────────────────────────────────────────────────────
export interface KonfigurasiItemDto {
  id?: number;
  objekId: number;
  namaKonfigurasi: string;
  nilaiAktual: string;
  nilaiStandar: string | null;
  nilaiStandarId?: number | null;
  kesesuaian: Kesesuaian | null;
  /** true jika baris ini berasal dari nilai standar (nama terkunci, tidak bisa dihapus) */
  isStandar: boolean;
  keterangan: string;
}
export interface PemantauanObjekDto {
  id?: number;
  objekId: number;
  objekNama: string;
  items: KonfigurasiItemDto[];
}
export interface RiwayatItemDto {
  id: number;
  aksi: AksiRiwayat;
  pelaku: string;
  siklus: number;
  waktu: string;
  catatan: string | null;
  hasil: HasilPemantauan;
}
export interface PemantauanListItemDto {
  id: number;
  noFormulir: string;
  objekRingkas: string;
  tanggalPemantauan: string;
  periode: number;
  jenisKonfigurasiNama: string;
  status: PemantauanStatus;
  hasil: HasilPemantauan;
  siklus: number;
  pelaksanaNama: string;
  adminNama: string | null;
  updatedAt: string;
}
export interface PemantauanDetailDto {
  id: number;
  noFormulir: string;
  noRevisi: string;
  tanggalBerlaku: string;
  tanggalPemantauan: string;
  periode: number;
  jenisKonfigurasiId: number;
  jenisKonfigurasiNama: string;
  status: PemantauanStatus;
  hasil: HasilPemantauan;
  jumlahSesuai: number;
  jumlahTidakSesuai: number;
  catatanTindakLanjut: string;
  catatanAdmin: string | null;
  pelaksanaId: number;
  pelaksanaNama: string;
  adminId: number | null;
  adminNama: string | null;
  tanggalTtdPelaksana: string | null;
  tanggalTtdAdmin: string | null;
  /** Snapshot TTE pemantauan (nama/jabatan saat ditandatangani). */
  ttdPelaksanaNama?: string | null;
  ttdPelaksanaJabatan?: string | null;
  ttdAdminNama?: string | null;
  ttdAdminJabatan?: string | null;
  siklus: number;
  objekList: PemantauanObjekDto[];
  riwayat: RiwayatItemDto[];
  createdAt: string;
  updatedAt: string;
}
export interface PemantauanSummaryDto {
  total: number;
  draft: number;
  diajukan: number;
  revisi: number;
  selesai: number;
}
export interface PaginatedDto<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}
export interface ListQuery {
  q?: string;
  periode?: number | "";
  jenisId?: number | "";
  status?: PemantauanStatus | "";
  page?: number;
  perPage?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────
export interface IdentifikasiPayload {
  noFormulir: string;
  noRevisi: string;
  tanggalBerlaku: string;
  tanggalPemantauan: string;
  periode: number;
  jenisKonfigurasiId: number;
  objekIds: number[];
}
export interface AjukanPayload {
  adminId: number;
  catatanTindakLanjut: string;
}
export interface KembalikanPayload {
  catatan: string;
}
export interface MasterJenisPayload {
  nama: string;
  keterangan?: string | null;
  isActive?: boolean;
}
export interface MasterObjekPayload {
  jenisKonfigurasiId: number;
  nama: string;
  isActive?: boolean;
}
export interface NilaiStandarRowPayload {
  id?: number;
  namaKonfigurasi: string;
  nilaiStandar: string;
}
