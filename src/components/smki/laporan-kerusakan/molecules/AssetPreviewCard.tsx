import React, { memo } from "react";
import { Server } from "lucide-react";
import { DataCenterAssetItem } from "@/services/api";

interface AssetPreviewCardProps {
  asset: DataCenterAssetItem | null;
}

export const AssetPreviewCard = memo(({ asset }: AssetPreviewCardProps) => {
  if (!asset) return null;

  return (
    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-900">{asset.kode_aset}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700 font-medium">{asset.kategori || "Perangkat DC"}</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Lokasi Rak: <span className="font-semibold text-slate-900">{asset.lokasi_rak || "Data Center"}</span>
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[10px] text-slate-400 uppercase font-bold block">Penanggung Jawab Aset</span>
        <span className="font-semibold text-slate-800">{asset.penanggung_jawab_default || "Tim Teknisi"}</span>
      </div>
    </div>
  );
});

AssetPreviewCard.displayName = "AssetPreviewCard";
