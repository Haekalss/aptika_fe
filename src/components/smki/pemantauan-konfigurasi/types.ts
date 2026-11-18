// Tipe bentuk state komponen modul FR-048.
// Kontrak DTO API diimpor langsung dari "@/services/smki/pemantauanKonfigurasiService.types".

export interface IdentifikasiFormState {
  // Identitas Dokumen (kop formulir)
  noFormulir: string;
  noRevisi: string;
  tanggalBerlaku: string;
  // Identifikasi Pemantauan
  tanggalPemantauan: string;
  periode: number;
  jenisKonfigurasiId: number | 0;
  objekIds: number[];
}

export interface KonfigurasiRowState {
  key: string; // client-side key stabil
  id?: number;
  objekId: number;
  namaKonfigurasi: string;
  nilaiAktual: string;
  nilaiStandar: string | null;
  nilaiStandarId?: number | null;
  kesesuaian: "sesuai" | "tidak_sesuai" | null;
  isStandar: boolean;
  keterangan: string;
}
