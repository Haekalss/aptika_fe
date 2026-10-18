import React, { memo } from "react";
import { DataCenterAssetItem } from "@/services/api";
import { AssetPreviewCard } from "../molecules/AssetPreviewCard";

interface FormSectionAsetProps {
  tanggal: string;
  jam: string;
  asetId?: number;
  assets: DataCenterAssetItem[];
  selectedAsset: DataCenterAssetItem | null;
  onChange: (field: string, value: string | number | null) => void;
}

export const FormSectionAset = memo(({
  tanggal,
  jam,
  asetId,
  assets,
  selectedAsset,
  onChange,
}: FormSectionAsetProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
          1
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Informasi Aset Data Center
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tanggal Kejadian <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => onChange("tanggal", e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Jam Kejadian <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: 09.30 WIB"
            value={jam}
            onChange={(e) => onChange("jam", e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Pilih Aset Terdaftar <span className="text-rose-500">*</span>
        </label>
        <select
          value={asetId || ""}
          onChange={(e) => onChange("aset_id", Number(e.target.value))}
          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          required
        >
          <option value="">-- Pilih Perangkat Data Center --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.nama_aset} ({asset.kode_aset}) - {asset.lokasi_rak || "Data Center"}
            </option>
          ))}
        </select>
      </div>

      <AssetPreviewCard asset={selectedAsset} />
    </div>
  );
});

FormSectionAset.displayName = "FormSectionAset";
