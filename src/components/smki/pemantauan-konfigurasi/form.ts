// Mapping form ↔ payload + validasi sisi klien (cermin dari FormRequest BE).
import type { IdentifikasiFormState, KonfigurasiRowState } from "./types";
export type { IdentifikasiFormState, KonfigurasiRowState };
import type { IdentifikasiPayload } from "@/services/smki/pemantauanKonfigurasiService.types";

export interface IdentifikasiErrors {
  noFormulir?: string;
  noRevisi?: string;
  tanggalBerlaku?: string;
  tanggalPemantauan?: string;
  periode?: string;
  jenisKonfigurasiId?: string;
  objekIds?: string;
}

export const validateIdentifikasi = (s: IdentifikasiFormState): IdentifikasiErrors => {
  const e: IdentifikasiErrors = {};
  if (!s.noFormulir.trim()) e.noFormulir = "No. Dokumen wajib diisi.";
  if (!s.noRevisi.trim()) e.noRevisi = "No. Revisi wajib diisi.";
  if (!s.tanggalBerlaku) e.tanggalBerlaku = "Tanggal Berlaku wajib diisi.";
  if (!s.tanggalPemantauan) e.tanggalPemantauan = "Tanggal Pemantauan wajib diisi.";
  if (![1, 2, 3, 4].includes(s.periode)) e.periode = "Periode harus 1–4.";
  if (!s.jenisKonfigurasiId) e.jenisKonfigurasiId = "Jenis Konfigurasi wajib dipilih.";
  if (s.objekIds.length === 0) e.objekIds = "Pilih minimal 1 objek.";
  return e;
};

export const toIdentifikasiPayload = (s: IdentifikasiFormState): IdentifikasiPayload => ({
  noFormulir: s.noFormulir.trim(),
  noRevisi: s.noRevisi.trim(),
  tanggalBerlaku: s.tanggalBerlaku,
  tanggalPemantauan: s.tanggalPemantauan,
  periode: s.periode,
  jenisKonfigurasiId: Number(s.jenisKonfigurasiId),
  objekIds: s.objekIds,
});

export const rowsFromDetail = (
  objekList: { objekId: number; items: Omit<KonfigurasiRowState, "key" | "objekId">[] }[]
): KonfigurasiRowState[] =>
  objekList.flatMap((o) =>
    o.items.map((it) => ({
      ...it,
      key: `${o.objekId}-${it.id ?? Math.random().toString(36).slice(2, 8)}-${it.namaKonfigurasi}`,
      objekId: o.objekId,
    }))
  );

/** Progres pengisian baris: terisi = punya Nama Konfigurasi & Nilai aktual (non-kosong). */
export const hitungProgres = (rows: KonfigurasiRowState[]) => {
  const total = rows.length;
  const terisi = rows.filter((r) => r.namaKonfigurasi.trim() && String(r.nilaiAktual).trim()).length;
  return { total, terisi, persen: total === 0 ? 0 : Math.round((terisi / total) * 100) };
};
