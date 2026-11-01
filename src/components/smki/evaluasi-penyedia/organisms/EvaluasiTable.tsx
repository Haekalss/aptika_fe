"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Fr021Evaluasi } from "@/services/smki/evaluasiPenyedia.types";
import { fr021SifatLabel, fr021StatusLabel } from "../constants";

export default function EvaluasiTable({
  records,
  currentUserId,
  isAtasan,
  onAction,
  onDelete,
}: {
  records: Fr021Evaluasi[];
  currentUserId?: number;
  isAtasan: boolean;
  onAction: (record: Fr021Evaluasi, action: "lanjutkan" | "tinjau" | "lihat") => void;
  onDelete?: (record: Fr021Evaluasi) => void;
}) {
  if (records.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        Tidak ada evaluasi yang sesuai dengan pencarian atau filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Penyedia Jasa</th>
            <th className="px-4 py-3">No. Kontrak</th>
            <th className="px-4 py-3">Sifat Pekerjaan</th>
            <th className="px-4 py-3 text-right">Nilai</th>
            <th className="px-4 py-3">Rekomendasi</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((record) => {
            const isOwner = currentUserId !== undefined && record.evaluator_id === currentUserId;
            const canDelete = isOwner && record.status === "draft";

            let primaryAction: { kind: "lanjutkan" | "tinjau" | "lihat"; label: string } | null = null;
            if (record.status === "draft") primaryAction = { kind: "lanjutkan", label: "Lanjutkan" };
            else if (record.status === "diajukan") {
              if (isAtasan && record.admin_id === currentUserId) {
                primaryAction = { kind: "tinjau", label: "Tinjau" };
              } else {
                primaryAction = { kind: "lihat", label: "Lihat" };
              }
            } else if (record.status === "revisi") {
              primaryAction = { kind: "lanjutkan", label: "Lanjutkan" };
            } else if (record.status === "selesai") {
              primaryAction = { kind: "lihat", label: "Lihat Hasil" };
            }

            return (
              <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {record.penyedia?.nama_penyedia ?? "—"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {record.penyedia?.email ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-100">
                  {record.no_kontrak}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-100">
                  {record.sifat_pekerjaan === "lainnya"
                    ? record.sifat_pekerjaan_lainnya || "Lainnya"
                    : fr021SifatLabel(record.sifat_pekerjaan)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {record.total_nilai === null ? "—" : record.total_nilai}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-100">
                  {record.rekomendasi?.kategori ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={fr021StatusLabel(record.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {primaryAction && (
                      <button
                        type="button"
                        onClick={() => onAction(record, primaryAction!.kind)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {primaryAction.kind === "lihat" ? (
                          <Eye size={13} />
                        ) : primaryAction.kind === "tinjau" ? (
                          <Eye size={13} />
                        ) : (
                          <Pencil size={13} />
                        )}
                        {primaryAction.label}
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus draft"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
