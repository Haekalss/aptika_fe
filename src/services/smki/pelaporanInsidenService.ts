import { api } from "@/services/api";
import type { BagianIData, BagianIIData } from "@/components/smki/pelaporan-insiden/types";
import type { InsidenReport } from "@/components/smki/pelaporan-insiden/types";

export interface InsidenRow {
  id: number;
  kategori_insiden: string;
  kategori_lainnya?: string | null;
  jenis_layanan: string;
  tanggal_laporan: string;
  nama_pelapor: string;
  jabatan_pelapor?: string | null;
  instansi_pelapor: string;
  nip_pelapor?: string | null;
  no_hp_pelapor?: string | null;
  email_pelapor: string;
  waktu_kejadian: string;
  nama_sistem: string;
  jenis_sistem?: string | null;
  url?: string | null;
  ip_address?: string | null;
  os?: string | null;
  web_server?: string | null;
  bukti_pelapor?: string | null;
  bukti_pelapor_nama?: string | null;
  bukti_pelapor_url?: string | null;
  nama_instansi_pemilik?: string | null;
  alamat_instansi?: string | null;
  telp_fax_instansi?: string | null;
  email_instansi?: string | null;
  nama_pic?: string | null;
  jabatan_pic?: string | null;
  nip_pic?: string | null;
  no_hp_pic?: string | null;
  email_pic?: string | null;
  lokasi_insiden?: string | null;
  deskripsi_kejadian?: string | null;
  isp?: string | null;
  is_downtime?: boolean;
  durasi_downtime?: string | null;
  tindakan_awal?: string | null;
  bukti_pemilik?: string | null;
  bukti_pemilik_nama?: string | null;
  bukti_pemilik_url?: string | null;
  status_laporan: string;
}

export interface InsidenLookup {
  kategori: string[];
  jenis_sistem: string[];
  jenis_layanan: string[];
  status: string[];
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
}

