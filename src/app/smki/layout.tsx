"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Lock,
  FileText,
  Building2,
  Box,
  CalendarCheck,
  FileCheck,
  ChevronUp,
  ChevronDown,
  ClipboardCheck,
  ScrollText,
  MonitorSmartphone,
  Cctv,
  DatabaseBackup,
  Database,
  CalendarRange,
  ServerCog,
  Users,
  Video,
  GitPullRequest,
  MessageSquare,
  Usb,
} from "lucide-react";

const smkiNavItems = [
  {
    label: "Ringkasan SMKI",
    title: "SMKI Diskominfo Jawa Barat",
    desc: "Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.",
    path: "/smki",
    icon: ShieldCheck,
    exact: true,
  },
  {
    label: "Software Standar",
    title: "Manajemen Daftar Software Standar (FR-017)",
    desc: "Inventarisasi dan verifikasi perangkat lunak resmi organisasi untuk menjamin keamanan informasi, kepatuhan lisensi, dan standarisasi operasional di lingkungan Diskominfo Jawa Barat.",
    path: "/smki/software-standar",
    icon: Laptop,
  },
  {
    label: "Formulir Hardening",
    title: "Formulir Hardening Pengecekan Aset (FR-047)",
    desc: "Pemeriksaan kepatuhan hardening keamanan perangkat teknologi informasi (Laptop/PC/Server) verifikasi auditor, dan ekspor dokumen resmi FR-047.",
    path: "/smki/formulir-hardening",
    icon: ShieldAlert,
  },
  {
    label: "Hak Akses TI",
    title: "Formulir Hak Akses TI (FR-018)",
    desc: "Pencatatan, pengajuan, dan verifikasi permohonan hak akses sistem informasi, penetapan level serta jenis akses pengguna sesuai standar keamanan informasi SMKI.",
    path: "/smki/hak-akses-ti",
    icon: Lock,
  },
  {
    label: "Daftar Rekaman",
    title: "Formulir Daftar Rekaman Dokumen SMKI",
    desc: "Kelola pencatatan dan inventarisasi daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip secara terpadu.",
    path: "/smki/daftar-rekaman",
    icon: FileText,
  },
  {
    label: "Daftar Penyedia",
    title: "Formulir Daftar Penyedia Barang/Jasa (FR-020)",
    desc: "Inventarisasi dan verifikasi rekanan penyedia barang/jasa TI, ruang lingkup pekerjaan, kontak vendor, serta status berita acara sesuai standar FR-020.",
    path: "/smki/daftar-penyedia",
    icon: Building2,
  },
  {
    label: "Daftar Aset TI",
    title: "Daftar Aset Teknologi Informasi",
    desc: "Sistem inventarisasi dan manajemen aset perangkat keras TI, monitoring masa pakai, pemantauan kondisi perangkat, serta ekspor laporan resmi Bidang APTIKA.",
    path: "/daftar-aset-ti",
    icon: Box,
  },
  {
    label: "Penghancuran Media",
    title: "Berita Acara Penghancuran Media (FR-014)",
    desc: "Kelola data berita acara penghancuran media penyimpanan sesuai formulir FR014-SMKI, rincian perangkat, metode pemusnahan, serta ekspor dokumen resmi Word (.docx).",
    path: "/smki/berita-acara",
    icon: FileText,
  },
  {
    label: "Rencana Audit",
    title: "Formulir Rencana Audit Internal SMKI (F05-SMKI)",
    desc: "Jadwalkan dan kelola rencana audit internal SMKI, kontrol kepatuhan keamanan informasi, penetapan auditee dan auditor, serta ekspor dokumen resmi PDF.",
    path: "/smki/rencana-audit",
    icon: CalendarCheck,
  },
  {
    label: "Laporan Audit",
    title: "Laporan Audit Internal SMKI (FR-006)",
    desc: "Catat temuan audit internal SMKI, klasifikasi kategori temuan (Major/Minor/OFI), analisis akar penyebab, rekomendasi perbaikan, serta ekspor dokumen resmi Word.",
    path: "/smki/laporan-audit",
    icon: FileCheck,
  },
  {
    label: "Program Audit Tahunan",
    title: "Program Audit Tahunan SMKI",
    desc: "Kelola perencanaan program tahunan, cakupan objek audit, dan jadwal pelaksanaan kegiatan audit internal Sistem Manajemen Keamanan Informasi.",
    path: "/smki/laporan-audit-tahunan",
    icon: CalendarRange,
  },
  {
    label: "Log Perubahan",
    title: "Formulir Log Perubahan TI (FR-032)",
    desc: "Pencatatan pelaksanaan perubahan teknologi informasi, kondisi sebelum dan sesudah perubahan, hasil pengujian sistem, serta tindak lanjut operasional.",
    path: "/smki/log-perubahan",
    icon: FileText,
  },
  {
    label: "Evaluasi Kepatuhan",
    title: "Formulir Evaluasi Kepatuhan Regulasi (FR-044)",
    desc: "Catat dan evaluasi tingkat kepatuhan terhadap regulasi, kebijakan keamanan informasi, dan standar teknis yang mendukung layanan utama organisasi.",
    path: "/smki/evaluasi-kepatuhan",
    icon: ClipboardCheck,
  },
  {
    label: "Review Log",
    title: "Daftar Review Log Aktivitas Sistem (FR-040)",
    desc: "Formulir reviu berkala log akses dan aktivitas sistem informasi, analisis anomali keamanan, serta pencatatan tindak lanjut di lingkungan Diskominfo Jawa Barat.",
    path: "/smki/review-log",
    icon: ScrollText,
  },
  {
    label: "Perangkat Pribadi",
    title: "Formulir Penggunaan Perangkat Pribadi / BYOD (FR-045)",
    desc: "Kelola surat pernyataan dan registrasi kepatuhan keamanan penggunaan perangkat pribadi (Bring Your Own Device) di lingkungan Diskominfo Jawa Barat.",
    path: "/smki/perangkat-pribadi",
    icon: MonitorSmartphone,
  },
  {
    label: "Review CCTV",
    title: "Daftar Review Monitoring CCTV (FR-038)",
    desc: "Formulir reviu berkala monitoring dan pemeliharaan perangkat keamanan fisik CCTV, pemeriksaan rekaman, serta tindak lanjut operasional.",
    path: "/smki/reviu-cctv",
    icon: Cctv,
  },
  {
    label: "Evaluasi DRP",
    title: "Evaluasi Pengujian Disaster Recovery Plan (FR-039)",
    desc: "Laporan evaluasi dan pengujian Disaster Recovery Plan (DRP), pencapaian target waktu pemulihan (RTO), kesiapan tim, dan checklist kelangsungan layanan TI.",
    path: "/smki/evaluasi-drp",
    icon: DatabaseBackup,
  },
  {
    label: "Aset Sistem Informasi",
    title: "Daftar Aset Sistem Informasi (FR-036)",
    desc: "Modul pendataan katalog aplikasi, spesifikasi teknis, arsitektur infrastruktur, dan inventarisasi Sistem Elektronik (Aplikasi/Server) sesuai standar FR-036.",
    path: "/smki/aset-sistem-informasi",
    icon: Database,
  },
  {
    label: "Laporan Kerusakan",
    title: "Laporan Kerusakan Fasilitas Data Center (FR-024)",
    desc: "Pantau, tangani, dan validasi rekaman insiden kerusakan perangkat keras serta fasilitas pendukung infrastruktur Data Center Diskominfo Jawa Barat.",
    path: "/smki/laporan-kerusakan",
    icon: ServerCog,
  },
  {
    label: "Pelaporan Insiden",
    title: "Formulir Pelaporan Insiden Keamanan (FR-016)",
    desc: "Kelola pencatatan insiden keamanan informasi, kronologi kejadian, analisis dampak, dan status penanganan insiden secara terstruktur.",
    path: "/smki/pelaporan-insiden",
    icon: ShieldAlert,
  },
  {
    label: "Screening Karyawan",
    title: "Screening Karyawan Outsourcing (FR-012)",
    desc: "Kelola berita acara verifikasi administrasi keamanan tenaga alih daya, checklist kepatuhan NDA & latar belakang, serta cetak dokumen resmi FR-012.",
    path: "/smki/screening-karyawan",
    icon: Users,
  },
  {
    label: "Pemeriksaan CCTV",
    title: "Formulir Pemeriksaan CCTV (FR-037)",
    desc: "Pemeriksaan berkala perangkat & rekaman CCTV ruang server, checklist kondisi fisik, dan ekspor formulir FR-037.",
    path: "/smki/pemeriksaan-cctv",
    icon: Video,
  },
  {
    label: "Daftar Aset SDM",
    title: "Daftar Aset Sumber Daya Manusia",
    desc: "Inventarisasi aset SDM SMKI, klasifikasi peran & tanggung jawab, riwayat pelatihan, serta ekspor dokumen resmi.",
    path: "/smki/daftar-aset-sdm",
    icon: Users,
  },
  {
    label: "Perubahan IT",
    title: "Formulir Perubahan IT SMKI (FR-031)",
    desc: "Pengajuan Request for Change (RFC), analisis dampak risiko, persetujuan CAB, dan dokumentasi perubahan IT sesuai SMKI.",
    path: "/smki/perubahan-it",
    icon: GitPullRequest,
  },
  {
    label: "Komunikasi SMKI",
    title: "Formulir Komunikasi SMKI (FR-010)",
    desc: "Pencatatan dan pemantauan agenda komunikasi internal dan eksternal SMKI: pesan kunci, media rilis, target audiens, dan evaluasi hasil.",
    path: "/smki/komunikasi",
    icon: MessageSquare,
  },
  {
    label: "Tindakan Perbaikan",
    title: "Tindakan Perbaikan & Pencegahan (FR-009)",
    desc: "Pencatatan temuan ketidaksesuaian, analisis akar masalah (root cause), serta monitoring rencana tindakan korektif & preventif format FR-009.",
    path: "/smki/tindakan-perbaikan",
    icon: ClipboardCheck,
  },
  {
    label: "Removable Media",
    title: "Daftar Removable Media (FR-025)",
    desc: "Inventarisasi media penyimpanan lepas pasang (Flashdisk, HDD Eksternal), hak akses otorisasi, penanggung jawab, dan formulir FR-025.",
    path: "/smki/removable-media",
    icon: Usb,
  },
  {
    label: "Notulen Management Review",
    title: "Notulen Management Review (FR-011)",
    desc: "Dokumentasi rapat tinjauan manajemen SMKI, pembahasan klausul ISO 27001 Clause 9.3, keputusan tindak lanjut, dan cetak berita acara.",
    path: "/smki/notulen",
    icon: FileCheck,
  },
];

