"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldAlert,
  TriangleAlert,
  PlaneTakeoff,
  Laptop,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getNotaDinasList,
  getHasilPentestList,
  getKerentananList,
  getDetailPerjalananList,
  getSpdList,
  getPerubahanItList,
} from "@/services/api";

export default function AdministrasiSuratPage() {
  const router = useRouter();
  const { hasServicePermission } = useAuthStore();

  const [counts, setCounts] = useState({
    notaDinas: 0,
    pentest: 0,
    kerentanan: 0,
    spd: 0,
    ti: 0,
  });
  const [totalSurat, setTotalSurat] = useState(0);
  const [suratDiproses, setSuratDiproses] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchAllSuratStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [ndRes, ptRes, krRes, spdRes, tiRes] = await Promise.allSettled([
        getNotaDinasList({ per_page: 200 }),
        getHasilPentestList({ per_page: 200 }),
        getKerentananList({ per_page: 200 }),
        getDetailPerjalananList().catch(() => getSpdList()),
        getPerubahanItList(),
      ]);

      // 1. Nota Dinas
      let ndTotal = 0;
      let ndProcessed = 0;
      if (ndRes.status === "fulfilled" && ndRes.value) {
        const val = ndRes.value;
        const list = Array.isArray(val?.data) ? val.data : [];
        ndTotal = Number(val?.meta?.total ?? list.length) || 0;
        ndProcessed = list.filter((x: any) => {
          const st = String(x?.status || "").toLowerCase();
          return st && st !== "draft" && st !== "draf";
        }).length;
      }

      // 2. Hasil Pentest
      let ptTotal = 0;
      let ptProcessed = 0;
      if (ptRes.status === "fulfilled" && ptRes.value) {
        const val = ptRes.value;
        const list = Array.isArray(val?.data) ? val.data : [];
        ptTotal = Number(val?.meta?.total ?? list.length) || 0;
        ptProcessed = list.filter((x: any) => {
          const st = String(x?.status || "").toLowerCase();
          return st && st !== "draft" && st !== "draf";
        }).length;
      }

      // 3. Pemberitahuan Kerentanan
      let krTotal = 0;
      let krProcessed = 0;
      if (krRes.status === "fulfilled" && krRes.value) {
        const val = krRes.value;
        const list = Array.isArray(val?.data) ? val.data : [];
        krTotal = Number(val?.meta?.total ?? list.length) || 0;
        krProcessed = list.filter((x: any) => {
          const st = String(x?.status || "").toLowerCase();
          return st && st !== "draft" && st !== "draf";
        }).length;
      }

      // 4. SPD
      let spdTotal = 0;
      let spdProcessed = 0;
      if (spdRes.status === "fulfilled" && spdRes.value) {
        const val = spdRes.value;
        const list = Array.isArray(val?.data)
          ? val.data
          : Array.isArray(val)
          ? val
          : [];
        spdTotal = Number(val?.meta?.total ?? list.length) || 0;
        spdProcessed = list.filter((x: any) => {
          const st = String(x?.status || "").toLowerCase();
          return st !== "draf" && st !== "draft";
        }).length;
      }

      // 5. Permohonan TI
      let tiTotal = 0;
      let tiProcessed = 0;
      if (tiRes.status === "fulfilled" && tiRes.value) {
        const val = tiRes.value;
        const list = Array.isArray(val)
          ? val
          : Array.isArray(val?.data)
          ? val.data
          : [];
        tiTotal = list.length;
        tiProcessed = list.filter((x: any) => {
          const st = String(x?.status || "").toLowerCase();
          return st !== "ditolak";
        }).length;
      }

      setCounts({
        notaDinas: ndTotal,
        pentest: ptTotal,
        kerentanan: krTotal,
        spd: spdTotal,
        ti: tiTotal,
      });
      setTotalSurat(ndTotal + ptTotal + krTotal + spdTotal + tiTotal);
      setSuratDiproses(
        ndProcessed + ptProcessed + krProcessed + spdProcessed + tiProcessed
      );
    } catch (err) {
      console.error("Gagal memuat ringkasan statistik surat:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSuratStats();
  }, [fetchAllSuratStats]);

  const allCards = [
    {
      id: "nota-dinas",
      code: "SURAT_NOTA_DINAS",
      title: "Nota Dinas",
      desc: "Format standar komunikasi internal kedinasan untuk koordinasi antar unit kerja.",
      icon: FileText,
      count: counts.notaDinas,
      path: "/administrasisurat/nota-dinas",
    },
    {
      id: "pentest",
      code: "SURAT_HASIL_PENTEST",
      title: "Pemberitahuan Hasil Pentest",
      desc: "Laporan resmi mengenai hasil pengujian penetrasi keamanan infrastruktur atau aplikasi.",
      icon: ShieldAlert,
      count: counts.pentest,
      path: "/administrasisurat/hasil-pentest",
    },
    {
      id: "kerentanan",
      code: "SURAT_KERENTANAN",
      title: "Pemberitahuan Kerentanan",
      desc: "Surat peringatan dini mengenai celah keamanan kritis yang ditemukan pada aplikasi.",
      icon: TriangleAlert,
      count: counts.kerentanan,
      path: "/administrasisurat/kerentanan",
    },
    {
      id: "spd",
      code: "SURAT_SPD",
      title: "SPD (Surat Perjalanan Dinas)",
      desc: "Dokumen penugasan resmi untuk perjalanan dinas pegawai di lingkungan kementerian.",
      icon: PlaneTakeoff,
      count: counts.spd,
      path: "/spd",
    },
    {
      id: "ti",
      code: "SURAT_PERMOHONAN_TI",
      title: "Permohonan TI",
      desc: "Surat pengajuan dukungan teknologi informasi, perangkat, atau pengembangan sistem.",
      icon: Laptop,
      count: counts.ti,
      path: "/perubahan-it/dashboard",
    },
  ];

  const filteredCards = allCards.filter((c) => hasServicePermission(c.code));
  const cards = filteredCards.length > 0 ? filteredCards : allCards;

  return (
    <ServiceRouteGuard requiredService="ADMINISTRASI_SURAT">
      <div className="flex flex-col gap-6 pb-6 font-sans">
        {/* ── Top Hero Banner (Dengan Ornamen Dot Matrix, Orbital Rings & Crystal Glow) ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#071733] via-[#0f2e60] to-[#1d4ed8] rounded-3xl text-white shadow-xl min-h-[185px]">
          {/* Top Shimmer Beam */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent pointer-events-none z-20" />

          {/* Dot Matrix Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.16] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Ambient Glow Orbs */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/25 blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -top-12 w-64 h-64 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

          {/* Orbital Rings / Geometric Circles */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-cyan-300/15 pointer-events-none" />

          {/* Sparkle Stars Decorative */}
          <div className="absolute right-64 top-6 pointer-events-none opacity-80 animate-pulse">
            <svg className="w-3.5 h-3.5 text-cyan-200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
          <div className="absolute right-12 bottom-5 pointer-events-none opacity-70 animate-pulse" style={{ animationDelay: "1s" }}>
            <svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-7 py-7 sm:px-9">
            <div className="flex items-start sm:items-center gap-5 max-w-xl">
              {/* Left: Crystal Glowing Icon Box */}
              <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-md opacity-50" />
                <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl shadow-blue-950/40">
                  <FileText size={34} className="text-white drop-shadow-sm" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-cyan-200 tracking-wide mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  <span>LAYANAN TATA NASKAH KEDINASAN</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                  Administrasi <span className="text-cyan-300">Surat</span>
                </h1>
                <p className="text-sm text-slate-100/90 leading-relaxed font-normal">
                  Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi kedinasan secara terpadu dan efisien.
                </p>
              </div>
            </div>

            {/* Ilustrasi 3D Kertas Melayang */}
            <div className="hidden lg:flex items-center justify-center relative w-[220px] h-[130px] -mt-3 flex-shrink-0 pointer-events-none select-none">
              <div className="absolute right-8 -top-2 w-24 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transform rotate-12 flex flex-col p-3 justify-between">
                <div className="w-8 h-2 bg-white/40 rounded-full" />
                <div className="space-y-1.5">
                  <div className="w-full h-1 bg-white/20 rounded-full" />
                  <div className="w-3/4 h-1 bg-white/20 rounded-full" />
                </div>
              </div>

              <div className="absolute right-16 -top-1 w-28 h-[134px] rounded-2xl bg-white/25 backdrop-blur-lg border border-white/40 shadow-2xl transform -rotate-6 flex flex-col p-3.5 justify-between">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-2.5 bg-cyan-300/80 rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-white/50 rounded-full" />
                  <div className="w-full h-1.5 bg-white/40 rounded-full" />
                  <div className="w-4/5 h-1.5 bg-white/40 rounded-full" />
                  <div className="w-1/2 h-1.5 bg-white/30 rounded-full" />
                </div>
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/60 flex items-center justify-center">
                    <FileText size={12} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 bottom-5 w-10 h-10 rounded-xl bg-cyan-400/30 backdrop-blur-sm border border-cyan-300/40 flex items-center justify-center transform rotate-45 shadow-lg">
                <span className="text-white text-base transform -rotate-45">✈️</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section Pilih Jenis Surat (Format Menggigit Serasi Dashboard & SMKI) ── */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600 dark:text-blue-400">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                Pilih Jenis Surat
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4.5">
            {cards.map((card) => {
              const WatermarkIcon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(card.path)}
                  className="relative overflow-hidden bg-white dark:bg-[#0b1e3d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group flex flex-col min-h-[205px]"
                >
                  {/* Strip warna biru khas Administrasi Surat */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

                  {/* Ikon watermark */}
                  <div className="absolute -right-5 -bottom-5 opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none text-blue-600 dark:text-blue-400">
                    <WatermarkIcon size={118} strokeWidth={1.5} />
                  </div>

                  <div className="relative flex flex-col flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 shadow-lg shadow-blue-500/25 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <WatermarkIcon size={22} className="text-white" />
                      </div>
                    </div>

                    <h3 className="mt-4 text-[15px] font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-[12.5px] text-slate-500 dark:text-slate-300 leading-relaxed mt-1 line-clamp-3">
                      {card.desc}
                    </p>

                    <div className="flex items-center justify-end mt-auto pt-4">
                      <div className="h-9 min-w-[36px] px-2.5 group-hover:px-4 rounded-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all duration-300">
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
        </div>

        {/* ── Bottom Section: Total Surat & Surat Diproses (Real-Time) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Total Surat & Surat Diproses (Span 5) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4.5 items-start">
            {/* Card 1: Total Surat */}
            <div className="relative overflow-hidden bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl border border-white/70 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="absolute -right-4 -bottom-4 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity pointer-events-none text-blue-600 dark:text-blue-400">
                <FileText size={105} strokeWidth={1.5} />
              </div>
              <div className="p-5.5 relative z-10 flex flex-col justify-between min-h-[160px]">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Surat
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 leading-none">
                      {loadingStats ? "..." : totalSurat.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  <span>Akumulasi 5 jenis surat</span>
                </div>
              </div>
            </div>

            {/* Card 2: Surat Diproses */}
            <div className="relative overflow-hidden bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl border border-white/70 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-teal-500" />
              <div className="absolute -right-4 -bottom-4 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity pointer-events-none text-cyan-600 dark:text-cyan-400">
                <Clock size={105} strokeWidth={1.5} />
              </div>
              <div className="p-5.5 relative z-10 flex flex-col justify-between min-h-[160px]">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Surat Diproses
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 leading-none">
                      {loadingStats ? "..." : suratDiproses.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span>Status aktif &amp; berjalan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Modul Table (Span 7) */}
          <div className="lg:col-span-7 relative overflow-hidden bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl border border-white/70 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
            <div className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      Ringkasan Modul
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Statistik distribusi berkas per kategori surat
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchAllSuratStats}
                  title="Muat ulang statistik"
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <RefreshCw size={14} className={loadingStats ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-bold">Kategori Surat</th>
                      <th className="pb-2.5 font-bold text-center">Distribusi</th>
                      <th className="pb-2.5 font-bold text-center">Jumlah</th>
                      <th className="pb-2.5 font-bold text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {cards.map((item) => {
                      const Icon = item.icon;
                      const percentage = totalSurat > 0 ? Math.round((item.count / totalSurat) * 100) : 0;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => router.push(item.path)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <Icon size={16} />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center w-36">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(percentage, totalSurat > 0 ? 4 : 0)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
                              {percentage}%
                            </span>
                          </td>
                          <td className="py-3 font-extrabold text-slate-800 dark:text-slate-200 text-center">
                            {loadingStats ? "..." : item.count.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 text-right pr-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Aktif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
