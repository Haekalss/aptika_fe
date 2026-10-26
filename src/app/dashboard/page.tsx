"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  Briefcase,
  Users,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  ChevronDown,
  Megaphone,
  Clock,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";

interface ServicePermissionItem {
  service_id: number;
  code: string;
  name: string;
  is_enabled: boolean;
}

interface BidangMatrixItem {
  bidang_id: number;
  bidang_code: string;
  bidang_name: string;
  services: ServicePermissionItem[];
}

const recentActivities = [
  {
    id: 1,
    icon: <FileText size={18} className="text-blue-600" />,
    iconBg: "bg-blue-100 dark:bg-blue-950/60",
    title: "Pengajuan surat masuk baru",
    desc: "Surat resmi dari Dinas Pendidikan terkait permohonan data dan integrasi API.",
    time: "12 menit yang lalu",
    status: "new",
  },
  {
    id: 2,
    icon: <Users size={18} className="text-orange-600" />,
    iconBg: "bg-orange-100 dark:bg-orange-950/60",
    title: "Tugas magang disetujui",
    desc: "Program Magang 2025 - Tahap 2 telah berhasil diverifikasi koordinator.",
    time: "1 jam yang lalu",
    status: "success",
  },
  {
    id: 3,
    icon: <Layers size={18} className="text-purple-600" />,
    iconBg: "bg-purple-100 dark:bg-purple-950/60",
    title: "Laporan IKI diperbarui",
    desc: "Rekapitulasi capaian kinerja individu aparatur bulan Mei 2025 telah diupdate.",
    time: "2 jam yang lalu",
    status: "info",
  },
  {
    id: 4,
    icon: <UserPlus size={18} className="text-emerald-600" />,
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
    title: "Pengguna baru terdaftar",
    desc: "Pegawai baru telah berhasil didaftarkan dan diberikan akses layanan.",
    time: "3 jam yang lalu",
    status: "success",
  },
  {
    id: 5,
    icon: <AlertTriangle size={18} className="text-red-500" />,
    iconBg: "bg-red-100 dark:bg-red-950/60",
    title: "Maintenance sistem",
    desc: "Pemeliharaan rutin server terjadwal malam ini pukul 22:00 - 24:00 WIB.",
    time: "4 jam yang lalu",
    status: "warning",
  },
];

const announcements = [
  {
    id: 1,
    color: "bg-blue-500",
    title: "Update Sistem Versi 2.1.0",
    desc: "Peningkatan performa sistem, optimalisasi database, dan perbaikan tampilan.",
    date: "16 Mei 2025",
  },
  {
    id: 2,
    color: "bg-amber-500",
    title: "Jadwal Maintenance Server",
    desc: "Pemeliharaan server berkala pada 30 Mei 2025 pukul 22:00 WIB.",
    date: "15 Mei 2025",
  },
  {
    id: 3,
    color: "bg-emerald-500",
    title: "Pelatihan Pengguna APTIKA Tools",
    desc: "Sesi pelatihan dan bimbingan alur kerja digital bagi seluruh aparatur unit kerja.",
    date: "13 Mei 2025",
  },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  success: "bg-emerald-500",
  info: "bg-slate-400",
  warning: "bg-red-500",
};

function IsometricIllustration() {
  return (
    <div className="relative w-[340px] h-[180px] flex items-center justify-center pointer-events-none select-none">
      <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full transform scale-75" />

      <div className="relative z-10 w-[210px] h-[130px] rounded-xl bg-gradient-to-tr from-slate-900/90 to-blue-950/95 border border-white/30 backdrop-blur-md shadow-2xl p-2.5 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
            <span className="w-2 h-2 rounded-full bg-green-400/80" />
          </div>
          <span className="text-[8px] text-cyan-200/80 font-mono">dashboard.preview</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 my-auto">
          <div className="h-9 bg-blue-500/25 border border-blue-400/30 rounded-md p-1 flex flex-col justify-between">
            <div className="w-3 h-3 rounded bg-blue-400/60" />
            <div className="w-full h-1 bg-white/40 rounded-full" />
          </div>
          <div className="h-9 bg-purple-500/25 border border-purple-400/30 rounded-md p-1 flex flex-col justify-between">
            <div className="w-3 h-3 rounded bg-purple-400/60" />
            <div className="w-full h-1 bg-white/40 rounded-full" />
          </div>
          <div className="h-9 bg-emerald-500/25 border border-emerald-400/30 rounded-md p-1 flex flex-col justify-between">
            <div className="w-3 h-3 rounded bg-emerald-400/60" />
            <div className="w-full h-1 bg-white/40 rounded-full" />
          </div>
        </div>

        <div className="h-6 w-full bg-white/5 border border-white/10 rounded-md flex items-end gap-1 px-1.5 pb-1">
          <div className="w-1/6 h-[40%] bg-cyan-400 rounded-t-xs" />
          <div className="w-1/6 h-[70%] bg-blue-400 rounded-t-xs" />
          <div className="w-1/6 h-[50%] bg-indigo-400 rounded-t-xs" />
          <div className="w-1/6 h-[90%] bg-purple-400 rounded-t-xs" />
          <div className="w-1/6 h-[65%] bg-pink-400 rounded-t-xs" />
          <div className="w-1/6 h-[100%] bg-emerald-400 rounded-t-xs" />
        </div>
      </div>

      <div className="absolute right-6 top-3 z-20 w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl shadow-rose-900/40 border border-white/30 flex items-center justify-center transform rotate-12">
        <FileText size={18} className="text-white" />
      </div>

      <div className="absolute left-8 top-4 z-20 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-900/40 border border-white/30 flex items-center justify-center transform -rotate-12">
        <ShieldCheck size={18} className="text-white" />
      </div>

      <div className="absolute right-12 -bottom-2 z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-900/40 border border-white/30 flex items-center justify-center transform rotate-6">
        <Layers size={20} className="text-white" />
      </div>

      <div className="absolute left-10 bottom-2 z-20 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-teal-900/40 border border-white/30 flex items-center justify-center transform rotate-12">
        <Briefcase size={16} className="text-white" />
      </div>
    </div>
  );
}

