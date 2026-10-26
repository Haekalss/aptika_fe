"use client";

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
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";

interface SmkiServiceCard {
  title: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
  iconBg: string;
}

const smkiCards: SmkiServiceCard[] = [
  {
    title: "Manajemen Software Standar",
    desc: "Kelola inventarisasi perangkat lunak resmi, audit lisensi, serta otomatis ekspor formulir input ke dalam template dokumen resmi FR-017.",
    path: "/smki/software-standar",
    icon: <Laptop size={24} className="text-blue-600 dark:text-blue-400" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800/60",
  },
  {
    title: "Formulir Hardening Aset",
    desc: "Pemeriksaan kepatuhan hardening keamanan perangkat (Laptop/PC/Server) berdasarkan ISO 27001, verifikasi auditor, dan ekspor resmi dokumen FR-047.",
    path: "/smki/formulir-hardening",
    icon: <ShieldAlert size={24} className="text-amber-500 dark:text-amber-400" />,
    iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800/60",
  },
  {
    title: "Formulir Daftar Rekaman",
    desc: "Kelola pencatatan dan inventarisasi formulir daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip.",
    path: "/smki/daftar-rekaman",
    icon: <FileText size={24} className="text-purple-600 dark:text-purple-400" />,
    iconBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-800/60",
  },
  {
    title: "Formulir Daftar Penyedia",
    desc: "Inventarisasi dan verifikasi rekanan penyedia barang/jasa, ruang lingkup pekerjaan, serta status berita acara sesuai standar FR-020.",
    path: "/smki/daftar-penyedia",
    icon: <Building2 size={24} className="text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60",
  },
  {
    title: "Daftar Aset TI",
    desc: "Sistem inventarisasi & manajemen aset perangkat keras, monitoring masa pakai, pemantauan dukungan serta ekspor laporan Excel Bidang APTIKA.",
    path: "/daftar-aset-ti",
    icon: <Box size={24} className="text-blue-600 dark:text-blue-400" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800/60",
  },
  {
    title: "Berita Acara Penghancuran Media",
    desc: "Kelola data berita acara penghancuran media sesuai formulir FR014-SMKI, rincian perangkat, serta ekspor dokumen resmi Word (.docx).",
    path: "/smki/berita-acara",
    icon: <FileText size={24} className="text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60",
  },
  {
    title: "Formulir Rencana Audit",
    desc: "Jadwalkan dan kelola rencana audit internal SMKI (F05-SMKI), kontrol ISO 27001, auditee, auditor, serta ekspor dokumen resmi PDF.",
    path: "/smki/rencana-audit",
    icon: <CalendarCheck size={24} className="text-purple-600 dark:text-purple-400" />,
    iconBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-800/60",
  },
  {
    title: "Formulir Hak Akses TI",
    desc: "Kelola permohonan dan verifikasi hak akses sistem informasi (FR-018), penetapan level akses, jenis akses, serta kontrol akses pengguna.",
    path: "/smki/hak-akses-ti",
    icon: <Lock size={24} className="text-cyan-600 dark:text-cyan-400" />,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-100 dark:border-cyan-800/60",
  },
  {
    title: "Laporan Audit Internal SMKI",
    desc: "Catat temuan audit internal SMKI (FR-006), kategori temuan (major/minor/OFI), rekomendasi perbaikan, serta ekspor dokumen resmi Word.",
    path: "/smki/laporan-audit",
    icon: <ShieldCheck size={24} className="text-rose-500 dark:text-rose-400" />,
    iconBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-800/60",
  },
  {
    title: "Formulir Log Perubahan",
    desc: "Catat pelaksanaan perubahan TI, kondisi sebelum dan sesudah, hasil pengujian, serta tindak lanjut pada formulir FR-032.",
    path: "/smki/log-perubahan",
    icon: <FileText size={24} className="text-teal-600 dark:text-teal-400" />,
    iconBg: "bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-800/60",
  },
  {
    title: "Formulir Evaluasi Kepatuhan",
    desc: "Catat dan evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama, lengkap dengan status dan ekspor dokumen FR-044.",
    path: "/smki/evaluasi-kepatuhan",
    icon: <ClipboardCheck size={24} className="text-sky-600 dark:text-sky-400" />,
    iconBg: "bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-800/60",
  },
  {
    title: "Formulir Review Log",
    desc: "Catat hasil review log akses dan aktivitas sistem (FR-040): obyek, periode, rincian user/IP/waktu/durasi, tindak lanjut, serta cetak formulir resmi.",
    path: "/smki/review-log",
    icon: <ScrollText size={24} className="text-orange-500 dark:text-orange-400" />,
    iconBg: "bg-orange-50 dark:bg-orange-950/60 border-orange-100 dark:border-orange-800/60",
  },
  {
    title: "Formulir BYOD (Perangkat Pribadi)",
    desc: "Kelola surat pernyataan penggunaan perangkat pribadi di unit kerja (FR-045): daftar laptop/PC/tab, merek, nomor seri, serta cetak formulir resmi.",
    path: "/smki/perangkat-pribadi",
    icon: <MonitorSmartphone size={24} className="text-indigo-600 dark:text-indigo-400" />,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-800/60",
  },
  {
    title: "Formulir Review CCTV",
    desc: "Catat review monitoring dan pemeliharaan CCTV (FR-038): obyek, periode, uraian review, tindak lanjut, target selesai, serta cetak formulir resmi.",
    path: "/smki/reviu-cctv",
    icon: <Cctv size={24} className="text-rose-500 dark:text-rose-400" />,
    iconBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-800/60",
  },
  {
    title: "Evaluasi dan Pengujian DRP",
    desc: "Laporkan evaluasi pengujian Disaster Recovery Plan (FR-039): persyaratan waktu (RTO), proses, team, check list BCP, serta cetak formulir resmi.",
    path: "/smki/evaluasi-drp",
    icon: <DatabaseBackup size={24} className="text-violet-600 dark:text-violet-400" />,
    iconBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-100 dark:border-violet-800/60",
  },
  {
    title: "Aset Sistem Informasi",
    desc: "Inventarisasi aset sistem informasi (FR-036): kode aset, virtualisasi, IP address, spesifikasi, pemilik, serta klasifikasi keamanan informasi.",
    path: "/smki/aset-sistem-informasi",
    icon: <Database size={24} className="text-indigo-600 dark:text-indigo-400" />,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-800/60",
  },
  {
    title: "Program Tahunan Audit Internal",
    desc: "Kelola formulir program tahunan audit internal (FR-008), penugasan tim auditor, objek auditee, matriks klausul ISO 27001, jadwal 12 bulan, serta ekspor resmi Word (.docx).",
    path: "/smki/laporan-audit-tahunan",
    icon: <CalendarRange size={24} className="text-teal-600 dark:text-teal-400" />,
    iconBg: "bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-800/60",
  },
  {
    title: "Formulir Laporan Kerusakan",
    desc: "Kelola formulir laporan kerusakan perangkat fasilitas data center (FR-024) beserta rincian tindakan perbaikan.",
    path: "/smki/laporan-kerusakan",
    icon: <ServerCog size={24} className="text-red-500 dark:text-red-400" />,
    iconBg: "bg-red-50 dark:bg-red-950/60 border-red-100 dark:border-red-800/60",
  },
  {
    title: "Screening Karyawan Outsourcing",
    desc: "Kelola berita acara verifikasi administrasi tenaga alih daya, 5 item checklist kepatuhan, serta cetak dokumen resmi format FR-012.",
    path: "/smki/screening-karyawan",
    icon: <Users size={24} className="text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60",
  },
];

