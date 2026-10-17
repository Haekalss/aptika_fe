"use client";

import { AlertCircle, Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { formatTanggalIndo, ringkasJenis, type PerangkatPribadi } from "@/services/smki/perangkatPribadiService";

/** Organism: tabel daftar formulir BYOD + empty state. Pagination dirender parent (pola InsidenTable FR-016). */
export default function PerangkatTable({
  items,
  offset,
  totalLabel,
  onDetail,
  onEdit,
  onPrint,
  onDelete,
}: {
  items: PerangkatPribadi[];
  offset: number;
  totalLabel: string;
  onDetail: (id: number) => void;
  onEdit: (id: number) => void;
  onPrint: (id: number) => void;
  onDelete: (item: PerangkatPribadi) => void;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-200">
          Formulir BYOD – Penggunaan Perangkat Pribadi FR-045
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{totalLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-12 text-center">NO</th>
              <th className="py-3 px-4 min-w-[180px]">KEPALA UNIT KERJA</th>
              <th className="py-3 px-4 min-w-[180px]">JABATAN</th>
              <th className="py-3 px-4 min-w-[160px]">UNIT KERJA</th>
              <th className="py-3 px-4 min-w-[120px]">PERANGKAT</th>
              <th className="py-3 px-4 min-w-[160px]">RINCIAN</th>
              <th className="py-3 px-4 min-w-[140px]">TANGGAL</th>
              <th className="py-3 px-4 text-center w-32">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <AlertCircle size={32} className="text-amber-500 mb-1" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      Data Formulir BYOD Tidak Ditemukan
                    </span>
                    <p className="text-xs text-slate-400 text-center">
                      Tidak ada data formulir yang cocok dengan filter atau kata kunci saat ini.
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
                        {offset + idx + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama}</div>
                    <div className="text-[10.5px] font-semibold text-slate-400">{item.nip ? `NIP ${item.nip}` : "-"}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">{item.jabatan}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{item.unit_kerja}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md tracking-wider border uppercase bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      {item.total_perangkat ?? 0} perangkat
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">{ringkasJenis(item)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                    {formatTanggalIndo(item.tanggal_ttd || item.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDetail(item.id)}
                        title="Lihat Detail Formulir"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrint(item.id)}
                        title="Cetak Formulir FR-045"
                        className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 transition-all cursor-pointer"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item.id)}
                        title="Edit Formulir"
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="Hapus Formulir"
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/80 dark:border-rose-800/60 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
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
