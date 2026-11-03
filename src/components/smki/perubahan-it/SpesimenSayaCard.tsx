"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import {
  extractFieldErrors,
  extractMessage,
  formatUkuran,
  getSpesimenSaya,
  hapusSpesimenSaya,
  unggahSpesimenSaya,
  type SpesimenSaya,
} from "@/services/smki/perubahanIt";
import SpesimenTtePreview from "./SpesimenTtePreview";

export default function SpesimenSayaCard({ userId, onChanged }: { userId?: number | string | null; onChanged?: () => void }) {
  const [info, setInfo] = useState<SpesimenSaya | null>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0); // paksa pratinjau dimuat ulang
  const fileRef = useRef<HTMLInputElement>(null);

  const muat = useCallback(async () => {
    try {
      setInfo(await getSpesimenSaya());
    } catch {
      setInfo({ ada: false, nama_asli: null, ukuran: null });
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const pilih = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      toast.success(await unggahSpesimenSaya(file));
      await muat();
      setVersion((v) => v + 1);
      onChanged?.();
    } catch (err: any) {
      const m = extractFieldErrors(err);
      toast.error(m.spesimen || extractMessage(err, "Gagal mengunggah spesimen TTE."));
    } finally {
      setBusy(false);
    }
  };

  const hapus = async () => {
    setBusy(true);
    try {
      toast.success(await hapusSpesimenSaya());
      await muat();
      setVersion((v) => v + 1);
      onChanged?.();
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal menghapus spesimen TTE."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center">
      <div className="w-full sm:w-48">
        <SpesimenTtePreview key={version} userId={info?.ada ? userId : null} fallbackTeks="Belum ada spesimen" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Spesimen TTE Saya</p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Gambar tanda tangan (PNG/JPG, latar transparan disarankan, maks. 1 MB). Otomatis tercetak pada formulir
          ketika nama Anda dipilih sebagai pengesah.
          {info?.ada && info.nama_asli ? ` Berkas saat ini: ${info.nama_asli}${info.ukuran ? ` (${formatUkuran(info.ukuran)})` : ""}.` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {busy ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <UploadCloud size={13} aria-hidden="true" />}
            {info?.ada ? "Ganti Spesimen" : "Unggah Spesimen"}
          </button>
          {info?.ada && (
            <button
              type="button"
              disabled={busy}
              onClick={hapus}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900 dark:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 size={13} aria-hidden="true" /> Hapus
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            pilih(f);
          }}
        />
      </div>
    </div>
  );
}