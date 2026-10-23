import { api } from "@/services/api";

/** Data penanda tangan dari master pegawai. */
export interface TtePegawai {
  id: number;
  nama: string;
  nip: string | null;
  pangkat: string | null;
  jabatan: string | null;
  role: string | null;
}

/** Data TTE siap render untuk blok tanda tangan dokumen. */
export interface TteData {
  pegawai_id: number;
  nama: string;
  nip: string | null;
  jabatan: string;
  unit: string;
  pangkat: string;
  golongan: string;
  kalimat: string;
  gambar_url: string;
}

/** Satu entri master spesimen TTE (tersimpan di database). */
export interface TteSpesimenItem {
  id: number;
  pegawai_id: number | null;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  pangkat: string | null;
  golongan: string | null;
  unit: string;
  kalimat: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TteSpesimenPayload = {
  pegawai_id?: number | null;
  nama: string;
  nip?: string;
  jabatan?: string;
  pangkat?: string;
  golongan?: string;
  unit?: string;
  kalimat?: string;
  is_active?: boolean;
};

export const getTtePegawai = async (): Promise<TtePegawai[]> => {
  const res = await api.get("/tte/pegawai");
  return res.data?.data ?? [];
};

/** Pilihan penanda tangan untuk dropdown saat cetak/unduh. */
export interface TteOption {
  key: string;
  source: "master" | "pegawai";
  id: number;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  unit: string | null;
  label: string;
}

export const getTteOptions = async (): Promise<TteOption[]> => {
  const res = await api.get("/tte/options");
  return res.data?.data ?? [];
};

export const getTteData = async (
  pegawaiId: number | string,
  unit?: string
): Promise<TteData | null> => {
  const res = await api.get(`/tte/data/${pegawaiId}`, {
    params: unit ? { unit } : undefined,
  });
  return res.data?.data ?? null;
};

/**
 * URL gambar spesimen TTE untuk dipakai di <img src>.
 * Ditambahkan token agar bisa dimuat langsung oleh tag <img> saat cetak.
 */
export const getTteImageUrl = (
  pegawaiId: number | string,
  unit?: string
): string => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const qs = unit ? `?unit=${encodeURIComponent(unit)}` : "";
  return `${base}/tte/spesimen/${pegawaiId}${qs}`;
};

// ─── Master Spesimen TTE (CRUD) ────────────────────────────────────

export const getTteSpesimenList = async (params?: { search?: string }) => {
  const res = await api.get("/tte/master", { params });
  return res.data;
};

export const createTteSpesimen = async (payload: TteSpesimenPayload) => {
  const res = await api.post("/tte/master", payload);
  return res.data;
};

export const updateTteSpesimen = async (id: number, payload: TteSpesimenPayload) => {
  const res = await api.put(`/tte/master/${id}`, payload);
  return res.data;
};

export const deleteTteSpesimen = async (id: number) => {
  const res = await api.delete(`/tte/master/${id}`);
  return res.data;
};

/** Ambil gambar spesimen tersimpan sebagai blob URL (endpoint butuh token). */
export const fetchTteSpesimenImage = async (
  id: number,
  bust?: string
): Promise<string> => {
  const res = await api.get(`/tte/master/${id}/image`, {
    responseType: "blob",
    params: bust ? { v: bust } : undefined,
  });
  return URL.createObjectURL(res.data as Blob);
};

/** Preview gambar dari isi form sebelum disimpan. */
export const previewTteSpesimen = async (payload: TteSpesimenPayload): Promise<string> => {
  const res = await api.post("/tte/master/preview", payload, {
    responseType: "blob",
  });
  return URL.createObjectURL(res.data as Blob);
};
