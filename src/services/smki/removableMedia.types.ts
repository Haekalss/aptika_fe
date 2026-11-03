export interface Fr025Option { id: number; name: string }
export type Fr025Condition = "baik" | "kurang_baik" | "rusak";
export interface Fr025Item {
  id?: number;
  urutan?: number;
  nama_barang_id: number | null;
  nama_barang: string | null;
  merek_id: number | null;
  merek: string | null;
  jumlah: number | null;
  tahun_pengadaan: number | null;
  pic_id: number | null;
  pic_nama: string | null;
  kondisi: Fr025Condition | null;
  keterangan: string | null;
}
export interface Fr025Template { code: string; revision: string; effective_date: string }
export interface Fr025Report {
  id: number;
  reference: string;
  bidang_id: number;
  unit_kerja_nama: string;
  created_by_nama: string;
  nomor_dokumen: string;
  nomor_revisi: string;
  tanggal_berlaku: string;
  tanggal_dokumen: string | null;
  tempat: string | null;
  pengurus_barang_user_id: number | null;
  pengurus_barang_nama: string | null;
  kepala_unit_user_id: number | null;
  kepala_unit_nama: string | null;
  status: "draft" | "final";
  version: number;
  finalized_at: string | null;
  template_version: string;
  template: Fr025Template;
  items?: Fr025Item[];
  items_count?: number;
  total_jumlah?: number;
  permissions: { can_update: boolean; can_delete: boolean; can_export: boolean };
}
export interface Fr025Lookup {
  unit: Fr025Option;
  names: Fr025Option[];
  brands: Fr025Option[];
  pics: Fr025Option[];
  users: Fr025Option[];
  conditions: Record<Fr025Condition, string>;
  template: Fr025Template;
}
export interface Fr025Payload {
  version?: number;
  finalize: boolean;
  nomor_dokumen: string;
  nomor_revisi: string;
  tanggal_berlaku: string;
  tanggal_dokumen: string | null;
  tempat: string | null;
  pengurus_barang_user_id: number | null;
  pengurus_barang_nama: string | null;
  kepala_unit_user_id: number | null;
  kepala_unit_nama: string | null;
  items: Fr025Item[];
}
export interface Fr025List {
  data: Fr025Report[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}
export interface Fr025Filters { search?: string; status?: string; page?: number }
