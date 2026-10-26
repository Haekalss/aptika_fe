"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let isMounted = true;

    const fetchAllSuratStats = async () => {
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

        if (isMounted) {
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
        }
      } catch (err) {
        console.error("Gagal memuat ringkasan statistik surat:", err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchAllSuratStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const allCards = [
    {
      id: "nota-dinas",
      code: "SURAT_NOTA_DINAS",
      title: "Nota Dinas",
      desc: "Format standar komunikasi internal kedinasan untuk koordinasi antar unit kerja.",
      icon: <FileText size={22} className="text-blue-600" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/60",
      cardBorder: "border-slate-100 hover:border-blue-300 dark:border-slate-800",
      arrowBg: "bg-blue-500 hover:bg-blue-600",
      count: counts.notaDinas,
      path: "/administrasisurat/nota-dinas",
    },
    {
      id: "pentest",
      code: "SURAT_HASIL_PENTEST",
      title: "Pemberitahuan Hasil Pentest",
      desc: "Laporan resmi mengenai hasil pengujian penetrasi keamanan infrastruktur atau aplikasi.",
      icon: <ShieldAlert size={22} className="text-amber-600" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/60",
      cardBorder: "border-slate-100 hover:border-amber-300 dark:border-slate-800",
      arrowBg: "bg-amber-500 hover:bg-amber-600",
      count: counts.pentest,
      path: "/administrasisurat/hasil-pentest",
    },
    {
      id: "kerentanan",
      code: "SURAT_KERENTANAN",
      title: "Pemberitahuan Kerentanan",
      desc: "Surat peringatan dini mengenai celah keamanan kritis yang ditemukan pada aplikasi.",
      icon: <TriangleAlert size={22} className="text-rose-600" />,
      iconBg: "bg-rose-50 dark:bg-rose-950/60",
      cardBorder: "border-slate-100 hover:border-rose-300 dark:border-slate-800",
      arrowBg: "bg-rose-500 hover:bg-rose-600",
      count: counts.kerentanan,
      path: "/administrasisurat/kerentanan",
    },
    {
      id: "spd",
      code: "SURAT_SPD",
      title: "SPD (Surat Perjalanan Dinas)",
      desc: "Dokumen penugasan resmi untuk perjalanan dinas pegawai di lingkungan kementerian.",
      icon: <PlaneTakeoff size={22} className="text-purple-600" />,
      iconBg: "bg-purple-50 dark:bg-purple-950/60",
      cardBorder: "border-slate-100 hover:border-purple-300 dark:border-slate-800",
      arrowBg: "bg-purple-500 hover:bg-purple-600",
      count: counts.spd,
      path: "/spd",
    },
    {
      id: "ti",
      code: "SURAT_PERMOHONAN_TI",
      title: "Permohonan TI",
      desc: "Surat pengajuan dukungan teknologi informasi, perangkat, atau pengembangan sistem.",
      icon: <Laptop size={22} className="text-sky-600" />,
      iconBg: "bg-sky-50 dark:bg-sky-950/60",
      cardBorder: "border-slate-100 hover:border-sky-300 dark:border-slate-800",
      arrowBg: "bg-sky-500 hover:bg-sky-600",
      count: counts.ti,
      path: "/perubahan-it/dashboard",
    },
  ];

  const filteredCards = allCards.filter((c) => hasServicePermission(c.code));
  const cards = filteredCards.length > 0 ? filteredCards : allCards;

  return (
    <ServiceRouteGuard requiredService="ADMINISTRASI_SURAT">
      <div className="flex flex-col gap-6 pb-6 font-sans">
        {/* ── Top Hero Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2146] via-[#163868] to-[#1d4ed8] rounded-3xl text-white shadow-xl min-h-[175px]">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-12 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-7 py-7 sm:px-9">
            <div className="flex items-center gap-5 max-w-xl">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <FileText size={34} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                  Administrasi <span className="text-cyan-300">Surat</span>
                </h1>
                <p className="text-sm text-slate-100/90 leading-relaxed font-normal">
                  Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi kedinasan secara terpadu dan efisien.
                </p>
              </div>
            </div>

            {/* Ilustrasi 3D Kertas Melayang (Dinaikkan agar sejajar tengah banner) */}
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

        {/* ── Section Pilih Jenis Surat ── */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(card.path)}
                className={`bg-white dark:bg-[#0b1e3d] rounded-2xl p-5 pt-6 border ${card.cardBorder} shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between min-h-[205px]`}
              >
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

        {/* ── Bottom Section: Total Surat & Surat Diproses (Real-Time) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Total Surat & Surat Diproses (Span 6) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Card 1: Total Surat */}
            <div className="bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total Surat
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 leading-none">
                    {loadingStats ? "..." : totalSurat.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TrendingUp size={14} />
                <span>Data real-time seluruh jenis surat</span>
              </div>
            </div>

            {/* Card 2: Surat Diproses */}
            <div className="bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Surat Diproses
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 leading-none">
                    {loadingStats ? "..." : suratDiproses.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TrendingUp size={14} />
                <span>Surat aktif &amp; telah diproses</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Modul Table (Span 6) */}
          <div className="lg:col-span-6 bg-white/70 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                  <Layers size={17} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Ringkasan Modul
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-bold">Nama Modul</th>
                      <th className="pb-2.5 font-bold text-center">Jumlah Surat</th>
                      <th className="pb-2.5 font-bold text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {cards.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.iconBg} flex-shrink-0`}>
                              {item.icon}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 text-center">
                          {loadingStats ? "..." : item.count.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 text-right pr-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
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
