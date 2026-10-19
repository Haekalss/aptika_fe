import {api} from "@/services/api";

/* ------------------------------------------------------------------ */
/* Tipe & konstanta                                                    */
/* ------------------------------------------------------------------ */

export type StatusPerubahan =
  | "draft"
  | "diajukan"
  | "dikembalikan"
  | "diterima"
  | "ditolak"
  | "disetujui"
  | "dilaksanakan";

export type JenisPerubahan = "permintaan_baru" | "peningkatan_sistem" | "perbaikan_sistem";
export type TingkatRisiko = "malapetaka" | "sangat_berat" | "berat" | "agak_berat" | "tidak_berat";

export type AksiPerubahan =
  | "ajukan"
  | "terima"
  | "kembalikan"
  | "setujui"
  | "tolak"
  | "laksanakan"
  | "simpan_catatan";

export const STATUS_OPTIONS: { value: StatusPerubahan; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "diajukan", label: "Diajukan" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "diterima", label: "Diterima" },
  { value: "ditolak", label: "Ditolak" },
  { value: "disetujui", label: "Disetujui" },
  { value: "dilaksanakan", label: "Dilaksanakan" },
];

export const JENIS_OPTIONS: { value: JenisPerubahan; label: string; desc: string }[] = [
  { value: "permintaan_baru", label: "Permintaan Baru", desc: "Pengadaan layanan atau sistem baru" },
  { value: "peningkatan_sistem", label: "Peningkatan Sistem", desc: "Penambahan kapasitas atau fitur" },
  { value: "perbaikan_sistem", label: "Perbaikan Sistem", desc: "Penanganan kendala atau gangguan" },
];

export const RISIKO_OPTIONS: { value: TingkatRisiko; label: string }[] = [
  { value: "malapetaka", label: "Malapetaka" },
  { value: "sangat_berat", label: "Sangat Berat" },
  { value: "berat", label: "Berat" },
  { value: "agak_berat", label: "Agak Berat" },
  { value: "tidak_berat", label: "Tidak Berat" },
];

export const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
export const jenisLabel = (s?: string | null) => JENIS_OPTIONS.find((o) => o.value === s)?.label ?? "-";
export const risikoLabel = (s?: string | null) => RISIKO_OPTIONS.find((o) => o.value === s)?.label ?? "-";

/** Label untuk kode aksi di riwayat tahapan. */
export const AKSI_RIWAYAT_LABEL: Record<string, string> = {
  draft_dibuat: "Draft dibuat",
  ajukan: "Diajukan",
  ajukan_ulang: "Diajukan ulang",
  terima: "Diterima Koordinator Agen",
  kembalikan: "Dikembalikan ke Pemohon",
  setujui: "Disetujui Penanggung Jawab Perangkat",
  tolak: "Ditolak Penanggung Jawab Perangkat",
  laksanakan: "Dilaksanakan Agen",
  catatan_pelaksanaan: "Catatan pelaksanaan diperbarui",
};

export interface Lampiran {
  id: number;
  nama_asli: string;
  mime: string | null;
  ukuran: number;
}

export interface RiwayatItem {
  id: number;
  aksi: string;
  status_dari: StatusPerubahan | null;
  status_ke: StatusPerubahan;
  catatan: string | null;
  nama_user: string;
  waktu: string | null;
}

export interface IzinPerubahan {
  can_edit: boolean;
  can_ajukan: boolean;
  can_delete: boolean;
  can_terima: boolean;
  can_kembalikan: boolean;
  can_setujui: boolean;
  can_tolak: boolean;
  can_laksanakan: boolean;
}

export interface PerubahanIt {
  id: number;
  no_rfc: string;
  tanggal: string | null;

  judul: string | null;
  /** Nama pemohon (diisi server dari pengguna yang membuat formulir). */
  pemohon: string | null;
  unit_kerja_id: number | null;
  /** Nama unit kerja dari master_unit_kerja. */
  unit_kerja: string | null;
  perangkat_daerah: string | null;
  nomor_surat_kontak: string | null;
  jenis_perubahan: JenisPerubahan | null;
  perubahan_diharapkan: string | null;
  latar_belakang: string | null;
  rincian_perubahan: string | null;
  tingkat_risiko: TingkatRisiko | null;
  keterangan_risiko: string | null;
  solusi_diharapkan: string | null;
  risiko_perubahan: string | null;
  alternatif_perubahan: string | null;
  estimasi_biaya: number | null;
  tanggal_perubahan: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;

