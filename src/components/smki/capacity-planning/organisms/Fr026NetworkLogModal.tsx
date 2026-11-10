"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Info, PencilLine } from "lucide-react";
import type { Fr026Asset, Fr026NetworkLogPayload } from "@/services/smki/capacityPlanning.types";
import { fr026Error, saveFr026Log } from "@/services/smki/capacityPlanningService";
import { showToast } from "@/components/ui/Toast";
import { fr026Control, fr026MonthLabel, fr026Number, fr026Signed, fr026YearOptions } from "../form";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Field } from "../molecules/Fr026Field";
import { Fr026MetricInput } from "../molecules/Fr026MetricInput";
import { Fr026Modal } from "../molecules/Fr026Modal";

type NetworkValues = {
  bandwidth_capacity_mbps: string;
  bandwidth_max_usage_mbps: string;
  sla_agreement_pct: string;
  sla_achievement_pct: string;
  notes: string;
};

function networkValues(asset: Fr026Asset | undefined, year: number, month: number): NetworkValues {
  const log = asset?.logs.find((item) => item.year === year && item.month === month);
  return {
    bandwidth_capacity_mbps: log?.bandwidth_capacity_mbps?.toString() ?? "",
    bandwidth_max_usage_mbps: log?.bandwidth_max_usage_mbps?.toString() ?? "",
    sla_agreement_pct: log?.sla_agreement_pct?.toString() ?? "",
    sla_achievement_pct: log?.sla_achievement_pct?.toString() ?? "",
    notes: log?.notes ?? "",
  };
}

