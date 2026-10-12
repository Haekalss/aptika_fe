"use client";

import React, { useState, useEffect } from "react";
import { X, ClipboardCheck, Plus, Trash2, Loader2, CalendarDays, MapPin } from "lucide-react";
import {
  EvaluasiKepatuhan,
  EvaluasiItem,
  EvaluasiFormPayload,
  EVALUASI_STATUS_OPTIONS,
} from "@/services/smki/evaluasiKepatuhanService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EvaluasiFormPayload) => Promise<void>;
  initialData?: EvaluasiKepatuhan | null;
}

const emptyItem = (): EvaluasiItem => ({ dokumen_kepatuhan: "", deskripsi: "", evaluasi_status: "Dalam Proses" });
const today = () => new Date().toISOString().slice(0, 10);

const inputCls = (err?: boolean) =>
  `w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${
    err ? "border-red-400" : "border-slate-200 dark:border-slate-700"
  }`;

export default function EvaluasiKepatuhanFormModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [tanggalEvaluasi, setTanggalEvaluasi] = useState(today());
  const [ditandatanganDi, setDitandatanganDi] = useState("");
  const [tanggalTtd, setTanggalTtd] = useState("");
  const [items, setItems] = useState<EvaluasiItem[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setTanggalEvaluasi(initialData.tanggal_evaluasi || today());
      setDitandatanganDi(initialData.ditandatangani_di || "");
      setTanggalTtd(initialData.tanggal_ttd || "");
      setItems(
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((i) => ({
              dokumen_kepatuhan: i.dokumen_kepatuhan,
              deskripsi: i.deskripsi,
              evaluasi_status: i.evaluasi_status,
            }))
          : [emptyItem()]
      );
    } else {
      setTanggalEvaluasi(today());
      setDitandatanganDi("");
      setTanggalTtd("");
      setItems([emptyItem()]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const updateItem = (idx: number, field: keyof EvaluasiItem, value: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!tanggalEvaluasi) next.tanggalEvaluasi = "Tanggal evaluasi wajib diisi";
    items.forEach((it, i) => {
      if (!it.dokumen_kepatuhan.trim()) next[`dok_${i}`] = "Dokumen Kepatuhan wajib diisi";
      if (!it.deskripsi.trim()) next[`desk_${i}`] = "Deskripsi wajib diisi";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        tanggal_evaluasi: tanggalEvaluasi,
        ditandatangani_di: ditandatanganDi.trim() || null,
        tanggal_ttd: tanggalTtd || null,
        items: items.map((it) => ({
          dokumen_kepatuhan: it.dokumen_kepatuhan.trim(),
          deskripsi: it.deskripsi.trim(),
          evaluasi_status: it.evaluasi_status,
        })),
      });
      onClose();
    } catch {
      // pesan error ditampilkan oleh pemanggil (page)
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold">{isEdit ? "Edit Evaluasi Kepatuhan" : "Tambah Evaluasi Kepatuhan"}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Evaluasi kepatuhan terhadap regulasi dan aturan lain yang mendukung layanan utama (FR-044).
              </p>
            </div>
          </div>
          <button type="button" onClick={loading ? undefined : onClose} className="text-white/80 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Tanggal Evaluasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={tanggalEvaluasi} onChange={(e) => setTanggalEvaluasi(e.target.value)} className={`${inputCls(!!errors.tanggalEvaluasi)} pl-9`} />
              </div>
              {errors.tanggalEvaluasi && <p className="text-[11px] text-red-500 mt-1">{errors.tanggalEvaluasi}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Ditandatangani di</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={ditandatanganDi} onChange={(e) => setDitandatanganDi(e.target.value)} placeholder="Contoh: Bandung" className={`${inputCls()} pl-9`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tanggal Tanda Tangan</label>
              <div className="relative">
                <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={tanggalTtd} onChange={(e) => setTanggalTtd(e.target.value)} className={`${inputCls()} pl-9`} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Rincian Dokumen Kepatuhan</h4>
              <span className="text-xs text-slate-400">{items.length} dokumen</span>
            </div>

            <div className="flex flex-col gap-4">
              {items.map((it, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Dokumen Kepatuhan</span>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
                        <Trash2 size={14} /> Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Dokumen Kepatuhan <span className="text-red-500">*</span></label>
                      <input
                        value={it.dokumen_kepatuhan}
                        onChange={(e) => updateItem(idx, "dokumen_kepatuhan", e.target.value)}
                        placeholder="Contoh: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi"
                        className={inputCls(!!errors[`dok_${idx}`])}
                      />
                      {errors[`dok_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{errors[`dok_${idx}`]}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Evaluasi/Status <span className="text-red-500">*</span></label>
                      <select value={it.evaluasi_status} onChange={(e) => updateItem(idx, "evaluasi_status", e.target.value)} className={inputCls()}>
                        {EVALUASI_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                      <textarea
                        value={it.deskripsi}
                        onChange={(e) => updateItem(idx, "deskripsi", e.target.value)}
                        rows={2}
                        placeholder="Uraian singkat isi regulasi/aturan dan hasil evaluasinya"
                        className={`${inputCls(!!errors[`desk_${idx}`])} resize-none`}
                      />
                      {errors[`desk_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{errors[`desk_${idx}`]}</p>}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Plus size={16} /> Tambah Dokumen Kepatuhan
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" disabled={loading} onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Data Evaluasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
