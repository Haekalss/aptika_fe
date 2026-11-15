"use client";

import { useState } from "react";
import { Plus, Pencil, Power, Check, X, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { saveObjek, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import type { ObjekDto, JenisKonfigurasiDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const inputBase =
  "h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500";

/** Tab Data Master — Objek (UC-08): terhubung ke 1 Jenis Konfigurasi, nama unik, nonaktif bukan hapus. */
export default function Fr048MasterObjek({
  items,
  jenisItems,
  onChanged,
}: {
  items: ObjekDto[];
  jenisItems: JenisKonfigurasiDto[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [jenisId, setJenisId] = useState<number | 0>(0);
  const [nama, setNama] = useState("");
  const [busy, setBusy] = useState(false);

  const resetForm = () => { setEditingId(null); setJenisId(0); setNama(""); };
  const startEdit = (o: ObjekDto) => { setEditingId(o.id); setJenisId(o.jenisKonfigurasiId); setNama(o.nama); };

  const submit = async () => {
    setBusy(true);
    try {
      await saveObjek({ id: editingId ?? undefined, jenisKonfigurasiId: Number(jenisId), nama });
      showToast.success(editingId ? "Objek diperbarui." : "Objek ditambahkan.");
      resetForm();
      onChanged();
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menyimpan Objek."));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (o: ObjekDto) => {
    setBusy(true);
    try {
      await saveObjek({ id: o.id, jenisKonfigurasiId: o.jenisKonfigurasiId, nama: o.nama, isActive: !o.isActive });
      showToast.success(o.isActive ? "Objek dinonaktifkan." : "Objek diaktifkan kembali.");
      onChanged();
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal mengubah status."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-dashed border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-3">
        <select value={jenisId || ""} onChange={(e) => setJenisId(e.target.value === "" ? 0 : Number(e.target.value))} aria-label="Jenis Konfigurasi" className={`${inputBase} sm:w-56`}>
          <option value="">Pilih Jenis...</option>
          {jenisItems.filter((j) => j.isActive).map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
        </select>
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Objek, mis. SRV-PROD-01 *" aria-label="Nama objek" className={`${inputBase} flex-1`} />
        <div className="flex gap-2">
          <button type="button" onClick={submit} disabled={busy || !nama.trim() || !jenisId} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50">
            {busy ? <Loader2 size={13} className="animate-spin" /> : editingId ? <Check size={13} /> : <Plus size={13} />}
            {editingId ? "Simpan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} aria-label="Batal ubah" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400"><X size={14} /></button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[9px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-bold">Nama Objek</th>
              <th className="px-3 py-2 font-bold">Jenis Konfigurasi</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{o.nama}</td>
                <td className="px-3 py-2 text-slate-500">{o.jenisKonfigurasiNama}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-md border ${o.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"}`}>
                    {o.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => startEdit(o)} aria-label="Ubah" title="Ubah" className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40"><Pencil size={13} /></button>
                    <button type="button" onClick={() => toggle(o)} disabled={busy} aria-label={o.isActive ? "Nonaktifkan" : "Aktifkan"} title={o.isActive ? "Nonaktifkan" : "Aktifkan"} className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"><Power size={13} /></button>
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