export default function Homepage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("User");

  const { user, bidang, isAdminAptika, hasServicePermission, fetchProfile } = useAuthStore();

  const isSuperAdmin =
    isAdminAptika ||
    (user?.role === "admin" && (bidang?.code === "APTIKA" || (user as any)?.bidang_id === 3));

  const [selectedBidangId, setSelectedBidangId] = useState<string>("all");
  const [bidangMatrixList, setBidangMatrixList] = useState<BidangMatrixItem[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj?.name) setUserName(uObj.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [fetchProfile]);

  const fetchMatrix = useCallback(async () => {
    if (!isSuperAdmin) return;
    setMatrixLoading(true);
    try {
      const res = await api.get("/admin/bidang-services");
      if (res.data?.success) {
        setBidangMatrixList(res.data.data);
      }
    } catch (e) {
      console.error("Gagal memuat matriks layanan per bidang:", e);
    } finally {
      setMatrixLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchMatrix();
    }
  }, [isSuperAdmin, fetchMatrix]);

  const allCards = [
    {
      id: "administrasi-surat",
      code: "ADMINISTRASI_SURAT",
      title: "Administrasi Surat",
      desc: "Layanan pengelolaan surat menyurat dan disposisi.",
      icon: <FileText size={22} className="text-white" />,
      iconBg: "bg-blue-500",
      cardBorder: "border-slate-100 hover:border-blue-300 dark:border-slate-800",
      arrowBg: "bg-blue-500 hover:bg-blue-600",
      path: "/administrasisurat",
    },
    {
      id: "magang",
      code: "MAGANG",
      title: "Magang",
      desc: "Pengelolaan data peserta magang, presensi, dan administrasi.",
      icon: <Users size={22} className="text-white" />,
      iconBg: "bg-purple-500",
      cardBorder: "border-slate-100 hover:border-purple-300 dark:border-slate-800",
      arrowBg: "bg-purple-500 hover:bg-purple-600",
      path: "/magang/dashboard",
    },
    {
      id: "manajemen-tugas-digital",
      code: "MANAJEMEN_TUGAS",
      title: "Manajemen Tugas Digital",
      desc: "Monitoring penugasan, alur kerja digital, dan manajemen penyelesaian.",
      icon: <Briefcase size={22} className="text-white" />,
      iconBg: "bg-emerald-500",
      cardBorder: "border-slate-100 hover:border-emerald-300 dark:border-slate-800",
      arrowBg: "bg-emerald-500 hover:bg-emerald-600",
      path: "/manajementugasdigital",
    },
    {
      id: "iki-report",
      code: "IKI_REPORT",
      title: "IKI Report",
      desc: "Rekapitulasi data Indikator Kinerja Individu (Integrasi, Pengelolaan, Rekayasa, dll).",
      icon: <Layers size={22} className="text-white" />,
      iconBg: "bg-rose-500",
      cardBorder: "border-slate-100 hover:border-rose-300 dark:border-slate-800",
      arrowBg: "bg-rose-500 hover:bg-rose-600",
      path: "/integrasiinteroperabilitas/dashboard",
    },
    {
      id: "smki",
      code: "SMKI",
      title: "SMKI",
      desc: "Layanan administrasi dan tata kelola Surat Manajemen Keamanan Informasi.",
      icon: <ShieldCheck size={22} className="text-white" />,
      iconBg: "bg-violet-500",
      cardBorder: "border-slate-100 hover:border-violet-300 dark:border-slate-800",
      arrowBg: "bg-violet-500 hover:bg-violet-600",
      path: "/smki",
    },
  ];

  const getFilteredCards = () => {
    if (!mounted) return allCards;
    if (isSuperAdmin) {
      if (selectedBidangId === "all") return allCards;
      const targetBidang = bidangMatrixList.find((b) => String(b.bidang_id) === selectedBidangId);
      if (!targetBidang) return allCards;
      return allCards.filter((card) => {
        const svc = targetBidang.services.find((s) => s.code === card.code);
        return svc ? svc.is_enabled : true;
      });
    }
    return allCards.filter((c) => hasServicePermission(c.code));
  };

  const cards = getFilteredCards();

  const selectedBidangObj = bidangMatrixList.find(
    (b) => String(b.bidang_id) === selectedBidangId
  );

  return (
    <div className="flex flex-col gap-6 pb-6 font-sans">
      {/* ── Hero Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2146] via-[#163868] to-[#1d4ed8] rounded-3xl text-white shadow-xl min-h-[190px]">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-6 sm:px-8">
          <div className="flex-1 min-w-0 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-cyan-200 text-xs font-bold backdrop-blur-sm border border-white/20 mb-3">
              🌟 <span>Selamat Datang di</span>
              {isSuperAdmin && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider">
                  Super Admin
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              APTIKA <span className="text-cyan-300">TOOLS</span>
            </h1>
            <p className="text-sm text-slate-100/90 leading-relaxed font-normal" suppressHydrationWarning>
              {isSuperAdmin
                ? "Sebagai Super Admin, Anda memiliki wewenang penuh untuk meninjau dan mengakses seluruh layanan lintas 7 Unit Kerja Diskominfo Jawa Barat."
                : "Platform pengelolaan dan rekapitulasi data Aplikasi Informatika Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Silakan pilih modul service di bawah untuk memulai."}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center justify-center">
              <IsometricIllustration />
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 min-w-[170px] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-300 font-medium">Status Sistem:</div>
                  <div className="text-emerald-300 font-extrabold text-sm">Aktif</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 min-w-[170px] shadow-sm">
                <Layers size={18} className="text-cyan-300 flex-shrink-0" />
                <div suppressHydrationWarning>
                  <div className="text-[11px] text-slate-300 font-medium">Total Modul:</div>
                  <div className="text-white font-extrabold text-sm">{cards.length} Layanan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Super Admin Bidang Selector ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-amber-300">
                  Mode Pengawasan Super Admin: Tinjau Layanan Per Bidang
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Pilih unit kerja untuk melihat ketersediaan & konfigurasi layanan aktif.
                </p>
              </div>
            </div>
            <div className="relative flex-shrink-0 min-w-[240px]">
              <select
                value={selectedBidangId}
                onChange={(e) => setSelectedBidangId(e.target.value)}
                disabled={matrixLoading}
                className="w-full pl-9 pr-8 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-[#0b1630] border-2 border-amber-500/40 text-slate-800 dark:text-amber-200 focus:outline-none focus:border-amber-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">🌐 Semua Bidang (Akses Super Admin)</option>
                {bidangMatrixList.map((b) => (
                  <option key={b.bidang_id} value={String(b.bidang_id)}>
                    🏛️ [{b.bidang_code}] {b.bidang_name}
                  </option>
                ))}
              </select>
              <Eye size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── Modul Service Section: Logo Vertikal Seimbang & Panah Tidak Mepet ── */}
      <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Layers size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                Modul Service
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Akses cepat ke seluruh modul service APTIKA TOOLS
              </p>
            </div>
          </div>
        </div>

        {/* Module Cards: Logo sejajar vertikal dengan teks, Deskripsi diperbesar, posisi diturunkan sedikit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4.5">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => router.push(card.path)}
              className="bg-white dark:bg-[#0b1e3d] rounded-2xl p-5 pt-6 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between min-h-[205px]"
            >
              {/* Row Horizontal: Logo sejajar rapi dengan deskripsi (items-start dengan mt-1.5) */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-sm flex-shrink-0 mt-1.5`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 line-clamp-3">
                    {card.desc}
                  </p>
                </div>
              </div>

              {/* Panah Lingkaran di POJOK KANAN BAWAH: diturunkan dengan mt-auto & padding lega agar tidak mepet */}
              <div className="flex items-center justify-end mt-auto pt-4 pr-1 pb-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${card.arrowBg} transition-all group-hover:scale-105 shadow-xs`}
                >
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Section: Aktivitas Terbaru & Pengumuman ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Terbaru */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Aktivitas Terbaru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pembaruan sistem & log pekerjaan pengguna</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg} flex-shrink-0 mt-0.5 shadow-xs`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusColors[item.status]}`} />
                      <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pengumuman */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Pengumuman
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Informasi resmi & agenda pemeliharaan</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shadow-2xs"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0 mt-1.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="text-xs text-slate-400 font-semibold mt-2 inline-block">
                      📅 {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
