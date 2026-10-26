"use client";

import React, { useState, useEffect } from "react";
import { X, MessageSquare, AlertCircle } from "lucide-react";
import { KomunikasiItem, KomunikasiType } from "@/services/smki/komunikasiService";

interface KomunikasiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<KomunikasiItem, "id" | "created_at" | "updated_at">) => Promise<void>;
  initialData?: KomunikasiItem | null;
  mode?: "add" | "edit";
  currentPeriode?: string;
}

const KLASIFIKASI_OPTIONS = ["Internal", "Terbatas", "Publik", "Rahasia"];
const FREKUENSI_OPTIONS = ["Tahunan", "Semesteran", "Triwulanan", "Bulanan", "Mingguan", "Sesuai kebutuhan"];

export default function KomunikasiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  currentPeriode = "2022",
}: KomunikasiFormModalProps) {
  const [tipe, setTipe] = useState<KomunikasiType>("internal");
  const [judul, setJudul] = useState("");
  const [klasifikasi, setKlasifikasi] = useState("Internal");
  const [pengirim, setPengirim] = useState("");
  const [penerima, setPenerima] = useState("");
  const [frekuensi, setFrekuensi] = useState("Tahunan");
  const [metode, setMetode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setTipe(initialData.tipe || "internal");
      setJudul(initialData.judul || "");
      setKlasifikasi(initialData.klasifikasi || "Internal");
      setPengirim(initialData.pengirim || "");
      setPenerima(initialData.penerima || "");
      setFrekuensi(initialData.frekuensi || "Tahunan");
      setMetode(initialData.metode || "");
    } else {
      setTipe("internal");
      setJudul("");
      setKlasifikasi("Internal");
      setPengirim("");
      setPenerima("");
      setFrekuensi("Tahunan");
      setMetode("");
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!tipe) errs.tipe = "Tipe komunikasi wajib dipilih";
    if (!judul.trim()) errs.judul = "Judul informasi wajib diisi";
    if (!klasifikasi.trim()) errs.klasifikasi = "Klasifikasi wajib dipilih";
    if (!pengirim.trim()) errs.pengirim = "Pengirim wajib diisi";
    if (!penerima.trim()) errs.penerima = "Penerima wajib diisi";
    if (!frekuensi.trim()) errs.frekuensi = "Frekuensi wajib dipilih";
    if (!metode.trim()) errs.metode = "Metode komunikasi wajib diisi";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        tipe,
        judul: judul.trim(),
        klasifikasi: klasifikasi.trim(),
        pengirim: pengirim.trim(),
        penerima: penerima.trim(),
        frekuensi: frekuensi.trim(),
        metode: metode.trim(),
        periode: initialData?.periode || currentPeriode,
      });
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-[#0d1d36] sticky top-0 z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-0.5">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {isEdit ? "Edit Komunikasi" : "Tambah Komunikasi"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEdit
                  ? `Komunikasi ${tipe === "internal" ? "Internal" : "Eksternal"} · ${judul || "Sosialisasi"}`
                  : `Catat informasi internal atau eksternal · Periode ${currentPeriode}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <AlertCircle size={15} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            {isEdit
              ? "Perubahan disimpan setelah seluruh isian wajib tervalidasi."
              : "Lengkapi tujuh isian wajib. Data akan divalidasi sebelum disimpan."}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Tipe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe <span className="text-rose-500">*</span>
            </label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as KomunikasiType)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="internal">Internal (Komunikasi Internal)</option>
              <option value="eksternal">Eksternal (Komunikasi Eksternal)</option>
            </select>
            {errors.tipe && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.tipe}</p>}
          </div>

          {/* Judul Informasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Informasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul informasi yang dikomunikasikan"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
            />
            {errors.judul && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.judul}</p>}
          </div>

          {/* Klasifikasi & Frekuensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Klasifikasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={klasifikasi}
                onChange={(e) => setKlasifikasi(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {KLASIFIKASI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.klasifikasi && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.klasifikasi}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Frekuensi <span className="text-rose-500">*</span>
              </label>
              <select
                value={frekuensi}
                onChange={(e) => setFrekuensi(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {FREKUENSI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.frekuensi && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.frekuensi}</p>}
            </div>
          </div>

          {/* Pengirim & Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pengirim <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
                placeholder="Unit atau pihak pengirim"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
              />
              {errors.pengirim && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.pengirim}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Penerima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
                placeholder="Unit atau pihak penerima"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
              />
              {errors.penerima && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.penerima}</p>}
            </div>
          </div>

          {/* Metode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Metode <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              placeholder="Contoh: rapat, email, atau situs web"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
            />
            {errors.metode && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.metode}</p>}
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            * Wajib diisi. Klasifikasi, frekuensi, dan metode dapat disesuaikan.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
