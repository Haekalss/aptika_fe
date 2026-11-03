"use client";

import React, { useState, useEffect } from "react";
import { X, Video, Plus, Trash2, Loader2, CalendarDays, Copy, HardDrive, User } from "lucide-react";
import toast from "react-hot-toast";
import {
  PemeriksaanCctv, CctvItem, PemeriksaanFormPayload,
  LINGKUP_OPTIONS, KESESUAIAN_OPTIONS, FUNGSI_OPTIONS, REKAMAN_OPTIONS, OBSTACLE_OPTIONS,
  Lingkup, KesesuaianWaktu, fetchPemeriksaanTerakhir,
} from "@/services/smki/pemeriksaanCctvService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PemeriksaanFormPayload) => Promise<void>;
  initialData?: PemeriksaanCctv | null;
}

const emptyItem = (): CctvItem => ({
  kode_cctv: "", nama_cctv: "", lokasi: "", fungsi: "Berfungsi", rekaman: "Baik", obstacle: "Tidak Ada",
  keterangan: "", tindak_lanjut: "", petugas: "",
});
const today = () => new Date().toISOString().slice(0, 10);

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${
    err ? "border-red-400" : "border-slate-200 dark:border-slate-700"
  }`;
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1";

export default function PemeriksaanCctvFormModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [lingkup, setLingkup] = useState<Lingkup>("Data Center");
  const [perangkat, setPerangkat] = useState("");
  const [tanggal, setTanggal] = useState(today());
  const [kesesuaian, setKesesuaian] = useState<KesesuaianWaktu>("Sesuai");
  const [pemeriksa, setPemeriksa] = useState("");
  const [items, setItems] = useState<CctvItem[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setLingkup(initialData.lingkup);
      setPerangkat(initialData.perangkat_perekaman);
      setTanggal(initialData.tanggal_pemeriksaan);
      setKesesuaian(initialData.kesesuaian_waktu);
      setPemeriksa(initialData.nama_pemeriksa || "");
      setItems(
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((i) => ({
              kode_cctv: i.kode_cctv, nama_cctv: i.nama_cctv, lokasi: i.lokasi,
              fungsi: i.fungsi, rekaman: i.rekaman, obstacle: i.obstacle,
              keterangan: i.keterangan || "", tindak_lanjut: i.tindak_lanjut || "", petugas: i.petugas || "",
            }))
          : [emptyItem()]
      );
    } else {
      setLingkup("Data Center"); setPerangkat(""); setTanggal(today()); setKesesuaian("Sesuai"); setPemeriksa("");
      setItems([emptyItem()]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const updateItem = (idx: number, field: keyof CctvItem, value: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  // Salin daftar CCTV (kode, nama, lokasi, petugas) dari pemeriksaan terakhir; hasil pemeriksaan direset.
  const handleCopyLast = async () => {
    setCopying(true);
    try {
      const res = await fetchPemeriksaanTerakhir(lingkup);
      if (!res.data || res.data.items.length === 0) {
        toast("Belum ada pemeriksaan sebelumnya untuk disalin.", { icon: "ℹ️" });
        return;
      }
      setItems(res.data.items.map((i) => ({ ...emptyItem(), kode_cctv: i.kode_cctv, nama_cctv: i.nama_cctv, lokasi: i.lokasi, petugas: i.petugas || "" })));
      if (!perangkat.trim()) setPerangkat(res.data.perangkat_perekaman);
      if (!pemeriksa.trim() && res.data.nama_pemeriksa) setPemeriksa(res.data.nama_pemeriksa);
      toast.success(`${res.data.items.length} CCTV disalin dari pemeriksaan ${res.data.tanggal_pemeriksaan}.`);
    } catch {
      toast.error("Gagal menyalin data pemeriksaan sebelumnya");
    } finally {
      setCopying(false);
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!perangkat.trim()) next.perangkat = "Perangkat perekaman wajib diisi";
    if (!tanggal) next.tanggal = "Tanggal pemeriksaan wajib diisi";
    items.forEach((it, i) => {
      if (!it.kode_cctv.trim()) next[`kode_${i}`] = "Wajib diisi";
      if (!it.nama_cctv.trim()) next[`nama_${i}`] = "Wajib diisi";
      if (!it.lokasi.trim()) next[`lokasi_${i}`] = "Wajib diisi";
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
        lingkup,
        perangkat_perekaman: perangkat.trim(),
        tanggal_pemeriksaan: tanggal,
        kesesuaian_waktu: kesesuaian,
        nama_pemeriksa: pemeriksa.trim() || null,
        items: items.map((it) => ({
          kode_cctv: it.kode_cctv.trim(), nama_cctv: it.nama_cctv.trim(), lokasi: it.lokasi.trim(),
          fungsi: it.fungsi, rekaman: it.rekaman, obstacle: it.obstacle,
          keterangan: (it.keterangan || "").trim() || null,
          tindak_lanjut: (it.tindak_lanjut || "").trim() || null,
          petugas: (it.petugas || "").trim() || null,
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
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center"><Video size={18} /></div>
            <div>
              <h3 className="text-base font-bold">{isEdit ? "Edit Pemeriksaan CCTV" : "Tambah Pemeriksaan CCTV"}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Checklist monitoring dan pemeliharaan CCTV (FR-037).</p>
            </div>
          </div>
          <button type="button" onClick={loading ? undefined : onClose} className="text-white/80 hover:text-white p-1"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Informasi pemeriksaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Lingkup <span className="text-red-500">*</span></label>
              <select value={lingkup} onChange={(e) => setLingkup(e.target.value as Lingkup)} className={inputCls()}>
                {LINGKUP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Perangkat Perekaman (DVR / NVR) <span className="text-red-500">*</span></label>
              <div className="relative">
                <HardDrive size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={perangkat} onChange={(e) => setPerangkat(e.target.value)} placeholder="Contoh: NVR Hikvision DS-7732NI" className={`${inputCls(!!errors.perangkat)} pl-9`} />
              </div>
              {errors.perangkat && <p className="text-[11px] text-red-500 mt-1">{errors.perangkat}</p>}
            </div>
            <div>
              <label className={labelCls}>Tanggal Pemeriksaan <span className="text-red-500">*</span></label>
              <div className="relative">
                <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={`${inputCls(!!errors.tanggal)} pl-9`} />
              </div>
              {errors.tanggal && <p className="text-[11px] text-red-500 mt-1">{errors.tanggal}</p>}
            </div>
            <div>
              <label className={labelCls}>Kesesuaian Waktu <span className="text-red-500">*</span></label>
              <select value={kesesuaian} onChange={(e) => setKesesuaian(e.target.value as KesesuaianWaktu)} className={inputCls()}>
                {KESESUAIAN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Nama Pemeriksa (tanda tangan)</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={pemeriksa} onChange={(e) => setPemeriksa(e.target.value)} placeholder="Nama pemeriksa CCTV" className={`${inputCls()} pl-9`} />
              </div>
            </div>
          </div>

          {/* Rincian CCTV */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Rincian CCTV <span className="text-xs font-medium text-slate-400">({items.length})</span></h4>
              {!isEdit && (
                <button type="button" onClick={handleCopyLast} disabled={copying} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40 disabled:opacity-60">
                  {copying ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />} Salin dari pemeriksaan sebelumnya
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {items.map((it, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">CCTV</span>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700"><Trash2 size={14} /> Hapus</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Kode CCTV <span className="text-red-500">*</span></label>
                      <input value={it.kode_cctv} onChange={(e) => updateItem(idx, "kode_cctv", e.target.value)} placeholder="CCTV-DC-01" className={inputCls(!!errors[`kode_${idx}`])} />
                      {errors[`kode_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{errors[`kode_${idx}`]}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Nama CCTV <span className="text-red-500">*</span></label>
                      <input value={it.nama_cctv} onChange={(e) => updateItem(idx, "nama_cctv", e.target.value)} placeholder="CCTV Pintu Masuk" className={inputCls(!!errors[`nama_${idx}`])} />
                      {errors[`nama_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{errors[`nama_${idx}`]}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Lokasi <span className="text-red-500">*</span></label>
                      <input value={it.lokasi} onChange={(e) => updateItem(idx, "lokasi", e.target.value)} placeholder="Lantai 1" className={inputCls(!!errors[`lokasi_${idx}`])} />
                      {errors[`lokasi_${idx}`] && <p className="text-[11px] text-red-500 mt-1">{errors[`lokasi_${idx}`]}</p>}
                    </div>

                    <div>
                      <label className={labelCls}>Fungsi <span className="text-red-500">*</span></label>
                      <select value={it.fungsi} onChange={(e) => updateItem(idx, "fungsi", e.target.value)} className={inputCls()}>
                        {FUNGSI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Rekaman <span className="text-red-500">*</span></label>
                      <select value={it.rekaman} onChange={(e) => updateItem(idx, "rekaman", e.target.value)} className={inputCls()}>
                        {REKAMAN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Obstacle <span className="text-red-500">*</span></label>
                      <select value={it.obstacle} onChange={(e) => updateItem(idx, "obstacle", e.target.value)} className={inputCls()}>
                        {OBSTACLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Keterangan</label>
                      <textarea value={it.keterangan || ""} onChange={(e) => updateItem(idx, "keterangan", e.target.value)} rows={2} className={`${inputCls()} resize-none`} />
                    </div>
                    <div>
                      <label className={labelCls}>Tindak Lanjut</label>
                      <textarea value={it.tindak_lanjut || ""} onChange={(e) => updateItem(idx, "tindak_lanjut", e.target.value)} rows={2} className={`${inputCls()} resize-none`} />
                    </div>
                    <div>
                      <label className={labelCls}>Petugas</label>
                      <input value={it.petugas || ""} onChange={(e) => updateItem(idx, "petugas", e.target.value)} placeholder="Nama petugas" className={inputCls()} />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <Plus size={16} /> Tambah CCTV
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" disabled={loading} onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Data Pemeriksaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
