// SMKI module catalog — SINGLE SOURCE OF TRUTH.
// Dipakai oleh: Sidebar (main), SMKI secondary nav (app/smki/layout.tsx), dan Ringkasan SMKI (app/smki/page.tsx).
// Urutan A–Z per grup dihitung saat runtime (modulesByGroup).
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Boxes,
  Building2,
  CalendarCheck,
  CalendarRange,
  Cctv,
  ClipboardCheck,
  Database,
  DatabaseBackup,
  FileCheck,
  FileText,
  GitPullRequest,
  KeyRound,
  Laptop,
  Layers,
  Lock,
  MessageSquare,
  MonitorSmartphone,
  ScrollText,
  Server,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  Usb,
  Users,
  Video,
} from "lucide-react";

export type SmkiGroupId = "aset" | "akses" | "audit" | "operasional";
export interface SmkiGroup { id: SmkiGroupId; label: string; icon: LucideIcon; }
export const SMKI_GROUPS: SmkiGroup[] = [
  { id: "aset", label: "Aset & Inventarisasi", icon: Boxes },
  { id: "akses", label: "Kontrol Akses", icon: KeyRound },
  { id: "audit", label: "Audit & Kepatuhan", icon: ShieldCheck },
  { id: "operasional", label: "Operasional & Layanan", icon: ServerCog },
];

export interface SmkiModule {
  path: string;
  label: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  group: SmkiGroupId;
  fr?: string;
}

/** Ringkasan SMKI — selalu dibaca langsung dari sini. */
export const SMKI_OVERVIEW = { path: "/smki", label: "Ringkasan SMKI", title: "SMKI Diskominfo Jawa Barat", desc: "Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.", icon: ShieldCheck };

