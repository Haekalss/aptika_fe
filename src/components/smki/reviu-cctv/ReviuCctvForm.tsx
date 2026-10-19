"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import FormActions from "@/components/smki/pelaporan-insiden/FormActions";
import FormField from "@/components/ui/FormField";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  createReviuCctv, updateReviuCctv, fetchReviuCctvDetail, reviuCctvErrMsg,
  ReviuCctvItem, ReviuCctvPayload,
} from "@/services/smki/reviuCctvService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

const emptyItem = (): ReviuCctvItem => ({ uraian_reviu: "", tindak_lanjut: "", target_selesai: "", keterangan: "" });

/** Organism: form tambah/ubah Reviu CCTV FR-038 (pola halaman Tambah Laporan FR-016). */
export default function ReviuCctvForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const back = () => router.push("/smki/reviu-cctv");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [tanggalReviu, setTanggalReviu] = useState("");
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [obyekReviu, setObyekReviu] = useState("");
  const [pelaksanaReviu, setPelaksanaReviu] = useState("");
  const [items, setItems] = useState<ReviuCctvItem[]>([emptyItem()]);
  const [pengelolaNama, setPengelolaNama] = useState("");
  const [pengelolaNip, setPengelolaNip] = useState("");

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await fetchReviuCctvDetail(id);
        if (res?.success) {
          const d = res.data;
          setTanggalReviu(d.tanggal_reviu || "");
          setPeriodeMulai(d.periode_mulai || "");
          setPeriodeSelesai(d.periode_selesai || "");
          setObyekReviu(d.obyek_reviu || "");
          setPelaksanaReviu(d.pelaksana_reviu || "");
          setItems(
            d.items?.length
              ? d.items.map((i: ReviuCctvItem) => ({
                  ...i,
                  tindak_lanjut: i.tindak_lanjut || "",
                  target_selesai: i.target_selesai || "",
                  keterangan: i.keterangan || "",
                }))
              : [emptyItem()]
          );
          setPengelolaNama(d.pengelola_nama || "");
          setPengelolaNip(d.pengelola_nip || "");
        }
      } catch (err) {
        toast.error(reviuCctvErrMsg(err, "Gagal memuat data formulir reviu CCTV."));
        router.push("/smki/reviu-cctv");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router]);

  const updateItem = (idx: number, patch: Partial<ReviuCctvItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggalReviu || !obyekReviu.trim() || !pelaksanaReviu.trim()) {
      toast.error("Tanggal reviu, obyek reviu, dan pelaksana reviu wajib diisi.");
      return;
    }
    if (periodeMulai && periodeSelesai && periodeSelesai < periodeMulai) {
      toast.error("Akhir periode tidak boleh sebelum awal periode.");
      return;
    }

    // Baris yang seluruh kolomnya kosong diabaikan; uraian reviu wajib bila baris terisi.
    const filled = items.filter((i) => i.uraian_reviu || i.tindak_lanjut || i.target_selesai || i.keterangan);
    if (filled.length === 0) {
      toast.error("Minimal satu uraian reviu harus diisi.");
      return;
    }
    for (let n = 0; n < filled.length; n++) {
      if (!filled[n].uraian_reviu.trim()) {
        toast.error(`Baris ke-${n + 1}: Uraian Reviu wajib diisi.`);
        return;
      }
    }

    const payload: ReviuCctvPayload = {
      tanggal_reviu: tanggalReviu,
      periode_mulai: periodeMulai || null,
      periode_selesai: periodeSelesai || null,
      obyek_reviu: obyekReviu.trim(),
      pelaksana_reviu: pelaksanaReviu.trim(),
      pengelola_nama: pengelolaNama.trim() || null,
      pengelola_nip: pengelolaNip.trim() || null,
      items: filled.map((i) => ({
        uraian_reviu: i.uraian_reviu.trim(),
        tindak_lanjut: (i.tindak_lanjut || "").trim() || null,
        target_selesai: i.target_selesai || null,
        keterangan: (i.keterangan || "").trim() || null,
      })),
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateReviuCctv(id, payload);
        toast.success("Formulir reviu CCTV berhasil diperbarui.");
      } else {
        await createReviuCctv(payload);
        toast.success("Formulir reviu CCTV berhasil disimpan.");
      }
      back();
    } catch (err) {
      toast.error(reviuCctvErrMsg(err, "Gagal menyimpan formulir reviu CCTV."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <HeroBanner
        title={isEdit ? "Edit Reviu CCTV" : "Tambah Reviu CCTV"}
        subtitle="FORMULIR REVIU MONITORING DAN PEMELIHARAAN CCTV (FR-038) - Lengkapi identitas reviu, uraian reviu, dan pengelola CCTV."
        breadcrumb={[
          { label: "Daftar Reviu CCTV", href: "/smki/reviu-cctv" },
          { label: isEdit ? "Edit Reviu CCTV" : "Tambah Reviu CCTV" },
        ]}
        docNo="FR-038/KOM.03.05/SANDIKAMI"
      />
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Formulir Reviu CCTV — Identitas, Uraian Reviu & Pengelola
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tanda * menunjukkan isian wajib.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 size={22} className="animate-spin mx-auto mb-2" />
            Memuat data formulir reviu CCTV...
          </div>
        ) : (
          <div className={submitting ? "pointer-events-none opacity-70" : ""}>
            <form className="p-6 sm:p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <SectionTitle title="Identitas Reviu" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Tanggal Reviu" required>
                    <input type="date" value={tanggalReviu} onChange={(e) => setTanggalReviu(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Periode Reviu (Mulai)">
                    <input type="date" value={periodeMulai} onChange={(e) => setPeriodeMulai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Periode Reviu (Selesai)">
                    <input type="date" value={periodeSelesai} onChange={(e) => setPeriodeSelesai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Obyek Reviu" required className="sm:col-span-2">
                    <input type="text" value={obyekReviu} onChange={(e) => setObyekReviu(e.target.value)} placeholder="Contoh: CCTV Ruang Server Lantai 2" className={inputCls} />
                  </FormField>
                  <FormField label="Pelaksana Reviu" required>
                    <input type="text" value={pelaksanaReviu} onChange={(e) => setPelaksanaReviu(e.target.value)} placeholder="Nama pelaksana / tim reviu" className={inputCls} />
                  </FormField>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Uraian Reviu" />
                  <span className="text-xs text-slate-400">{items.length} baris</span>
                </div>
                <div className="flex flex-col gap-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Uraian Reviu</span>
                        </div>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <FormField label="Uraian Reviu" className="sm:col-span-2 md:col-span-4">
                          <textarea rows={2} value={it.uraian_reviu} onChange={(e) => updateItem(idx, { uraian_reviu: e.target.value })} placeholder="Hasil reviu monitoring / pemeliharaan CCTV" className={`${inputCls} resize-none`} />
                        </FormField>
                        <FormField label="Tindak Lanjut" className="sm:col-span-2">
                          <textarea rows={2} value={it.tindak_lanjut ?? ""} onChange={(e) => updateItem(idx, { tindak_lanjut: e.target.value })} placeholder="Tindak lanjut atas hasil reviu" className={`${inputCls} resize-none`} />
                        </FormField>
                        <FormField label="Target Selesai">
                          <input type="date" value={it.target_selesai ?? ""} onChange={(e) => updateItem(idx, { target_selesai: e.target.value })} className={inputCls} />
                        </FormField>
                        <FormField label="Keterangan">
                          <input type="text" value={it.keterangan ?? ""} onChange={(e) => updateItem(idx, { keterangan: e.target.value })} placeholder="Keterangan" className={inputCls} />
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    <Plus size={16} /> Tambah Uraian Reviu
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <SectionTitle title="Pengelola CCTV" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Pengelola CCTV (Nama)">
                    <input type="text" value={pengelolaNama} onChange={(e) => setPengelolaNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
                  </FormField>
                  <FormField label="Pengelola CCTV (NIP)">
                    <input type="text" value={pengelolaNip} onChange={(e) => setPengelolaNip(e.target.value)} placeholder="NIP (opsional)" className={inputCls} />
                  </FormField>
                </div>
              </div>

              <FormActions
                onCancel={back}
                submitLabel={isEdit ? "Simpan Perubahan" : "Simpan Reviu CCTV"}
                submitting={submitting}
                note="Periksa kembali data sebelum menyimpan formulir reviu CCTV."
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
