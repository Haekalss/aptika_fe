"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Laptop,
  Box,
  ArrowRight,
  FileText,
  CalendarCheck,
  CalendarRange,
  Lock,
  ClipboardCheck,
  ServerCog,
  Database,
  ScrollText,
  MonitorSmartphone,
  Cctv,
  DatabaseBackup,
  Users,
  Search,
  MessageSquare,
  FileCheck,
  Video,
  Siren,
  GitPullRequest,
  Usb,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";

interface SmkiServiceCard {
  title: string;
  desc: string;
  path: string;
  icon: any;
}

const smkiCards: SmkiServiceCard[] = [
  {
    title: "Manajemen Software Standar",
    desc: "Kelola inventarisasi perangkat lunak resmi, audit lisensi, serta otomatis ekspor formulir input ke dalam template dokumen resmi FR-017.",
    path: "/smki/software-standar",
    icon: Laptop,
  },
  {
    title: "Formulir Hardening Aset",
    desc: "Pemeriksaan kepatuhan hardening keamanan perangkat (Laptop/PC/Server), verifikasi auditor, dan ekspor resmi dokumen FR-047.",
    path: "/smki/formulir-hardening",
    icon: ShieldAlert,
  },
  {
    title: "Formulir Daftar Rekaman",
    desc: "Kelola pencatatan dan inventarisasi formulir daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip.",
    path: "/smki/daftar-rekaman",
    icon: FileText,
  },
  {
    title: "Formulir Daftar Penyedia",
    desc: "Inventarisasi dan verifikasi rekanan penyedia barang/jasa, ruang lingkup pekerjaan, serta status berita acara sesuai standar FR-020.",
    path: "/smki/daftar-penyedia",
    icon: Building2,
  },
  {
    title: "Daftar Aset TI",
    desc: "Sistem inventarisasi & manajemen aset perangkat keras, monitoring masa pakai, pemantauan dukungan serta ekspor laporan Excel Bidang APTIKA.",
    path: "/daftar-aset-ti",
    icon: Box,
  },
  {
    title: "Berita Acara Penghancuran Media",
    desc: "Kelola data berita acara penghancuran media sesuai formulir FR014-SMKI, rincian perangkat, serta ekspor dokumen resmi Word (.docx).",
    path: "/smki/berita-acara",
    icon: FileText,
  },
  {
    title: "Formulir Rencana Audit",
    desc: "Jadwalkan dan kelola rencana audit internal SMKI (F05-SMKI), auditee, auditor, serta ekspor dokumen resmi PDF.",
    path: "/smki/rencana-audit",
    icon: CalendarCheck,
  },
  {
    title: "Formulir Hak Akses TI",
    desc: "Kelola permohonan dan verifikasi hak akses sistem informasi (FR-018), penetapan level akses, jenis akses, serta kontrol akses pengguna.",
    path: "/smki/hak-akses-ti",
    icon: Lock,
  },
  {
    title: "Laporan Audit Internal SMKI",
    desc: "Catat temuan audit internal SMKI (FR-006), kategori temuan (major/minor/OFI), rekomendasi perbaikan, serta ekspor dokumen resmi Word.",
    path: "/smki/laporan-audit",
    icon: ShieldCheck,
  },
  {
    title: "Formulir Log Perubahan",
    desc: "Catat pelaksanaan perubahan TI, kondisi sebelum dan sesudah, hasil pengujian, serta tindak lanjut pada formulir FR-032.",
    path: "/smki/log-perubahan",
    icon: FileText,
  },
  {
    title: "Formulir Evaluasi Kepatuhan",
    desc: "Catat dan evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama, lengkap dengan status dan ekspor dokumen FR-044.",
    path: "/smki/evaluasi-kepatuhan",
    icon: ClipboardCheck,
  },
  {
    title: "Formulir Review Log",
    desc: "Catat hasil review log akses dan aktivitas sistem (FR-040): obyek, periode, rincian user/IP/waktu/durasi, tindak lanjut, serta cetak formulir resmi.",
    path: "/smki/review-log",
    icon: ScrollText,
  },
  {
    title: "Formulir BYOD (Perangkat Pribadi)",
    desc: "Kelola surat pernyataan penggunaan perangkat pribadi di unit kerja (FR-045): daftar laptop/PC/tab, merek, nomor seri, serta cetak formulir resmi.",
    path: "/smki/perangkat-pribadi",
    icon: MonitorSmartphone,
  },
  {
    title: "Formulir Review CCTV",
    desc: "Catat review monitoring dan pemeliharaan CCTV (FR-038): obyek, periode, uraian review, tindak lanjut, target selesai, serta cetak formulir resmi.",
    path: "/smki/reviu-cctv",
    icon: Cctv,
  },
  {
    title: "Evaluasi dan Pengujian DRP",
    desc: "Laporkan evaluasi pengujian Disaster Recovery Plan (FR-039): persyaratan waktu (RTO), proses, team, check list BCP, serta cetak formulir resmi.",
    path: "/smki/evaluasi-drp",
    icon: DatabaseBackup,
  },
  {
    title: "Aset Sistem Informasi",
    desc: "Inventarisasi aset sistem informasi (FR-036): kode aset, virtualisasi, IP address, spesifikasi, pemilik, serta klasifikasi keamanan informasi.",
    path: "/smki/aset-sistem-informasi",
    icon: Database,
  },
  {
    title: "Program Tahunan Audit Internal",
    desc: "Kelola formulir program tahunan audit internal (FR-008), penugasan tim auditor, objek auditee, matriks klausul, jadwal 12 bulan, serta ekspor resmi Word (.docx).",
    path: "/smki/laporan-audit-tahunan",
    icon: CalendarRange,
  },
  {
    title: "Formulir Laporan Kerusakan",
    desc: "Kelola formulir laporan kerusakan perangkat fasilitas data center (FR-024), kronologi kejadian, tingkat dampak, serta rencana penanganan teknis.",
    path: "/smki/laporan-kerusakan",
    icon: ServerCog,
  },
  {
    title: "Screening Karyawan Outsourcing",
    desc: "Kelola berita acara verifikasi administrasi tenaga alih daya, 5 item checklist kepatuhan, serta cetak dokumen resmi format FR-012/KOM.03.05/SANDIKAMI.",
    path: "/smki/screening-karyawan",
    icon: Users,
  },
  {
    title: "Formulir Pemeriksaan CCTV",
    desc: "Pemeriksaan berkala perangkat & rekaman CCTV ruang server (FR-037), verifikasi visual kamera, status operasional, serta ekspor dokumen.",
    path: "/smki/pemeriksaan-cctv",
    icon: Video,
  },
  {
    title: "Pelaporan Insiden Keamanan",
    desc: "Pelaporan, penanganan cepat, analisis dampak dan tindak lanjut insiden keamanan informasi sesuai ketentuan formulir FR-016.",
    path: "/smki/pelaporan-insiden",
    icon: Siren,
  },
  {
    title: "Daftar Aset SDM",
    desc: "Kelola inventarisasi aset sumber daya manusia SMKI, klasifikasi peran & tanggung jawab, riwayat pelatihan, serta ekspor dokumen resmi.",
    path: "/smki/daftar-aset-sdm",
    icon: Users,
  },
  {
    title: "Formulir Perubahan IT",
    desc: "Pengajuan Request for Change (RFC), analisis dampak risiko, persetujuan CAB, dan dokumentasi perubahan IT sesuai format SMKI (FR-031).",
    path: "/smki/perubahan-it",
    icon: GitPullRequest,
  },
  {
    title: "Formulir Komunikasi SMKI",
    desc: "Pencatatan dan pemantauan agenda komunikasi internal dan eksternal SMKI (FR-010): pesan kunci, media rilis, target audiens, dan evaluasi hasil.",
    path: "/smki/komunikasi",
    icon: MessageSquare,
  },
  {
    title: "Tindakan Perbaikan & Pencegahan",
    desc: "Pencatatan temuan ketidaksesuaian, analisis akar masalah (root cause), serta monitoring rencana tindakan korektif & preventif format FR-009.",
    path: "/smki/tindakan-perbaikan",
    icon: ClipboardCheck,
  },
  {
    title: "Daftar Removable Media",
    desc: "Pencatatan inventaris media penyimpanan lepas pasang (Flashdisk, HDD Eksternal), hak akses otorisasi, penanggung jawab, dan formulir FR-025.",
    path: "/smki/removable-media",
    icon: Usb,
  },
  {
    title: "Notulen Management Review",
    desc: "Dokumentasi rapat tinjauan manajemen SMKI (FR-011), pembahasan klausul ISO 27001:2013 Clause 9.3, keputusan tindak lanjut, dan cetak berita acara.",
    path: "/smki/notulen",
    icon: FileCheck,
  },
];

