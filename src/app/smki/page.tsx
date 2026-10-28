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
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";

interface SmkiServiceCard {
  title: string;
  desc: string;
  path: string;
  icon: any;
  strip: string;
  glow: string;
  border: string;
  text: string;
  iconShadow: string;
}

const smkiCards: SmkiServiceCard[] = [
  {
    title: "Manajemen Software Standar",
    desc: "Kelola inventarisasi perangkat lunak resmi, audit lisensi, serta otomatis ekspor formulir input ke dalam template dokumen resmi FR-017.",
    path: "/smki/software-standar",
    icon: Laptop,
    strip: "from-blue-600 to-sky-400",
    glow: "hover:shadow-blue-500/20",
    border: "hover:border-blue-200",
    text: "text-blue-600",
    iconShadow: "shadow-blue-500/30",
  },
  {
    title: "Formulir Hardening Aset",
    desc: "Pemeriksaan kepatuhan hardening keamanan perangkat (Laptop/PC/Server), verifikasi auditor, dan ekspor resmi dokumen FR-047.",
    path: "/smki/formulir-hardening",
    icon: ShieldAlert,
    strip: "from-amber-500 to-yellow-400",
    glow: "hover:shadow-amber-500/20",
    border: "hover:border-amber-200",
    text: "text-amber-500",
    iconShadow: "shadow-amber-500/30",
  },
  {
    title: "Formulir Daftar Rekaman",
    desc: "Kelola pencatatan dan inventarisasi formulir daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip.",
    path: "/smki/daftar-rekaman",
    icon: FileText,
    strip: "from-purple-600 to-pink-400",
    glow: "hover:shadow-purple-500/20",
    border: "hover:border-purple-200",
    text: "text-purple-600",
    iconShadow: "shadow-purple-500/30",
  },
  {
    title: "Formulir Daftar Penyedia",
    desc: "Inventarisasi dan verifikasi rekanan penyedia barang/jasa, ruang lingkup pekerjaan, serta status berita acara sesuai standar FR-020.",
    path: "/smki/daftar-penyedia",
    icon: Building2,
    strip: "from-emerald-600 to-teal-400",
    glow: "hover:shadow-emerald-500/20",
    border: "hover:border-emerald-200",
    text: "text-emerald-600",
    iconShadow: "shadow-emerald-500/30",
  },
  {
    title: "Daftar Aset TI",
    desc: "Sistem inventarisasi & manajemen aset perangkat keras, monitoring masa pakai, pemantauan dukungan serta ekspor laporan Excel Bidang APTIKA.",
    path: "/daftar-aset-ti",
    icon: Box,
    strip: "from-sky-600 to-blue-400",
    glow: "hover:shadow-sky-500/20",
    border: "hover:border-sky-200",
    text: "text-sky-600",
    iconShadow: "shadow-sky-500/30",
  },
  {
    title: "Berita Acara Penghancuran Media",
    desc: "Kelola data berita acara penghancuran media sesuai formulir FR014-SMKI, rincian perangkat, serta ekspor dokumen resmi Word (.docx).",
    path: "/smki/berita-acara",
    icon: FileText,
    strip: "from-teal-600 to-emerald-400",
    glow: "hover:shadow-teal-500/20",
    border: "hover:border-teal-200",
    text: "text-teal-600",
    iconShadow: "shadow-teal-500/30",
  },
  {
    title: "Formulir Rencana Audit",
    desc: "Jadwalkan dan kelola rencana audit internal SMKI (F05-SMKI), auditee, auditor, serta ekspor dokumen resmi PDF.",
    path: "/smki/rencana-audit",
    icon: CalendarCheck,
    strip: "from-violet-600 to-purple-400",
    glow: "hover:shadow-violet-500/20",
    border: "hover:border-violet-200",
    text: "text-violet-600",
    iconShadow: "shadow-violet-500/30",
  },
  {
    title: "Formulir Hak Akses TI",
    desc: "Kelola permohonan dan verifikasi hak akses sistem informasi (FR-018), penetapan level akses, jenis akses, serta kontrol akses pengguna.",
    path: "/smki/hak-akses-ti",
    icon: Lock,
    strip: "from-cyan-600 to-teal-400",
    glow: "hover:shadow-cyan-500/20",
    border: "hover:border-cyan-200",
    text: "text-cyan-600",
    iconShadow: "shadow-cyan-500/30",
  },
  {
    title: "Laporan Audit Internal SMKI",
    desc: "Catat temuan audit internal SMKI (FR-006), kategori temuan (major/minor/OFI), rekomendasi perbaikan, serta ekspor dokumen resmi Word.",
    path: "/smki/laporan-audit",
    icon: ShieldCheck,
    strip: "from-rose-600 to-pink-400",
    glow: "hover:shadow-rose-500/20",
    border: "hover:border-rose-200",
    text: "text-rose-600",
    iconShadow: "shadow-rose-500/30",
  },
  {
    title: "Formulir Log Perubahan",
    desc: "Catat pelaksanaan perubahan TI, kondisi sebelum dan sesudah, hasil pengujian, serta tindak lanjut pada formulir FR-032.",
    path: "/smki/log-perubahan",
    icon: FileText,
    strip: "from-teal-600 to-cyan-400",
    glow: "hover:shadow-teal-500/20",
    border: "hover:border-teal-200",
    text: "text-teal-600",
    iconShadow: "shadow-teal-500/30",
  },
  {
    title: "Formulir Evaluasi Kepatuhan",
    desc: "Catat dan evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama, lengkap dengan status dan ekspor dokumen FR-044.",
    path: "/smki/evaluasi-kepatuhan",
    icon: ClipboardCheck,
    strip: "from-sky-600 to-indigo-400",
    glow: "hover:shadow-sky-500/20",
    border: "hover:border-sky-200",
    text: "text-sky-600",
    iconShadow: "shadow-sky-500/30",
  },
  {
    title: "Formulir Review Log",
    desc: "Catat hasil review log akses dan aktivitas sistem (FR-040): obyek, periode, rincian user/IP/waktu/durasi, tindak lanjut, serta cetak formulir resmi.",
    path: "/smki/review-log",
    icon: ScrollText,
    strip: "from-orange-500 to-amber-400",
    glow: "hover:shadow-orange-500/20",
    border: "hover:border-orange-200",
    text: "text-orange-500",
    iconShadow: "shadow-orange-500/30",
  },
  {
    title: "Formulir BYOD (Perangkat Pribadi)",
    desc: "Kelola surat pernyataan penggunaan perangkat pribadi di unit kerja (FR-045): daftar laptop/PC/tab, merek, nomor seri, serta cetak formulir resmi.",
    path: "/smki/perangkat-pribadi",
    icon: MonitorSmartphone,
    strip: "from-indigo-600 to-violet-400",
    glow: "hover:shadow-indigo-500/20",
    border: "hover:border-indigo-200",
    text: "text-indigo-600",
    iconShadow: "shadow-indigo-500/30",
  },
  {
    title: "Formulir Review CCTV",
    desc: "Catat review monitoring dan pemeliharaan CCTV (FR-038): obyek, periode, uraian review, tindak lanjut, target selesai, serta cetak formulir resmi.",
    path: "/smki/reviu-cctv",
    icon: Cctv,
    strip: "from-rose-600 to-red-400",
    glow: "hover:shadow-rose-500/20",
    border: "hover:border-rose-200",
    text: "text-rose-600",
    iconShadow: "shadow-rose-500/30",
  },
  {
    title: "Evaluasi dan Pengujian DRP",
    desc: "Laporkan evaluasi pengujian Disaster Recovery Plan (FR-039): persyaratan waktu (RTO), proses, team, check list BCP, serta cetak formulir resmi.",
    path: "/smki/evaluasi-drp",
    icon: DatabaseBackup,
    strip: "from-violet-600 to-indigo-400",
    glow: "hover:shadow-violet-500/20",
    border: "hover:border-violet-200",
    text: "text-violet-600",
    iconShadow: "shadow-violet-500/30",
  },
  {
    title: "Aset Sistem Informasi",
    desc: "Inventarisasi aset sistem informasi (FR-036): kode aset, virtualisasi, IP address, spesifikasi, pemilik, serta klasifikasi keamanan informasi.",
    path: "/smki/aset-sistem-informasi",
    icon: Database,
    strip: "from-indigo-600 to-blue-400",
    glow: "hover:shadow-indigo-500/20",
    border: "hover:border-indigo-200",
    text: "text-indigo-600",
    iconShadow: "shadow-indigo-500/30",
  },
  {
    title: "Program Tahunan Audit Internal",
    desc: "Kelola formulir program tahunan audit internal (FR-008), penugasan tim auditor, objek auditee, matriks klausul, jadwal 12 bulan, serta ekspor resmi Word (.docx).",
    path: "/smki/laporan-audit-tahunan",
    icon: CalendarRange,
    strip: "from-teal-600 to-emerald-400",
    glow: "hover:shadow-teal-500/20",
    border: "hover:border-teal-200",
    text: "text-teal-600",
    iconShadow: "shadow-teal-500/30",
  },
  {
    title: "Formulir Pelaporan Insiden",
    desc: "Kelola pencatatan insiden keamanan informasi (FR-016), kronologi kejadian, analisis dampak, dan status penanganan insiden secara terstruktur.",
    path: "/smki/pelaporan-insiden",
    icon: ShieldAlert,
    strip: "from-amber-600 to-red-400",
    glow: "hover:shadow-amber-500/20",
    border: "hover:border-amber-200",
    text: "text-amber-600",
    iconShadow: "shadow-amber-500/30",
  },
  {
    title: "Formulir Laporan Kerusakan",
    desc: "Kelola formulir laporan kerusakan perangkat fasilitas data center (FR-024) beserta rincian tindakan perbaikan.",
    path: "/smki/laporan-kerusakan",
    icon: ServerCog,
    strip: "from-red-600 to-rose-400",
    glow: "hover:shadow-red-500/20",
    border: "hover:border-red-200",
    text: "text-red-600",
    iconShadow: "shadow-red-500/30",
  },
  {
    title: "Screening Karyawan Outsourcing",
    desc: "Kelola berita acara verifikasi administrasi tenaga alih daya, 5 item checklist kepatuhan, serta cetak dokumen resmi format FR-012.",
    path: "/smki/screening-karyawan",
    icon: Users,
    strip: "from-emerald-600 to-green-400",
    glow: "hover:shadow-emerald-500/20",
    border: "hover:border-emerald-200",
    text: "text-emerald-600",
    iconShadow: "shadow-emerald-500/30",
  },
];

