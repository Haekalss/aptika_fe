import { isAxiosError } from "axios";
import { api } from "@/services/api";

export interface DaftarAsetVirtualRowPayload {
  kode_aset: string;
  nama_instance: string;
  deskripsi: string;
  tipe_virtualisasi: string;
  alamat: string;
  hostname: string;
  spesifikasi: string;
  pemilik: string;
  klasifikasi: string;
}

export interface DaftarAsetVirtualPayload {
  status: "Draf" | "Tersimpan";
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
  kode_aset: string;
  nama_aset: string;
  lokasi_aset: string;
  rows: DaftarAsetVirtualRowPayload[];
}

interface ApiDaftarAsetVirtualRow extends DaftarAsetVirtualRowPayload {
  id: number;
  urutan: number;
}

interface ApiDaftarAsetVirtual {
  id: number | string;
  no_dokumen: string | null;
  no_revisi: string | null;
  tanggal_berlaku: string | null;
  kode_aset: string | null;
  nama_aset: string | null;
  lokasi_aset: string | null;
  status: "Draf" | "Tersimpan";
  rows?: ApiDaftarAsetVirtualRow[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DaftarAsetVirtual {
  id: string;
  noDokumen: string;
  noRevisi: string;
  tanggalBerlaku: string;
  kodeAset: string;
  namaAset: string;
  lokasiAset: string;
  rows: Array<{
    id: number;
    kodeAset: string;
    namaInstance: string;
    deskripsi: string;
    tipeVirtualisasi: string;
    alamat: string;
    hostname: string;
    spesifikasi: string;
    pemilik: string;
    klasifikasi: string;
  }>;
  savedAt: string;
  status: "Draf" | "Tersimpan";
}

const mapForm = (form: ApiDaftarAsetVirtual): DaftarAsetVirtual => ({
  id: String(form.id),
  noDokumen: form.no_dokumen ?? "",
  noRevisi: form.no_revisi ?? "",
  tanggalBerlaku: form.tanggal_berlaku ?? "",
  kodeAset: form.kode_aset ?? "",
  namaAset: form.nama_aset ?? "",
  lokasiAset: form.lokasi_aset ?? "",
  rows: (form.rows ?? []).map((row, index) => ({
    id: row.urutan ?? index + 1,
    kodeAset: row.kode_aset ?? "",
    namaInstance: row.nama_instance ?? "",
    deskripsi: row.deskripsi ?? "",
    tipeVirtualisasi: row.tipe_virtualisasi ?? "",
    alamat: row.alamat ?? "",
    hostname: row.hostname ?? "",
    spesifikasi: row.spesifikasi ?? "",
    pemilik: row.pemilik ?? "",
    klasifikasi: row.klasifikasi ?? "",
  })),
  savedAt: form.updated_at ?? form.created_at ?? new Date().toISOString(),
  status: form.status,
});

export const fetchAllDaftarAsetVirtual = async (): Promise<DaftarAsetVirtual[]> => {
  const forms: DaftarAsetVirtual[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await api.get("/smki/daftar-aset-virtual", {
      params: { page, per_page: 100 },
    });
    const result = response.data as {
      data?: ApiDaftarAsetVirtual[];
      meta?: { current_page?: number; last_page?: number };
    };

    if (!Array.isArray(result.data)) {
      throw new Error("Respons daftar aset virtual dari server tidak valid.");
    }

    forms.push(...result.data.map(mapForm));
    lastPage = result.meta?.last_page ?? page;
    page = (result.meta?.current_page ?? page) + 1;
  } while (page <= lastPage);

  return forms;
};

export const fetchDaftarAsetVirtual = async (id: string): Promise<DaftarAsetVirtual> => {
  const response = await api.get(`/smki/daftar-aset-virtual/${id}`);
  return mapForm(response.data.data as ApiDaftarAsetVirtual);
};

export const createDaftarAsetVirtual = async (
  payload: DaftarAsetVirtualPayload,
): Promise<DaftarAsetVirtual> => {
  const response = await api.post("/smki/daftar-aset-virtual", payload);
  return mapForm(response.data.data as ApiDaftarAsetVirtual);
};

export const updateDaftarAsetVirtual = async (
  id: string,
  payload: DaftarAsetVirtualPayload,
): Promise<DaftarAsetVirtual> => {
  const response = await api.put(`/smki/daftar-aset-virtual/${id}`, payload);
  return mapForm(response.data.data as ApiDaftarAsetVirtual);
};

export const deleteDaftarAsetVirtual = async (id: string): Promise<void> => {
  await api.delete(`/smki/daftar-aset-virtual/${id}`);
};

export const getDaftarAsetVirtualErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    } | undefined;
    const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
    return validationMessage ?? data?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
};