export interface InsidenListParams {
  search?: string;
  kategori?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Backend row -> baris tabel ringkas. */
export function toTableItem(row: InsidenRow): InsidenReport {
  return {
    id: row.id,
    tanggal_laporan: fmtDate(row.tanggal_laporan),
    pelapor: row.nama_pelapor,
    kategori_insiden: row.kategori_insiden,
    nama_sistem: row.nama_sistem,
    status: row.status_laporan,
  };
}

export const fetchInsidenList = async (params?: InsidenListParams) => {
  const query: Record<string, string | number> = {};
  if (params?.search) query.search = params.search;
  if (params?.kategori && params.kategori !== "Semua Kategori") query.kategori = params.kategori;
  if (params?.status && params.status !== "Semua Status") query.status = params.status;
  if (params?.page) query.page = params.page;
  query.per_page = params?.per_page ?? 10;
  const res = await api.get("/smki/pelaporan-insiden", { params: query });
  return res.data as {
    success: boolean;
    data: InsidenRow[];
    stats: { total: number; menunggu: number; dalam_penanganan: number; selesai: number };
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  };
};

export const fetchInsidenLookup = async (): Promise<InsidenLookup> => {
  const res = await api.get("/smki/pelaporan-insiden/lookup");
  const d = res.data?.data ?? res.data;
  return {
    kategori: d.kategori ?? [],
    jenis_sistem: d.jenis_sistem ?? [],
    jenis_layanan: d.jenis_layanan ?? [],
    status: d.status ?? [],
    no_dokumen: d.no_dokumen ?? "F16-SMKI",
    no_revisi: d.no_revisi ?? "1.0",
    tanggal_berlaku: d.tanggal_berlaku ?? "14 Februari 2022",
  };
};

export const fetchInsidenDetail = async (id: number | string) => {
  const res = await api.get(`/smki/pelaporan-insiden/${id}`);
  return res.data as { success: boolean; data: InsidenRow };
};

export function buildBagianIFormData(data: BagianIData): FormData {
  const fd = new FormData();
  fd.append("kategori_insiden", data.kategori);
  if (data.kategoriLainnya) fd.append("kategori_lainnya", data.kategoriLainnya);
  fd.append("jenis_layanan", data.jenisLayanan);
  if (data.tanggalLaporan) fd.append("tanggal_laporan", data.tanggalLaporan);
  fd.append("nama_pelapor", data.nama);
  if (data.jabatan) fd.append("jabatan_pelapor", data.jabatan);
  fd.append("instansi_pelapor", data.instansi);
  if (data.nip) fd.append("nip_pelapor", data.nip);
  if (data.noHp) fd.append("no_hp_pelapor", data.noHp);
  fd.append("email_pelapor", data.email);
  if (data.tglKejadian) {
    const waktu = data.waktuKejadian || "00:00";
    fd.append("waktu_kejadian", `${data.tglKejadian} ${waktu}:00`);
  }
  fd.append("nama_sistem", data.namaSistem);
  if (data.jenisSistem) fd.append("jenis_sistem", data.jenisSistem);
  if (data.url) fd.append("url", data.url);
  if (data.ip) fd.append("ip_address", data.ip);
  if (data.os) fd.append("os", data.os);
  if (data.webServer) fd.append("web_server", data.webServer);
  if (data.files[0]) fd.append("bukti_pelapor", data.files[0]);
  return fd;
}

export function buildBagianIIFormData(
  data: BagianIIData,
  opts?: { hapusBuktiPemilik?: boolean; includeStatus?: boolean }
): FormData {
  const fd = new FormData();
  fd.append("_method", "PUT");
  if (data.namaInstansi) fd.append("nama_instansi_pemilik", data.namaInstansi);
  if (data.alamat) fd.append("alamat_instansi", data.alamat);
  if (data.telpFax) fd.append("telp_fax_instansi", data.telpFax);
  if (data.emailInstansi) fd.append("email_instansi", data.emailInstansi);
  if (data.namaPic) fd.append("nama_pic", data.namaPic);
  if (data.jabatanPic) fd.append("jabatan_pic", data.jabatanPic);
  if (data.nipPic) fd.append("nip_pic", data.nipPic);
  if (data.noHpPic) fd.append("no_hp_pic", data.noHpPic);
  if (data.emailPic) fd.append("email_pic", data.emailPic);
  if (data.lokasi) fd.append("lokasi_insiden", data.lokasi);
  if (data.deskripsi) fd.append("deskripsi_kejadian", data.deskripsi);
  if (data.isp) fd.append("isp", data.isp);
  fd.append("is_downtime", data.downtime === "Ya" ? "1" : "0");
  if (data.durasi) fd.append("durasi_downtime", data.durasi);
  if (data.tindakan) fd.append("tindakan_awal", data.tindakan);
  if (opts?.includeStatus !== false && data.status) fd.append("status_laporan", data.status);
  if (data.files[0]) fd.append("bukti_pemilik", data.files[0]);
  if (opts?.hapusBuktiPemilik) fd.append("hapus_bukti_pemilik", "1");
  return fd;
}

export const createInsiden = async (payload: FormData) => {
  const res = await api.post("/smki/pelaporan-insiden", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateInsiden = async (id: number | string, payload: FormData) => {
  // Laravel: file upload via PUT harus POST + _method=PUT
  if (!payload.has("_method")) payload.append("_method", "PUT");
  const res = await api.post(`/smki/pelaporan-insiden/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteInsiden = async (id: number) => {
  const res = await api.delete(`/smki/pelaporan-insiden/${id}`);
  return res.data;
};

function filenameFromDisposition(cd: string | undefined, fallback: string): string {
  if (cd) {
    const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/.exec(cd);
    const raw = m?.[1] ?? m?.[2];
    if (raw) {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return fallback;
}

/** Unduh bukti via endpoint API (CORS aman + attachment + nama asli). */
export const downloadBukti = async (
  id: number | string,
  tipe: "pelapor" | "pemilik" = "pelapor"
): Promise<void> => {
  const res = await api.get(`/smki/pelaporan-insiden/${id}/unduh`, {
    params: { tipe },
    responseType: "blob",
  });
  const filename = filenameFromDisposition(
    res.headers?.["content-disposition"] as string | undefined,
    tipe === "pemilik" ? "bukti-pemilik" : "bukti-pelapor"
  );
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export interface InsidenDocxParams {
  no_dokumen?: string;
  no_revisi?: string;
  tanggal_berlaku?: string;
}

/** Unduh dokumen FR-016 (.docx) untuk satu laporan. Header kop bisa diisi via params. */
export const downloadInsidenDocx = async (
  id: number | string,
  params?: InsidenDocxParams
): Promise<void> => {
  const res = await api.get(`/smki/pelaporan-insiden/${id}/export-docx`, {
    params,
    responseType: "blob",
  });
  const filename = filenameFromDisposition(
    res.headers?.["content-disposition"] as string | undefined,
    `FR016_Laporan_Insiden_${id}.docx`
  );
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};
