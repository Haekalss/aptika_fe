import { api } from "@/services/api";

export type JenisPerangkat = "Laptop" | "PC" | "Tab";

export const JENIS_PERANGKAT_OPTIONS: JenisPerangkat[] = ["Laptop", "PC", "Tab"];

export interface PerangkatItem {
  id?: number;
  nama: string;
  nip: string | null;
  jenis_perangkat: JenisPerangkat | "";
  merek_tipe: string;
  nomor_seri: string;
}

export interface PerangkatPribadi {
  id: number;
  nama: string;
  nip: string | null;
  jabatan: string;
  unit_kerja: string;
  ditandatangani_di: string | null;
  tanggal_ttd: string | null;
  created_at?: string;
  updated_at?: string;
  total_perangkat?: number;
  laptop_count?: number;
  pc_count?: number;
  tab_count?: number;
  perangkat?: PerangkatItem[];
  user?: { id: number; name: string; email: string } | null;
}

export interface PerangkatPribadiPayload {
  nama: string;
  nip?: string | null;
  jabatan: string;
  unit_kerja: string;
  ditandatangani_di?: string | null;
  tanggal_ttd?: string | null;
  perangkat: PerangkatItem[];
}

export interface PerangkatPribadiStats {
  total_formulir: number;
  total_perangkat: number;
  laptop: number;
  pc: number;
  tab: number;
}

export interface GetPerangkatPribadiParams {
  search?: string;
  jenis_perangkat?: string;
  page?: number;
  per_page?: number;
}

export const fetchPerangkatPribadiList = async (params?: GetPerangkatPribadiParams) => {
  const res = await api.get("/smki/perangkat-pribadi", { params });
  return res.data;
};

export const fetchPerangkatPribadiDetail = async (id: number | string) => {
  const res = await api.get(`/smki/perangkat-pribadi/${id}`);
  return res.data;
};

export const createPerangkatPribadi = async (data: PerangkatPribadiPayload) => {
  const res = await api.post("/smki/perangkat-pribadi", data);
  return res.data;
};

export const updatePerangkatPribadi = async (id: number | string, data: PerangkatPribadiPayload) => {
  const res = await api.put(`/smki/perangkat-pribadi/${id}`, data);
  return res.data;
};

export const deletePerangkatPribadi = async (id: number | string) => {
  const res = await api.delete(`/smki/perangkat-pribadi/${id}`);
  return res.data;
};

export const formatTanggalIndo = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export const ringkasJenis = (f: PerangkatPribadi): string => {
  const parts = [
    f.laptop_count ? `${f.laptop_count} Laptop` : "",
    f.pc_count ? `${f.pc_count} PC` : "",
    f.tab_count ? `${f.tab_count} Tab` : "",
  ].filter(Boolean);
  return parts.join(" · ") || "-";
};

export const perangkatErrMsg = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0] as string;
  return data?.message || fallback;
};