  status: StatusPerubahan;
  status_label: string;
  jenis_perubahan_label: string | null;
  tingkat_risiko_label: string | null;

  tanggal_diajukan: string | null;
  catatan_pengembalian: string | null;
  diterima_oleh_id: number | null;
  diterima_oleh_nama: string | null;
  diterima_pada: string | null;
  disetujui_oleh_id: number | null;
  disetujui_oleh_nama: string | null;
  disetujui_pada: string | null;
  alasan_penolakan: string | null;
  dilaksanakan_oleh_id: number | null;
  dilaksanakan_oleh_nama: string | null;
  dilaksanakan_pada: string | null;
  tanggal_pelaksanaan: string | null;
  catatan_pelaksanaan: string | null;

  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;

  izin: IzinPerubahan;
  lampiran: Lampiran[];
  riwayat: RiwayatItem[];
}

/** Nilai isian formulir (semua string agar mudah dikontrol input). */
export interface PerubahanItInput {
  judul: string;
  /** id master_unit_kerja (string agar mudah dikontrol <select>). */
  unit_kerja_id: string;
  perangkat_daerah: string;
  nomor_surat_kontak: string;
  jenis_perubahan: JenisPerubahan | "";
  perubahan_diharapkan: string;
  latar_belakang: string;
  rincian_perubahan: string;
  tingkat_risiko: TingkatRisiko | "";
  keterangan_risiko: string;
  solusi_diharapkan: string;
  risiko_perubahan: string;
  alternatif_perubahan: string;
  /** Hanya digit, mis. "15000000". */
  estimasi_biaya: string;
  tanggal_perubahan: string;
  jam_mulai: string;
  jam_selesai: string;
  /** id pengguna (tabel users) untuk blok pengesahan bagian 05. */
  diterima_oleh_id: string;
  disetujui_oleh_id: string;
  dilaksanakan_oleh_id: string;
}

export const FORM_FIELDS: (keyof PerubahanItInput)[] = [
  "judul",
  "unit_kerja_id",
  "perangkat_daerah",
  "nomor_surat_kontak",
  "jenis_perubahan",
  "perubahan_diharapkan",
  "latar_belakang",
  "rincian_perubahan",
  "tingkat_risiko",
  "keterangan_risiko",
  "solusi_diharapkan",
  "risiko_perubahan",
  "alternatif_perubahan",
  "estimasi_biaya",
  "tanggal_perubahan",
  "jam_mulai",
  "jam_selesai",
  "diterima_oleh_id",
  "disetujui_oleh_id",
  "dilaksanakan_oleh_id",
];

/** Batas lampiran — samakan dengan config/smki_perubahan_it.php. */
export const LAMPIRAN_MAKS_BERKAS = 5;
export const LAMPIRAN_MAKS_KB = 10240;
export const LAMPIRAN_ACCEPT = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg";

export interface PerubahanItStats {
  total: number;
  draft: number;
  diajukan: number;
  dikembalikan: number;
  diterima: number;
  ditolak: number;
  disetujui: number;
  dilaksanakan: number;
}

export interface PerubahanItListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PerubahanItListParams {
  search?: string;
  status?: string;
  jenis_perubahan?: string;
  tingkat_risiko?: string;
  unit_kerja_id?: string;
  page?: number;
  per_page?: number;
}

export interface PerubahanItListResult {
  data: PerubahanIt[];
  stats: PerubahanItStats;
  meta: PerubahanItListMeta;
}

export interface AksiPayload {
  catatan?: string;
  tanggal_pelaksanaan?: string;
}

/* ------------------------------------------------------------------ */
/* Pemanggilan API                                                     */
/* ------------------------------------------------------------------ */

const BASE = "/smki/perubahan-it";

const clean = <T extends Record<string, unknown>>(p?: T) =>
  p
    ? Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    : undefined;

export async function getPerubahanItList(params?: PerubahanItListParams): Promise<PerubahanItListResult> {
  const res = await api.get(BASE, { params: clean(params as Record<string, unknown>) });
  return res.data;
}

export interface UnitKerjaOption {
  id: number;
  nama: string;
}

