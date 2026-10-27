import { api } from "@/services/api";

export type Lingkup = "Data Center" | "Gedung";
export type KesesuaianWaktu = "Sesuai" | "Tidak Sesuai";
export type Fungsi = "Berfungsi" | "Mati";
export type Rekaman = "Baik" | "Buruk";
export type Obstacle = "Ada" | "Tidak Ada";

export const LINGKUP_OPTIONS: Lingkup[] = ["Data Center", "Gedung"];
export const KESESUAIAN_OPTIONS: KesesuaianWaktu[] = ["Sesuai", "Tidak Sesuai"];
export const FUNGSI_OPTIONS: Fungsi[] = ["Berfungsi", "Mati"];
export const REKAMAN_OPTIONS: Rekaman[] = ["Baik", "Buruk"];
export const OBSTACLE_OPTIONS: Obstacle[] = ["Tidak Ada", "Ada"];

export interface CctvItem {
  id?: number;
  kode_cctv: string;
  nama_cctv: string;
  lokasi: string;
  fungsi: Fungsi;
  rekaman: Rekaman;
  obstacle: Obstacle;
  keterangan: string | null;
  tindak_lanjut: string | null;
  petugas: string | null;
}

export interface PemeriksaanCctv {
  id: number;
  lingkup: Lingkup;
  perangkat_perekaman: string;
  tanggal_pemeriksaan: string;
  kesesuaian_waktu: KesesuaianWaktu;
  nama_pemeriksa: string | null;
  created_at?: string;
  updated_at?: string;
  total_cctv?: number;
  bermasalah_count?: number;
  items?: CctvItem[];
}

export interface PemeriksaanFormPayload {
  lingkup: Lingkup;
  perangkat_perekaman: string;
  tanggal_pemeriksaan: string;
  kesesuaian_waktu: KesesuaianWaktu;
  nama_pemeriksa?: string | null;
  items: CctvItem[];
}

export interface TerakhirData {
  lingkup: Lingkup;
  perangkat_perekaman: string;
  nama_pemeriksa: string | null;
  tanggal_pemeriksaan: string;
  items: { kode_cctv: string; nama_cctv: string; lokasi: string; petugas: string | null }[];
}

export interface GetPemeriksaanParams {
  search?: string;
  lingkup?: string;
  kondisi?: string;
  page?: number;
  per_page?: number;
}

export const fetchPemeriksaanList = async (params?: GetPemeriksaanParams) => {
  const res = await api.get("/smki/pemeriksaan-cctv", { params });
  return res.data;
};

export const fetchPemeriksaanDetail = async (id: number) => {
  const res = await api.get(`/smki/pemeriksaan-cctv/${id}`);
  return res.data;
};

export const fetchPemeriksaanTerakhir = async (lingkup?: string) => {
  const res = await api.get("/smki/pemeriksaan-cctv/terakhir", { params: { lingkup: lingkup || undefined } });
  return res.data as { success: boolean; data: TerakhirData | null };
};

export const createPemeriksaan = async (data: PemeriksaanFormPayload) => {
  const res = await api.post("/smki/pemeriksaan-cctv", data);
  return res.data;
};

export const updatePemeriksaan = async (id: number, data: PemeriksaanFormPayload) => {
  const res = await api.put(`/smki/pemeriksaan-cctv/${id}`, data);
  return res.data;
};

export const deletePemeriksaan = async (id: number) => {
  const res = await api.delete(`/smki/pemeriksaan-cctv/${id}`);
  return res.data;
};

export const downloadPemeriksaanDocx = async (
  id: number,
  params?: { no_dokumen?: string; no_revisi?: string; tanggal_berlaku?: string }
) => {
  const res = await api.get(`/smki/pemeriksaan-cctv/${id}/export-docx`, { params, responseType: "blob" });
  return res.data;
};

export const formatTanggalIndo = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export const isBermasalah = (it: Pick<CctvItem, "fungsi" | "rekaman" | "obstacle">) =>
  it.fungsi === "Mati" || it.rekaman === "Buruk" || it.obstacle === "Ada";

const good = "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
const bad = "bg-red-50 text-red-600 border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";

/** Warna lencana: hijau = kondisi baik, merah = bermasalah. */
export const kondisiBadgeClass = (value: string): string =>
  ["Berfungsi", "Baik", "Tidak Ada", "Sesuai"].includes(value) ? good : bad;
