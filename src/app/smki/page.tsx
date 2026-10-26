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

            {/* Right: Ilustrasi Khusus SMKI (Security Operations, ISO 27001 Audit & Server Vault) */}
            <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-2 select-none pointer-events-none">
              <svg width="360" height="122" viewBox="0 0 360 122" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="smkiVaultGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f2952" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.88" />
                  </linearGradient>
                  <linearGradient id="smkiShieldGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>

                {/* Outer Radar / Cyber Rings on Left */}
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

                {/* Floating ISO 27001 Pill above Shield */}
                <rect x="44" y="8" width="56" height="15" rx="7.5" fill="#0f2952" fillOpacity="0.8" stroke="#7dd3fc" strokeWidth="1" />
                <circle cx="53" cy="15.5" r="3" fill="#34d399" />
                <text x="60" y="18" fontSize="7" fontWeight="700" fill="white" letterSpacing="0.4">ISO 27001</text>

                {/* Connection Line from Shield to Audit Board */}
                <path d="M118 61 H134" stroke="#7dd3fc" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx="126" cy="61" r="3" fill="#38bdf8" />

                {/* Main Security & Compliance Dashboard Board */}
                <rect x="134" y="10" width="208" height="102" rx="12" fill="url(#smkiVaultGrad)" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />

                {/* Top Window Bar */}
                <circle cx="147" cy="21" r="2.8" fill="#f87171" />
                <circle cx="156" cy="21" r="2.8" fill="#fbbf24" />
                <circle cx="165" cy="21" r="2.8" fill="#34d399" />
                <text x="176" y="23.5" fontSize="7" fontWeight="700" fill="#bae6fd" letterSpacing="0.5">SMKI SECURITY AUDIT</text>
                <rect x="292" y="16" width="38" height="11" rx="5.5" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="0.8" />
                <text x="299" y="23.5" fontSize="6.5" fontWeight="700" fill="#6ee7b7">SECURE</text>
                <line x1="134" y1="30" x2="342" y2="30" stroke="white" strokeOpacity="0.12" />

                {/* Left Sub-panel: Server Rack / Hardening Nodes */}
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

                {/* Right Sub-panel: Encryption Lock & Compliance Meter */}
                <rect x="234" y="37" width="98" height="67" rx="7" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.15" />

                {/* Padlock Badge inside Right Sub-panel */}
                <circle cx="256" cy="57" r="13" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.2" />
                <path d="M252 55 V52 C252 49.5 260 49.5 260 52 V55" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <rect x="250" y="55" width="12" height="9" rx="2.5" fill="#fbbf24" />
                <circle cx="256" cy="59.5" r="1.3" fill="#0f2952" />

                {/* Compliance Score Text & Progress Bars */}
                <text x="274" y="53" fontSize="11" fontWeight="800" fill="white">99.4%</text>
                <text x="274" y="62" fontSize="6" fontWeight="600" fill="#93c5fd">KEPATUHAN</text>

                {/* Progress Bar 1 */}
                <text x="242" y="77" fontSize="6" fontWeight="600" fill="#e0f2fe">Hardening Aset</text>
                <rect x="242" y="80" width="82" height="4.5" rx="2.25" fill="white" fillOpacity="0.15" />
                <rect x="242" y="80" width="74" height="4.5" rx="2.25" fill="#34d399" />

                {/* Progress Bar 2 */}
                <text x="242" y="92" fontSize="6" fontWeight="600" fill="#e0f2fe">Audit &amp; Rekaman</text>
                <rect x="242" y="95" width="82" height="4.5" rx="2.25" fill="white" fillOpacity="0.15" />
                <rect x="242" y="95" width="68" height="4.5" rx="2.25" fill="#38bdf8" />
              </svg>
            </div>          </div>
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
