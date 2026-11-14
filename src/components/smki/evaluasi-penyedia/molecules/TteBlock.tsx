"use client";

import { PenTool } from "lucide-react";
import TteSpecimen from "@/components/smki/TteSpecimen";

export default function TteBlock({
  label,
  status,
  nama,
  nip,
  tanggal,
  width = 260,
}: {
  label: string;
  status: "belum" | "sudah";
  nama?: string | null;
  nip?: string | null;
  tanggal?: string | null;
  width?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </p>
      {status === "sudah" && (nama || tanggal) ? (
        <div className="flex flex-col items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-center">
          <div className="flex w-full justify-center">
            <TteSpecimen
              nama={nama ?? undefined}
              nip={nip ?? undefined}
              width={width}
              className="h-auto max-w-full"
            />
          </div>
          {tanggal && (
            <p className="mt-2 w-full text-center text-xs text-slate-600 dark:text-slate-300">
              {tanggal}
            </p>
          )}
          {nama && (
            <p className="w-full text-center text-xs font-semibold text-slate-800 dark:text-slate-100">
              ({nama})
            </p>
          )}
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400">
          <div className="text-center">
            <PenTool size={18} className="mx-auto mb-1" />
            <p className="text-xs">Belum ditandatangani</p>
          </div>
        </div>
      )}
    </div>
  );
}
