import type { Fr025Condition, Fr025Item, Fr025Payload, Fr025Report, Fr025Template } from "@/services/smki/removableMedia.types";

export interface Fr025FormItem extends Omit<Fr025Item, "jumlah" | "tahun_pengadaan" | "id" | "urutan"> {
  client_key: string;
  jumlah: string;
  tahun_pengadaan: string;
}
export interface Fr025FormState {
  nomor_dokumen: string;
  nomor_revisi: string;
  tanggal_berlaku: string;
  tanggal_dokumen: string;
  tempat: string;
  pengurus_barang_user_id: number | null;
  pengurus_barang_nama: string;
  kepala_unit_user_id: number | null;
  kepala_unit_nama: string;
  items: Fr025FormItem[];
}
export function blankFr025Item(): Fr025FormItem {
  return { client_key: crypto.randomUUID(), nama_barang_id: null, nama_barang: "", merek_id: null, merek: "", jumlah: "", tahun_pengadaan: "", pic_id: null, pic_nama: "", kondisi: null, keterangan: "" };
}
export function fr025Form(report?: Fr025Report, defaults?: Fr025Template): Fr025FormState {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" });
  return {
    nomor_dokumen: report?.nomor_dokumen ?? report?.template.code ?? defaults?.code ?? "",
    nomor_revisi: report?.nomor_revisi ?? report?.template.revision ?? defaults?.revision ?? "",
    tanggal_berlaku: report?.tanggal_berlaku ?? report?.template.effective_date ?? defaults?.effective_date ?? "",
    tanggal_dokumen: report ? report.tanggal_dokumen ?? "" : today,
    tempat: report ? report.tempat ?? "" : "Bandung",
    pengurus_barang_user_id: report?.pengurus_barang_user_id ?? null,
    pengurus_barang_nama: report?.pengurus_barang_nama ?? "",
    kepala_unit_user_id: report?.kepala_unit_user_id ?? null,
    kepala_unit_nama: report?.kepala_unit_nama ?? "",
    items: report ? (report.items ?? []).map((item) => ({ ...item, client_key: crypto.randomUUID(), jumlah: item.jumlah == null ? "" : String(item.jumlah), tahun_pengadaan: item.tahun_pengadaan == null ? "" : String(item.tahun_pengadaan) })) : [blankFr025Item()],
  };
}
const nullableText = (value?: string | null) => value?.trim() || null;
export function fr025Payload(form: Fr025FormState, finalize: boolean, version?: number): Fr025Payload {
  return {
    ...(version == null ? {} : { version }), finalize,
    nomor_dokumen: form.nomor_dokumen.trim(), nomor_revisi: form.nomor_revisi.trim(), tanggal_berlaku: form.tanggal_berlaku,
    tanggal_dokumen: form.tanggal_dokumen || null, tempat: nullableText(form.tempat),
    pengurus_barang_user_id: form.pengurus_barang_user_id, pengurus_barang_nama: nullableText(form.pengurus_barang_nama),
    kepala_unit_user_id: form.kepala_unit_user_id, kepala_unit_nama: nullableText(form.kepala_unit_nama),
    items: form.items.map((item) => ({
      nama_barang_id: item.nama_barang_id, nama_barang: nullableText(item.nama_barang), merek_id: item.merek_id, merek: nullableText(item.merek),
      jumlah: item.jumlah.trim() === "" ? null : Number(item.jumlah), tahun_pengadaan: item.tahun_pengadaan.trim() === "" ? null : Number(item.tahun_pengadaan),
      pic_id: item.pic_id, pic_nama: nullableText(item.pic_nama), kondisi: item.kondisi as Fr025Condition | null, keterangan: nullableText(item.keterangan),
    })),
  };
}
export function fr025Date(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
