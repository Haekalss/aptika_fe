"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { BackupRestoreAsset, BackupRestoreEntry, BackupRestoreOperation, BackupRestoreReport } from "@/services/smki/backupRestore.types";
import { createFr030Asset, filledFr030Entries, fr030EntrySummary } from "../form";
import { AssetIdentityField } from "../molecules/AssetIdentityField";
import { MonthlyResultField } from "../molecules/MonthlyResultField";
import { EvidenceAttachments } from "./EvidenceAttachments";

export const FR030_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function AnnualAssetMatrix({ assets, year, onChange, report, dirty, busy, setBusy, onSaved, errors = {}, readOnly }: { assets: BackupRestoreAsset[]; year: number; onChange: (assets: BackupRestoreAsset[]) => void; report?: BackupRestoreReport; dirty: boolean; busy: boolean; setBusy: (busy: boolean) => void; onSaved: (report: BackupRestoreReport) => void; errors?: Record<string, string[]>; readOnly?: boolean }) {
  const [selected, setSelected] = useState<{ key: string; month: number } | null>(null);
  const [removeKey, setRemoveKey] = useState<string | null>(null);
  const index = assets.findIndex(asset => asset.client_key === selected?.key);
  const active = assets[index];
  function update(asset: BackupRestoreAsset) { onChange(assets.map(previous => previous.client_key === asset.client_key ? asset : previous)); }
  function changeEntry(entry: BackupRestoreEntry) {
    if (!active) return;
    const old = active.entries.find(item => item.month === entry.month && item.operation === entry.operation);
    update({ ...active, entries: old ? active.entries.map(item => item === old ? entry : item) : [...active.entries, entry] });
  }
  return <>
    <Card id="fr030-assets" tabIndex={-1} hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" title={<h2 className="font-semibold text-slate-900 dark:text-white">2. Rekap Backup & Restore Bulanan</h2>} headerActions={!readOnly && <Button type="button" variant="outline" disabled={busy || assets.length >= 50} onClick={() => onChange([...assets, createFr030Asset()])}>Tambah aset</Button>}>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Klik bulan untuk mencatat kegiatan. B = Backup, R = Restore. Bulan kosong berarti belum dicatat, bukan berhasil. Maksimal 50 aset.</p>
      {errors.assets && <p role="alert" className="mb-3 text-red-700 dark:text-red-300">{errors.assets[0]}</p>}
      {assets.length === 0 ? <p className="rounded-lg bg-slate-50 p-5 dark:bg-slate-800">Belum ada aset. Tambahkan aset untuk mulai mengisi rekap.</p> : <div className="max-w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[1600px] border-collapse text-sm"><caption className="sr-only">Rekap backup dan restore tahun {year}</caption>
          <thead className="bg-slate-50 dark:bg-slate-800"><tr><th scope="col" className="sticky left-0 z-10 min-w-[250px] max-w-[280px] bg-slate-50 p-4 text-left dark:bg-slate-800">Nama Aset</th>{FR030_MONTHS.map(month => <th key={month} scope="col" className="min-w-[105px] p-3 text-center">{month}</th>)}{!readOnly && <th scope="col" className="p-3">Aksi</th>}</tr></thead>
          <tbody>{assets.map((asset, i) => <tr key={asset.client_key} className="border-t border-slate-200 dark:border-slate-700 align-top">
            <td className="sticky left-0 z-10 w-[260px] min-w-[250px] max-w-[280px] bg-white p-4 dark:bg-slate-900"><AssetIdentityField asset={asset} number={i + 1} onChange={update} readOnly={readOnly} error={errors[`assets.${i}.nama_aset`]?.[0]} /></td>
            {FR030_MONTHS.map((month, m) => {
              const entries = asset.entries.filter(entry => entry.month === m + 1);
              const canonical = filledFr030Entries(asset.entries);
              const invalid = Object.keys(errors).some(key => key.startsWith(`assets.${i}.entries.`) && entries.some(entry => canonical.indexOf(entry) === Number(key.split(".")[3])));
              return <td key={month} className="p-2 text-center"><button id={`fr030-cell-${asset.client_key}-${m + 1}`} type="button" aria-label={`${asset.nama_aset || `Aset ${i + 1}`} · ${month}`} disabled={busy} onClick={() => setSelected({ key: asset.client_key, month: m + 1 })} className={`w-full rounded-lg border p-2 text-left text-xs leading-6 transition-colors hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-600 dark:hover:bg-slate-800 ${invalid ? "border-red-500" : "border-slate-200 dark:border-slate-700"}`}>
                {(["backup", "restore"] as const).map(operation => { const entry = entries.find(item => item.operation === operation); return <span key={operation} className="block">{operation === "backup" ? "B" : "R"}: {fr030EntrySummary(entry)}{entry?.performed_on && <span className="block text-slate-600 dark:text-slate-300">{entry.performed_on}</span>}{entry?.attachments.length ? <span className="block">{entry.attachments.length} bukti</span> : null}</span>; })}
                {invalid && <span className="block text-red-700 dark:text-red-300">Periksa isian</span>}
              </button></td>;
            })}
            {!readOnly && <td className="p-3"><Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => setRemoveKey(asset.client_key)}>Hapus aset {i + 1}</Button></td>}
          </tr>)}</tbody>
        </table>
      </div>}
    </Card>
    <Modal isOpen={Boolean(active && selected)} onClose={() => { if (!busy) setSelected(null); }} title={`${active?.nama_aset || "Aset"} · ${FR030_MONTHS[(selected?.month ?? 1) - 1]} ${year}`} size="xl" footer={<Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>Selesai</Button>}>
      {active && selected && <div className="grid gap-8 md:grid-cols-2">{(["backup", "restore"] as BackupRestoreOperation[]).map(operation => {
        const entry = active.entries.find(item => item.month === selected.month && item.operation === operation) ?? { month: selected.month, operation, result: null, performed_on: null, notes: null, attachments: [] };
        const entryIndex = filledFr030Entries(active.entries).indexOf(entry);
        return <div key={operation}><MonthlyResultField entry={entry} year={year} onChange={changeEntry} readOnly={readOnly || busy} errors={errors} prefix={`assets.${index}.entries.${entryIndex}`} /><EvidenceAttachments entry={entry} report={report} dirty={dirty} busy={busy} setBusy={setBusy} onSaved={onSaved} readOnly={readOnly} /></div>;
      })}</div>}
    </Modal>
    <ConfirmModal isOpen={Boolean(removeKey)} title="Hapus aset dari laporan?" message="Aset beserta catatan dan buktinya akan dihapus dari laporan setelah Anda menyimpan perubahan." onClose={() => setRemoveKey(null)} onConfirm={() => { onChange(assets.filter(asset => asset.client_key !== removeKey)); setRemoveKey(null); }} />
  </>;
}
