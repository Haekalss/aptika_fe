"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Info, PencilLine } from "lucide-react";
import type { Fr026Asset, Fr026ServerLogPayload } from "@/services/smki/capacityPlanning.types";
import { fr026Error, saveFr026Log } from "@/services/smki/capacityPlanningService";
import { showToast } from "@/components/ui/Toast";
import { fr026Control, fr026MonthLabel, fr026YearOptions } from "../form";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Field } from "../molecules/Fr026Field";
import { Fr026MetricInput } from "../molecules/Fr026MetricInput";
import { Fr026Modal } from "../molecules/Fr026Modal";

type ServerValues = {
  current_storage_gb: string;
  current_memory_pct: string;
  current_cpu_pct: string;
  projection_storage_gb: string;
  projection_memory_pct: string;
  projection_cpu_pct: string;
};

function serverValues(asset: Fr026Asset | undefined, year: number, month: number): ServerValues {
  const log = asset?.logs.find((item) => item.year === year && item.month === month);
  return {
    current_storage_gb: log?.current_storage_gb?.toString() ?? "",
    current_memory_pct: log?.current_memory_pct?.toString() ?? "",
    current_cpu_pct: log?.current_cpu_pct?.toString() ?? "",
    projection_storage_gb: log?.projection_storage_gb?.toString() ?? "",
    projection_memory_pct: log?.projection_memory_pct?.toString() ?? "",
    projection_cpu_pct: log?.projection_cpu_pct?.toString() ?? "",
  };
}

