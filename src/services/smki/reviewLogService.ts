import { api } from "@/services/api";

export interface ReviewLogItem {
  id?: number;
  user_log: string;
  ip_address: string;
  tanggal: string;
  waktu: string;
  durasi: string;
}

export interface ReviewLog {
  id: number;
  tanggal_review: string;
  periode_mulai: string | null;
  periode_selesai: string | null;
  obyek_review: string;
  pelaksana_review: string;
  tindak_lanjut: string | null;
  dibuat_oleh_nama: string | null;
  dibuat_oleh_nip: string | null;
  mengetahui_nama: string | null;
  mengetahui_nip: string | null;
  ditandatangani_di: string | null;
  tanggal_ttd: string | null;
  created_at?: string;
  updated_at?: string;
  total_log?: number;
  items?: ReviewLogItem[];
  user?: { id: number; name: string; email: string } | null;
}

export interface ReviewLogPayload {
  tanggal_review: string;
  periode_mulai?: string | null;
  periode_selesai?: string | null;
  obyek_review: string;
  pelaksana_review: string;
  tindak_lanjut?: string | null;
  dibuat_oleh_nama?: string | null;
  dibuat_oleh_nip?: string | null;
  mengetahui_nama?: string | null;
  mengetahui_nip?: string | null;
  ditandatangani_di?: string | null;
  tanggal_ttd?: string | null;
  items: ReviewLogItem[];
}

export interface ReviewLogStats {
  total_review: number;
  total_log: number;
  review_bulan_ini: number;
  ada_tindak_lanjut: number;
}

export interface GetReviewLogParams {
  search?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  page?: number;
  per_page?: number;
}

export const fetchReviewLogList = async (params?: GetReviewLogParams) => {
  const res = await api.get("/smki/review-log", { params });
  return res.data;
};

export const fetchReviewLogDetail = async (id: number | string) => {
  const res = await api.get(`/smki/review-log/${id}`);
  return res.data;
};

export const createReviewLog = async (data: ReviewLogPayload) => {
  const res = await api.post("/smki/review-log", data);
  return res.data;
};

export const updateReviewLog = async (id: number | string, data: ReviewLogPayload) => {
  const res = await api.put(`/smki/review-log/${id}`, data);
  return res.data;
};

export const deleteReviewLog = async (id: number | string) => {
  const res = await api.delete(`/smki/review-log/${id}`);
  return res.data;
};

/** Unduh formulir FR-040 (.docx) hasil pengisian template asli. */
export const downloadReviewLogDocx = async (id: number | string): Promise<void> => {
  const res = await api.get(`/smki/review-log/${id}/export-docx`, { responseType: "blob" });
  const cd = res.headers?.["content-disposition"] as string | undefined;
  const m = cd ? /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/.exec(cd) : null;
  const filename = m ? decodeURIComponent(m[1] ?? m[2]) : `FR-040_Review_Log_${id}.docx`;
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

/** Tanggal ringkas gaya kop dokumen, mis. 07-Jul-2022 (sama dengan hasil ekspor .docx). */
export const formatTanggalRingkas = (value?: string | null): string => {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${m[3]}-${bln[Number(m[2]) - 1]}-${m[1]}`;
};

export const formatTanggalIndo = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export const formatPeriode = (mulai?: string | null, selesai?: string | null): string => {
  if (!mulai && !selesai) return "-";
  if (mulai && selesai && mulai !== selesai) return `${formatTanggalIndo(mulai)} s.d. ${formatTanggalIndo(selesai)}`;
  return formatTanggalIndo(mulai || selesai);
};

export const formatWaktu = (value?: string | null): string => (value ? value.slice(0, 5) : "-");

export const reviewLogErrMsg = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0] as string;
  return data?.message || fallback;
};
