"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  FileText,
  ShieldAlert,
  TriangleAlert,
  PlaneTakeoff,
  Laptop,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const suratNavItems = [
  {
    label: "Ringkasan Surat",
    title: "Administrasi Surat",
    desc: "Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi kedinasan secara terpadu dan efisien.",
    path: "/administrasisurat",
    matchPrefix: "/administrasisurat",
    exact: true,
    icon: Layers,
  },
  {
    label: "Nota Dinas",
    title: "Nota Dinas Kedinasan",
    desc: "Kelola, buat, dan pantau seluruh surat komunikasi internal kedinasan (Nota Dinas) antar unit kerja secara terpadu.",
    path: "/administrasisurat/nota-dinas",
    matchPrefix: "/administrasisurat/nota-dinas",
    icon: FileText,
  },
  {
    label: "Hasil Pentest",
    title: "Pemberitahuan Hasil Pentest",
    desc: "Kelola dan arsipkan surat laporan resmi mengenai hasil pengujian penetrasi keamanan aplikasi dan infrastruktur TI.",
    path: "/administrasisurat/hasil-pentest",
    matchPrefix: "/administrasisurat/hasil-pentest",
    icon: ShieldAlert,
  },
  {
    label: "Pemberitahuan Kerentanan",
    title: "Pemberitahuan Kerentanan Keamanan",
    desc: "Kelola surat peringatan dini mengenai celah keamanan kritis (Vulnerability Advisory) dan rekomendasi perbaikan sistem.",
    path: "/administrasisurat/kerentanan",
    matchPrefix: "/administrasisurat/kerentanan",
    icon: TriangleAlert,
  },
  {
    label: "SPD (Perjalanan Dinas)",
    title: "Surat Perjalanan Dinas (SPD)",
    desc: "Kelola dokumen penugasan resmi, visum, dan pertanggungjawaban perjalanan dinas pegawai di lingkungan Diskominfo Jawa Barat.",
    path: "/spd",
    matchPrefix: "/spd",
    icon: PlaneTakeoff,
  },
  {
    label: "Permohonan TI",
    title: "Permohonan Perubahan TI",
    desc: "Kelola surat pengajuan dukungan teknologi informasi, perubahan konfigurasi perangkat, atau pengembangan sistem aplikasi.",
    path: "/perubahan-it/dashboard",
    matchPrefix: "/perubahan-it",
    icon: Laptop,
  },
];

export default function AdministrasiSuratLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const isMainSuratPage = pathname === "/administrasisurat";
  const isPrintPage = pathname.includes("/print");

  const activeItem =
    suratNavItems.find((item) =>
      item.exact
        ? pathname === item.path
        : pathname === item.path || pathname.startsWith(item.matchPrefix)
    ) || suratNavItems[0];

  const ActiveIcon = activeItem.icon || FileText;

  // Halaman utama /administrasisurat tampil full-width seperti desain aslinya
  if (isMainSuratPage) {
    return (
      <MainLayout
        title="Administrasi Surat"
        subtitle="Silakan pilih kategori surat yang ingin Anda kelola untuk memulai proses administrasi."
        hideSidebar={true}
      >
        {children}
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={activeItem.title}
      subtitle={activeItem.desc}
      hideSidebar={true}
      isPrintPage={isPrintPage}
    >
      <style>{`
        .surat-subpage-content > div.max-w-\[1200px\],
        .surat-subpage-content > div.max-w-7xl,
        .surat-subpage-content > div.max-w-4xl {
          max-width: none !important;
        }
        .surat-subpage-content > div[style*="padding: 24px"] {
          padding: 0 !important;
        }
        .surat-subpage-content > div.min-h-screen.bg-\[\#F8FAFC\] {
          min-height: auto !important;
          background: transparent !important;
        }
        .surat-subpage-content > div.min-h-screen.bg-\[\#F8FAFC\] > div.bg-white.border-b {
          display: none !important;
        }
        .surat-subpage-content > div.min-h-screen.bg-\[\#F8FAFC\] > div.px-8.mx-auto.max-w-7xl {
          max-width: none !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-5 items-start font-sans">
        {/* ── SIDEBAR DROPDOWN ADMINISTRASI SURAT ── */}
        {!isPrintPage && (
          <aside className="w-full lg:w-[240px] flex-shrink-0 bg-white/90 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 lg:sticky lg:top-2 lg:min-h-[calc(100vh-130px)] print:hidden">
            {/* Header Tombol Dropdown Administrasi Surat */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent"
            >
              <span className="flex items-center gap-2.5 text-[13.5px] font-extrabold tracking-wide text-[#0b2146] dark:text-white">
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </span>
                <span className="truncate">Administrasi Surat</span>
              </span>
              {isDropdownOpen ? (
                <ChevronUp size={16} className="text-slate-500 flex-shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
              )}
            </button>

            {/* Daftar Sub-Menu Jenis Surat */}
            {isDropdownOpen && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1">
                {suratNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.path
                    : pathname === item.path || pathname.startsWith(item.matchPrefix);

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[12.5px] transition-all ${
                        isActive
                          ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/80 dark:border-blue-900/60 shadow-2xs"
                          : "text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? "bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300"
                            : "bg-slate-100/80 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
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
        )}

        {/* ── KONTEN UTAMA JENIS SURAT ── */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5 pb-8">
          {/* Hero Banner Seragam untuk Seluruh Fitur Jenis Surat */}
          {!isPrintPage && (
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2146] via-[#163868] to-[#1d4ed8] rounded-3xl text-white shadow-xl min-h-[170px] print:hidden">
              <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 -top-12 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-7 py-7 sm:px-9">
                <div className="flex items-start sm:items-center gap-5 max-w-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <ActiveIcon size={34} className="text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-cyan-200 mb-1">
                      Layanan Administrasi Surat Kedinasan
                    </p>
                    <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-white mb-2 leading-tight">
                      {activeItem.title}
                    </h1>
                    <p className="text-xs sm:text-[13px] text-slate-100/90 leading-relaxed font-normal">
                      {activeItem.desc}
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
          )}

          <div className="surat-subpage-content">{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}
