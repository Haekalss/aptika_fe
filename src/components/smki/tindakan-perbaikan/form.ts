import type { Fr009ActionType, Fr009Payload, Fr009Record } from "@/services/smki/tindakanPerbaikan.types";
import type { Fr009FormAction, Fr009FormState } from "./types";

export function createAction(jenis: Fr009ActionType): Fr009FormAction {
  return { clientKey: crypto.randomUUID(), jenis, uraian: "", pic_id: null, pic_nama: "", batas_waktu: null, urutan: 0 };
}

/** Match API/DB validation indexes without reordering or mutating the editing draft. */
export function orderedFilledActions(items: readonly Fr009FormAction[]): Fr009FormAction[] {
  const filled = items.filter((item) => (item.uraian ?? "").trim() || item.pic_id || (item.pic_nama ?? "").trim() || item.batas_waktu);
  return [
    ...filled.filter((item) => item.jenis === "koreksi"),
    ...filled.filter((item) => item.jenis === "tindakan_korektif"),
  ];
}

export function emptyFr009Form(reporter?: { id: number; name: string } | null): Fr009FormState {
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return {
    nomor_laporan: "", id_unit_kerja: null, area: "", tanggal_laporan: localDate,
    diajukan_kepada_id: null, diajukan_kepada_nama: "", dilaporkan_oleh_id: reporter?.id ?? null,
    dilaporkan_oleh_nama: reporter?.name ?? "", sumber_codes: [], sumber_lainnya: "", status_temuan: null,
    deskripsi: "", akar_masalah: "", id_auditor: null, auditor_nama: "", atasan_id: null, atasan_nama: "",
    items: [createAction("koreksi"), createAction("tindakan_korektif")],
  };
}

export function recordToForm(record: Fr009Record): Fr009FormState {
  const base = emptyFr009Form();
  return {
    ...base, ...toFr009Payload({ ...record, items: record.items.map((item) => ({ ...item, clientKey: `saved-${item.id ?? crypto.randomUUID()}` })) }),
    tanggal_laporan: record.tanggal_laporan?.slice(0, 10) ?? null,
    items: record.items.map((item) => ({ ...item, uraian: item.uraian ?? "", pic_nama: item.pic_nama ?? "", batas_waktu: item.batas_waktu?.slice(0, 10) ?? null, clientKey: `saved-${item.id ?? crypto.randomUUID()}` })),
  };
}

export function toFr009Payload(form: Fr009FormState): Fr009Payload {
  const order: Record<Fr009ActionType, number> = { koreksi: 0, tindakan_korektif: 0 };
  return {
    nomor_laporan: form.nomor_laporan?.trim() || null,
    id_unit_kerja: form.id_unit_kerja, area: (form.area ?? "").trim(), tanggal_laporan: form.tanggal_laporan || null,
    diajukan_kepada_id: form.diajukan_kepada_id, diajukan_kepada_nama: (form.diajukan_kepada_nama ?? "").trim(),
    dilaporkan_oleh_id: form.dilaporkan_oleh_id, dilaporkan_oleh_nama: (form.dilaporkan_oleh_nama ?? "").trim(),
    sumber_codes: [...new Set(form.sumber_codes)], sumber_lainnya: form.sumber_codes.includes("lainnya") ? (form.sumber_lainnya ?? "").trim() : "",
    status_temuan: form.status_temuan, deskripsi: (form.deskripsi ?? "").trim(), akar_masalah: (form.akar_masalah ?? "").trim(),
    id_auditor: form.id_auditor, auditor_nama: (form.auditor_nama ?? "").trim(), atasan_id: form.atasan_id, atasan_nama: (form.atasan_nama ?? "").trim(),
    items: orderedFilledActions(form.items).map((item) => ({
      ...(item.id ? { id: item.id } : {}), jenis: item.jenis, uraian: (item.uraian ?? "").trim(), pic_id: item.pic_id,
      pic_nama: (item.pic_nama ?? "").trim(), batas_waktu: item.batas_waktu || null, urutan: ++order[item.jenis],
    })),
    ...(form.version !== undefined ? { version: form.version } : {}),
  };
}

export function isAuditSource(sources: readonly string[]): boolean {
  return sources.includes("audit_internal") || sources.includes("audit_eksternal");
}
