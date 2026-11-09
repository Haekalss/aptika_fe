"use client";

import { useState } from "react";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { BackupRestoreAsset, BackupRestoreLookupParams } from "@/services/smki/backupRestore.types";
import { useFr030Lookup } from "../hooks/useFr030Queries";

export function AssetIdentityField({ asset, number, onChange, error, readOnly }: { asset: BackupRestoreAsset; number: number; onChange: (asset: BackupRestoreAsset) => void; error?: string; readOnly?: boolean }) {
  const [source, setSource] = useState<"manual" | "physical" | "virtual">(asset.aset_ti_id ? "physical" : asset.virtual_instance_id ? "virtual" : "manual");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const lookup = useFr030Lookup({ asset_type: source === "virtual" ? "virtual" : "physical", search, page } as BackupRestoreLookupParams, source !== "manual" && !readOnly);
  if (readOnly) return <div className="space-y-1"><strong className="break-words">{asset.nama_aset || "Belum diisi"}</strong><p className="text-xs">{asset.kode_aset || "Tanpa kode"}</p></div>;
  return <div className="space-y-3">
    <FormField label={`Sumber aset ${number}`}>
      <select className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:bg-slate-900 dark:border-slate-600" value={source} onChange={e => { setSource(e.target.value as typeof source); setPage(1); onChange({ ...asset, aset_ti_id: null, virtual_instance_id: null }); }}>
        <option value="manual">Isi manual</option><option value="physical">Master Aset TI</option><option value="virtual">Master Aset Virtual</option>
      </select>
    </FormField>
    {source !== "manual" && <div className="space-y-2">
      <Input label={`Cari master aset ${number}`} maxLength={100} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      {lookup.isError ? <Button type="button" variant="outline" onClick={() => lookup.refetch()}>Muat ulang master aset</Button> : <FormField label={`Pilih master aset ${number}`} hint={lookup.isFetching ? "Memuat master…" : undefined}>
        <select id={`fr030-assets.${number - 1}.${source === "virtual" ? "virtual_instance_id" : "aset_ti_id"}`} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:bg-slate-900 dark:border-slate-600" value={asset.aset_ti_id ?? asset.virtual_instance_id ?? ""} onChange={e => {
          const option = lookup.data?.assets.data.find(item => item.id === Number(e.target.value));
          if (option) onChange({ ...asset, aset_ti_id: source === "physical" ? option.id : null, virtual_instance_id: source === "virtual" ? option.id : null, nama_aset: option.nama_aset, kode_aset: option.kode_aset });
        }}>
          <option value="">Pilih aset</option>
          {(asset.aset_ti_id || asset.virtual_instance_id) && !lookup.data?.assets.data.some(item => item.id === (asset.aset_ti_id ?? asset.virtual_instance_id)) && <option value={asset.aset_ti_id ?? asset.virtual_instance_id ?? ""}>{asset.nama_aset} (tersimpan)</option>}
          {lookup.data?.assets.data.map(item => <option key={item.id} value={item.id}>{item.nama_aset} · {item.kode_aset || "Tanpa kode"}</option>)}
        </select>
      </FormField>}
      {lookup.data && lookup.data.assets.last_page > 1 && <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button><span className="text-xs">{page}/{lookup.data.assets.last_page}</span><Button type="button" variant="outline" size="sm" disabled={page >= lookup.data.assets.last_page} onClick={() => setPage(p => p + 1)}>Berikutnya</Button></div>}
    </div>}
    <Input id={`fr030-assets.${number - 1}.nama_aset`} label={`Nama aset ${number}`} value={asset.nama_aset ?? ""} maxLength={255} readOnly={source !== "manual"} error={error} onChange={e => onChange({ ...asset, nama_aset: e.target.value })} />
    <Input id={`fr030-assets.${number - 1}.kode_aset`} label={`Kode aset ${number}`} value={asset.kode_aset ?? ""} maxLength={255} readOnly={source !== "manual"} onChange={e => onChange({ ...asset, kode_aset: e.target.value })} />
  </div>;
}
