"use client";

import { IdCard, Info } from "lucide-react";
import Fr048Field from "../atoms/Fr048Field";
import { PERIODE_OPTIONS } from "../constants";
import type { IdentifikasiFormState, IdentifikasiErrors } from "../form";
import type { OptionDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const inputBase =
  "w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:text-slate-500 disabled:cursor-not-allowed";

/** Step 1b — Identifikasi Pemantauan (UC-01): tanggal, periode, jenis konfigurasi & objek. */
export default function Fr048IdentifikasiForm({
  value,
  errors,
  onChange,
  pelaksanaNama,
  jenisOptions,
  objekOptions,
  loadingObjek,
  locked = false,
}: {
  value: IdentifikasiFormState;
  errors: IdentifikasiErrors;
  onChange: (patch: Partial<IdentifikasiFormState>) => void;
  pelaksanaNama: string;
  jenisOptions: OptionDto[];
  objekOptions: OptionDto[];
  loadingObjek: boolean;
  locked?: boolean;
}) {
  const toggleObjek = (id: number) => {
    if (locked) return;
    const next = value.objekIds.includes(id) ? value.objekIds.filter((o) => o !== id) : [...value.objekIds, id];
    onChange({ objekIds: next });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <IdCard size={16} className="text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Identifikasi Pemantauan</h3>
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md px-2 py-1">
            <Info size={11} /> Terkunci (status Revisi)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Fr048Field label="Tanggal Pemantauan" required error={errors.tanggalPemantauan}>
          <input type="date" value={value.tanggalPemantauan} disabled={locked} onChange={(e) => onChange({ tanggalPemantauan: e.target.value })} className={inputBase} />
        </Fr048Field>

        <Fr048Field label="Periode" required error={errors.periode} hint="Triwulan berjalan (1–4)">
          <select value={value.periode} disabled={locked} onChange={(e) => onChange({ periode: Number(e.target.value) })} className={inputBase}>
            {PERIODE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </Fr048Field>

        <Fr048Field label="Pelaksana" hint="Terisi otomatis dari akun yang login">
          <input value={pelaksanaNama} disabled className={inputBase} />
        </Fr048Field>

        <Fr048Field label="Jenis Konfigurasi" required error={errors.jenisKonfigurasiId} hint="Pilihan dari data master (dikelola Admin)">
          <select
            value={value.jenisKonfigurasiId || ""}
            disabled={locked}
            onChange={(e) => onChange({ jenisKonfigurasiId: e.target.value === "" ? 0 : Number(e.target.value), objekIds: [] })}
            className={inputBase}
          >
            <option value="">Pilih Jenis Konfigurasi...</option>
            {jenisOptions.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
        </Fr048Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Nama Objek {errors.objekIds && <span className="text-rose-500 normal-case font-medium">— {errors.objekIds}</span>}
        </legend>
        {!value.jenisKonfigurasiId ? (
          <p className="text-[11px] text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-4 text-center">
            Pilih Jenis Konfigurasi terlebih dahulu untuk menampilkan daftar objek.
          </p>
        ) : loadingObjek ? (
          <p className="text-[11px] text-slate-400 italic px-1 py-3">Memuat objek...</p>
        ) : objekOptions.length === 0 ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
            Belum ada objek terdaftar untuk jenis ini. Hubungi Admin untuk menambahkannya di menu Data Master.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {objekOptions.map((o) => {
              const checked = value.objekIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={locked}
                  onClick={() => toggleObjek(o.id)}
                  aria-pressed={checked}
                  className={`h-9 px-3 rounded-xl border text-[11px] font-bold transition-all disabled:opacity-60 ${
                    checked
                      ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400"
                  }`}
                >
                  {o.nama}
                </button>
              );
            })}
          </div>
        )}
        {value.objekIds.length > 0 && (
          <p className="mt-2 text-[10px] text-violet-600 dark:text-violet-400 font-semibold">{value.objekIds.length} objek dipilih — dapat mencakup beberapa sub-perangkat (mis. beberapa VM dalam satu hardware).</p>
        )}
      </fieldset>
    </div>
  );
}