export interface PenggunaOption {
  id: number;
  nama: string;
}

export interface PerubahanItLookup {
  unit_kerja: UnitKerjaOption[];
  perangkat_daerah: string[];
  /** Daftar pengguna (tabel users) untuk dropdown pengesah; hanya terisi bila scope "all". */
  pengguna: PenggunaOption[];
}

/** scope "all" = semua master unit kerja + daftar pengguna (form & filter); default = hanya unit kerja yang sudah dipakai. */
export async function getPerubahanItLookup(scope?: "all"): Promise<PerubahanItLookup> {
  const res = await api.get(`${BASE}/lookup`, { params: scope ? { scope } : undefined });
  const data = res.data.data;
  return { ...data, pengguna: data.pengguna ?? [] };
}

export async function getPerubahanIt(id: number | string): Promise<PerubahanIt> {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data;
}

export interface SimpanOptions {
  /** "draft" = simpan sebagai Draft, "ajukan" = simpan lalu ajukan. */
  aksiSimpan: "draft" | "ajukan";
  lampiranBaru?: File[];
  hapusLampiranIds?: number[];
}

/** Membuat (tanpa id) atau memperbarui (dengan id) formulir. Mengembalikan data terbaru. */
export async function simpanPerubahanIt(
  input: PerubahanItInput,
  options: SimpanOptions,
  id?: number | string
): Promise<{ message: string; data: PerubahanIt }> {
  const fd = new FormData();

  FORM_FIELDS.forEach((key) => fd.append(key, input[key] ?? ""));
  fd.append("aksi_simpan", options.aksiSimpan);
  (options.lampiranBaru ?? []).forEach((f) => fd.append("lampiran[]", f));
  (options.hapusLampiranIds ?? []).forEach((n) => fd.append("hapus_lampiran[]", String(n)));

  if (id !== undefined) {
    // multipart tidak didukung PUT secara native di PHP, gunakan method spoofing
    fd.append("_method", "PUT");
  }

  const res = await api.post(id !== undefined ? `${BASE}/${id}` : BASE, fd);
  return { message: res.data.message, data: res.data.data };
}

export async function deletePerubahanIt(id: number | string): Promise<string> {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data.message;
}

export async function aksiPerubahanIt(
  id: number | string,
  aksi: AksiPerubahan,
  payload: AksiPayload = {}
): Promise<{ message: string; data: PerubahanIt }> {
  const res = await api.post(`${BASE}/${id}/aksi`, { aksi, ...payload });
  return { message: res.data.message, data: res.data.data };
}

/** Mengunduh lampiran lewat axios (membawa token) lalu memicu penyimpanan file. */
export async function unduhLampiran(perubahanId: number | string, lampiran: Lampiran): Promise<void> {
  const res = await api.get(`${BASE}/${perubahanId}/lampiran/${lampiran.id}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = lampiran.nama_asli;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ */
/* Utilitas                                                            */
/* ------------------------------------------------------------------ */

/** Mengambil error validasi Laravel (422) menjadi { field: pesan }. Kunci "lampiran.0" dipetakan ke "lampiran". */
export function extractFieldErrors(err: any): Record<string, string> {
  const raw = err?.response?.data?.errors;
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  Object.entries(raw as Record<string, string[] | string>).forEach(([k, v]) => {
    const key = k.startsWith("lampiran") ? "lampiran" : k;
    if (!out[key]) out[key] = Array.isArray(v) ? v[0] : String(v);
  });
  return out;
}

export function extractMessage(err: any, fallback: string): string {
  return err?.response?.data?.message || err?.message || fallback;
}

export function formatTanggal(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatWaktu(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString(
    "id-ID",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
}

export function formatRupiah(n?: number | null): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(n ?? 0)}`;
}

const jamTitik = (v: string) => v.slice(0, 5).replace(":", ".");

/** "22.00–00.00 WIB", atau "-" bila jam belum diisi. */
export function formatRentangJam(mulai?: string | null, selesai?: string | null): string {
  if (!mulai && !selesai) return "";
  if (mulai && selesai) return `${jamTitik(mulai)}–${jamTitik(selesai)} WIB`;
  return `${jamTitik((mulai || selesai) as string)} WIB`;
}

/** "15 Okt 2026" (ringkas, untuk tabel). */
export function formatTanggalPendek(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatUkuran(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}