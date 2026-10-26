import { api } from "@/services/api";

export type EvaluasiStatus = "Patuh" | "Tidak Patuh" | "Dalam Proses";

export const EVALUASI_STATUS_OPTIONS: EvaluasiStatus[] = ["Patuh", "Tidak Patuh", "Dalam Proses"];

export interface EvaluasiItem {
  id?: number;
  dokumen_kepatuhan: string;
  deskripsi: string;
  evaluasi_status: EvaluasiStatus;
}

export interface EvaluasiKepatuhan {
  id: number;
  tanggal_evaluasi: string;
  ditandatangani_di: string | null;
  tanggal_ttd: string | null;
  created_at?: string;
  updated_at?: string;
  total_dokumen?: number;
  patuh_count?: number;
  tidak_patuh_count?: number;
  dalam_proses_count?: number;
  items?: EvaluasiItem[];
}

export interface EvaluasiFormPayload {
  tanggal_evaluasi: string;
  ditandatangani_di?: string | null;
  tanggal_ttd?: string | null;
  items: EvaluasiItem[];
}

export interface GetEvaluasiParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const fetchEvaluasiList = async (params?: GetEvaluasiParams) => {
  const res = await api.get("/smki/evaluasi-kepatuhan", { params });
  return res.data;
};

export const fetchEvaluasiDetail = async (id: number) => {
  const res = await api.get(`/smki/evaluasi-kepatuhan/${id}`);
  return res.data;
};

export const createEvaluasi = async (data: EvaluasiFormPayload) => {
  const res = await api.post("/smki/evaluasi-kepatuhan", data);
  return res.data;
};

export const updateEvaluasi = async (id: number, data: EvaluasiFormPayload) => {
  const res = await api.put(`/smki/evaluasi-kepatuhan/${id}`, data);
  return res.data;
};

export const deleteEvaluasi = async (id: number) => {
  const res = await api.delete(`/smki/evaluasi-kepatuhan/${id}`);
  return res.data;
};

export const downloadEvaluasiDocx = async (
  id: number,
  params?: { no_dokumen?: string; no_revisi?: string; tanggal_berlaku?: string }
) => {
  const res = await api.get(`/smki/evaluasi-kepatuhan/${id}/export-docx`, {
    params,
    responseType: "blob",
  });
  return res.data;
};

export const formatTanggalIndo = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "Patuh":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    case "Tidak Patuh":
      return "bg-red-50 text-red-600 border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  }
};