export default function SmkiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return smkiCards;
    const query = searchQuery.toLowerCase();
    return smkiCards.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.desc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-10 font-sans">
        {/* ── HERO BANNER SMKI ── */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, #3b0764 0%, #4c1d95 38%, #6d28d9 72%, #8b5cf6 100%)",
          }}
        >
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-cyan-300/15 translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-7 py-7 sm:px-9">
            {/* Left: Icon + Text */}
            <div className="flex items-start sm:items-center gap-5 max-w-2xl">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-lg">
                <ShieldCheck size={34} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-violet-200 mb-1">
                  Selamat Datang di
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                  SMKI Diskominfo Jawa Barat
                </h1>
                <p className="text-xs sm:text-[13px] text-violet-100/95 mt-2 leading-relaxed font-normal">
                  Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.
                </p>
              </div>
            </div>

            {/* Right: Ilustrasi Khusus SMKI */}
            <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-2 select-none pointer-events-none">
              <svg width="360" height="122" viewBox="0 0 360 122" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="smkiVaultGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2e1065" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.88" />
                  </linearGradient>
                  <linearGradient id="smkiShieldGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>

                {/* Outer Radar Rings */}
                <circle cx="72" cy="61" r="46" stroke="white" strokeOpacity="0.14" strokeWidth="1.2" strokeDasharray="4 4" />
                <circle cx="72" cy="61" r="34" stroke="#7dd3fc" strokeOpacity="0.28" strokeWidth="1.5" />
                <circle cx="72" cy="61" r="24" fill="white" fillOpacity="0.12" />

                {/* 3D Security Shield Core */}
                <g transform="translate(72, 61)">
                  <path
                    d="M0,-24 L20,-16 V-2 C20,13 11,22 0,26 C-11,22 -20,13 -20,-2 V-16 L0,-24 Z"
                    fill="url(#smkiShieldGlow)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M-6,0 L-1.5,4.5 L7.5,-4.5"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Connection Line */}
                <path d="M118 61 H134" stroke="#7dd3fc" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx="126" cy="61" r="3" fill="#38bdf8" />

                {/* Main Security Board */}
                <rect x="134" y="10" width="208" height="102" rx="12" fill="url(#smkiVaultGrad)" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />

                {/* Top Window Bar */}
                <circle cx="147" cy="21" r="2.8" fill="#f87171" />
                <circle cx="156" cy="21" r="2.8" fill="#fbbf24" />
                <circle cx="165" cy="21" r="2.8" fill="#34d399" />
                <text x="176" y="23.5" fontSize="7" fontWeight="700" fill="#bae6fd" letterSpacing="0.5">SMKI SECURITY AUDIT</text>
                <rect x="292" y="16" width="38" height="11" rx="5.5" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="0.8" />
                <text x="299" y="23.5" fontSize="6.5" fontWeight="700" fill="#6ee7b7">SECURE</text>
                <line x1="134" y1="30" x2="342" y2="30" stroke="white" strokeOpacity="0.12" />

                {/* Left Nodes */}
                <rect x="144" y="37" width="82" height="20" rx="5" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" />
                <circle cx="154" cy="47" r="3.5" fill="#34d399" />
                <rect x="162" y="43" width="38" height="3.5" rx="1.75" fill="white" fillOpacity="0.85" />
                <rect x="162" y="49" width="24" height="3" rx="1.5" fill="#93c5fd" fillOpacity="0.7" />
                <rect x="208" y="44" width="12" height="6" rx="3" fill="#38bdf8" fillOpacity="0.4" />

                <rect x="144" y="61" width="82" height="20" rx="5" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" />
                <circle cx="154" cy="71" r="3.5" fill="#38bdf8" />
                <rect x="162" y="67" width="42" height="3.5" rx="1.75" fill="white" fillOpacity="0.85" />
                <rect x="162" y="73" width="28" height="3" rx="1.5" fill="#93c5fd" fillOpacity="0.7" />
                <rect x="208" y="68" width="12" height="6" rx="3" fill="#34d399" fillOpacity="0.4" />

                <rect x="144" y="85" width="82" height="19" rx="5" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" />
                <circle cx="154" cy="94.5" r="3.5" fill="#a78bfa" />
                <rect x="162" y="90.5" width="34" height="3.5" rx="1.75" fill="white" fillOpacity="0.85" />
                <rect x="162" y="96.5" width="22" height="3" rx="1.5" fill="#93c5fd" fillOpacity="0.7" />
                <rect x="208" y="91.5" width="12" height="6" rx="3" fill="#a78bfa" fillOpacity="0.4" />

                {/* Right Panel: Lock & Meter */}
                <rect x="234" y="37" width="98" height="67" rx="7" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.15" />

                <circle cx="256" cy="57" r="13" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.2" />
                <path d="M252 55 V52 C252 49.5 260 49.5 260 52 V55" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <rect x="250" y="55" width="12" height="9" rx="2.5" fill="#fbbf24" />
                <circle cx="256" cy="59.5" r="1.3" fill="#0f2952" />

                <text x="274" y="53" fontSize="11" fontWeight="800" fill="white">99.4%</text>
                <text x="274" y="62" fontSize="6" fontWeight="600" fill="#93c5fd">KEPATUHAN</text>

                <text x="242" y="77" fontSize="6" fontWeight="600" fill="#e0f2fe">Hardening Aset</text>
                <rect x="242" y="80" width="82" height="4.5" rx="2.25" fill="white" fillOpacity="0.15" />
                <rect x="242" y="80" width="74" height="4.5" rx="2.25" fill="#34d399" />

                <text x="242" y="92" fontSize="6" fontWeight="600" fill="#e0f2fe">Audit &amp; Rekaman</text>
                <rect x="242" y="95" width="82" height="4.5" rx="2.25" fill="white" fillOpacity="0.15" />
                <rect x="242" y="95" width="68" height="4.5" rx="2.25" fill="#38bdf8" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── MODUL LAYANAN SMKI (Format Menggigit Serasi Dashboard) ── */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center flex-shrink-0 shadow-sm text-violet-600 dark:text-violet-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Katalog Layanan SMKI
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

          {/* Cards Grid: Sesuai Desain Menggigit Dashboard */}
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
                    className={`relative overflow-hidden bg-white dark:bg-[#0b1e3d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1.5 hover:shadow-xl ${card.glow} ${card.border} transition-all duration-300 group flex flex-col min-h-[195px]`}
                  >
                    {/* Strip warna modul */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${card.strip}`} />

                    {/* Ikon watermark */}
                    <div
                      className={`absolute -right-5 -bottom-5 opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none ${card.text}`}
                    >
                      <WatermarkIcon size={118} strokeWidth={1.5} />
                    </div>

                    <div className="relative flex flex-col flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.strip} shadow-lg ${card.iconShadow} text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                        >
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
                        <div
                          className={`h-9 min-w-[36px] px-2.5 group-hover:px-4 rounded-full flex items-center justify-center gap-1.5 bg-gradient-to-r ${card.strip} text-white shadow-md transition-all duration-300`}
                        >
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