export function Fr026NetworkLogModal({
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
    <Fr026NetworkLogModalContent
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

function Fr026NetworkLogModalContent({
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
  const [values, setValues] = useState<NetworkValues>(() => networkValues(initialAsset, initialYear, initialMonth));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const client = useQueryClient();

  const selectedAsset = assets.find((asset) => asset.id === assetId);
  const existingLog = selectedAsset?.logs.find((log) => log.year === year && log.month === month);
  const hasExisting = !!existingLog;

  const fillFrom = (asset: Fr026Asset | undefined, targetYear: number, targetMonth: number) => {
    setValues(networkValues(asset, targetYear, targetMonth));
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

  const capacity = Number(values.bandwidth_capacity_mbps);
  const usage = Number(values.bandwidth_max_usage_mbps);
  const computedUsage = capacity > 0 && values.bandwidth_max_usage_mbps.trim() !== "" ? (usage / capacity) * 100 : null;
  const agreement = Number(values.sla_agreement_pct);
  const achievement = Number(values.sla_achievement_pct);
  const slaDifference = values.sla_agreement_pct.trim() !== "" && values.sla_achievement_pct.trim() !== "" ? achievement - agreement : null;

  const mutation = useMutation({
    mutationFn: (payload: Fr026NetworkLogPayload) => saveFr026Log(Number(assetId), payload),
    onSuccess: async () => {
      showToast.success("Log bulanan Network berhasil disimpan.");
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
    if (!values.bandwidth_capacity_mbps.trim()) next.bandwidth_capacity_mbps = "Wajib diisi.";
    else if (!(Number(values.bandwidth_capacity_mbps) > 0)) next.bandwidth_capacity_mbps = "Kapasitas harus lebih dari 0.";
    if (!values.bandwidth_max_usage_mbps.trim()) next.bandwidth_max_usage_mbps = "Wajib diisi.";
    else if (Number(values.bandwidth_max_usage_mbps) < 0) next.bandwidth_max_usage_mbps = "Nilai tidak boleh negatif.";
    (["sla_agreement_pct", "sla_achievement_pct"] as const).forEach((key) => {
      if (!values[key].trim()) next[key] = "Wajib diisi.";
      else if (Number(values[key]) < 0 || Number(values[key]) > 100) next[key] = "Persentase harus 0–100.";
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate({
      year,
      month,
      bandwidth_capacity_mbps: Number(values.bandwidth_capacity_mbps),
      bandwidth_max_usage_mbps: Number(values.bandwidth_max_usage_mbps),
      sla_agreement_pct: Number(values.sla_agreement_pct),
      sla_achievement_pct: Number(values.sla_achievement_pct),
      notes: values.notes.trim() || null,
    });
  };

  const set = (key: keyof NetworkValues) => (value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <Fr026Modal
      open
      onClose={onClose}
      title={hasExisting ? "Ubah Log Bulanan Network" : "Tambah Log Bulanan Network"}
      subtitle="Sesuaikan data pemantauan untuk aset dan periode yang dipilih."
      icon={hasExisting ? <PencilLine size={20} /> : <FilePlus2 size={20} />}
      size="xl"
      darkHeader={hasExisting}
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
        <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${hasExisting ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"}`}>
          <Info size={17} className="mt-0.5 flex-shrink-0" />
          <p>
            {hasExisting
              ? `Anda sedang mengubah log ${fr026MonthLabel(month)} ${year}. Perubahan hanya berlaku pada aset dan bulan ini; log bulan lain tetap tersimpan.`
              : `Log ${fr026MonthLabel(month)} ${year} untuk ${selectedAsset?.asset_name ?? "aset terpilih"} belum tersedia. Isi kapasitas, pemakaian, dan capaian SLA sebelum menyimpan.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Fr026Field id="fr026-network-asset" label="Perangkat / Aset ID" required>
            <select className={fr026Control} value={assetId} onChange={(event) => changeAsset(event.target.value)}>
              <option value="">Pilih perangkat Network</option>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_name}</option>)}
            </select>
          </Fr026Field>
          <Fr026Field id="fr026-network-month" label="Bulan" required>
            <select className={fr026Control} value={month} onChange={(event) => changePeriod(year, Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{fr026MonthLabel(value)}</option>
              ))}
            </select>
          </Fr026Field>
          <Fr026Field id="fr026-network-year" label="Tahun" required>
            <select className={fr026Control} value={year} onChange={(event) => changePeriod(Number(event.target.value), month)}>
              {Array.from(new Set([year, ...fr026YearOptions()])).sort((a, b) => a - b).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Fr026Field>
        </div>

        <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
          {selectedAsset ? `Network • ${selectedAsset.ip_address ? `IP ${selectedAsset.ip_address}` : "IP —"}` : "Pilih aset Network terlebih dahulu."}
        </p>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bandwidth</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Fr026MetricInput id="fr026-capacity" label="Kapasitas" value={values.bandwidth_capacity_mbps} onChange={set("bandwidth_capacity_mbps")} suffix="Mbps" hint="Kapasitas harus lebih dari 0." error={errors.bandwidth_capacity_mbps} />
            <Fr026MetricInput id="fr026-max-usage" label="Max Pemakaian" value={values.bandwidth_max_usage_mbps} onChange={set("bandwidth_max_usage_mbps")} suffix="Mbps" hint="Pemakaian tertinggi bulan ini." error={errors.bandwidth_max_usage_mbps} />
            <Fr026Field id="fr026-usage-pct" label="% Pemakaian" hint="Dihitung otomatis.">
              <div className="relative">
                <input className={`${fr026Control} bg-slate-50 pr-10 dark:bg-slate-800/60`} value={computedUsage === null ? "—" : fr026Number(computedUsage, 0)} readOnly aria-readonly="true" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">%</span>
              </div>
            </Fr026Field>
          </div>
          {computedUsage !== null && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Dihitung otomatis: {fr026Number(usage, 0)} ÷ {fr026Number(capacity, 0)} × 100.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Availability (Up Time)</h3>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">Terpisah dari bandwidth</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Fr026MetricInput id="fr026-sla-agreement" label="Perjanjian SLA" value={values.sla_agreement_pct} onChange={set("sla_agreement_pct")} suffix="%" hint="Sesuai perjanjian layanan; rentang 0–100." error={errors.sla_agreement_pct} />
            <Fr026MetricInput id="fr026-sla-achievement" label="Capaian SLA" value={values.sla_achievement_pct} onChange={set("sla_achievement_pct")} suffix="%" hint="Hasil pengukuran uptime; rentang 0–100." error={errors.sla_achievement_pct} />
          </div>
          <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Capaian − Perjanjian: {slaDifference === null ? "—" : fr026Signed(slaDifference, " poin persentase")}
          </p>
        </section>

        <Fr026Field id="fr026-network-notes" label="Keterangan" error={errors.notes} hint="Catat gangguan atau konteks pemantauan jika ada.">
          <input className={fr026Control} value={values.notes} maxLength={1000} placeholder="Contoh: Stabil" onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} />
        </Fr026Field>
        <p className="text-xs text-slate-500 dark:text-slate-400">* Isian wajib. Nomor dokumen lembar Network: FR-029/KOM.03.05/SANDIKAMI, revisi 1.0, dipertahankan sesuai sumber.</p>
      </div>
    </Fr026Modal>
  );
}
