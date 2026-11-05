"use client";

import Button from "@/components/ui/Button";
import { filledPenilaianCount, isPenilaianComplete, penilaianSubtotal } from "../form";
import KriteriaRow from "../molecules/KriteriaRow";
import type { Fr021SectionProps } from "../types";

export default function PenilaianSection({
  form,
  master,
  errors,
  onChange,
  disabled,
  onHitung,
  hitungBusy,
}: Fr021SectionProps & {
  onHitung: () => void;
  hitungBusy?: boolean;
}) {
  const kriteriaSorted = [...master.kriteria].sort((a, b) => a.urutan - b.urutan);
  const skalaSorted = [...master.skala].sort((a, b) => b.skor - a.skor);
  const complete = isPenilaianComplete(form, kriteriaSorted);
  const filled = filledPenilaianCount(form);
  const subtotal = penilaianSubtotal(form, master.skala);

  function handleSelect(kriteriaId: number, skalaId: number) {
    const next = form.penilaian.map((item) =>
      item.kriteria_id === kriteriaId ? { ...item, skala_id: skalaId } : item
    );
    onChange({ penilaian: next });
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan identitas (hanya baca) */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-slate-600 dark:text-slate-300 grid gap-2 sm:grid-cols-2">
        <p>
          <span className="font-semibold">Penyedia:</span>{" "}
          {form.penyedia_nama || "—"}
        </p>
        <p>
          <span className="font-semibold">No. Kontrak:</span>{" "}
          {form.no_kontrak || "—"}
        </p>
        <p>
          <span className="font-semibold">Sifat Pekerjaan:</span>{" "}
          {form.sifat_pekerjaan === "lainnya"
            ? form.sifat_pekerjaan_lainnya || "Lainnya"
            : form.sifat_pekerjaan}
        </p>
        <p>
          <span className="font-semibold">Tanggal Evaluasi:</span>{" "}
          {form.tanggal_evaluasi || "—"}
        </p>
      </div>

      {errors.penilaian && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800"
        >
          {errors.penilaian[0]}
        </div>
      )}

      {!complete && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          Semua 4 kriteria wajib dinilai sebelum perhitungan.{" "}
          <span className="font-semibold">
            {filled}/4 kriteria terisi.
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Kriteria Penilaian</th>
              {skalaSorted.map((s) => (
                <th key={s.id} className="px-4 py-3 text-center">
                  {s.label}
                  <span className="block text-[10px] font-normal text-slate-400">
                    ({s.skor} poin)
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {kriteriaSorted.map((kriteria) => {
              const draft = form.penilaian.find(
                (p) => p.kriteria_id === kriteria.id
              );
              const empty = !draft || draft.skala_id === null;
              return (
                <KriteriaRow
                  key={kriteria.id}
                  kriteria={kriteria}
                  skala={skalaSorted}
                  value={draft?.skala_id ?? null}
                  empty={empty && !complete}
                  disabled={disabled}
                  onChange={(skalaId) => handleSelect(kriteria.id, skalaId)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Progres:{" "}
          <span className="font-semibold">
            {filled}/{kriteriaSorted.length} kriteria terisi
          </span>
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Total sementara: {subtotal}
        </p>
      </div>

      {!disabled && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onHitung}
            disabled={!complete || hitungBusy}
          >
            {hitungBusy ? "Menghitung..." : "Hitung Nilai"}
          </Button>
        </div>
      )}
    </div>
  );
}
