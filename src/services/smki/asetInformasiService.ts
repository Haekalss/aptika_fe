import { api } from "@/services/api";

export interface UnitKerjaDetailItem {
  id?: number;
  no_urut?: number;
  kode_aset?: string;
  nama_aset: string;
  klasifikasi: string; // Publik, Internal, Rahasia
  tahun_pembuatan?: string;
  tahun_update?: string;
  deskripsi?: string;
  format_penyimpanan: string; // Hardcopy / Softcopy
  masa_simpan?: string;
  lokasi_penyimpanan?: string;
  pemilik_aset?: string;
  keterangan?: string;
}

export interface IntangibleDetailItem {
  id?: number;
  no_urut?: number;
  kode_aset?: string;
  layanan?: string;
  nama_aset: string;
  sub_klasifikasi?: string;
  pemilik_aset?: string;
  kerahasiaan: number; // 1-3
  integritas: number; // 1-3
  ketersediaan: number; // 1-3
  nilai?: number; // max(C,I,A)
  keterangan?: string; // Tinggi, Sedang, Rendah
}

export interface FormulirAsetInformasiItem {
  id: number;
  no_formulir: string;
  revisi: string;
  tanggal: string;
  bidang_nama: string;
  klasifikasi_dokumen: string;
  bidang_id: number;
  user_id?: number;
  catatan?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  unit_kerja_details_count?: number;
  intangible_details_count?: number;
  unit_kerja_details?: UnitKerjaDetailItem[];
  intangible_details?: IntangibleDetailItem[];
}

export interface AsetInformasiListResponse {
  status: string;
  data: FormulirAsetInformasiItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_dokumen: number;
    total_unit_kerja: number;
    total_intangible: number;
    total_rahasia: number;
  };
}

export const getAsetInformasiList = async (params?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<AsetInformasiListResponse> => {
  const response = await api.get("/smki/aset-informasi", {
    params,
  });
  return response.data;
};

export const getAsetInformasiDetail = async (
  id: number | string
): Promise<{ status: string; data: FormulirAsetInformasiItem }> => {
  const response = await api.get(`/smki/aset-informasi/${id}`);
  return response.data;
};

export const createAsetInformasi = async (payload: {
  no_formulir: string;
  revisi: string;
  tanggal: string;
  bidang_nama?: string;
  klasifikasi_dokumen?: string;
  catatan?: string;
  unit_kerja_details?: UnitKerjaDetailItem[];
  intangible_details?: IntangibleDetailItem[];
}): Promise<{ status: string; message: string; data: FormulirAsetInformasiItem }> => {
  const response = await api.post("/smki/aset-informasi", payload);
  return response.data;
};

export const updateAsetInformasi = async (
  id: number | string,
  payload: {
    no_formulir: string;
    revisi: string;
    tanggal: string;
    bidang_nama?: string;
    klasifikasi_dokumen?: string;
    catatan?: string;
    unit_kerja_details?: UnitKerjaDetailItem[];
    intangible_details?: IntangibleDetailItem[];
  }
): Promise<{ status: string; message: string; data: FormulirAsetInformasiItem }> => {
  const response = await api.put(`/smki/aset-informasi/${id}`, payload);
  return response.data;
};

export const deleteAsetInformasi = async (
  id: number | string
): Promise<{ status: string; message: string }> => {
  const response = await api.delete(`/smki/aset-informasi/${id}`);
  return response.data;
};

export const exportAsetInformasiExcel = async (id: number | string): Promise<Blob> => {
  const response = await api.get(`/smki/aset-informasi/${id}/export-excel`, {
    responseType: "blob",
  });
  return response.data;
};
