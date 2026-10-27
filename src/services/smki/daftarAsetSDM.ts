import { api } from "@/services/api";

export interface PelatihanItem {
  id?: number;
  nama: string;
  tahun: string;
}

export interface AsetSdm {
  id: number;
  kode_aset: string;
  nama: string;
  nip: string;
  pangkat_golongan: string;
  jabatan: string;
  tmt_jabatan: string | null;
  tmt_jabatan_label: string | null;
  unit_kerja_id: number;
  unit_kerja: string;
  jabatan_smki: string;
  tanggung_jawab: string;
  jenjang: string;
  jurusan: string;
  tahun_lulus: string;
  pelatihan: PelatihanItem[];
}

export type AsetSdmInput = {
  nama: string;
  nip: string;
  pangkat_golongan: string;
  jabatan: string;
  tmt_jabatan: string | null;
  unit_kerja_id: number;
  jabatan_smki: string;
  tanggung_jawab: string;
  jenjang: string;
  jurusan: string;
  tahun_lulus: string | number;
  pelatihan: { nama: string; tahun: string | number }[];
};

export interface AsetSdmListParams {
  search?: string;
  pangkat_golongan?: string;
  jabatan?: string;
  unit_kerja_id?: number | string;
  page?: number;
  per_page?: number;
}

export interface AsetSdmStats {
  total_aset: number;
  total_jabatan: number;
  total_unit: number;
}

export interface AsetSdmMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AsetSdmListResponse {
  success: boolean;
  data: AsetSdm[];
  stats: AsetSdmStats;
  meta: AsetSdmMeta;
}

export interface AsetSdmLookup {
  pangkat_golongan: string[];
  jabatan: string[];
  unit_kerja: { id: number; nama: string }[];
}

export const JENJANG_OPTIONS = ["SMA/SMK", "D3", "D4", "S1", "S2", "S3"];

const BASE = "/smki/daftar-aset-sdm";

export const getDaftarAsetSdmAll = async (
  params?: AsetSdmListParams
): Promise<AsetSdmListResponse> => {
  const res = await api.get(BASE, { params });
  return res.data;
};

export const getAsetSdmLookup = async (
  params?: { scope?: "all" }
): Promise<AsetSdmLookup> => {
  const res = await api.get(`${BASE}/lookup`, { params });
  return res.data.data;
};

/** Semua master unit kerja (untuk dropdown pada form tambah/ubah). */
export const getUnitKerjaOptions = async (): Promise<AsetSdmLookup["unit_kerja"]> => {
  const res = await api.get(`${BASE}/lookup`, { params: { scope: "all" } });
  return res.data.data.unit_kerja;
};

export const getAsetSdm = async (id: number | string): Promise<AsetSdm> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data;
};

export const createAsetSdm = async (input: AsetSdmInput): Promise<AsetSdm> => {
  const res = await api.post(BASE, input);
  return res.data.data;
};

export const updateAsetSdm = async (
  id: number | string,
  input: AsetSdmInput
): Promise<AsetSdm> => {
  const res = await api.put(`${BASE}/${id}`, input);
  return res.data.data;
};

export const deleteAsetSdm = async (id: number | string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};