"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import type { AksiPayload, AksiPerubahan } from "@/services/smki/perubahanIt";
import { useModalA11y } from "./useModalA11y";

interface AksiConfig {
  title: string;
  description: string;
  confirm: string;
  busy: string;
  tone: "emerald" | "rose" | "amber" | "blue";
  catatan: "none" | "optional" | "required";
  catatanLabel?: string;
  catatanPlaceholder?: string;
  tanggal?: boolean;
}

export const AKSI_CONFIG: Record<AksiPerubahan, AksiConfig> = {
  ajukan: {
    title: "Ajukan Perubahan TI?",
    description:
      "Formulir akan dikirim ke Koordinator Agen untuk diperiksa. Setelah diajukan, isian tidak dapat diubah kecuali dikembalikan.",
    confirm: "Ya, Ajukan",
    busy: "Mengajukan...",
    tone: "blue",
    catatan: "none",
  },
  terima: {
    title: "Terima Permintaan Perubahan?",
    description: "Permintaan akan diteruskan ke Penanggung Jawab Perangkat untuk disetujui atau ditolak.",
    confirm: "Ya, Terima",
    busy: "Memproses...",
    tone: "emerald",
    catatan: "optional",
    catatanLabel: "Catatan (opsional)",
    catatanPlaceholder: "Tambahkan catatan untuk riwayat tahapan",
  },
  kembalikan: {
    title: "Kembalikan ke Pemohon?",
    description: "Pemohon dapat memperbaiki isian lalu mengajukan ulang. Jelaskan bagian yang perlu diperbaiki.",
    confirm: "Kembalikan",
    busy: "Memproses...",
    tone: "amber",
    catatan: "required",
    catatanLabel: "Catatan pengembalian",
    catatanPlaceholder: "Tuliskan alasan dan bagian yang perlu diperbaiki",
  },
  setujui: {
    title: "Setujui Perubahan TI?",
    description: "Perubahan akan berstatus Disetujui dan menunggu pelaksanaan oleh Agen.",
    confirm: "Ya, Setujui",
    busy: "Memproses...",
    tone: "emerald",
    catatan: "optional",
    catatanLabel: "Catatan (opsional)",
    catatanPlaceholder: "Tambahkan catatan persetujuan",
  },
  tolak: {
    title: "Tolak Perubahan TI?",
    description: "Permintaan akan berstatus Ditolak dan proses berhenti di sini.",
    confirm: "Tolak Perubahan",
    busy: "Memproses...",
    tone: "rose",
    catatan: "required",
    catatanLabel: "Alasan penolakan",
    catatanPlaceholder: "Tuliskan alasan penolakan",
  },
  laksanakan: {
    title: "Tandai Telah Dilaksanakan",
    description: "Isi tanggal dan catatan pelaksanaan. Status akan menjadi Dilaksanakan dan tidak dapat diubah lagi.",
    confirm: "Tandai Dilaksanakan",
    busy: "Menyimpan...",
    tone: "emerald",
    catatan: "required",
    catatanLabel: "Catatan pelaksanaan",
    catatanPlaceholder: "Jelaskan hasil pelaksanaan perubahan",
    tanggal: true,
  },
  simpan_catatan: {
    title: "Simpan Catatan Pelaksanaan",
    description: "Catatan disimpan ke riwayat tahapan. Status tetap Disetujui sampai Anda menandai perubahan dilaksanakan.",
    confirm: "Simpan Catatan",
    busy: "Menyimpan...",
    tone: "blue",
    catatan: "required",
    catatanLabel: "Catatan pelaksanaan",
    catatanPlaceholder: "Tuliskan progres atau kendala pelaksanaan",
  },
};

const TONE_BTN: Record<AksiConfig["tone"], string> = {
  emerald: "bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-600",
  rose: "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600",
  amber: "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600",
  blue: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600",
};

const fieldCls = (invalid: boolean) =>
  `w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
    invalid ? "border-rose-400 dark:border-rose-600" : "border-slate-200 dark:border-slate-700"
  }`;

interface Props {
  open: boolean;
  aksi: AksiPerubahan | null;
  noRfc: string;
  submitting: boolean;
  /** Error dari server (validasi 422 / 403), ditampilkan di dalam modal. */
  serverErrors?: Record<string, string>;
  serverMessage?: string | null;
  onCancel: () => void;
  onSubmit: (payload: AksiPayload) => void;
}

export default function PerubahanItAksiModal({
  open,
  aksi,
  noRfc,
  submitting,
  serverErrors,
  serverMessage,
  onCancel,
  onSubmit,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [catatan, setCatatan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const cfg = aksi ? AKSI_CONFIG[aksi] : null;
  const today = new Date().toISOString().slice(0, 10);

  // Reset isian setiap kali modal dibuka untuk aksi tertentu
  useEffect(() => {
    if (open) {
      setCatatan("");
      setTanggal(aksi === "laksanakan" ? today : "");
      setLocalErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, aksi]);

  useModalA11y(open, submitting, onCancel, dialogRef);

  if (!open || !cfg || !aksi) return null;

  const errors = { ...serverErrors, ...localErrors };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const errs: Record<string, string> = {};
    if (cfg.catatan === "required" && !catatan.trim()) errs.catatan = `${cfg.catatanLabel} wajib diisi.`;
    if (cfg.tanggal) {
      if (!tanggal) errs.tanggal_pelaksanaan = "Tanggal pelaksanaan wajib diisi.";
      else if (tanggal > today) errs.tanggal_pelaksanaan = "Tanggal pelaksanaan tidak boleh melebihi hari ini.";
    }
    setLocalErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      catatan: catatan.trim() || undefined,
      tanggal_pelaksanaan: cfg.tanggal ? tanggal : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aksi-rfc-title"
        aria-describedby="aksi-rfc-desc"
        aria-busy={submitting}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 id="aksi-rfc-title" className="text-base font-extrabold text-slate-800 dark:text-white">
              {cfg.title}
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{noRfc}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4 px-6 py-5">
          <p id="aksi-rfc-desc" className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {cfg.description}
          </p>

          {serverMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle size={15} className="mt-px flex-shrink-0" aria-hidden="true" />
              <span>{serverMessage}</span>
            </div>
          )}

          {cfg.tanggal && (
            <div>
              <label htmlFor="aksi-tanggal" className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
                Tanggal pelaksanaan
              </label>
              <input
                id="aksi-tanggal"
                type="date"
                max={today}
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                aria-invalid={errors.tanggal_pelaksanaan ? true : undefined}
                aria-describedby={errors.tanggal_pelaksanaan ? "aksi-tanggal-err" : undefined}
                className={fieldCls(!!errors.tanggal_pelaksanaan)}
              />
              {errors.tanggal_pelaksanaan && (
                <p id="aksi-tanggal-err" className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {errors.tanggal_pelaksanaan}
                </p>
              )}
            </div>
          )}

          {cfg.catatan !== "none" && (
            <div>
              <label htmlFor="aksi-catatan" className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
                {cfg.catatanLabel}
              </label>
              <textarea
                id="aksi-catatan"
                rows={4}
                maxLength={5000}
                autoFocus={!cfg.tanggal}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder={cfg.catatanPlaceholder}
                aria-invalid={errors.catatan ? true : undefined}
                aria-describedby={errors.catatan ? "aksi-catatan-err" : undefined}
                className={fieldCls(!!errors.catatan)}
              />
              {errors.catatan && (
                <p id="aksi-catatan-err" className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {errors.catatan}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${TONE_BTN[cfg.tone]}`}
            >
              {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {submitting ? cfg.busy : cfg.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
