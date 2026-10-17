"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import FormActions from "@/components/smki/pelaporan-insiden/FormActions";
import FormField from "@/components/ui/FormField";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAuthStore } from "@/store/useAuthStore";
import {
  createPerangkatPribadi, updatePerangkatPribadi, fetchPerangkatPribadiDetail, perangkatErrMsg,
  JENIS_PERANGKAT_OPTIONS, PerangkatItem, PerangkatPribadiPayload,
} from "@/services/smki/perangkatPribadiService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

const emptyItem = (): PerangkatItem => ({ nama: "", nip: "", jenis_perangkat: "", merek_tipe: "", nomor_seri: "" });

/** Organism: form tambah/ubah formulir BYOD FR-045 (pola halaman Tambah Laporan FR-016). */
export default function PerangkatPribadiForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const back = () => router.push("/smki/perangkat-pribadi");
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
      back();
    } catch (err) {
      toast.error(perangkatErrMsg(err, "Gagal menyimpan formulir BYOD"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <HeroBanner
        title={isEdit ? "Edit Formulir BYOD" : "Tambah Formulir BYOD"}
        subtitle="FORMULIR PENGGUNAAN PERANGKAT PRIBADI / BYOD (FR-045) - Lengkapi identitas pejabat dan daftar perangkat pribadi."
        breadcrumb={[
          { label: "Daftar Formulir BYOD", href: "/smki/perangkat-pribadi" },
          { label: isEdit ? "Edit Formulir BYOD" : "Tambah Formulir BYOD" },
        ]}
        docNo="FR-045/KOM.03/05/SANDIKAMI"
      />
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Formulir BYOD — Identitas, Daftar Perangkat & Pengesahan
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tanda * menunjukkan isian wajib.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 size={22} className="animate-spin mx-auto mb-2" />
            Memuat data formulir BYOD...
          </div>
        ) : (
          <div className={submitting ? "pointer-events-none opacity-70" : ""}>
            <form className="p-6 sm:p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <SectionTitle title="Yang Bertanda Tangan" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Nama" required>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
                  </FormField>
                  <FormField label="NIP">
                    <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Nomor Induk Pegawai" className={inputCls} />
                  </FormField>
                  <div className="hidden md:block" />
                  <FormField label="Unit Kerja" required>
                    <input type="text" value={unitKerja} onChange={(e) => setUnitKerjaInput(e.target.value)} placeholder="Contoh: Bidang Aptika" className={inputCls} />
                  </FormField>
                  <FormField label="Jabatan" required hint="Otomatis terisi “Kepala [Unit Kerja]”, dapat diubah.">
                    <input type="text" value={jabatan} onChange={(e) => setJabatanInput(e.target.value)} placeholder="Kepala [Unit Kerja]" className={inputCls} />
                  </FormField>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Daftar Perangkat Pribadi" />
                  <span className="text-xs text-slate-400">{perangkat.length} perangkat</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
                  Penggunaan perangkat pribadi di {unitKerja || "[Unit Kerja]"} adalah sebagai berikut. Jenis Perangkat TI: Laptop / PC / Tab.
                </p>
                <div className="flex flex-col gap-4">
                  {perangkat.map((p, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Perangkat Pribadi</span>
                        </div>
                        {perangkat.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        <FormField label="Nama Pemilik">
                          <input type="text" value={p.nama} onChange={(e) => updateItem(idx, { nama: e.target.value })} placeholder="Nama pemilik" className={inputCls} />
                        </FormField>
                        <FormField label="NIP">
                          <input type="text" value={p.nip || ""} onChange={(e) => updateItem(idx, { nip: e.target.value })} placeholder="NIP" className={inputCls} />
                        </FormField>
                        <FormField label="Jenis Perangkat TI">
                          <select value={p.jenis_perangkat} onChange={(e) => updateItem(idx, { jenis_perangkat: e.target.value as PerangkatItem["jenis_perangkat"] })} className={inputCls}>
                            <option value="">Pilih jenis</option>
                            {JENIS_PERANGKAT_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                          </select>
                        </FormField>
                        <FormField label="Merek/Tipe">
                          <input type="text" value={p.merek_tipe} onChange={(e) => updateItem(idx, { merek_tipe: e.target.value })} placeholder="Merek / tipe" className={inputCls} />
                        </FormField>
                        <FormField label="Nomor Seri">
                          <input type="text" value={p.nomor_seri} onChange={(e) => updateItem(idx, { nomor_seri: e.target.value })} placeholder="Nomor seri" className={inputCls} />
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    <Plus size={16} /> Tambah Perangkat
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <SectionTitle title="Pengesahan" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Ditandatangani di">
                    <input type="text" value={ditandatanganiDi} onChange={(e) => setDitandatanganiDi(e.target.value)} placeholder="Bandung" className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal Tanda Tangan">
                    <input type="date" value={tanggalTtd} onChange={(e) => setTanggalTtd(e.target.value)} className={inputCls} />
                  </FormField>
                </div>
              </div>

              <FormActions
                onCancel={back}
                submitLabel={isEdit ? "Simpan Perubahan" : "Simpan Formulir BYOD"}
                submitting={submitting}
                note="Periksa kembali data sebelum menyimpan formulir BYOD."
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