export default function SmkiPage() {
  const router = useRouter();

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-5 pb-10">
        {/* ── HERO BANNER SMKI (Sesuai Gambar Desain) ── */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #104991 0%, #1863be 38%, #2580e3 72%, #4da3f6 100%)",
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
                <p className="text-xs sm:text-sm font-semibold text-blue-100 mb-1">
                  Selamat Datang di
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                  SMKI Diskominfo Jawa Barat
                </h1>
                <p className="text-xs sm:text-[13px] text-blue-50/95 mt-2 leading-relaxed font-normal">
                  Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.
                </p>
              </div>
            </div>

            {/* Right: Vector SVG Illustration (Laptop + Perisai Check + Dokumen Gembok + Daun) */}
            <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-1 select-none pointer-events-none">
              <svg width="350" height="120" viewBox="0 0 350 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="smkiScreenGrad" x1="110" y1="16" x2="240" y2="96" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d6ae0" />
                    <stop offset="55%" stopColor="#358ef5" />
                    <stop offset="100%" stopColor="#6dc2ff" />
                  </linearGradient>
                  <linearGradient id="smkiDocGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#e8f3ff" stopOpacity="0.92" />
                  </linearGradient>
                </defs>

                {/* Soft glow behind laptop */}
                <ellipse cx="176" cy="66" rx="125" ry="48" fill="white" opacity="0.12" />

                {/* Left tropical leaves */}
                <g opacity="0.92">
                  <path d="M56 108 C32 98, 20 78, 22 56 C40 62, 54 80, 56 108 Z" fill="#0d9488" opacity="0.75" />
                  <path d="M66 110 C40 90, 34 64, 44 42 C60 54, 68 80, 66 110 Z" fill="#14b8a6" opacity="0.88" />
                  <path d="M44 42 L62 106" stroke="#99f6e4" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                  <path d="M74 108 C56 94, 54 72, 66 54 C76 66, 78 88, 74 108 Z" fill="#38bdf8" opacity="0.65" />
                </g>

                {/* Right tropical leaves */}
                <g opacity="0.92">
                  <path d="M298 108 C322 98, 334 78, 332 56 C314 62, 300 80, 298 108 Z" fill="#0d9488" opacity="0.75" />
                  <path d="M288 110 C314 90, 320 64, 310 42 C294 54, 286 80, 288 110 Z" fill="#14b8a6" opacity="0.88" />
                  <path d="M310 42 L292 106" stroke="#99f6e4" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                </g>

                {/* Left Floating Clipboard Card (User & Security Profile) */}
                <g transform="rotate(-8 82 66)">
                  <rect x="50" y="24" width="58" height="80" rx="9" fill="url(#smkiDocGrad)" stroke="white" strokeWidth="1.5" />
                  <rect x="68" y="19" width="22" height="8" rx="3" fill="#60a5fa" />
                  {/* User icon badge */}
                  <circle cx="67" cy="43" r="8" fill="#dbeafe" />
                  <circle cx="67" cy="41" r="3" fill="#2563eb" />
                  <path d="M61 48 C62.5 45, 71.5 45, 73 48" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                  <rect x="79" y="38" width="21" height="4" rx="2" fill="#3b82f6" opacity="0.85" />
                  <rect x="79" y="45" width="14" height="3.5" rx="1.75" fill="#93c5fd" />
                  {/* Checklist rows */}
                  <rect x="59" y="58" width="40" height="4" rx="2" fill="#bfdbfe" />
                  <rect x="59" y="67" width="34" height="4" rx="2" fill="#bfdbfe" />
                  <rect x="59" y="76" width="38" height="4" rx="2" fill="#bfdbfe" />
                  <rect x="59" y="85" width="25" height="4" rx="2" fill="#93c5fd" />
                </g>

                {/* Right Floating Clipboard Card (with Padlock) */}
                <g transform="rotate(8 268 64)">
                  <rect x="240" y="20" width="60" height="84" rx="9" fill="url(#smkiDocGrad)" stroke="white" strokeWidth="1.5" />
                  <rect x="259" y="15" width="22" height="8" rx="3" fill="#38bdf8" />
                  <rect x="250" y="30" width="38" height="4" rx="2" fill="#93c5fd" />
                  <rect x="250" y="38" width="30" height="4" rx="2" fill="#bfdbfe" />
                  <rect x="250" y="46" width="34" height="4" rx="2" fill="#bfdbfe" />
                  {/* Padlock icon on card */}
                  <g transform="translate(270, 74)">
                    <path d="M-8,-4 V-9 C-8,-14 8,-14 8,-9 V-4" stroke="#1d4ed8" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <rect x="-13" y="-4" width="26" height="20" rx="5" fill="#1e64d8" />
                    <circle cx="0" cy="4" r="2.5" fill="white" />
                    <rect x="-1.2" y="5" width="2.4" height="5" rx="1" fill="white" />
                  </g>
                </g>

                {/* Centerpiece Laptop */}
                <g>
                  <rect x="110" y="16" width="130" height="84" rx="9" fill="#0f2952" stroke="#93c5fd" strokeWidth="1.5" />
                  <rect x="116" y="22" width="118" height="72" rx="5" fill="url(#smkiScreenGrad)" />
                  <circle cx="220" cy="34" r="18" fill="white" opacity="0.1" />
                  <circle cx="132" cy="82" r="22" fill="white" opacity="0.08" />

                  {/* Shield with Checkmark on Laptop Screen */}
                  <g transform="translate(175, 57)">
                    <path
                      d="M0,-23 L20,-15 V-2 C20,12 11,21 0,25 C-11,21 -20,12 -20,-2 V-15 L0,-23 Z"
                      fill="white"
                      opacity="0.96"
                    />
                    <path
                      d="M0,-18 L15,-12 V-2 C15,9 8,16 0,19.5 C-8,16 -15,9 -15,-2 V-12 L0,-18 Z"
                      fill="#2575e8"
                      opacity="0.2"
                    />
                    <path
                      d="M-7,0 L-2,5 L8,-5"
                      stroke="#1d63d2"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Laptop Keyboard Base */}
                  <path d="M94 99 H256 L248 107 C246 109 243 110 239 110 H111 C107 110 104 109 102 107 L94 99 Z" fill="#e2e8f0" />
                  <path d="M94 99 H256 L253 103 H97 L94 99 Z" fill="#f8fafc" />
                  <rect x="161" y="99" width="28" height="3" rx="1.5" fill="#94a3b8" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ── GRID KARTU LAYANAN SMKI (Sesuai Desain Gambar) ── */}
        <div className="bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-sm border border-white/80 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {smkiCards.map((card) => (
              <div
                key={card.path}
                onClick={() => router.push(card.path)}
                className="group bg-white dark:bg-[#0b1e3d] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[168px]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${card.iconBg}`}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14.5px] font-extrabold text-[#102a56] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-3 pt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
