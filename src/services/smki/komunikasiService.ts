import { api } from "@/services/api";

export type KomunikasiType = "internal" | "eksternal";

export interface KomunikasiItem {
  id: number;
  tipe: KomunikasiType;
  judul: string;
  klasifikasi: string;
  pengirim: string;
  penerima: string;
  frekuensi: string;
  metode: string;
  periode: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string } | null;
  bidang?: { id: number; name: string } | null;
}

export interface HeaderInfoFR010 {
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
  periode: string;
}

export interface GetKomunikasiParams {
  search?: string;
  klasifikasi?: string;
  periode?: string;
  tipe?: KomunikasiType;
}

export interface KomunikasiListResponse {
  success: boolean;
  header: HeaderInfoFR010;
  data: KomunikasiItem[];
  internal: KomunikasiItem[];
  eksternal: KomunikasiItem[];
  stats: { total: number; internalCount: number; eksternalCount: number };
}

export async function fetchKomunikasiList(params?: GetKomunikasiParams): Promise<KomunikasiListResponse> {
  const res = await api.get("/smki/komunikasi", { params });
  return res.data;
}

export async function getKomunikasiById(id: number): Promise<KomunikasiItem> {
  const res = await api.get(`/smki/komunikasi/${id}`);
  return res.data.data;
}

export async function createKomunikasi(data: Omit<KomunikasiItem, "id" | "created_at" | "updated_at" | "user" | "bidang">): Promise<KomunikasiItem> {
  const res = await api.post("/smki/komunikasi", data);
  return res.data.data;
}

export async function updateKomunikasi(
  id: number,
  data: Partial<Omit<KomunikasiItem, "id" | "created_at" | "updated_at" | "user" | "bidang">>
): Promise<KomunikasiItem> {
  const res = await api.put(`/smki/komunikasi/${id}`, data);
  return res.data.data;
}

export async function deleteKomunikasi(id: number): Promise<boolean> {
  const res = await api.delete(`/smki/komunikasi/${id}`);
  return res.data?.success ?? true;
}

export const updateKomunikasiHeader = async (data: HeaderInfoFR010): Promise<HeaderInfoFR010> => {
  const res = await api.put("/smki/komunikasi/header", data);
  return res.data.data;
};