export const SMKI_MODULES: SmkiModule[] = [
  { path: "/smki/aset-informasi", label: "Aset Informasi", title: "Formulir Aset Informasi (FR-028)", desc: "Pendataan formulir resmi FR-028 aset informasi unit kerja, aset intangible, dan evaluasi matriks risiko CIA (Kerahasiaan, Integritas, Ketersediaan).", icon: Layers, group: "aset", fr: "FR-028" },
  { path: "/smki/aset-sistem-informasi", label: "Aset Sistem Informasi", title: "Daftar Aset Sistem Informasi (FR-036)", desc: "Modul pendataan katalog aplikasi, spesifikasi teknis, arsitektur infrastruktur, dan inventarisasi Sistem Elektronik (Aplikasi/Server) sesuai standar FR-036.", icon: Database, group: "aset", fr: "FR-036" },
  { path: "/smki/backup-restore", label: "Backup & Restore", title: "Berita Acara Backup dan Restore (FR-030)", desc: "Rekap backup dan restore aset, hasil kegiatan, serta bukti bulanan keamanan informasi.", icon: DatabaseBackup, group: "operasional", fr: "FR-030" },
  { path: "/smki/capacity-planning", label: "Capacity Planning", title: "Pemantauan Kapasitas Infrastruktur (FR-026)", desc: "Pantau kapasitas Server dan Network, catat log bulanan Current/Projection, serta ekspor laporan tahunan dalam format PDF atau Excel.", icon: ServerCog, group: "operasional", fr: "FR-026" },
  { path: "/smki/daftar-aset-sdm", label: "Daftar Aset SDM", title: "Daftar Aset Sumber Daya Manusia", desc: "Inventarisasi aset SDM SMKI, klasifikasi peran & tanggung jawab, riwayat pelatihan, serta ekspor dokumen resmi.", icon: Users, group: "aset" },
  { path: "/daftar-aset-ti", label: "Daftar Aset TI", title: "Daftar Aset Teknologi Informasi", desc: "Sistem inventarisasi dan manajemen aset perangkat keras TI, monitoring masa pakai, pemantauan kondisi perangkat, serta ekspor laporan resmi Bidang APTIKA.", icon: Box, group: "aset" },
  { path: "/smki/formulir-daftar-aset-virtualisasi", label: "Daftar Aset Virtualisasi", title: "Daftar Aset Virtualisasi (FR-035)", desc: "Inventarisasi server fisik dan instance virtualisasi, alamat IP/hostname, spesifikasi, pemilik, klasifikasi keamanan, serta ekspor dokumen FR-035.", icon: Server, group: "aset", fr: "FR-035" },
  { path: "/smki/daftar-penyedia", label: "Daftar Penyedia", title: "Formulir Daftar Penyedia Barang/Jasa (FR-020)", desc: "Inventarisasi dan verifikasi rekanan penyedia barang/jasa TI, ruang lingkup pekerjaan, kontak vendor, serta status berita acara sesuai standar FR-020.", icon: Building2, group: "aset", fr: "FR-020" },
  { path: "/smki/daftar-rekaman", label: "Daftar Rekaman", title: "Formulir Daftar Rekaman Dokumen SMKI", desc: "Kelola pencatatan dan inventarisasi daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip secara terpadu.", icon: FileText, group: "aset" },
  { path: "/smki/evaluasi-drp", label: "Evaluasi DRP", title: "Evaluasi Pengujian Disaster Recovery Plan (FR-039)", desc: "Laporan evaluasi dan pengujian Disaster Recovery Plan (DRP), pencapaian target waktu pemulihan (RTO), kesiapan tim, dan checklist kelangsungan layanan TI.", icon: DatabaseBackup, group: "audit", fr: "FR-039" },
  { path: "/smki/evaluasi-kepatuhan", label: "Evaluasi Kepatuhan", title: "Formulir Evaluasi Kepatuhan Regulasi (FR-044)", desc: "Catat dan evaluasi tingkat kepatuhan terhadap regulasi, kebijakan keamanan informasi, dan standar teknis yang mendukung layanan utama organisasi.", icon: ClipboardCheck, group: "audit", fr: "FR-044" },
  { path: "/smki/evaluasi-penyedia", label: "Evaluasi Penyedia", title: "Formulir Evaluasi Kinerja Penyedia Barang/Jasa (FR-021)", desc: "Penilaian kinerja penyedia barang/jasa, perhitungan nilai otomatis, rekomendasi, dan pengesahan digital (TTE) oleh Evaluator dan Atasan.", icon: ClipboardCheck, group: "aset", fr: "FR-021" },
  { path: "/smki/formulir-hardening", label: "Formulir Hardening", title: "Formulir Hardening Pengecekan Aset (FR-047)", desc: "Pemeriksaan kepatuhan hardening keamanan perangkat teknologi informasi (Laptop/PC/Server) verifikasi auditor, dan ekspor dokumen resmi FR-047.", icon: ShieldAlert, group: "operasional", fr: "FR-047" },
  { path: "/smki/hak-akses-fisik", label: "Hak Akses Fisik", title: "Formulir Hak Akses Fisik (FR-019)", desc: "Kelola data pengajuan dan izin hak akses fisik ruangan terbatas sesuai formulir FR-019 SMKI dengan mudah dan terstruktur.", icon: KeyRound, group: "akses", fr: "FR-019" },
  { path: "/smki/hak-akses-ti", label: "Hak Akses TI", title: "Formulir Hak Akses TI (FR-018)", desc: "Pencatatan, pengajuan, dan verifikasi permohonan hak akses sistem informasi, penetapan level serta jenis akses pengguna sesuai standar keamanan informasi SMKI.", icon: Lock, group: "akses", fr: "FR-018" },
  { path: "/smki/komunikasi", label: "Komunikasi SMKI", title: "Formulir Komunikasi SMKI (FR-010)", desc: "Pencatatan dan pemantauan agenda komunikasi internal dan eksternal SMKI: pesan kunci, media rilis, target audiens, dan evaluasi hasil.", icon: MessageSquare, group: "audit", fr: "FR-010" },
  { path: "/smki/laporan-audit", label: "Laporan Audit", title: "Laporan Audit Internal SMKI (FR-006)", desc: "Catat temuan audit internal SMKI, klasifikasi kategori temuan (Major/Minor/OFI), analisis akar penyebab, rekomendasi perbaikan, serta ekspor dokumen resmi Word.", icon: FileCheck, group: "audit", fr: "FR-006" },
  { path: "/smki/laporan-kerusakan", label: "Laporan Kerusakan", title: "Laporan Kerusakan Fasilitas Data Center (FR-024)", desc: "Pantau, tangani, dan validasi rekaman insiden kerusakan perangkat keras serta fasilitas pendukung infrastruktur Data Center Diskominfo Jawa Barat.", icon: ServerCog, group: "operasional", fr: "FR-024" },
  { path: "/smki/log-perubahan", label: "Log Perubahan", title: "Formulir Log Perubahan TI (FR-032)", desc: "Pencatatan pelaksanaan perubahan teknologi informasi, kondisi sebelum dan sesudah perubahan, hasil pengujian sistem, serta tindak lanjut operasional.", icon: FileText, group: "operasional", fr: "FR-032" },
  { path: "/smki/matrix-competency", label: "Matriks Kompetensi", title: "Matriks Kompetensi SMKI (FR-031)", desc: "Kelola standar kompetensi peran (Kordinator/Team Teknis), kompetensi pegawai dari Aset SDM, gap analisis otomatis, dan rencana training.", icon: ClipboardCheck, group: "audit", fr: "FR-031" },
  { path: "/smki/notulen", label: "Notulen Management Review", title: "Notulen Management Review (FR-011)", desc: "Dokumentasi rapat tinjauan manajemen SMKI, pembahasan klausul ISO 27001 Clause 9.3, keputusan tindak lanjut, dan cetak berita acara.", icon: FileCheck, group: "audit", fr: "FR-011" },
  { path: "/smki/pelaporan-insiden", label: "Pelaporan Insiden", title: "Formulir Pelaporan Insiden Keamanan (FR-016)", desc: "Kelola pencatatan insiden keamanan informasi, kronologi kejadian, analisis dampak, dan status penanganan insiden secara terstruktur.", icon: ShieldAlert, group: "operasional", fr: "FR-016" },
  { path: "/smki/pemantauan-konfigurasi", label: "Pemantauan Konfigurasi", title: "Pemantauan Manajemen Konfigurasi (FR-048)", desc: "Pemantauan berkala konfigurasi keamanan Server/Jaringan/Endpoint: identifikasi, perbandingan nilai aktual dengan nilai standar, pemeriksaan kesesuaian otomatis, serta pengesahan Pelaksana dan Admin.", icon: ClipboardCheck, group: "operasional", fr: "FR-048" },
  { path: "/smki/pemeriksaan-cctv", label: "Pemeriksaan CCTV", title: "Formulir Pemeriksaan CCTV (FR-037)", desc: "Pemeriksaan berkala perangkat & rekaman CCTV ruang server, checklist kondisi fisik, dan ekspor formulir FR-037.", icon: Video, group: "operasional", fr: "FR-037" },
  { path: "/smki/berita-acara", label: "Penghancuran Media", title: "Berita Acara Penghancuran Media (FR-014)", desc: "Kelola data berita acara penghancuran media penyimpanan sesuai formulir FR014-SMKI, rincian perangkat, metode pemusnahan, serta ekspor dokumen resmi Word (.docx).", icon: FileText, group: "aset", fr: "FR-014" },
  { path: "/smki/perangkat-pribadi", label: "Perangkat Pribadi", title: "Formulir Penggunaan Perangkat Pribadi / BYOD (FR-045)", desc: "Kelola surat pernyataan dan registrasi kepatuhan keamanan penggunaan perangkat pribadi (Bring Your Own Device) di lingkungan Diskominfo Jawa Barat.", icon: MonitorSmartphone, group: "akses", fr: "FR-045" },
  { path: "/smki/perubahan-it", label: "Perubahan IT", title: "Formulir Perubahan IT SMKI (FR-031)", desc: "Pengajuan Request for Change (RFC), analisis dampak risiko, persetujuan CAB, dan dokumentasi perubahan IT sesuai SMKI.", icon: GitPullRequest, group: "operasional", fr: "FR-031" },
  { path: "/smki/laporan-audit-tahunan", label: "Program Audit Tahunan", title: "Program Audit Tahunan SMKI", desc: "Kelola perencanaan program tahunan, cakupan objek audit, dan jadwal pelaksanaan kegiatan audit internal Sistem Manajemen Keamanan Informasi.", icon: CalendarRange, group: "audit" },
  { path: "/smki/removable-media", label: "Removable Media", title: "Daftar Removable Media (FR-025)", desc: "Inventarisasi media penyimpanan lepas pasang (Flashdisk, HDD Eksternal), hak akses otorisasi, penanggung jawab, dan formulir FR-025.", icon: Usb, group: "aset", fr: "FR-025" },
  { path: "/smki/rencana-audit", label: "Rencana Audit", title: "Formulir Rencana Audit Internal SMKI (F05-SMKI)", desc: "Jadwalkan dan kelola rencana audit internal SMKI, kontrol kepatuhan keamanan informasi, penetapan auditee dan auditor, serta ekspor dokumen resmi PDF.", icon: CalendarCheck, group: "audit", fr: "F05-SMKI" },
  { path: "/smki/reviu-cctv", label: "Review CCTV", title: "Daftar Review Monitoring CCTV (FR-038)", desc: "Formulir reviu berkala monitoring dan pemeliharaan perangkat keamanan fisik CCTV, pemeriksaan rekaman, serta tindak lanjut operasional.", icon: Cctv, group: "audit", fr: "FR-038" },
  { path: "/smki/review-hak-akses", label: "Review Hak Akses", title: "Formulir Review Hak Akses (FR-034)", desc: "Review pengguna yang terdaftar dalam sistem, tingkat hak akses, status akun, dan tindak lanjut hasil pemeriksaan sesuai formulir FR-034.", icon: ClipboardCheck, group: "akses", fr: "FR-034" },
  { path: "/smki/review-log", label: "Review Log", title: "Daftar Review Log Aktivitas Sistem (FR-040)", desc: "Formulir reviu berkala log akses dan aktivitas sistem informasi, analisis anomali keamanan, serta pencatatan tindak lanjut di lingkungan Diskominfo Jawa Barat.", icon: ScrollText, group: "audit", fr: "FR-040" },
  { path: "/smki/risk-register", label: "Risk Register", title: "Daftar Risiko Keamanan Informasi (FR-002)", desc: "Kelola identifikasi aset, penilaian matriks risiko (Inherent, Current, Residual), kontrol ISO 27001, dan rencana mitigasi risiko keamanan informasi.", icon: ShieldAlert, group: "audit", fr: "FR-002" },
  { path: "/smki/screening-karyawan", label: "Screening Karyawan", title: "Screening Karyawan Outsourcing (FR-012)", desc: "Kelola berita acara verifikasi administrasi keamanan tenaga alih daya, checklist kepatuhan NDA & latar belakang, serta cetak dokumen resmi FR-012.", icon: Users, group: "akses", fr: "FR-012" },
  { path: "/smki/software-standar", label: "Software Standar", title: "Manajemen Daftar Software Standar (FR-017)", desc: "Inventarisasi dan verifikasi perangkat lunak resmi organisasi untuk menjamin keamanan informasi, kepatuhan lisensi, dan standarisasi operasional di lingkungan Diskominfo Jawa Barat.", icon: Laptop, group: "aset", fr: "FR-017" },
  { path: "/smki/tindakan-perbaikan", label: "Tindakan Perbaikan", title: "Tindakan Perbaikan & Pencegahan (FR-009)", desc: "Pencatatan temuan ketidaksesuaian, analisis akar masalah (root cause), serta monitoring rencana tindakan korektif & preventif format FR-009.", icon: ClipboardCheck, group: "audit", fr: "FR-009" },
];

/** Modul per grup, terurut A–Z (localeCompare id). */
export const modulesByGroup = (group: SmkiGroupId): SmkiModule[] =>
  SMKI_MODULES.filter((m) => m.group === group).sort((a, b) => a.label.localeCompare(b.label, "id"));
