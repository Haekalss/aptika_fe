"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, ArrowRight, Search } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  SMKI_GROUPS,
  SMKI_MODULES,
  modulesByGroup,
} from "@/components/smki/modules";

export default function SmkiPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const searching = q.length > 0;

  const filteredModules = useMemo(() => {
    if (!searching) return SMKI_MODULES;
    return SMKI_MODULES.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        (m.fr ?? "").toLowerCase().includes(q)
    );
  }, [q, searching]);

  const renderCard = (m: (typeof SMKI_MODULES)[number]) => {
    const Icon = m.icon;
    return (
      <div
        key={m.path}
        onClick={() => router.push(m.path)}
        title={m.title}
        className="relative overflow-hidden bg-white dark:bg-[#0b1e3d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-500/15 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 group flex flex-col min-h-[195px]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500" />
        <div className="absolute -right-5 -bottom-5 opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none text-violet-600 dark:text-violet-400">
          <Icon size={118} strokeWidth={1.5} />
        </div>
        <div className="relative flex flex-col flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-lg shadow-violet-500/25 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Icon size={22} className="text-white" />
            </div>
            {m.fr && (
              <span className="text-[9px] font-extrabold tracking-wider text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/60 rounded-md px-1.5 py-1">
                {m.fr}
              </span>
            )}
          </div>
          <h3 className="mt-4 text-[15px] font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
            {m.label}
          </h3>
          <p className="text-xs sm:text-[12.5px] text-slate-500 dark:text-slate-300 leading-relaxed mt-1 line-clamp-2">
            {m.desc}
          </p>
          <div className="flex items-center justify-end mt-auto pt-4">
            <div className="h-9 min-w-[36px] px-2.5 group-hover:px-4 rounded-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 transition-all duration-300">
              <span className="text-xs font-bold max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 whitespace-nowrap">
                Buka
              </span>
              <ArrowRight size={15} className="flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-8 pb-16">
        {/* Hero Banner: Ungu Violet Khas SMKI dengan ornamen Cyber Security Radar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 rounded-3xl p-7 sm:p-10 text-white shadow-xl shadow-purple-950/20 border border-purple-800/40">
          {/* Cyber mesh / Circuit dot matrix */}
          <div
            className="absolute inset-0 opacity-[0.16] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#c084fc 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Glowing cyber shield aura */}
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-violet-500/25 blur-3xl pointer-events-none animate-pulse duration-1000" />
          <div className="absolute right-0 -bottom-16 w-80 h-80 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

          {/* Concentric Cyber Radar Rings & Target Reticle */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-purple-400/20 pointer-events-none hidden md:block">
            <div className="absolute inset-6 rounded-full border border-dashed border-violet-400/25 animate-spin-slow" />
            <div className="absolute inset-16 rounded-full border border-purple-300/20" />
            <div className="absolute inset-28 rounded-full border border-violet-400/30" />
            {/* Target crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-purple-400/15" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-purple-400/15" />
          </div>

          {/* Cyber sparkle nodes */}
          <div className="absolute top-6 right-1/4 w-1.5 h-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_#c084fc] pointer-events-none" />
          <div className="absolute bottom-8 right-1/3 w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_#f472b6] pointer-events-none animate-ping duration-1000" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3.5 backdrop-blur-sm">
                <ShieldCheck size={14} className="text-purple-300" />
                <span>STANDAR KEAMANAN INFORMASI & TATA KELOLA SIBER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                Sistem Manajemen Keamanan Informasi (SMKI)
              </h1>
              <p className="text-sm sm:text-[15px] text-purple-200/90 leading-relaxed max-w-xl font-normal">
                Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Daerah Provinsi Jawa Barat.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0 self-start md:self-auto">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
                <Building2 size={16} className="text-purple-300" />
                <span>Bidang: <strong className="text-white">APTIKA</strong></span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
                <ShieldCheck size={16} className="text-emerald-300" />
                <span>Status Layanan: <strong className="text-emerald-300 font-bold">Aktif &amp; Beroperasi</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header & Pencarian */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-violet-600 to-purple-600" />
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Daftar Layanan &amp; Formulir SMKI
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Akses cepat ke {SMKI_MODULES.length} formulir dan modul tata kelola keamanan informasi
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
                  âœ•
                </button>
              )}
            </div>
          </div>

          {/* Konten SMKI: per grup (default) atau hasil pencarian (flat) */}
          {searching ? (
            filteredModules.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">Tidak ada formulir SMKI yang cocok dengan pencarian &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {filteredModules.length} hasil untuk &quot;{searchQuery}&quot;
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                  {filteredModules.map(renderCard)}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-8">
              {SMKI_GROUPS.map((group) => {
                const items = modulesByGroup(group.id);
                const GroupIcon = group.icon;
                return (
                  <section key={group.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/60 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                        <GroupIcon size={17} />
                      </div>
                      <h3 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white">
                        {group.label}
                      </h3>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/60 rounded-full px-2.5 py-0.5">
                        {items.length} modul
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-violet-200 via-violet-100 to-transparent dark:from-violet-800 dark:via-violet-900" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                      {items.map(renderCard)}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
