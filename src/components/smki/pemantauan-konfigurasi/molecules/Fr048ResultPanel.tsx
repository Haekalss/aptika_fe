"use client";

import { ShieldCheck, ShieldAlert, MinusCircle } from "lucide-react";
import type { HasilPemantauan } from "@/services/smki/pemantauanKonfigurasiService.types";
import { hasilLabel } from "../constants";

export default function Fr048ResultPanel({ hasil, jumlahSesuai, jumlahTidakSesuai }: { hasil: HasilPemantauan; jumlahSesuai: number; jumlahTidakSesuai: number }) {
  const cfg =
    hasil === "sesuai_seluruhnya"
      ? { icon: ShieldCheck, label: "Sesuai Seluruhnya", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" }
      : hasil === "ada_ketidaksesuaian"
      ? { icon: ShieldAlert, label: "Ada Ketidaksesuaian", cls: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" }
      : { icon: MinusCircle, label: hasilLabel(null), cls: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" };
  const Icon = cfg.icon;
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${cfg.cls}`}>
      <Icon size={30} className="flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Hasil Pemantauan</p>
        <p className="text-base font-extrabold leading-tight">{cfg.label}</p>
        <p className="text-[10px] opacity-80 mt-0.5">{jumlahSesuai} Sesuai · {jumlahTidakSesuai} Tidak Sesuai</p>
      </div>
    </div>
  );
}
