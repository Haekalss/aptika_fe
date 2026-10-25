"use client";

import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Clock,
  Laptop,
  Box,
  ArrowRight,
  FileText,
  CalendarCheck,
  CalendarRange,
  Lock,
  FileCheck,
  ClipboardCheck,
  ServerCog,
  Database,
  ScrollText,
  MonitorSmartphone,
  Cctv,
  DatabaseBackup,
  Users,
  Video,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";

export default function SmkiPage() {
  const router = useRouter();
  const { user, bidang, isAdminAptika } = useAuthStore();

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                SMKI Diskominfo Jawa Barat
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, hardening aset, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Bidang: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Clock size={16} className="text-emerald-200" />
                <span>Status Layanan: <strong className="text-emerald-100">Aktif &amp; Beroperasi</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => router.push("/smki/log-perubahan")}
            className="group text-left relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4"><FileText size={24}/></div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600">Formulir Log Perubahan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">Catat pelaksanaan perubahan TI, kondisi sebelum dan sesudah, hasil pengujian, serta tindak lanjut pada formulir FR-032.</p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">Buka Layanan <ArrowRight size={14}/></div>
          </button>
          {/* Card: Manajemen Software Standar */}
          <div
            onClick={() => router.push("/smki/software-standar")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Laptop size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Manajemen Software Standar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola inventaris perangkat lunak resmi, audit lisensi, serta otomatis ekspor formulir input ke dalam template dokumen resmi FR-017.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
         {/* Card: Formulir Hardening Pengecekan Aset (FR-047) */}
          <div
            onClick={() => router.push("/smki/formulir-hardening")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Formulir Hardening Aset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Pemeriksaan kepatuhan hardening keamanan perangkat (Laptop/PC/Server) berstandar ISO 27001, verifikasi auditor, dan ekspor resmi dokumen FR-047.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Daftar Rekaman (FR-003) */}
          <div
            onClick={() => router.push("/smki/daftar-rekaman")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Formulir Daftar Rekaman
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola pencatatan dan inventarisasi formulir daftar rekaman dokumen SMKI, klasifikasi tingkat keamanan, masa retensi, dan penetapan pemilik arsip.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-purple-600 dark:text-purple-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
          {/* Card: Checklist Monitoring CCTV (FR-037) */}
          <div
            onClick={() => router.push("/smki/pemeriksaan-cctv")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-105 transition-transform">
                <Video size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Checklist Monitoring CCTV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Catat hasil monitoring dan pemeliharaan CCTV (fungsi, rekaman, obstacle, tindak lanjut) beserta ekspor dokumen FR-037.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Evaluasi Kepatuhan (FR-044) */}
          <div
            onClick={() => router.push("/smki/evaluasi-kepatuhan")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-105 transition-transform">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Formulir Evaluasi Kepatuhan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Catat dan evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama, lengkap dengan status dan ekspor dokumen FR-044.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-sky-600 dark:text-sky-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir Review Log (FR-040) */}
          <div
            onClick={() => router.push("/smki/review-log")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-105 transition-transform">
                <ScrollText size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Formulir Review Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Catat hasil review log akses dan aktivitas sistem (FR-040): obyek, periode, rincian user/IP/waktu/durasi, tindak lanjut, serta cetak formulir resmi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-orange-600 dark:text-orange-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir BYOD / Perangkat Pribadi (FR-045) */}
          <div
            onClick={() => router.push("/smki/perangkat-pribadi")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                <MonitorSmartphone size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Formulir BYOD (Perangkat Pribadi)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola surat pernyataan penggunaan perangkat pribadi di unit kerja (FR-045): daftar laptop/PC/tab, merek, nomor seri, serta cetak formulir resmi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir Review CCTV (FR-038) */}
          <div
            onClick={() => router.push("/smki/reviu-cctv")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-105 transition-transform">
                <Cctv size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Formulir Review CCTV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Catat review monitoring dan pemeliharaan CCTV (FR-038): obyek, periode, uraian review, tindak lanjut, target selesai, serta cetak formulir resmi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Evaluasi dan Pengujian DRP (FR-039) */}
          <div
            onClick={() => router.push("/smki/evaluasi-drp")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-violet-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-105 transition-transform">
                <DatabaseBackup size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Evaluasi dan Pengujian DRP
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Laporkan evaluasi pengujian Disaster Recovery Plan (FR-039): persyaratan waktu (RTO), proses, team, check list BCP, serta cetak formulir resmi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-violet-600 dark:text-violet-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Daftar Penyedia Barang/Jasa (FR-020) */}
          <div
            onClick={() => router.push("/smki/daftar-penyedia")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Building2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Formulir Daftar Penyedia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Inventarisasi dan verifikasi rekanan penyedia barang/jasa, ruang lingkup pekerjaan, serta status berita acara sesuai standar FR-020.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Daftar Aset TI */}
          <div
            onClick={() => router.push("/daftar-aset-ti")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Box size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Daftar Aset TI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Sistem inventarisasi &amp; manajemen aset perangkat keras, monitoring masa pakai, pemantauan dukungan serta ekspor laporan Excel Bidang APTIKA.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-blue-600 dark:text-blue-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Aset Sistem Informasi (FR-036) */}
          <div
            onClick={() => router.push("/smki/aset-sistem-informasi")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Aset Sistem Informasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Inventarisasi aset sistem informasi (FR-036): kode aset, virtualisasi, IP address, spesifikasi, pemilik, serta klasifikasi keamanan informasi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Berita Acara Penghancuran Media */}
          <div
            onClick={() => router.push("/smki/berita-acara")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Berita Acara Penghancuran Media
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola data berita acara penghancuran media sesuai formulir FR014-SMKI, rincian perangkat, serta ekspor dokumen resmi Word (.docx).
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir Rencana Audit (F05-SMKI) */}
          <div
            onClick={() => router.push("/smki/rencana-audit")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-105 transition-transform">
                <CalendarCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Formulir Rencana Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Jadwalkan dan kelola rencana audit internal SMKI (F05-SMKI), kontrol ISO 27001, auditee, auditor, serta ekspor dokumen resmi PDF.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-teal-600 dark:text-teal-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir Hak Akses TI (FR-018) */}
          <div
            onClick={() => router.push("/smki/hak-akses-ti")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                <Lock size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Formulir Hak Akses TI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola permohonan dan verifikasi hak akses sistem informasi (FR-018), penetapan level akses, jenis akses, serta kontrol akses pengguna.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Laporan Audit Internal SMKI (FR-006) */}
          <div
            onClick={() => router.push("/smki/laporan-audit")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <FileCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Laporan Audit Internal SMKI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Catat temuan audit internal SMKI (FR-006), kategori temuan (major/minor/OFI), rekomendasi perbaikan, serta ekspor dokumen resmi Word.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Program Tahunan Audit Internal (FR-008) */}
          <div
            onClick={() => router.push("/smki/laporan-audit-tahunan")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-105 transition-transform">
                <CalendarRange size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Program Tahunan Audit Internal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola formulir program tahunan audit internal (FR-008), penugasan tim auditor, objek auditee, matriks klausul ISO 27001, jadwal 12 bulan, serta ekspor resmi Word (.docx).
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-teal-600 dark:text-teal-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Formulir Laporan Kerusakan (FR-024) */}
          <div
            onClick={() => router.push("/smki/laporan-kerusakan")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-red-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 group-hover:scale-105 transition-transform">
                <ServerCog size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Formulir Laporan Kerusakan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola formulir laporan kerusakan perangkat fasilitas data center (FR-024).
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-red-600 dark:text-red-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Card: Berita Acara Screening Karyawan Outsourcing */}
          <div
            onClick={() => router.push("/smki/screening-karyawan")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Screening Karyawan Outsourcing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                Kelola berita acara verifikasi administrasi tenaga alih daya, 5 item checklist kepatuhan, serta cetak dokumen resmi format FR-012/KOM.03.05/SANDIKAMI.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Buka Layanan</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
