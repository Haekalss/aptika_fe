"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useFr021Riwayat, useFr021Snapshot } from "../hooks/useFr021Queries";
import RiwayatEntry from "../molecules/RiwayatEntry";
import type { Fr021Log } from "@/services/smki/evaluasiPenyedia.types";

export default function RiwayatPanel({ id }: { id: number }) {
  const riwayatQuery = useFr021Riwayat(id, true);
  const [snapshotTarget, setSnapshotTarget] = useState<Fr021Log | null>(null);
  const snapshotQuery = useFr021Snapshot(
    id,
    snapshotTarget?.id ?? 0
  );

  const logs = riwayatQuery.data ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 dark:text-slate-100">
          Riwayat
        </h2>
        {riwayatQuery.isFetching && (
          <span className="text-[11px] text-slate-400">Memuat...</span>
        )}
      </div>

      {riwayatQuery.isLoading ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Memuat riwayat...
        </p>
      ) : riwayatQuery.isError ? (
        <p className="py-6 text-center text-sm text-rose-600">
          Gagal memuat riwayat.
        </p>
      ) : logs.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Belum ada riwayat.
        </p>
      ) : (
        <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-1.5">
          {logs.map((log) => (
            <RiwayatEntry
              key={log.id}
              log={log}
              onOpenSnapshot={setSnapshotTarget}
            />
          ))}
        </ol>
      )}

      <Modal
        isOpen={!!snapshotTarget}
        onClose={() => setSnapshotTarget(null)}
        title="Snapshot Nilai per Kriteria"
        size="md"
      >
        {snapshotQuery.isLoading ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Memuat snapshot...
          </p>
        ) : snapshotQuery.data?.penilaian?.length ? (
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-2 py-2">Kriteria</th>
                <th className="px-2 py-2 text-center">Skala</th>
                <th className="px-2 py-2 text-right">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {snapshotQuery.data.penilaian.map((p, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-100">
                    {p.kriteria?.nama_kriteria ?? `Kriteria ${p.kriteria_id}`}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-600 dark:text-slate-300">
                    {p.skala?.label ?? p.skala_id}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold text-slate-800 dark:text-slate-100">
                    {p.skor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            Snapshot tidak tersedia.
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setSnapshotTarget(null)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </section>
  );
}
