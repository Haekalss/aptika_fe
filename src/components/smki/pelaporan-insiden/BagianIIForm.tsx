"use client";

import { useState } from "react";
import Lightbox from "@/components/ui/Lightbox";
import BuktiThumb from "./BuktiThumb";
import type { BagianIISummary } from "./types";

/** Organism: ringkasan read-only Bagian I. */
export function BagianISummary({ data, id }: { data: BagianIISummary; id: number | string }) {
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const rows = [
    { label: "Pelapor", value: data.pelapor },
    { label: "Kategori & Jenis", value: data.kategori },
    { label: "Sistem Terdampak", value: data.sistem },
    { label: "Tanggal & Waktu Kejadian", value: data.waktu },
    { label: "Asal Instansi / NIP", value: data.instansi },
    { label: "No HP / Email", value: data.kontak },
    { label: "URL / IP Address", value: data.urlIp },
    { label: "OS / Web Server", value: data.osWeb },
  ];
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Bagian I — Identitas Pelapor & Bukti Insiden
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Data pelapor yang telah dikirimkan sebelumnya.
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          Read-only
        </span>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {rows.map((f) => (
            <div key={f.label}>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">{f.label}</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{f.value}</p>
            </div>
          ))}
        </div>
        <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {data.buktiUrl ? (
              <BuktiThumb nama={data.buktiNama} src={data.buktiUrl} size="sm" onPreview={() => setPreview(true)} />
            ) : (
              <span className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{data.buktiNama}</p>
              <p className="text-[10px] text-slate-500">{data.buktiUkuran}{data.buktiUrl ? " • klik gambar untuk pratinjau" : " • tambahkan pada tab Lampiran"}</p>
            </div>
          </div>
          {data.buktiUrl ? (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
                  await downloadBukti(id, "pelapor");
                } finally {
                  setBusy(false);
                }
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-60 transition-colors shrink-0"
            >
              {busy ? "Mengunduh..." : "Unduh Bukti"}
            </button>
          ) : (
            <span
              title="Belum ada file terlampir"
              className="text-xs font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed shrink-0"
            >
              Unduh Bukti
            </span>
          )}
        </div>
        {preview && data.buktiUrl && (
          <Lightbox
            images={[{
              src: data.buktiUrl,
              nama: data.buktiNama,
              onDownload: async () => {
                const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
                await downloadBukti(id, "pelapor");
              },
            }]}
            index={0}
            onClose={() => setPreview(false)}
            onIndex={() => {}}
          />
        )}
      </div>
    </div>
  );
}
