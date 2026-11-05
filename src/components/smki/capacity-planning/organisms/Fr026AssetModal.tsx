"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Network, Server, ShieldCheck } from "lucide-react";
import type { Fr026Asset, Fr026Category } from "@/services/smki/capacityPlanning.types";
import { createFr026Asset, fr026Error, updateFr026Asset } from "@/services/smki/capacityPlanningService";
import { showToast } from "@/components/ui/Toast";
import { fr026Control } from "../form";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Field } from "../molecules/Fr026Field";
import { Fr026Modal } from "../molecules/Fr026Modal";

export function Fr026AssetModal({
  open,
  defaultCategory,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  defaultCategory: Fr026Category;
  editing?: Fr026Asset | null;
  onClose: () => void;
  onSaved?: (asset: Fr026Asset) => void;
}) {
  if (!open) return null;
  return (
    <Fr026AssetModalContent
      key={editing?.id ?? "new"}
      defaultCategory={defaultCategory}
      editing={editing}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function Fr026AssetModalContent({
  defaultCategory,
  editing,
  onClose,
  onSaved,
}: {
  defaultCategory: Fr026Category;
  editing?: Fr026Asset | null;
  onClose: () => void;
  onSaved?: (asset: Fr026Asset) => void;
}) {
  const [category, setCategory] = useState<Fr026Category>(editing?.category ?? defaultCategory);
  const [assetName, setAssetName] = useState(editing?.asset_name ?? "");
  const [ipAddress, setIpAddress] = useState(editing?.ip_address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      editing
        ? updateFr026Asset(editing.id, { category, asset_name: assetName.trim(), ip_address: ipAddress.trim() || null })
        : createFr026Asset({ category, asset_name: assetName.trim(), ip_address: ipAddress.trim() || null }),
    onSuccess: async (asset) => {
      showToast.success(editing ? "Aset capacity planning berhasil diperbarui." : "Aset capacity planning berhasil ditambahkan.");
      await client.invalidateQueries({ queryKey: ["fr026"] });
      onSaved?.(asset);
      onClose();
    },
    onError: (error) => {
      const parsed = fr026Error(error);
      setErrors(parsed.fields);
      showToast.error(parsed.message);
    },
  });

  const submit = () => {
    const next: Record<string, string> = {};
    if (!assetName.trim()) next.asset_name = "Nama perangkat / Aset ID wajib diisi.";
    if (ipAddress.trim() && !/^[0-9a-fA-F:.]+$/.test(ipAddress.trim())) next.ip_address = "Alamat IP belum valid.";
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate();
  };

  return (
    <Fr026Modal
      open
      onClose={onClose}
      title={editing ? "Ubah Aset" : "Tambah Aset"}
      subtitle="Daftarkan perangkat sebelum mencatat log pemantauan."
      icon={<FilePlus2 size={20} />}
      footer={
        <>
          <Fr026Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Batal</Fr026Button>
          <Fr026Button onClick={submit} disabled={mutation.isPending}>
            <FilePlus2 size={16} />{mutation.isPending ? "Menyimpan..." : "Simpan Aset"}
          </Fr026Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <ShieldCheck size={17} className="mt-0.5 flex-shrink-0" />
          <p>Pilih kategori aset. Parameter log bulanan akan mengikuti kategori Server atau Network.</p>
        </div>

        <fieldset>
          <legend className="mb-2 block text-[13px] font-bold text-slate-700 dark:text-slate-200">Kategori aset <span className="text-red-500">*</span></legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(["server", "network"] as Fr026Category[]).map((value) => {
              const active = category === value;
              const Icon = value === "server" ? Server : Network;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  aria-pressed={active}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/20 dark:text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2.5"><Icon size={18} />{value === "server" ? "Server" : "Network"}</span>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-emerald-600 bg-emerald-600" : "border-slate-300 dark:border-slate-600"}`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Fr026Field id="fr026-asset-name" label="Nama perangkat / Aset ID" required error={errors.asset_name} hint="Gunakan nama atau ID aset yang unik dan mudah dikenali.">
          <input
            className={fr026Control}
            value={assetName}
            maxLength={180}
            placeholder="Contoh: SRV-WEB-02"
            onChange={(event) => setAssetName(event.target.value)}
          />
        </Fr026Field>

        <Fr026Field id="fr026-asset-ip" label="Alamat IP" error={errors.ip_address} hint="Opsional. Jika diisi, gunakan format IPv4 atau IPv6 yang valid.">
          <input
            className={fr026Control}
            value={ipAddress}
            maxLength={45}
            placeholder="Contoh: 10.10.1.40"
            onChange={(event) => setIpAddress(event.target.value)}
          />
        </Fr026Field>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/30">
          <p className="font-bold text-slate-800 dark:text-slate-100">Setelah aset disimpan</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Aset ditampilkan pada matriks kategori yang dipilih. Semua bulan masih kosong hingga Anda menambahkan log bulanan.
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">* Isian wajib. Data belum ditambahkan ke daftar aset.</p>
      </div>
    </Fr026Modal>
  );
}