export default function SmkiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return smkiCards;
    const q = searchQuery.toLowerCase().trim();
    return smkiCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-8 pb-16">
        {/* Hero Banner: Ungu Violet Khas SMKI dengan ornamen Cyber Security Radar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 rounded-3xl p-7 sm:p-10 text-white shadow-xl shadow-purple-950/20 border border-purple-800/40">
          {/* Cyber mesh / Circuit dot matrix */}
          <div
            className="absolute inset-0 opacity-[0.16] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#c084fc 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Glowing cyber shield aura */}
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-violet-500/25 blur-3xl pointer-events-none animate-pulse duration-1000" />
          <div className="absolute right-0 -bottom-16 w-80 h-80 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

          {/* Concentric Cyber Radar Rings & Target Reticle */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-purple-400/20 pointer-events-none hidden md:block">
            <div className="absolute inset-6 rounded-full border border-dashed border-violet-400/25 animate-spin-slow" />
            <div className="absolute inset-16 rounded-full border border-purple-300/20" />
            <div className="absolute inset-28 rounded-full border border-violet-400/30" />
            {/* Target crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-purple-400/15" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-purple-400/15" />
          </div>

          {/* Cyber sparkle nodes */}
          <div className="absolute top-6 right-1/4 w-1.5 h-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_#c084fc] pointer-events-none" />
          <div className="absolute bottom-8 right-1/3 w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_#f472b6] pointer-events-none animate-ping duration-1000" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3.5 backdrop-blur-sm">
                <ShieldCheck size={14} className="text-purple-300" />
                <span>STANDAR KEAMANAN INFORMASI & TATA KELOLA SIBER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                Sistem Manajemen Keamanan Informasi (SMKI)
              </h1>
              <p className="text-sm sm:text-[15px] text-purple-200/90 leading-relaxed max-w-xl font-normal">
                Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Daerah Provinsi Jawa Barat.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0 self-start md:self-auto">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
                <Building2 size={16} className="text-purple-300" />
                <span>Bidang: <strong className="text-white">APTIKA</strong></span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
                <ShieldCheck size={16} className="text-emerald-300" />
                <span>Status Layanan: <strong className="text-emerald-300 font-bold">Aktif &amp; Beroperasi</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header & Pencarian */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-violet-600 to-purple-600" />
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Daftar Layanan &amp; Formulir SMKI
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Akses cepat ke {smkiCards.length} formulir dan modul tata kelola keamanan informasi
                </p>
              </div>
            </div>

            {/* Pencarian Formulir SMKI */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari formulir SMKI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid: Seragam Tema Violet SMKI */}
          {filteredCards.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">Tidak ada formulir SMKI yang cocok dengan pencarian "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {filteredCards.map((card) => {
                const WatermarkIcon = card.icon;
                return (
                  <div
                    key={card.path}
                    onClick={() => router.push(card.path)}
                    className="relative overflow-hidden bg-white dark:bg-[#0b1e3d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-500/15 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 group flex flex-col min-h-[195px]"
                  >
                    {/* Strip warna ungu / violet khas SMKI */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500" />

                    {/* Ikon watermark khas SMKI */}
                    <div className="absolute -right-5 -bottom-5 opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none text-violet-600 dark:text-violet-400">
                      <WatermarkIcon size={118} strokeWidth={1.5} />
                    </div>

                    <div className="relative flex flex-col flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-lg shadow-violet-500/25 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <WatermarkIcon size={22} className="text-white" />
                        </div>
                      </div>

                      <h3 className="mt-4 text-[15px] font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-[12.5px] text-slate-500 dark:text-slate-300 leading-relaxed mt-1 line-clamp-2">
                        {card.desc}
                      </p>

                      <div className="flex items-center justify-end mt-auto pt-4">
                        <div className="h-9 min-w-[36px] px-2.5 group-hover:px-4 rounded-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 transition-all duration-300">
                          <span className="text-xs font-bold max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 whitespace-nowrap">
                            Buka
                          </span>
                          <ArrowRight size={15} className="flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
