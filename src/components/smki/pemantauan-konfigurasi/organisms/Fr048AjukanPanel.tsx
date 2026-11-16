"use client";

import { ClipboardCheck } from "lucide-react";
import Fr048ResultPanel from "../molecules/Fr048ResultPanel";
import Fr048AdminSelect from "../molecules/Fr048AdminSelect";
import Fr048TteBlock from "../molecules/Fr048TteBlock";
import type { HasilPemantauan } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Step 3 — Hasil & Pengajuan (UC-04): ringkasan, catatan, admin, tanda tangan. */
export default function Fr048AjukanPanel({
  hasil,
  jumlahSesuai,
  jumlahTidakSesuai,
  catatanTindakLanjut,
  onCatatanChange,
  adminId,
  onAdminChange,
  pelaksanaId,
  pelaksanaNama,
  adminNama,
  tanggalTtdPelaksana,
  tanggalTtdAdmin,
  locked = false,
}: {
  hasil: HasilPemantauan;
  jumlahSesuai: number;
  jumlahTidakSesuai: number;
  catatanTindakLanjut: string;
  onCatatanChange: (v: string) => void;
  adminId: number | null;
  onAdminChange: (id: number | null) => void;
  pelaksanaId: number;
  pelaksanaNama: string;
  adminNama: string | null;
  tanggalTtdPelaksana: string | null;
  tanggalTtdAdmin: string | null;
  locked?: boolean;
}) {
  const mustNote = jumlahTidakSesuai > 0;
  return (
    <div className="flex flex-col gap-4">
      <Fr048ResultPanel hasil={hasil} jumlahSesuai={jumlahSesuai} jumlahTidakSesuai={jumlahTidakSesuai} />

      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Catatan Tindak Lanjut {mustNote && <span className="text-rose-500">*</span>}
        </span>
        <textarea
          value={catatanTindakLanjut}
          disabled={locked}
          onChange={(e) => onCatatanChange(e.target.value)}
          rows={3}
          placeholder={mustNote ? "Wajib diisi karena terdapat baris Tidak Sesuai..." : "Catatan tindak lanjut (bila ada)..."}
          aria-label="Catatan tindak lanjut"
          className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 ${
            mustNote && !catatanTindakLanjut.trim() ? "border-amber-400" : "border-slate-200 dark:border-slate-700"
          }`}
        />
        {mustNote && !catatanTindakLanjut.trim() && (
          <span className="mt-1 block text-[11px] font-medium text-amber-600 dark:text-amber-400" role="alert">
            Terdapat {jumlahTidakSesuai} baris Tidak Sesuai — Catatan Tindak Lanjut wajib diisi.
          </span>
        )}
      </label>

      {!locked && <Fr048AdminSelect value={adminId} excludeId={pelaksanaId} onChange={onAdminChange} />}

      {/* Spesimen TTE berdampingan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Fr048TteBlock label="Dibuat Oleh" nama={pelaksanaNama} signed={Boolean(tanggalTtdPelaksana)} width={220} />
        <Fr048TteBlock label="Mengetahui" nama={adminNama} signed={Boolean(tanggalTtdAdmin)} width={220} />
      </div>

      {locked && (
        <p className="text-[10px] text-slate-400 inline-flex items-center gap-1.5">
          <ClipboardCheck size={12} /> Data telah diajukan. Tanda tangan berarti pencatatan nama pengguna & waktu server.
        </p>
      )}
    </div>
  );
}
