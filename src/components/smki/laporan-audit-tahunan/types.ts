export interface AuditorItem {
  id: number;
  nama: string;
  unit: string;
  peran: string;
}

export interface ObjekAuditItem {
  kode: string;
  nama: string;
  lingkup: string;
  unit: string;
  klausul: string[];
  jadwal: number[];
}

export interface FormLaporanTahunanState {
  id?: number;
  tahun_smki: string;
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
  kriteria_audit: string;
  tujuan: string;
  status: string;

  // Step 2
  lead_auditor: string;
  unit_lead: string;
  auditors: AuditorItem[];

  // Step 3, 4, 5
  objek_audit: ObjekAuditItem[];

  // Step 6
  disusun_oleh: string;
  jabatan_penyusun: string;
  disahkan_oleh: string;
  jabatan_pengesah: string;
}
