"use client";

import { ChevronLeft, ChevronRight, Eye, PencilLine, ClipboardCheck, Trash2 } from "lucide-react";
import Fr048StatusBadge from "../atoms/Fr048StatusBadge";
import Fr048EmptyState from "../atoms/Fr048EmptyState";
import Fr048SkeletonTable from "../atoms/Fr048SkeletonTable";
import type { PemantauanListItemDto } from "@/services/smki/pemantauanKonfigurasiService.types";
import { formatTanggal, periodeLabel } from "../constants";

export default function Fr048PemantauanTable({
  rows,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onOpen,
  onDelete,
  isAdmin,

}: {
  rows: PemantauanListItemDto[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  onOpen: (id: number) => void;
  onDelete?: (id: number) => void;
  isAdmin: boolean;
}) {
  const actionFor = (row: PemantauanListItemDto) => {
    if (row.status === "draft") return { label: "Lanjutkan", icon: PencilLine };
    if (row.status === "revisi") return { label: "Perbaiki", icon: PencilLine };
    if (row.status === "diajukan") return { label: isAdmin ? "Tinjau" : "Lihat Hasil", icon: ClipboardCheck };
    return { label: "Lihat Hasil", icon: Eye };
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3 font-bold">Objek</th>
              <th className="px-4 py-3 font-bold">No. Formulir</th>
              <th className="px-4 py-3 font-bold">Periode</th>
              <th className="px-4 py-3 font-bold">Tanggal</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Pelaksana → Admin</th>
              <th className="px-4 py-3 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <Fr048SkeletonTable rows={5} cols={7} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <Fr048EmptyState
                    title="Belum ada pemantauan"
                    description="Tidak ada data yang cocok dengan pencarian/filter. Klik “Tambah Pemantauan” untuk membuat yang baru."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const action = actionFor(row);
                const ActionIcon = action.icon;
                return (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-violet-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100 max-w-[220px] truncate" title={row.objekRingkas}>{row.objekRingkas}</span>
                      <span className="block text-[10px] text-slate-500">{row.jenisKonfigurasiNama}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-[180px] truncate" title={row.noFormulir}>{row.noFormulir || <span className="italic text-slate-400">(belum diisi)</span>}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300">{periodeLabel(row.periode)}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatTanggal(row.tanggalPemantauan)}</td>
                    <td className="px-4 py-3"><Fr048StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 text-[10px] text-slate-500 max-w-[180px] truncate">{row.pelaksanaNama}{row.adminNama ? ` → ${row.adminNama}` : ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpen(row.id)}
                          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-[10px] font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-colors"
                        >
                          <ActionIcon size={13} /> {action.label}
                        </button>
                        {onDelete && row.status === "draft" && !isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            aria-label="Hapus draft"
                            title="Hapus draft"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Paginasi */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
        <span>Menampilkan halaman <b>{page}</b> dari {totalPages} · {total} data</span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Halaman sebelumnya" className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ChevronLeft size={14} />
          </button>
          <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Halaman berikutnya" className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
