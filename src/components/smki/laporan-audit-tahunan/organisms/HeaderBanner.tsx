import React from 'react';
import { ShieldCheck, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderBannerProps {
  title: string;
  subtitle: string;
}

export const HeaderBanner = ({ title, subtitle }: HeaderBannerProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#065f46] via-[#047857] to-[#059669] text-white p-6 shadow-md border border-emerald-600/30">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
      <div className="space-y-2 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        </div>
        <p className="text-emerald-100 text-sm leading-relaxed">{subtitle}</p>
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200 hover:text-white transition-colors cursor-pointer">
            <AlertCircle className="w-3.5 h-3.5" /> Info/Bantuan
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[200px]">
          <Layers className="w-5 h-5 text-emerald-200 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">BIDANG</div>
            <div className="text-xs font-bold text-white">Bidang Aplikasi Informatika</div>
          </div>
        </div>

        <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[190px]">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">STATUS LAYANAN</div>
            <div className="text-xs font-bold text-emerald-200">Aktif & Beroperasi</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
