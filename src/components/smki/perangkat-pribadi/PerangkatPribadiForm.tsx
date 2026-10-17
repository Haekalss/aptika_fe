"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, Plus, Trash2, UserRound, MonitorSmartphone, PenLine } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import {
  createPerangkatPribadi, updatePerangkatPribadi, fetchPerangkatPribadiDetail, perangkatErrMsg,
  JENIS_PERANGKAT_OPTIONS, PerangkatItem, PerangkatPribadiPayload,
} from "@/services/smki/perangkatPribadiService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const emptyItem = (): PerangkatItem => ({ nama: "", nip: "", jenis_perangkat: "", merek_tipe: "", nomor_seri: "" });

export default function PerangkatPribadiForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { bidang } = useAuthStore();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  // null = belum diubah user: unit kerja mengikuti bidang user (tambah baru),
  // jabatan mengikuti pola "Kepala [Unit Kerja]".
  const [unitKerjaInput, setUnitKerjaInput] = useState<string | null>(null);
  const [jabatanInput, setJabatanInput] = useState<string | null>(null);
  const unitKerja = unitKerjaInput ?? (isEdit ? "" : bidang?.name || "");
  const jabatan = jabatanInput ?? (unitKerja ? `Kepala ${unitKerja}` : "");
  const [perangkat, setPerangkat] = useState<PerangkatItem[]>([emptyItem()]);
  const [ditandatanganiDi, setDitandatanganiDi] = useState("Bandung");
  const [tanggalTtd, setTanggalTtd] = useState("");

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await fetchPerangkatPribadiDetail(id);
        if (res?.success) {
          const d = res.data;
          setNama(d.nama || "");
          setNip(d.nip || "");
          setUnitKerjaInput(d.unit_kerja || "");
          setJabatanInput(d.jabatan || "");
          setPerangkat(d.perangkat?.length ? d.perangkat.map((p: PerangkatItem) => ({ ...p, nip: p.nip || "" })) : [emptyItem()]);
          setDitandatanganiDi(d.ditandatangani_di || "");
          setTanggalTtd(d.tanggal_ttd || "");
        }
      } catch (err) {
        toast.error(perangkatErrMsg(err, "Gagal memuat data formulir"));
        router.push("/smki/perangkat-pribadi");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router]);

  const updateItem = (idx: number, patch: Partial<PerangkatItem>) =>
    setPerangkat((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addItem = () => setPerangkat((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setPerangkat((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!nama.trim()) return toast.error("Nama wajib diisi.");
    if (!unitKerja.trim()) return toast.error("Unit Kerja wajib diisi.");
    if (!jabatan.trim()) return toast.error("Jabatan wajib diisi.");

    const filled = perangkat.filter((p) => p.nama || p.nip || p.jenis_perangkat || p.merek_tipe || p.nomor_seri);
    if (filled.length === 0) return toast.error("Minimal satu perangkat pribadi harus diisi.");
    for (let n = 0; n < filled.length; n++) {
      const p = filled[n];
      if (!p.nama.trim() || !p.jenis_perangkat || !p.merek_tipe.trim() || !p.nomor_seri.trim()) {
        return toast.error(`Perangkat ke-${n + 1}: Nama, Jenis, Merek/Tipe, dan Nomor Seri wajib diisi.`);
      }
    }

    const payload: PerangkatPribadiPayload = {
      nama: nama.trim(),
      nip: nip.trim() || null,
      jabatan: jabatan.trim(),
      unit_kerja: unitKerja.trim(),
      ditandatangani_di: ditandatanganiDi.trim() || null,
      tanggal_ttd: tanggalTtd || null,
      perangkat: filled.map((p) => ({ ...p, nip: p.nip?.trim() || null })),
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updatePerangkatPribadi(id, payload);
        toast.success("Formulir BYOD berhasil diperbarui.");
      } else {
        await createPerangkatPribadi(payload);
        toast.success("Formulir BYOD berhasil disimpan.");
      }
      router.push("/smki/perangkat-pribadi");
    } catch (err) {
      toast.error(perangkatErrMsg(err, "Gagal menyimpan formulir BYOD"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200";
  const labelCls = "block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5";
  const cardCls = "rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6";

  const sectionHead = (icon: React.ReactNode, title: string, desc: string) => (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-600 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">Memuat data formulir...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-12">
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => router.push("/smki/perangkat-pribadi")} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="text-[10.5px] font-extrabold tracking-widest uppercase text-slate-400 mb-1">FR-045 &gt; {isEdit ? "Ubah Formulir" : "Formulir Baru"}</div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{isEdit ? "Ubah Formulir BYOD" : "Tambah Formulir BYOD"}</h1>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">FR-045/KOM.03/05/SANDIKAMI · Rev 0.0 · Berlaku 13 Juli 2023</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => router.push("/smki/perangkat-pribadi")} disabled={submitting} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all">Batal</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isEdit ? "Simpan Perubahan" : "Simpan Formulir"}
          </button>
        </div>
      </div>

      <section className={cardCls}>
        {sectionHead(<UserRound size={18} />, "Yang Bertanda Tangan", "Identitas Kepala Unit Kerja yang menyatakan.")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nama <span className="text-rose-500">*</span></label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>NIP</label>
            <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Nomor Induk Pegawai" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Unit Kerja <span className="text-rose-500">*</span></label>
            <input type="text" value={unitKerja} onChange={(e) => setUnitKerjaInput(e.target.value)} placeholder="Contoh: Bidang Aptika" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Jabatan <span className="text-rose-500">*</span></label>
            <input type="text" value={jabatan} onChange={(e) => setJabatanInput(e.target.value)} placeholder="Kepala [Unit Kerja]" className={inputCls} />
            <p className="text-[10.5px] text-slate-400 mt-1">Otomatis terisi “Kepala [Unit Kerja]”, dapat diubah.</p>
          </div>
        </div>
      </section>

      <section className={cardCls}>
        {sectionHead(<MonitorSmartphone size={18} />, "Daftar Perangkat Pribadi", `Penggunaan perangkat pribadi di ${unitKerja || "[Unit Kerja]"} adalah sebagai berikut:`)}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 w-12 text-center">No</th>
                <th className="px-3 py-2.5">Nama</th>
                <th className="px-3 py-2.5">NIP</th>
                <th className="px-3 py-2.5">Jenis Perangkat TI</th>
                <th className="px-3 py-2.5">Merek/Tipe</th>
                <th className="px-3 py-2.5">Nomor Seri</th>
                <th className="px-3 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {perangkat.map((p, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-2 py-2"><input type="text" value={p.nama} onChange={(e) => updateItem(idx, { nama: e.target.value })} placeholder="Nama pemilik" className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="text" value={p.nip || ""} onChange={(e) => updateItem(idx, { nip: e.target.value })} placeholder="NIP" className={inputCls} /></td>
                  <td className="px-2 py-2">
                    <select value={p.jenis_perangkat} onChange={(e) => updateItem(idx, { jenis_perangkat: e.target.value as PerangkatItem["jenis_perangkat"] })} className={inputCls}>
                      <option value="">Pilih</option>
                      {JENIS_PERANGKAT_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2"><input type="text" value={p.merek_tipe} onChange={(e) => updateItem(idx, { merek_tipe: e.target.value })} placeholder="Merek / tipe" className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="text" value={p.nomor_seri} onChange={(e) => updateItem(idx, { nomor_seri: e.target.value })} placeholder="Nomor seri" className={inputCls} /></td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeItem(idx)} disabled={perangkat.length === 1} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-800/60 disabled:opacity-30" title="Hapus baris">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
          <Plus size={14} /> Tambah Perangkat
        </button>
        <p className="mt-3 text-[11px] text-slate-400 font-medium">Jenis Perangkat TI dapat diisi dengan: Laptop / PC / Tab.</p>
      </section>

      <section className={cardCls}>
        {sectionHead(<PenLine size={18} />, "Pengesahan", "Kota dan tanggal surat pernyataan (spesimen TTE Kepala Unit Kerja ditambahkan saat dokumen dicetak).")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Kota (Ditandatangani di)</label>
            <input type="text" value={ditandatanganiDi} onChange={(e) => setDitandatanganiDi(e.target.value)} placeholder="Bandung" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tanggal</label>
            <input type="date" value={tanggalTtd} onChange={(e) => setTanggalTtd(e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>
    </form>
  );
}
