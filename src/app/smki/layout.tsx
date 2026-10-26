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
} from "lucide-react";

const smkiNavItems = [
  { label: "Ringkasan SMKI", path: "/smki", icon: ShieldCheck, exact: true },
  { label: "Software Standar", path: "/smki/software-standar", icon: Laptop },
  { label: "Formulir Hardening", path: "/smki/formulir-hardening", icon: ShieldAlert },
  { label: "Hak Akses TI", path: "/smki/hak-akses-ti", icon: Lock },
  { label: "Daftar Rekaman", path: "/smki/daftar-rekaman", icon: FileText },
  { label: "Daftar Penyedia", path: "/smki/daftar-penyedia", icon: Building2 },
  { label: "Daftar Aset TI", path: "/daftar-aset-ti", icon: Box },
  { label: "Penghancuran Media", path: "/smki/berita-acara", icon: FileText },
  { label: "Rencana Audit", path: "/smki/rencana-audit", icon: CalendarCheck },
  { label: "Laporan Audit", path: "/smki/laporan-audit", icon: FileCheck },
  { label: "Program Audit Tahunan", path: "/smki/laporan-audit-tahunan", icon: CalendarRange },
  { label: "Log Perubahan", path: "/smki/log-perubahan", icon: FileText },
  { label: "Evaluasi Kepatuhan", path: "/smki/evaluasi-kepatuhan", icon: ClipboardCheck },
  { label: "Review Log", path: "/smki/review-log", icon: ScrollText },
  { label: "Perangkat Pribadi", path: "/smki/perangkat-pribadi", icon: MonitorSmartphone },
  { label: "Review CCTV", path: "/smki/reviu-cctv", icon: Cctv },
  { label: "Evaluasi DRP", path: "/smki/evaluasi-drp", icon: DatabaseBackup },
  { label: "Aset Sistem Informasi", path: "/smki/aset-sistem-informasi", icon: Database },
  { label: "Laporan Kerusakan", path: "/smki/laporan-kerusakan", icon: ServerCog },
  { label: "Pelaporan Insiden", path: "/smki/pelaporan-insiden", icon: ShieldAlert },
  { label: "Screening Karyawan", path: "/smki/screening-karyawan", icon: Users },
];

export default function SmkiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  return (
    <MainLayout
      title="Surat Manajemen Keamanan Informasi (SMKI)"
      subtitle="Modul pengelolaan, tata kelola kepatuhan, dan administrasi SMKI Diskominfo Jawa Barat."
      hideSidebar={true}
    >
      <div className="flex flex-col lg:flex-row gap-5 items-start font-sans">
        {/* ── SIDEBAR DROPDOWN SMKI ── */}
        <aside className="w-full lg:w-[235px] flex-shrink-0 bg-white/90 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 lg:sticky lg:top-2 lg:min-h-[calc(100vh-130px)] print:hidden">
          {/* Header Tombol Dropdown SMKI */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <span className="flex items-center gap-2.5 text-[13.5px] font-extrabold tracking-wide text-[#0b2146] dark:text-white">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
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
                  : pathname === item.path || pathname.startsWith(item.path + "/");

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[12.5px] transition-all ${
                      isActive
                        ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs"
                        : "text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-blue-100/80 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300"
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

        {/* ── KONTEN UTAMA SMKI ── */}
        <div className="flex-1 min-w-0 w-full">{children}</div>
      </div>
    </MainLayout>
  );
}
