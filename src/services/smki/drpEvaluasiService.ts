import { api } from "@/services/api";

export interface DrpWaktu { id?: number; sistem_ti: string; rto_ideal: string | null; pencapaian_rto: string | null; kendala: string | null }
export interface DrpProses { id?: number; proses: string; aktivitas: string | null; hasil_evaluasi: string | null; rekomendasi: string | null; pic: string | null }
export interface DrpTim { id?: number; peran: string; tanggung_jawab: string | null; evaluasi: string | null; rekomendasi: string | null }

export type DrpChecklist = Record<string, boolean>;

/** Kriteria Check List Pengujian BCP (sama dengan template FR-039 dan SmkiDrpEvaluasi::CHECKLIST di backend). */
export const CHECKLIST_GROUPS: { kategori: string; kategoriEn: string; items: { key: string; teks: string }[] }[] = [
  {
    kategori: "Kelengkapan", kategoriEn: "Completeness",
    items: [
      { key: "kelengkapan_1", teks: "Setiap langkah dalam rencana dilakukan semua (langkah tidak hilang)" },
      { key: "kelengkapan_2", teks: "Peserta tidak perlu membuat asumsi yang bukan bagian dari rencana" },
      { key: "kelengkapan_3", teks: "Informasi yang diperlukan di dalam rencana tersedia (nomor telepon, alamat, lokasi)" },
    ],
  },
  {
    kategori: "Kejelasan", kategoriEn: "Clarity",
    items: [
      { key: "kejelasan_1", teks: "Peserta memahami arah atau langkah-langkah yang diberikan dalam rencana, tidak memerlukan klarifikasi dari koordinator" },
      { key: "kejelasan_2", teks: "Tujuan untuk setiap bagian sudah jelas" },
      { key: "kejelasan_3", teks: "Rencana organisasi jelas dan logis, peserta tidak \"tersesat\" dalam rencana" },
    ],
  },
  {
    kategori: "Kemungkinan dapat dieksekusi", kategoriEn: "Executability",
    items: [
      { key: "eksekusi_1", teks: "Rencana memiliki titik awal yang jelas" },
      { key: "eksekusi_2", teks: "Rencana memiliki titik akhir yang jelas" },
      { key: "eksekusi_3", teks: "Rencana tertulis sedemikian rupa sehingga ada aliran logis dari awal sampai akhir" },
      { key: "eksekusi_4", teks: "Recovery Time Objectives (RTO) yang realistis" },
    ],
  },
];

export const CHECKLIST_KEYS = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export interface DrpEvaluasi {
  id: number;
  tanggal_pengujian: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  tujuan: string;
  cakupan: string;
  tipe_pengujian: string;
  asumsi_bencana: string | null;
  asumsi_sumber_daya: string | null;
  checklist: DrpChecklist | null;
  lampiran: string | null;
  dibuat_oleh_nama: string | null;
  dibuat_oleh_tanggal: string | null;
  diperiksa_oleh_nama: string | null;
  diperiksa_oleh_tanggal: string | null;
  disetujui_oleh_nama: string | null;
  disetujui_oleh_tanggal: string | null;
  created_at?: string;
  total_sistem?: number;
  total_proses?: number;
  total_tim?: number;
  waktu?: DrpWaktu[];
  proses?: DrpProses[];
  tim?: DrpTim[];
  user?: { id: number; name: string; email: string } | null;
}

export interface DrpEvaluasiPayload {
  tanggal_pengujian: string;
  waktu_mulai?: string | null;
  waktu_selesai?: string | null;
  tujuan: string;
  cakupan: string;
  tipe_pengujian: string;
  asumsi_bencana?: string | null;
  asumsi_sumber_daya?: string | null;
  checklist: DrpChecklist;
  lampiran?: string | null;
  dibuat_oleh_nama?: string | null;
  dibuat_oleh_tanggal?: string | null;
  diperiksa_oleh_nama?: string | null;
  diperiksa_oleh_tanggal?: string | null;
  disetujui_oleh_nama?: string | null;
  disetujui_oleh_tanggal?: string | null;
  waktu: DrpWaktu[];
  proses: DrpProses[];
  tim: DrpTim[];
}

export interface DrpEvaluasiStats {
  total_evaluasi: number;
  evaluasi_bulan_ini: number;
  total_sistem: number;
  total_rekomendasi: number;
}

export interface GetDrpEvaluasiParams {
  search?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  page?: number;
  per_page?: number;
}

export const fetchDrpEvaluasiList = async (params?: GetDrpEvaluasiParams) => (await api.get("/smki/evaluasi-drp", { params })).data;
export const fetchDrpEvaluasiDetail = async (id: number | string) => (await api.get(`/smki/evaluasi-drp/${id}`)).data;
export const createDrpEvaluasi = async (data: DrpEvaluasiPayload) => (await api.post("/smki/evaluasi-drp", data)).data;
export const updateDrpEvaluasi = async (id: number | string, data: DrpEvaluasiPayload) => (await api.put(`/smki/evaluasi-drp/${id}`, data)).data;
export const deleteDrpEvaluasi = async (id: number | string) => (await api.delete(`/smki/evaluasi-drp/${id}`)).data;

/** Unduh formulir FR-039 (.docx) hasil pengisian template asli. */
export const downloadDrpEvaluasiDocx = async (id: number | string): Promise<void> => {
  const res = await api.get(`/smki/evaluasi-drp/${id}/export-docx`, { responseType: "blob" });
  const cd = res.headers?.["content-disposition"] as string | undefined;
  const m = cd ? /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/.exec(cd) : null;
  const filename = m ? decodeURIComponent(m[1] ?? m[2]) : `FR-039_Evaluasi_Pengujian_DRP_${id}.docx`;
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const formatTanggalIndo = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

/** "17 Oktober 2026, 09:00 - 12:30 WIB" (sama dengan hasil ekspor .docx). */
export const formatWaktuPengujian = (tanggal?: string | null, mulai?: string | null, selesai?: string | null): string => {
  let t = formatTanggalIndo(tanggal);
  const a = mulai ? mulai.slice(0, 5) : "";
  const b = selesai ? selesai.slice(0, 5) : "";
  if (a && b) t += `, ${a} - ${b} WIB`;
  else if (a || b) t += `, ${a || b} WIB`;
  return t;
};

export const drpEvaluasiErrMsg = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0] as string;
  return data?.message || fallback;
};