export function Fr026ServerLogModal({
  open,
  assets,
  initialAssetId,
  initialYear,
  initialMonth,
  onClose,
  onSaved,
}: {
  open: boolean;
  assets: Fr026Asset[];
  initialAssetId?: number;
  initialYear: number;
  initialMonth: number;
  onClose: () => void;
  onSaved?: () => void;
}) {
  if (!open) return null;
  return (
    <Fr026ServerLogModalContent
      key={`${initialAssetId ?? "first"}-${initialYear}-${initialMonth}`}
      assets={assets}
      initialAssetId={initialAssetId}
      initialYear={initialYear}
      initialMonth={initialMonth}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function Fr026ServerLogModalContent({
  assets,
  initialAssetId,
  initialYear,
  initialMonth,
  onClose,
  onSaved,
}: {
  assets: Fr026Asset[];
  initialAssetId?: number;
  initialYear: number;
  initialMonth: number;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const initialAsset = assets.find((item) => item.id === initialAssetId) ?? assets[0];
  const [assetId, setAssetId] = useState<number | "">(initialAsset?.id ?? "");
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [values, setValues] = useState<ServerValues>(() => serverValues(initialAsset, initialYear, initialMonth));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const client = useQueryClient();

  const selectedAsset = assets.find((asset) => asset.id === assetId);
  const existingLog = selectedAsset?.logs.find((log) => log.year === year && log.month === month);
  const hasExisting = !!existingLog;

  const fillFrom = (asset: Fr026Asset | undefined, targetYear: number, targetMonth: number) => {
    setValues(serverValues(asset, targetYear, targetMonth));
  };

  const changeAsset = (value: string) => {
    const nextId = value ? Number(value) : "";
    const asset = assets.find((item) => item.id === nextId);
    setAssetId(nextId);
    setErrors({});
    fillFrom(asset, year, month);
  };

  const changePeriod = (nextYear: number, nextMonth: number) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setErrors({});
    fillFrom(selectedAsset, nextYear, nextMonth);
  };

  const mutation = useMutation({
    mutationFn: (payload: Fr026ServerLogPayload) => saveFr026Log(Number(assetId), payload),
    onSuccess: async () => {
      showToast.success("Log bulanan Server berhasil disimpan.");
      await client.invalidateQueries({ queryKey: ["fr026"] });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      const parsed = fr026Error(error);
      setErrors(parsed.fields);
      showToast.error(parsed.message);
    },
  });

  const submit = () => {
    if (!assetId) return;
    const next: Record<string, string> = {};
    (Object.keys(values) as Array<keyof ServerValues>).forEach((key) => {
      const value = values[key].trim();
      if (!value) next[key] = "Wajib diisi.";
      else if (Number.isNaN(Number(value))) next[key] = "Masukkan angka yang valid.";
      else if ((key.endsWith("_pct")) && (Number(value) < 0 || Number(value) > 100)) next[key] = "Persentase harus 0–100.";
      else if (Number(value) < 0) next[key] = "Nilai tidak boleh negatif.";
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate({
      year,
      month,
      current_storage_gb: Number(values.current_storage_gb),
      current_memory_pct: Number(values.current_memory_pct),
      current_cpu_pct: Number(values.current_cpu_pct),
      projection_storage_gb: Number(values.projection_storage_gb),
      projection_memory_pct: Number(values.projection_memory_pct),
      projection_cpu_pct: Number(values.projection_cpu_pct),
    });
  };

  const set = (key: keyof ServerValues) => (value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <Fr026Modal
      open
      onClose={onClose}
      title={hasExisting ? "Ubah Log Bulanan Server" : "Tambah Log Bulanan Server"}
      subtitle="Catat hasil pengukuran dan estimasi kapasitas untuk bulan terpilih."
      icon={hasExisting ? <PencilLine size={20} /> : <FilePlus2 size={20} />}
      size="xl"
      footer={
        <>
          <Fr026Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Batal</Fr026Button>
          <Fr026Button onClick={submit} disabled={mutation.isPending || !assetId}>
            <FilePlus2 size={16} />{mutation.isPending ? "Menyimpan..." : hasExisting ? "Simpan Perubahan" : "Simpan Log"}
          </Fr026Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Info size={17} className="mt-0.5 flex-shrink-0" />
          <p>
            {hasExisting
              ? `Anda sedang mengubah log ${fr026MonthLabel(month)} ${year}. Perubahan hanya berlaku pada aset dan bulan ini; log bulan lain tetap tersimpan.`
              : `Log ${fr026MonthLabel(month)} ${year} untuk ${selectedAsset?.asset_name ?? "aset terpilih"} belum tersedia. Isi semua metrik Current dan Projection sebelum menyimpan.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Fr026Field id="fr026-server-asset" label="Perangkat / Aset ID" required>
            <select className={fr026Control} value={assetId} onChange={(event) => changeAsset(event.target.value)}>
              <option value="">Pilih perangkat Server</option>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_name}</option>)}
            </select>
          </Fr026Field>
          <Fr026Field id="fr026-server-month" label="Bulan" required>
            <select className={fr026Control} value={month} onChange={(event) => changePeriod(year, Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{fr026MonthLabel(value)}</option>
              ))}
            </select>
          </Fr026Field>
          <Fr026Field id="fr026-server-year" label="Tahun" required>
            <select className={fr026Control} value={year} onChange={(event) => changePeriod(Number(event.target.value), month)}>
              {Array.from(new Set([year, ...fr026YearOptions()])).sort((a, b) => a - b).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Fr026Field>
        </div>

        <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
          {selectedAsset ? `Server • ${selectedAsset.ip_address ? `IP ${selectedAsset.ip_address}` : "IP —"}` : "Pilih aset Server terlebih dahulu."}
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current</h3>
              <span className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">Hasil pengukuran</span>
            </div>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Nilai pemakaian aktual pada bulan ini.</p>
            <div className="space-y-4">
              <Fr026MetricInput id="fr026-current-storage" label="Storage" value={values.current_storage_gb} onChange={set("current_storage_gb")} suffix="GB" hint="Angka ≥ 0. Gunakan satuan gigabyte." error={errors.current_storage_gb} />
              <Fr026MetricInput id="fr026-current-memory" label="Memory" value={values.current_memory_pct} onChange={set("current_memory_pct")} suffix="%" hint="Persentase 0–100." error={errors.current_memory_pct} />
              <Fr026MetricInput id="fr026-current-cpu" label="CPU Usage" value={values.current_cpu_pct} onChange={set("current_cpu_pct")} suffix="%" hint="Persentase 0–100." error={errors.current_cpu_pct} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Projection</h3>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Estimasi pengguna</span>
            </div>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Proyeksi kapasitas yang dicatat pada bulan ini.</p>
            <div className="space-y-4">
              <Fr026MetricInput id="fr026-projection-storage" label="Storage" value={values.projection_storage_gb} onChange={set("projection_storage_gb")} suffix="GB" hint="Angka ≥ 0. Gunakan satuan gigabyte." error={errors.projection_storage_gb} />
              <Fr026MetricInput id="fr026-projection-memory" label="Memory" value={values.projection_memory_pct} onChange={set("projection_memory_pct")} suffix="%" hint="Persentase 0–100." error={errors.projection_memory_pct} />
              <Fr026MetricInput id="fr026-projection-cpu" label="CPU Usage" value={values.projection_cpu_pct} onChange={set("projection_cpu_pct")} suffix="%" hint="Persentase 0–100." error={errors.projection_cpu_pct} />
            </div>
          </section>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          * Semua metrik wajib diisi. Satu aset memiliki satu log per bulan dan tahun. Projection tidak dihitung otomatis dan tidak menggantikan nilai Current.
        </p>
      </div>
    </Fr026Modal>
  );
}
