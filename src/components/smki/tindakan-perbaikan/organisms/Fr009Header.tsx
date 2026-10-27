import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export default function Fr009Header({ title, children }: { title: string; children?: ReactNode }) {
  return <header className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600 p-6 text-white shadow-sm">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs uppercase tracking-wider text-white mb-2">SMKI · FR-009</p><h1 className="flex gap-3 items-center text-xl sm:text-2xl font-bold text-white"><ShieldCheck className="shrink-0" />{title}</h1><p className="text-xs text-white mt-2">Koreksi, tindakan korektif, dan verifikasi tindak lanjut keamanan informasi.</p></div>
      {children}
    </div>
  </header>;
}
