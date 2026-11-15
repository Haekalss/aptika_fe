"use client";

import { useState } from "react";
import { Plus, Pencil, Power, Check, X, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { saveJenis, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import type { JenisKonfigurasiDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const inputBase =
  "h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500";

/** Tab Data Master — Jenis Konfigurasi (UC-08): CRUD + nonaktif (data terpakai tidak bisa dihapus). */
export default function Fr048MasterJenis({ items, onChanged }: { items: JenisKonfigurasiDto[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [busy, setBusy] = useState(false);

  const resetForm = () => { setEditingId(null); setNama(""); setKeterangan(""); };
  const startEdit = (j: JenisKonfigurasiDto) => { setEditingId(j.id); setNama(j.nama); setKeterangan(j.keterangan ?? ""); };

  const submit = async () => {
    setBusy(true);
    try {
      await saveJenis({ id: editingId ?? undefined, nama, keterangan: keterangan || null });
      showToast.success(editingId ? "Jenis Konfigurasi diperbarui." : "Jenis Konfigurasi ditambahkan.");
      resetForm();
      onChanged();
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menyimpan Jenis Konfigurasi."));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (j: JenisKonfigurasiDto) => {
    setBusy(true);
    try {
      await saveJenis({ id: j.id, nama: j.nama, keterangan: j.keterangan, isActive: !j.isActive });
      showToast.success(j.isActive ? "Jenis Konfigurasi dinonaktifkan. Tidak tampil di pilihan baru." : "Jenis Konfigurasi diaktifkan kembali.");
      onChanged();
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal mengubah status."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Form tambah/ubah */}
      <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-dashed border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Jenis Konfigurasi *" aria-label="Nama jenis konfigurasi" className={`${inputBase} flex-1`} />
        <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Keterangan (opsional)" aria-label="Keterangan" className={`${inputBase} flex-1`} />
        <div className="flex gap-2">
          <button type="button" onClick={submit} disabled={busy || !nama.trim()} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50">
            {busy ? <Loader2 size={13} className="animate-spin" /> : editingId ? <Check size={13} /> : <Plus size={13} />}
            {editingId ? "Simpan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} aria-label="Batal ubah" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Daftar */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[9px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-bold">Nama</th>
              <th className="px-3 py-2 font-bold">Keterangan</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((j) => (
              <tr key={j.id} className="border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{j.nama}</td>
                <td className="px-3 py-2 text-slate-500 max-w-[220px] truncate">{j.keterangan ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-md border ${j.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"}`}>
                    {j.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => startEdit(j)} aria-label="Ubah" title="Ubah" className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40"><Pencil size={13} /></button>
                    <button type="button" onClick={() => toggle(j)} disabled={busy} aria-label={j.isActive ? "Nonaktifkan" : "Aktifkan"} title={j.isActive ? "Nonaktifkan" : "Aktifkan"} className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"><Power size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
