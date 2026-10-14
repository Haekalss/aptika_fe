"use client";

import { AlertCircle, Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { InsidenReport } from "./types";

/** Organism: tabel daftar laporan + empty state. Pagination dirender parent. */
export default function InsidenTable({
  items,
  totalLabel,
  onDetail,
  onEdit,
  onDelete,
}: {
  items: InsidenReport[];
  totalLabel: string;
  onDetail: (id: number) => void;
  onEdit: (id: number) => void;
  /** Undefined = sembunyikan tombol hapus (non-admin). */
  onDelete?: (item: InsidenReport) => void;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-200">
          Laporan Insiden Keamanan Informasi FR-016
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{totalLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-12 text-center">NO</th>
              <th className="py-3 px-4 min-w-[140px]">TANGGAL LAPORAN</th>
              <th className="py-3 px-4 min-w-[150px]">PELAPOR</th>
              <th className="py-3 px-4 min-w-[160px]">KATEGORI INSIDEN</th>
              <th className="py-3 px-4 min-w-[180px]">NAMA SISTEM</th>
              <th className="py-3 px-4 min-w-[160px]">STATUS</th>
              <th className="py-3 px-4 text-center w-24">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle size={32} className="text-amber-500 mb-1" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      Data Laporan Tidak Ditemukan
                    </span>
                    <p className="text-xs text-slate-400 text-center">
                      Tidak ada data laporan yang cocok dengan filter atau kata kunci saat ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-center align-middle">
                    <div className="flex justify-center">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                    {item.tanggal_laporan}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                    {item.pelapor}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.kategori_insiden} uppercase />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {item.nama_sistem}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDetail(item.id)}
                        title="Lihat Detail Laporan"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item.id)}
                        title="Lengkapi/Edit Laporan"
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          title="Hapus Laporan (admin)"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/80 dark:border-rose-800/60 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
