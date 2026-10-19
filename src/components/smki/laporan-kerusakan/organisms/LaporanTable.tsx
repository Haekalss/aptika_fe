import React, { memo } from "react";
import { Edit2, Eye, Trash2, ArrowUpDown, FileDown, Lock } from "lucide-react";
import { LaporanKerusakanItem } from "@/services/api";
import { StatusBadge } from "../atoms/StatusBadge";

interface LaporanTableProps {
  reports: LaporanKerusakanItem[];
  isLoading: boolean;
  onEdit: (item: LaporanKerusakanItem) => void;
  onDetail: (item: LaporanKerusakanItem) => void;
  onDelete?: (id: number) => void;
  onExport?: (item: LaporanKerusakanItem) => void;
  isSupervisor?: boolean;
  sortOrder?: "asc" | "desc";
  onToggleSort?: () => void;
}

export const LaporanTable = memo(({
  reports,
  isLoading,
  onEdit,
  onDetail,
  onDelete,
  onExport,
  isSupervisor = false,
  sortOrder = "desc",
  onToggleSort,
}: LaporanTableProps) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memuat data laporan kerusakan...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-semibold text-slate-700">Belum ada laporan kerusakan tercatat.</p>
        <p className="text-xs text-slate-400 mt-1">Gunakan tombol &quot;Tambah Laporan&quot; untuk memasukkan laporan baru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-4 w-12 text-center">No</th>
            <th className="py-3 px-4">
              {onToggleSort ? (
                <button
                  type="button"
                  onClick={onToggleSort}
                  className="flex items-center gap-1 cursor-pointer select-none font-bold uppercase text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                  title={`Urutkan berdasarkan tanggal (${sortOrder === "asc" ? "Terlama ke Terbaru" : "Terbaru ke Terlama"})`}
                >
                  <span>Tanggal</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <span>Tanggal</span>
              )}
            </th>
            <th className="py-3 px-4">Nama Aset</th>
            <th className="py-3 px-4">Penanggung Jawab</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-center w-44">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {reports.map((report, idx) => (
            <tr key={report.id || idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                {String(idx + 1).padStart(2, "0")}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="font-semibold text-slate-900 block">
                  {report.tanggal}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {report.jam}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span className="font-bold text-slate-900 block">
                  {report.nama_aset}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                  {report.kode_aset || "-"}
                </span>
              </td>
              <td className="py-3.5 px-4 font-medium text-slate-700">
                {report.penanggung_jawab_nama || (
                  <span className="text-slate-400 italic">Belum ditugaskan</span>
                )}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <StatusBadge status={report.status} />
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {/* 1. Detail Button (Non-destruktif, paling sering digunakan) */}
                  <button
                    type="button"
                    onClick={() => onDetail(report)}
                    className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                    title="Lihat Detail Laporan"
                    aria-label="Lihat Detail Laporan"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* 2. Export Button (Sesuai instruksi: berada di sebelah kiri Edit) */}
                  {onExport && (
                    report.status === "Closed" ? (
                      <button
                        type="button"
                        onClick={() => onExport(report)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        title="Export Formulir Laporan (DOCX)"
                        aria-label="Export Formulir Laporan"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed flex items-center justify-center"
                        title="Belum dapat diekspor: Laporan harus divalidasi dan disahkan (Closed) terlebih dahulu oleh Supervisor"
                        aria-label="Export Terkunci (Menunggu Pengesahan)"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}

                  {/* 3. Edit Button / Lock State */}
                  {report.status === "Closed" && !isSupervisor ? (
                    <button
                      type="button"
                      disabled
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed flex items-center justify-center"
                      title="Laporan telah disahkan/Closed oleh Supervisor (Data Terkunci)"
                      aria-label="Data Terkunci"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onEdit(report)}
                      className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Edit Laporan"
                      aria-label="Edit Laporan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* 4. Delete Button (Khusus Admin / Supervisor, ditaruh di paling kanan) */}
                  {onDelete && report.id && (
                    <button
                      type="button"
                      onClick={() => onDelete(report.id!)}
                      className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Hapus Laporan"
                      aria-label="Hapus Laporan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

LaporanTable.displayName = "LaporanTable";
