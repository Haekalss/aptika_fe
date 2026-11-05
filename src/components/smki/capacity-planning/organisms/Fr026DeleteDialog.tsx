"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileWarning, Trash2, TriangleAlert } from "lucide-react";
import type { Fr026Asset } from "@/services/smki/capacityPlanning.types";
import { deleteFr026Asset, fr026Error } from "@/services/smki/capacityPlanningService";
import { showToast } from "@/components/ui/Toast";
import { fr026CategoryLabel, fr026MonthLabel } from "../form";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Modal } from "../molecules/Fr026Modal";

export function Fr026DeleteDialog({
  asset,
  year,
  onClose,
  onDeleted,
}: {
  asset: Fr026Asset | null;
  year: number;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: number) => deleteFr026Asset(id),
    onSuccess: async () => {
      showToast.success("Aset dan seluruh log bulanannya berhasil dihapus.");
      await client.invalidateQueries({ queryKey: ["fr026"] });
      onDeleted?.();
      onClose();
    },
    onError: (error) => showToast.error(fr026Error(error).message),
  });

  const months = asset ? Array.from(new Set(asset.logs.map((log) => log.month))).sort((a, b) => a - b) : [];
  const range = months.length
    ? `${months.length} log • ${fr026MonthLabel(months[0])}${months.length > 1 ? `–${fr026MonthLabel(months[months.length - 1])}` : ""} ${year}`
    : "Belum ada log tersimpan";

  return (
    <Fr026Modal
      open={!!asset}
      onClose={onClose}
      title="Hapus Aset?"
      subtitle="Tindakan ini tidak dapat dibatalkan."
      icon={<FileWarning size={20} />}
      size="md"
      footer={
        <>
          <Fr026Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Batal</Fr026Button>
          <Fr026Button variant="destructive" onClick={() => asset && mutation.mutate(asset.id)} disabled={mutation.isPending}>
            <Trash2 size={16} />{mutation.isPending ? "Menghapus..." : "Hapus Aset & Seluruh Log"}
          </Fr026Button>
        </>
      }
    >
      {asset && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <TriangleAlert size={18} className="mt-0.5 flex-shrink-0" />
            <p>
              Anda akan menghapus <strong>{asset.asset_name}</strong> beserta SELURUH log bulanannya, untuk semua bulan dan tahun.
            </p>
          </div>
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-700">
            <div className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Perangkat / Aset ID</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">{asset.asset_name}</dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Kategori / IP</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {fr026CategoryLabel(asset.category)} / {asset.ip_address || "—"}
              </dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Log yang akan dihapus</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">{range}</dd>
            </div>
          </dl>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Aset akan dihapus dari matriks {fr026CategoryLabel(asset.category)}. Semua nilai Current dan Projection milik aset ini ikut terhapus.
            Pilih Batal untuk mempertahankan aset dan seluruh datanya.
          </p>
        </div>
      )}
    </Fr026Modal>
  );
}
