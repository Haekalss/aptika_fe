"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { getNilaiStandar, saveNilaiStandar, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import type { ObjekDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const inputBase =
  "h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500";

/**
 * Tab Data Master — Nilai Standar (UC-08).
 * Baris berlaku untuk pemantauan BARU; pemantauan yang sudah dibuat tidak berubah.
 */
export default function Fr048MasterNilaiStandar({ objekItems }: { objekItems: ObjekDto[] }) {
  const [objekId, setObjekId] = useState<number | 0>(0);
  const [rows, setRows] = useState<{ key: string; namaKonfigurasi: string; nilaiStandar: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sinkronisasi prop objekId → state baris (adjust state during render)
  const [lastObjekId, setLastObjekId] = useState(objekId);
  if (objekId !== lastObjekId) {
    setLastObjekId(objekId);
    setRows([]);
    setLoading(objekId !== 0);
  }

  useEffect(() => {
    if (!objekId) return;
    let mounted = true;
    getNilaiStandar(objekId)
      .then((data) => mounted && setRows(data.filter((n) => n.isActive).map((n) => ({ key: String(n.id), namaKonfigurasi: n.namaKonfigurasi, nilaiStandar: n.nilaiStandar }))))
      .catch((err) => mounted && showToast.error(getApiErrorMessage(err, "Gagal memuat nilai standar.")))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [objekId]);

  const updateRow = (key: string, patch: Partial<{ namaKonfigurasi: string; nilaiStandar: string }>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, { key: `new-${Date.now()}`, namaKonfigurasi: "", nilaiStandar: "" }]);
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const simpan = async () => {
    if (!objekId) return;
    setBusy(true);
    try {
      await saveNilaiStandar(objekId, rows.map((r) => ({ namaKonfigurasi: r.namaKonfigurasi, nilaiStandar: r.nilaiStandar })));
      showToast.success("Nilai standar tersimpan. Berlaku untuk pemantauan berikutnya.");
      const data = await getNilaiStandar(objekId);
      setRows(data.filter((n) => n.isActive).map((n) => ({ key: String(n.id), namaKonfigurasi: n.namaKonfigurasi, nilaiStandar: n.nilaiStandar })));
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menyimpan nilai standar."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select value={objekId || ""} onChange={(e) => setObjekId(e.target.value === "" ? 0 : Number(e.target.value))} aria-label="Pilih objek" className={`${inputBase} sm:w-64`}>
          <option value="">Pilih Objek...</option>
          {objekItems.filter((o) => o.isActive).map((o) => <option key={o.id} value={o.id}>{o.nama} ({o.jenisKonfigurasiNama})</option>)}
        </select>
        {objekId !== 0 && (
          <>
            <button type="button" onClick={addRow} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Plus size={13} /> Tambah Baris</button>
            <button type="button" onClick={simpan} disabled={busy} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50">{busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Simpan</button>
          </>
        )}
      </div>

      <p className="text-[10px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
        Perubahan Nilai Standar hanya berlaku untuk pemantauan yang dibuat setelah disimpan. Pemantauan lama tidak berubah, dan baris standar tidak dapat dihapus oleh Pelaksana.
      </p>

      {!objekId ? (
        <p className="text-[11px] text-slate-400 italic text-center py-6">Pilih objek untuk mengelola nilai standarnya.</p>
      ) : loading ? (
        <p className="text-[11px] text-slate-400 italic py-6 text-center">Memuat nilai standar...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left min-w-[480px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[9px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2 font-bold w-1/2">Nama Konfigurasi</th>
                <th className="px-3 py-2 font-bold w-1/2">Nilai Standar</th>
                <th className="px-3 py-2 font-bold w-14 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-[11px] text-slate-400 italic">Belum ada nilai standar untuk objek ini.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.key} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-1.5"><input value={r.namaKonfigurasi} onChange={(e) => updateRow(r.key, { namaKonfigurasi: e.target.value })} placeholder="Nama konfigurasi..." aria-label="Nama Konfigurasi" className={`${inputBase} w-full`} /></td>
                  <td className="px-3 py-1.5"><input value={r.nilaiStandar} onChange={(e) => updateRow(r.key, { nilaiStandar: e.target.value })} placeholder="Nilai standar..." aria-label="Nilai Standar" className={`${inputBase} w-full`} /></td>
                  <td className="px-3 py-1.5 text-center">
                    <button type="button" onClick={() => removeRow(r.key)} aria-label="Hapus baris" className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
