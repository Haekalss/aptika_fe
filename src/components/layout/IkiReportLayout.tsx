"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Layers,
  Network,
  Cpu,
  LayoutTemplate,
  Smartphone,
  Database,
  ChevronUp,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

const ikiNavItems = [
  {
    label: "Integrasi Interoperabilitas",
    key: "integrasiinteroperabilitas",
    path: "/integrasiinteroperabilitas/dashboard",
    icon: Network,
  },
  {
    label: "Pengelolaan Aplikasi",
    key: "pengelolaanaplikasi",
    path: "/pengelolaanaplikasi/dashboard",
    icon: Layers,
  },
  {
    label: "Rekayasa Aplikasi",
    key: "rekayasaaplikasi",
    path: "/rekayasaaplikasi/dashboard",
    icon: Cpu,
  },
  {
    label: "Sidebar Jabar",
    key: "sidebarjabar",
    path: "/sidebarjabar/dashboard",
    icon: LayoutTemplate,
  },
  {
    label: "Smart Jabar",
    key: "smartjabar",
    path: "/smartjabar/dashboard",
    icon: Smartphone,
  },
  {
    label: "Sada Jabar",
    key: "sadajabar",
    path: "/sadajabar/dashboard",
    icon: Database,
  },
];

interface IkiReportLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function IkiReportLayout({
  title,
  subtitle,
  children,
}: IkiReportLayoutProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const activeSegment = pathname.split("/")[1] || "integrasiinteroperabilitas";
  const activeItem =
    ikiNavItems.find((item) => item.key === activeSegment) || ikiNavItems[0];
  const BannerIcon = activeItem.icon || TrendingUp;

  return (
    <MainLayout title={title} subtitle={subtitle} hideSidebar={true}>
      <style>{`
        .iki-report-content > div {
          padding: 0 !important;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-5 items-start font-sans">
        {/* ── BAR 1: SIDEBAR DROPDOWN IKI REPORT ── */}
        <aside className="w-full lg:w-[240px] flex-shrink-0 bg-white/90 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 lg:sticky lg:top-2 lg:min-h-[calc(100vh-130px)] print:hidden">
          {/* Header Tombol Dropdown IKI Report */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <span className="flex items-center gap-2.5 text-[13.5px] font-extrabold tracking-wide text-[#0b2146] dark:text-white">
              <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center flex-shrink-0">
                <Layers size={16} />
              </span>
              <span>IKI Report</span>
            </span>
            {isDropdownOpen ? (
              <ChevronUp size={16} className="text-slate-500" />
            ) : (
              <ChevronDown size={16} className="text-slate-500" />
            )}
          </button>

          {/* Daftar Sub-Menu Dropdown IKI Report */}
          {isDropdownOpen && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1">
              {ikiNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSegment === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[12.5px] transition-all ${
                      isActive
                        ? "bg-rose-50/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200/80 dark:border-rose-900/60 shadow-2xs"
                        : "text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-rose-100/90 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300"
                          : "bg-slate-100/80 dark:bg-slate-800 text-rose-600 dark:text-rose-400"
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

        {/* ── KONTEN UTAMA IKI REPORT (Banner + Isi Asli) ── */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5 pb-8">
          {/* ── HERO BANNER IKI REPORT (Analytics Metrics Grid & Crimson Trend Aura) ── */}
          <div
            className="relative overflow-hidden rounded-3xl shadow-xl print:hidden"
            style={{
              background:
                "linear-gradient(135deg, #700c2a 0%, #9f1239 38%, #e11d48 74%, #f43f5e 100%)",
            }}
          >
            {/* Top Shimmer Beam Rose */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-200/80 to-transparent pointer-events-none z-20" />

            {/* Analytics Coordinate Pulse Texture */}
            <div
              className="absolute inset-0 opacity-[0.16] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(254,205,211,0.4) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Ambient Crimson Glow Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pink-400/20 -translate-y-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-300/15 translate-y-1/2 blur-2xl pointer-events-none" />

            {/* Metric Trend Circles */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-rose-300/15 pointer-events-none" />
            <div className="absolute right-36 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-pink-200/20 pointer-events-none" />

            {/* Sparkle KPI Metric Nodes */}
            <div className="absolute right-64 top-6 pointer-events-none opacity-80 animate-pulse">
              <svg className="w-3.5 h-3.5 text-rose-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-7 py-7 sm:px-9">
              {/* Left: Icon + Text */}
              <div className="flex items-start sm:items-center gap-5 max-w-2xl">
                {/* Crimson Trend Glowing Halo */}
                <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
                  <div className="absolute -inset-2 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl blur-md opacity-60" />
                  <div className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 shadow-xl shadow-rose-950/40">
                    <BannerIcon size={34} className="text-white drop-shadow-sm" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-rose-200 tracking-wide mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
                    <span>REKAPITULASI CAPAIAN KINERJA APARATUR</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-[13px] text-rose-100/95 mt-2 leading-relaxed font-normal">
                    {subtitle} — Rekapitulasi capaian Indikator Kinerja Individu (IKI) secara terukur, terintegrasi, dan real-time di lingkungan Diskominfo Jawa Barat.
                  </p>
                </div>
              </div>

              {/* Right: Ilustrasi Vektor IKI Report (Analytics Chart, KPI Target & Interconnected Data Nodes) */}
              <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-2 select-none pointer-events-none">
                <svg
                  width="360"
                  height="122"
                  viewBox="0 0 360 122"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="ikiBoardGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4c0519" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#881337" stopOpacity="0.88" />
                    </linearGradient>
                    <linearGradient id="ikiBadgeGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Left Interconnected KPI / Network Hub */}
                  <circle
                    cx="72"
                    cy="61"
                    r="45"
                    stroke="white"
                    strokeOpacity="0.15"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="72"
                    cy="61"
                    r="33"
                    stroke="#fda4af"
                    strokeOpacity="0.32"
                    strokeWidth="1.5"
                  />
                  <circle cx="72" cy="61" r="23" fill="white" fillOpacity="0.14" />

                  {/* Central KPI Target Circle & Rising Trend Arrow */}
                  <g transform="translate(72, 61)">
                    <circle
                      cx="0"
                      cy="0"
                      r="18"
                      fill="url(#ikiBadgeGlow)"
                      stroke="white"
                      strokeOpacity="0.6"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M-8,5 L-2,-1 L2,3 L9,-5"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5,-5 H9 V-1"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Orbiting Data Nodes */}
                  <circle cx="34" cy="34" r="4.5" fill="#fde047" />
                  <circle cx="108" cy="30" r="4" fill="#38bdf8" />
                  <circle cx="38" cy="92" r="4" fill="#4ade80" />
                  <line
                    x1="116"
                    y1="61"
                    x2="138"
                    y2="61"
                    stroke="white"
                    strokeOpacity="0.35"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Right Analytics Dashboard Card */}
                  <g transform="translate(138, 10)">
                    <rect
                      x="0"
                      y="0"
                      width="206"
                      height="102"
                      rx="13"
                      fill="url(#ikiBoardGrad)"
                      stroke="white"
                      strokeOpacity="0.28"
                      strokeWidth="1.3"
                    />
                    {/* Top Window Bar */}
                    <rect
                      x="0"
                      y="0"
                      width="206"
                      height="22"
                      rx="13"
                      fill="white"
                      fillOpacity="0.08"
                    />
                    <circle cx="13" cy="11" r="3" fill="#fb7185" />
                    <circle cx="23" cy="11" r="3" fill="#fbbf24" />
                    <circle cx="33" cy="11" r="3" fill="#4ade80" />
                    <text
                      x="45"
                      y="14"
                      fill="white"
                      fillOpacity="0.85"
                      fontSize="7.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      IKI REPORT • ANALYTICS
                    </text>

                    {/* Left Mini Bar Chart inside Board */}
                    <rect
                      x="12"
                      y="30"
                      width="112"
                      height="60"
                      rx="8"
                      fill="white"
                      fillOpacity="0.07"
                      stroke="white"
                      strokeOpacity="0.14"
                      strokeWidth="0.9"
                    />
                    <text
                      x="20"
                      y="42"
                      fill="#fda4af"
                      fontSize="7"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      TARGET VS CAPAIAN
                    </text>
                    {/* Bars */}
                    <rect x="22" y="64" width="10" height="18" rx="2.5" fill="#fb7185" />
                    <rect x="35" y="56" width="10" height="26" rx="2.5" fill="#38bdf8" />
                    <rect x="52" y="58" width="10" height="24" rx="2.5" fill="#fb7185" />
                    <rect x="65" y="49" width="10" height="33" rx="2.5" fill="#38bdf8" />
                    <rect x="82" y="52" width="10" height="30" rx="2.5" fill="#fb7185" />
                    <rect x="95" y="44" width="10" height="38" rx="2.5" fill="#4ade80" />

                    {/* Right KPI Summary Cards */}
                    <rect
                      x="132"
                      y="30"
                      width="62"
                      height="27"
                      rx="7"
                      fill="white"
                      fillOpacity="0.1"
                      stroke="white"
                      strokeOpacity="0.18"
                      strokeWidth="0.8"
                    />
                    <text
                      x="140"
                      y="41"
                      fill="white"
                      fillOpacity="0.65"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      CAPAIAN IKI
                    </text>
                    <text
                      x="140"
                      y="52"
                      fill="#4ade80"
                      fontSize="10"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      98.4%
                    </text>

                    <rect
                      x="132"
                      y="63"
                      width="62"
                      height="27"
                      rx="7"
                      fill="white"
                      fillOpacity="0.1"
                      stroke="white"
                      strokeOpacity="0.18"
                      strokeWidth="0.8"
                    />
                    <text
                      x="140"
                      y="74"
                      fill="white"
                      fillOpacity="0.65"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      STATUS DATA
                    </text>
                    <circle cx="144" cy="83" r="3" fill="#fde047" />
                    <text
                      x="150"
                      y="85.5"
                      fill="white"
                      fontSize="7.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      TERPADU
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* ── ISI KONTEN ASLI (Tidak diubah) ── */}
          <div className="iki-report-content">{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}
