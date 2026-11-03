import { Usb } from "lucide-react";

export function Fr025Header({ title = "Daftar Removable Media" }: { title?: string }) {
  return <header className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600 p-6 shadow-sm">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">SMKI · FR-025</p>
    <h1 className="flex items-center gap-3 text-2xl font-bold text-white"><Usb />{title}</h1>
    <p className="mt-2 text-sm text-white">Inventarisasi, pemegang, dan kondisi media penyimpanan yang dapat dilepas.</p>
  </header>;
}
