import type {
  Fr021Evaluasi,
  Fr021IdentifikasiPayload,
  Fr021Kriteria,
  Fr021Master,
  Fr021PenilaianItemPayload,
  Fr021Skala,
} from "@/services/smki/evaluasiPenyedia.types";
import type { Fr021FormState, Fr021PenilaianDraft } from "./types";

/** Tanggal hari ini (zona WIB) dalam format `yyyy-mm-dd`. */
export function todayJakarta(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** Form kosong untuk evaluasi baru (Step 1). */
export function emptyFr021Form(master?: Fr021Master): Fr021FormState {
  return {
    penyedia_id: null,
    penyedia_nama: "",
    contact_person: "",
    email: "",
    no_kontrak: "",
    nomor_dokumen: master?.template?.nomor_dokumen ?? "FR-021/KOM.03.05/SANDIKAMI",
    nomor_revisi: master?.template?.nomor_revisi ?? "1.1",
    tanggal_berlaku: master?.template?.tanggal_berlaku ?? "07 Juli 2022",
    sifat_pekerjaan: "pengadaan_baru",
    sifat_pekerjaan_lainnya: "",
    tanggal_evaluasi: todayJakarta(),
    tempat: "",
    penilaian: (master?.kriteria ?? []).map((kriteria) => ({
      kriteria_id: kriteria.id,
      skala_id: null,
    })),
    admin_id: null,
    catatan_tinjauan: "",
  };
}

/** Ubah record API → state form. Nilai penilaian tetap tersimpan. */
export function recordToForm(
  record: Fr021Evaluasi,
  master?: Fr021Master
): Fr021FormState {
  const saved = new Map(record.penilaian.map((p) => [p.kriteria_id, p.skala_id]));
  const kriteriaIds = master?.kriteria?.length
    ? master.kriteria.map((k) => k.id)
    : record.penilaian.map((p) => p.kriteria_id);

  return {
    penyedia_id: record.penyedia_id,
    penyedia_nama: record.penyedia?.nama_penyedia ?? "",
    contact_person: record.penyedia?.contact_person ?? "",
    email: record.penyedia?.email ?? "",
    no_kontrak: record.no_kontrak ?? "",
    nomor_dokumen: record.nomor_dokumen ?? master?.template?.nomor_dokumen ?? "FR-021/KOM.03.05/SANDIKAMI",
    nomor_revisi: record.nomor_revisi ?? master?.template?.nomor_revisi ?? "1.1",
    tanggal_berlaku: record.tanggal_berlaku ?? master?.template?.tanggal_berlaku ?? "07 Juli 2022",
    sifat_pekerjaan: record.sifat_pekerjaan,
    sifat_pekerjaan_lainnya: record.sifat_pekerjaan_lainnya ?? "",
    tanggal_evaluasi: record.tanggal_evaluasi?.slice(0, 10) ?? todayJakarta(),
    tempat: record.tempat ?? "",
    penilaian: kriteriaIds.map((kriteriaId) => ({
      kriteria_id: kriteriaId,
      skala_id: saved.get(kriteriaId) ?? null,
    })),
    admin_id: record.admin_id,
    catatan_tinjauan: "",
    version: record.version,
  };
}

/** Form → payload Step 1. `sifat_pekerjaan_lainnya` dikosongkan bila bukan "lainnya". */
export function toIdentifikasiPayload(
  form: Fr021FormState
): Fr021IdentifikasiPayload {
  return {
    penyedia_id: form.penyedia_id,
    penyedia_nama: (form.penyedia_nama ?? "").trim(),
    contact_person: (form.contact_person ?? "").trim(),
    email: (form.email ?? "").trim(),
    no_kontrak: (form.no_kontrak ?? "").trim(),
    nomor_dokumen: (form.nomor_dokumen ?? "").trim(),
    nomor_revisi: (form.nomor_revisi ?? "").trim(),
    tanggal_berlaku: (form.tanggal_berlaku ?? "").trim(),
    sifat_pekerjaan: form.sifat_pekerjaan,
    sifat_pekerjaan_lainnya:
      form.sifat_pekerjaan === "lainnya"
        ? (form.sifat_pekerjaan_lainnya ?? "").trim()
        : "",
    tanggal_evaluasi: form.tanggal_evaluasi,
    tempat: (form.tempat ?? "").trim(),
    ...(form.version !== undefined ? { version: form.version } : {}),
  };
}

/** Form → payload Step 2. Hanya baris yang sudah dipilih yang dikirim. */
export function toPenilaianPayload(
  form: Fr021FormState
): Fr021PenilaianItemPayload[] {
  return form.penilaian
    .filter((item) => item.skala_id !== null)
    .map((item) => ({
      kriteria_id: item.kriteria_id,
      skala_id: item.skala_id as number,
    }));
}

/** Jumlah kriteria yang sudah dinilai. */
export function filledPenilaianCount(form: Fr021FormState): number {
  return form.penilaian.filter((item) => item.skala_id !== null).length;
}

/** Semua kriteria wajib terisi sebelum tombol Hitung aktif (FR-2.5). */
export function isPenilaianComplete(
  form: Fr021FormState,
  kriteria: readonly Fr021Kriteria[]
): boolean {
  if (kriteria.length === 0) return false;
  return kriteria.every((k) =>
    form.penilaian.some(
      (item) => item.kriteria_id === k.id && item.skala_id !== null
    )
  );
}

/** Total sementara di sisi klien — hanya untuk pratinjau, bukan sumber kebenaran. */
export function penilaianSubtotal(
  form: Fr021FormState,
  skala: readonly Fr021Skala[]
): number {
  const skorById = new Map(skala.map((s) => [s.id, s.skor]));
  return form.penilaian.reduce(
    (total, item) =>
      total + (item.skala_id !== null ? skorById.get(item.skala_id) ?? 0 : 0),
    0
  );
}

/** Ubah satu baris penilaian tanpa memutasi array asal. */
export function setPenilaian(
  penilaian: readonly Fr021PenilaianDraft[],
  kriteriaId: number,
  skalaId: number | null
): Fr021PenilaianDraft[] {
  return penilaian.map((item) =>
    item.kriteria_id === kriteriaId ? { ...item, skala_id: skalaId } : item
  );
}

/** Apakah sebuah evaluasi masih dapat diubah (identifikasi/penilaian). */
export function isEditable(status: string | undefined): boolean {
  return status === "draft" || status === "revisi";
}

/** Ambil nilai skor untuk satu skala. */
export function skorForSkala(
  skala: readonly Fr021Skala[],
  skalaId: number | null
): number {
  if (skalaId === null) return 0;
  return skala.find((s) => s.id === skalaId)?.skor ?? 0;
}
