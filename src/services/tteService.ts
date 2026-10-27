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

export const getTtePegawai = async (): Promise<TtePegawai[]> => {
  const res = await api.get("/tte/pegawai");
  return res.data?.data ?? [];
};

/** Pilihan penanda tangan untuk dropdown saat cetak/unduh (dari data pegawai). */
export interface TteOption {
  key: string;
  source: "pegawai";
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
 * Endpoint berada di balik auth, jadi pemakaian sebenarnya lewat
 * komponen TteSpecimen (axios + blob URL).
 */
export const getTteImageUrl = (
  pegawaiId: number | string,
  unit?: string
): string => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const qs = unit ? `?unit=${encodeURIComponent(unit)}` : "";
  return `${base}/tte/spesimen/${pegawaiId}${qs}`;
};