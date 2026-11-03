import { api } from "@/services/api";

export interface ReviuCctvItem {
  id?: number;
  uraian_reviu: string;
  tindak_lanjut: string | null;
  target_selesai: string | null;
  keterangan: string | null;
}

export interface ReviuCctv {
  id: number;
  tanggal_reviu: string;
  periode_mulai: string | null;
  periode_selesai: string | null;
  obyek_reviu: string;
  pelaksana_reviu: string;
  pengelola_nama: string | null;
  pengelola_nip: string | null;
  created_at?: string;
  updated_at?: string;
  total_uraian?: number;
  items?: ReviuCctvItem[];
  user?: { id: number; name: string; email: string } | null;
}

export interface ReviuCctvPayload {
  tanggal_reviu: string;
  periode_mulai?: string | null;
  periode_selesai?: string | null;
  obyek_reviu: string;
  pelaksana_reviu: string;
  pengelola_nama?: string | null;
  pengelola_nip?: string | null;
  items: ReviuCctvItem[];
}

export interface ReviuCctvStats {
  total_reviu: number;
  total_uraian: number;
  reviu_bulan_ini: number;
  tindak_lanjut_aktif: number;
}

export interface GetReviuCctvParams {
  search?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  page?: number;
  per_page?: number;
}

export const fetchReviuCctvList = async (params?: GetReviuCctvParams) => {
  const res = await api.get("/smki/reviu-cctv", { params });
  return res.data;
};

export const fetchReviuCctvDetail = async (id: number | string) => {
  const res = await api.get(`/smki/reviu-cctv/${id}`);
  return res.data;
};

export const createReviuCctv = async (data: ReviuCctvPayload) => {
  const res = await api.post("/smki/reviu-cctv", data);
  return res.data;
};

export const updateReviuCctv = async (id: number | string, data: ReviuCctvPayload) => {
  const res = await api.put(`/smki/reviu-cctv/${id}`, data);
  return res.data;
};

export const deleteReviuCctv = async (id: number | string) => {
  const res = await api.delete(`/smki/reviu-cctv/${id}`);
  return res.data;
};

/** Unduh formulir FR-038 (.docx) hasil pengisian template asli. */
export const downloadReviuCctvDocx = async (
  id: number | string,
  tte?: { nama?: string | null; nip?: string | null }
): Promise<void> => {
  const params: Record<string, string> = {};
  if (tte?.nama) params.nama = tte.nama;
  if (tte?.nip) params.nip = tte.nip;

  const res = await api.get(`/smki/reviu-cctv/${id}/export-docx`, {
    responseType: "blob",
    params: Object.keys(params).length ? params : undefined,
  });
  const cd = res.headers?.["content-disposition"] as string | undefined;
  const m = cd ? /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/.exec(cd) : null;
  const filename = m ? decodeURIComponent(m[1] ?? m[2]) : `FR-038_Reviu_CCTV_${id}.docx`;
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

export const reviuCctvErrMsg = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0] as string;
  return data?.message || fallback;
};