export default function SmkiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const isDaftarAsetAlias = pathname.startsWith("/smki/daftar-aset-ti");
  const activeItem =
    smkiNavItems.find((item) =>
      item.exact
        ? pathname === item.path
        : pathname === item.path ||
          pathname.startsWith(item.path + "/") ||
          (item.path === "/daftar-aset-ti" && isDaftarAsetAlias)
    ) || smkiNavItems[0];

  const ActiveIcon = activeItem.icon || ShieldCheck;
  const isMainOverview = pathname === "/smki";
  const isPrintPage = pathname.includes("/print/");

  return (
    <MainLayout
      title={activeItem.title}
      subtitle={activeItem.desc}
      hideSidebar={true}
    >
      {/* Scoped style agar semua sub-fitur SMKI menggunakan Hero Banner Violet yang seragam */}
      <style>{`
        .smki-subpage-content div.rounded-2xl[class*="from-[#064e3b]"]:not(.fixed *),
        .smki-subpage-content div.rounded-2xl[class*="from-[#065f46]"]:not(.fixed *),
        .smki-subpage-content div.rounded-2xl.p-6[class*="bg-[#059669]"]:not(.fixed *),
        .smki-subpage-content header.rounded-2xl[class*="from-emerald-"]:not(.fixed *),
        .smki-subpage-content div.rounded-2xl[class*="from-emerald-"]:not(.fixed *) {
          display: none !important;
        }
        .smki-subpage-content > div[class*="bg-[#f8fafc]"] {
          padding: 0 !important;
          background: transparent !important;
          min-height: auto !important;
        }
        .smki-subpage-content > div.max-w-7xl,
        .smki-subpage-content > div > div.max-w-7xl {
          max-width: none !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-5 items-start font-sans">
        {/* ── SIDEBAR DROPDOWN SMKI ── */}
        <aside className="w-full lg:w-[240px] flex-shrink-0 bg-white/90 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 lg:sticky lg:top-2 lg:min-h-[calc(100vh-130px)] print:hidden">
          {/* Header Tombol Dropdown SMKI */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <span className="flex items-center gap-2.5 text-[13.5px] font-extrabold tracking-wide text-[#0b2146] dark:text-white">
              <span className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} />
              </span>
              <span>SMKI</span>
            </span>
            {isDropdownOpen ? (
              <ChevronUp size={16} className="text-slate-500" />
            ) : (
              <ChevronDown size={16} className="text-slate-500" />
            )}
          </button>

          {/* Daftar Sub-Menu Dropdown SMKI */}
          {isDropdownOpen && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1">
              {smkiNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.path
                  : pathname === item.path ||
                    pathname.startsWith(item.path + "/") ||
                    (item.path === "/daftar-aset-ti" && isDaftarAsetAlias);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[12.5px] transition-all ${
                      isActive
                        ? "bg-violet-50/90 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold border border-violet-200/80 dark:border-violet-900/60 shadow-2xs"
                        : "text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-violet-100/90 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300"
                          : "bg-slate-100/80 dark:bg-slate-800 text-violet-600 dark:text-violet-400"
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* ── KONTEN UTAMA SMKI ── */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
          {/* Tampilkan Hero Banner Seragam untuk seluruh sub-fitur dropdown SMKI (Dengan Ornamen Cyber Radar) */}
          {!isMainOverview && !isPrintPage && (
            <div
              className="relative overflow-hidden rounded-3xl shadow-xl print:hidden"
              style={{
                background:
                  "linear-gradient(135deg, #2e0854 0%, #4c1d95 38%, #6d28d9 72%, #8b5cf6 100%)",
              }}
            >
              {/* Top Shimmer Beam Violet */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-300/70 to-transparent pointer-events-none z-20" />

              {/* Hex / Cyber Mesh Dot Texture */}
              <div
                className="absolute inset-0 opacity-[0.16] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(192,132,252,0.35) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Ambient Glow Orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-fuchsia-500/15 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-cyan-300/15 translate-y-1/2 blur-2xl pointer-events-none" />

              {/* Concentric Cyber Radar Rings */}
              <div className="absolute right-24 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-violet-400/20 border-dashed pointer-events-none" />
              <div className="absolute right-36 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-fuchsia-300/20 pointer-events-none" />

              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-7 py-7 sm:px-9">
                {/* Left: Icon + Text */}
                <div className="flex items-start sm:items-center gap-5 max-w-2xl">
                  <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-2xl blur-md opacity-60" />
                    <div className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 shadow-xl shadow-purple-950/40">
                      <ActiveIcon size={34} className="text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-violet-200 mb-1">
                      Layanan Tata Kelola SMKI Diskominfo Jawa Barat
                    </p>
                    <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                      {activeItem.title}
                    </h1>
                    <p className="text-xs sm:text-[13px] text-violet-100/95 mt-2 leading-relaxed font-normal">
                      {activeItem.desc}
                    </p>
                  </div>
                </div>

                {/* Right: Ilustrasi Vektor SMKI (Security Shield, Radar & ISO 27001 Audit Board) */}
                <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-2 select-none pointer-events-none">
                  <svg
                    width="360"
                    height="122"
                    viewBox="0 0 360 122"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="smkiSubVaultGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2e1065" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.88" />
                      </linearGradient>
                      <linearGradient id="smkiSubShieldGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>

                    {/* Outer Radar / Cyber Rings on Left */}
                    <circle
                      cx="72"
                      cy="61"
                      r="46"
                      stroke="white"
                      strokeOpacity="0.14"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx="72"
                      cy="61"
                      r="34"
                      stroke="#7dd3fc"
                      strokeOpacity="0.28"
                      strokeWidth="1.5"
                    />
                    <circle cx="72" cy="61" r="24" fill="white" fillOpacity="0.12" />

                    {/* 3D Security Shield Core */}
                    <g transform="translate(72, 61)">
                      <path
                        d="M0,-24 L20,-16 V-2 C20,13 11,22 0,26 C-11,22 -20,13 -20,-2 V-16 L0,-24 Z"
                        fill="url(#smkiSubShieldGlow)"
                        stroke="white"
                        strokeOpacity="0.65"
                        strokeWidth="1.5"
                      />
                      <rect
                        x="-7"
                        y="-3"
                        width="14"
                        height="11"
                        rx="2.5"
                        fill="white"
                        fillOpacity="0.95"
                      />
                      <path
                        d="M-4,-3 V-6.5 C-4,-8.8 -2.2,-10.5 0,-10.5 C2.2,-10.5 4,-8.8 4,-6.5 V-3"
                        stroke="white"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <circle cx="0" cy="2.5" r="1.6" fill="#5b21b6" />
                    </g>

                    {/* Orbiting Security Nodes */}
                    <circle cx="32" cy="36" r="4" fill="#4ade80" />
                    <circle cx="110" cy="32" r="3.5" fill="#38bdf8" />
                    <circle cx="38" cy="92" r="3.5" fill="#fde047" />
                    <line
                      x1="115"
                      y1="61"
                      x2="138"
                      y2="61"
                      stroke="#7dd3fc"
                      strokeOpacity="0.4"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Right ISO 27001 Security Operations & Audit Dashboard Card */}
                    <g transform="translate(138, 10)">
                      <rect
                        x="0"
                        y="0"
                        width="206"
                        height="102"
                        rx="13"
                        fill="url(#smkiSubVaultGrad)"
                        stroke="white"
                        strokeOpacity="0.28"
                        strokeWidth="1.3"
                      />
                      {/* Top Header Bar */}
                      <rect
                        x="0"
                        y="0"
                        width="206"
                        height="22"
                        rx="13"
                        fill="white"
                        fillOpacity="0.08"
                      />
                      <circle cx="13" cy="11" r="3" fill="#f87171" />
                      <circle cx="23" cy="11" r="3" fill="#fbbf24" />
                      <circle cx="33" cy="11" r="3" fill="#4ade80" />
                      <text
                        x="45"
                        y="14"
                        fill="white"
                        fillOpacity="0.8"
                        fontSize="7.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        letterSpacing="0.5"
                      >
                        SMKI SECURITY AUDIT
                      </text>

                      {/* Left Column: Server & Asset Hardening Status Bars */}
                      <rect
                        x="12"
                        y="30"
                        width="112"
                        height="18"
                        rx="5"
                        fill="white"
                        fillOpacity="0.09"
                        stroke="white"
                        strokeOpacity="0.15"
                        strokeWidth="0.8"
                      />
                      <circle cx="21" cy="39" r="3.5" fill="#4ade80" />
                      <rect
                        x="29"
                        y="36"
                        width="52"
                        height="3.5"
                        rx="1.75"
                        fill="white"
                        fillOpacity="0.85"
                      />
                      <rect
                        x="29"
                        y="41.5"
                        width="34"
                        height="2.5"
                        rx="1.25"
                        fill="#c4b5fd"
                        fillOpacity="0.65"
                      />
                      <rect
                        x="94"
                        y="35"
                        width="24"
                        height="8"
                        rx="4"
                        fill="#4ade80"
                        fillOpacity="0.25"
                      />
                      <text
                        x="99"
                        y="41"
                        fill="#4ade80"
                        fontSize="5.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        PASS
                      </text>

                      <rect
                        x="12"
                        y="53"
                        width="112"
                        height="18"
                        rx="5"
                        fill="white"
                        fillOpacity="0.09"
                        stroke="white"
                        strokeOpacity="0.15"
                        strokeWidth="0.8"
                      />
                      <circle cx="21" cy="62" r="3.5" fill="#38bdf8" />
                      <rect
                        x="29"
                        y="59"
                        width="60"
                        height="3.5"
                        rx="1.75"
                        fill="white"
                        fillOpacity="0.85"
                      />
                      <rect
                        x="29"
                        y="64.5"
                        width="40"
                        height="2.5"
                        rx="1.25"
                        fill="#c4b5fd"
                        fillOpacity="0.65"
                      />
                      <rect
                        x="94"
                        y="58"
                        width="24"
                        height="8"
                        rx="4"
                        fill="#38bdf8"
                        fillOpacity="0.25"
                      />
                      <text
                        x="98"
                        y="64"
                        fill="#7dd3fc"
                        fontSize="5.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        VALID
                      </text>

                      <rect
                        x="12"
                        y="76"
                        width="112"
                        height="16"
                        rx="5"
                        fill="white"
                        fillOpacity="0.07"
                      />
                      <rect
                        x="18"
                        y="82"
                        width="72"
                        height="4"
                        rx="2"
                        fill="white"
                        fillOpacity="0.2"
                      />
                      <rect x="18" y="82" width="62" height="4" rx="2" fill="#a855f7" />
                      <text
                        x="96"
                        y="86"
                        fill="white"
                        fillOpacity="0.9"
                        fontSize="6.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        98%
                      </text>

                      {/* Right Column: Compliance Verification Badge */}
                      <rect
                        x="132"
                        y="30"
                        width="62"
                        height="62"
                        rx="9"
                        fill="white"
                        fillOpacity="0.1"
                        stroke="white"
                        strokeOpacity="0.2"
                        strokeWidth="0.9"
                      />
                      <circle
                        cx="163"
                        cy="53"
                        r="14"
                        stroke="#4ade80"
                        strokeWidth="2.5"
                        strokeOpacity="0.9"
                      />
                      <path
                        d="M157,53 L161,57 L169,49"
                        stroke="#4ade80"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text
                        x="145"
                        y="79"
                        fill="white"
                        fillOpacity="0.9"
                        fontSize="6.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        VERIFIED
                      </text>
                      <text
                        x="148"
                        y="87"
                        fill="#c4b5fd"
                        fontSize="5.5"
                        fontFamily="sans-serif"
                      >
                        SMKI JABAR
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className={isMainOverview ? "" : "smki-subpage-content"}>
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
