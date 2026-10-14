export interface InsidenReport {
  id: number;
  tanggal_laporan: string;
  pelapor: string;
  kategori_insiden: string;
  nama_sistem: string;
  status: string;
}

/** Form Bagian I (tambah laporan). File dikirim via FormData ke backend. */
export interface BagianIData {
  kategori: string;
  kategoriLainnya: string;
  jenisLayanan: string;
  tanggalLaporan: string;
  nama: string;
  jabatan: string;
  instansi: string;
  nip: string;
  noHp: string;
  email: string;
  tglKejadian: string;
  waktuKejadian: string;
  namaSistem: string;
  jenisSistem: string;
  url: string;
  ip: string;
  os: string;
  webServer: string;
  files: File[];
}

/** Form Bagian II (lengkapi laporan). */
export interface BagianIIData {
  namaInstansi: string;
  telpFax: string;
  emailInstansi: string;
  alamat: string;
  namaPic: string;
  jabatanPic: string;
  nipPic: string;
  noHpPic: string;
  emailPic: string;
  lokasi: string;
  deskripsi: string;
  isp: string;
  downtime: string;
  durasi: string;
  tindakan: string;
  status: string;
  files: File[];
}

/** Ringkasan read-only Bagian I untuk halaman edit. */
export interface BagianIISummary {
  pelapor: string;
  kategori: string;
  sistem: string;
  waktu: string;
  instansi: string;
  kontak: string;
  urlIp: string;
  osWeb: string;
  buktiNama: string;
  buktiUkuran: string;
  buktiUrl?: string | null;
}

export const KATEGORI_OPTIONS = [
  "web defacement",
  "hacking",
  "malware detection",
  "phishing",
  "spoofing",
  "brute force",
  "denial of service",
  "sniffing",
  "lainnya",
];

export const JENIS_SISTEM_OPTIONS = ["Server", "Website", "PC", "Network"];

export const STATUS_OPTIONS = [
  "Menunggu Pemilik Sistem",
  "Dalam Penanganan",
  "Selesai",
];

export const ACCEPTED_EXT = [".png", ".jpg", ".jpeg", ".pdf", ".docx"];
export const MAX_FILE_MB = 5;
