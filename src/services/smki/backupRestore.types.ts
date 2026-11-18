export type BackupRestoreOperation = "backup" | "restore";
export type BackupRestoreResult = "berhasil" | "gagal";
export type BackupRestoreSignatory = "pelaksana" | "penanggung-jawab";
export interface BackupRestoreAttachment {
  id: number;
  original_name: string;
  mime: string;
  size: number;
}
export interface BackupRestoreEntry {
  id?: number;
  month: number;
  operation: BackupRestoreOperation;
  result: BackupRestoreResult | null;
  performed_on: string | null;
  notes: string | null;
  attachments: BackupRestoreAttachment[];
}
export interface BackupRestoreAsset {
  id?: number;
  client_key: string;
  urutan?: number;
  aset_ti_id: number | null;
  virtual_instance_id: number | null;
  kode_aset: string | null;
  nama_aset: string | null;
  entries: BackupRestoreEntry[];
}
export interface Fr030FormState {
  refresh_signatories?: ("pelaksana" | "penanggung_jawab")[];
  version?: number;
  tahun: number;
  nomor_dokumen: string;
  nomor_revisi: string;
  tanggal_terbit: string;
  pelaksana_pegawai_id: number | null;
  penanggung_jawab_pegawai_id: number | null;
  assets: BackupRestoreAsset[];
}
export interface BackupRestoreReport extends Omit<Fr030FormState, "tanggal_terbit" | "nomor_dokumen" | "nomor_revisi"> {
  id: number;
  version: number;
  bidang_id: number;
  unit_kerja_nama: string;
  status: "draft" | "final";
  nomor_dokumen: string | null;
  nomor_revisi: string | null;
  tanggal_terbit: string | null;
  pelaksana_nama: string | null;
  pelaksana_nip: string | null;
  pelaksana_jabatan: string | null;
  pelaksana_pangkat: string | null;
  penanggung_jawab_nama: string | null;
  penanggung_jawab_nip: string | null;
  penanggung_jawab_jabatan: string | null;
  penanggung_jawab_pangkat: string | null;
  finalized_at: string | null;
  updated_at: string;
  permissions: { can_update: boolean; can_delete: boolean; can_export: boolean };
}
export interface SaveBackupRestorePayload extends Omit<Fr030FormState, "tanggal_terbit" | "assets"> {
  tanggal_terbit: string | null;
  finalize: boolean;
  assets: (Omit<BackupRestoreAsset, "entries"> & { entries: Omit<BackupRestoreEntry, "attachments">[] })[];
}
export interface BackupRestoreFilters {
  year?: number;
  status?: "draft" | "final";
  search?: string;
  page?: number;
  per_page?: number;
}
export interface BackupRestorePage<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
export interface BackupRestoreLookupParams { asset_type: "physical" | "virtual"; search?: string; page?: number }
export interface BackupRestoreLookup {
  bidang: { id: number; nama: string };
  assets: BackupRestorePage<{ id: number; kode_aset: string | null; nama_aset: string }>;
}
