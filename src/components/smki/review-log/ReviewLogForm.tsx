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
  createReviewLog, updateReviewLog, fetchReviewLogDetail, reviewLogErrMsg,
  ReviewLogItem, ReviewLogPayload,
} from "@/services/smki/reviewLogService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

const emptyItem = (): ReviewLogItem => ({ user_log: "", ip_address: "", tanggal: "", waktu: "", durasi: "" });

/** Organism: form tambah/ubah Review Log FR-040 (pola halaman Tambah Laporan FR-016). */
export default function ReviewLogForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const back = () => router.push("/smki/review-log");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [tanggalReview, setTanggalReview] = useState("");
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [obyekReview, setObyekReview] = useState("");
  const [pelaksanaReview, setPelaksanaReview] = useState("");
  const [items, setItems] = useState<ReviewLogItem[]>([emptyItem()]);
  const [tindakLanjut, setTindakLanjut] = useState("");
  const [ditandatanganiDi, setDitandatanganiDi] = useState("Bandung");
  const [tanggalTtd, setTanggalTtd] = useState("");
  const [dibuatNama, setDibuatNama] = useState("");
  const [dibuatNip, setDibuatNip] = useState("");
  const [mengetahuiNama, setMengetahuiNama] = useState("");
  const [mengetahuiNip, setMengetahuiNip] = useState("");

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await fetchReviewLogDetail(id);
        if (res?.success) {
          const d = res.data;
          setTanggalReview(d.tanggal_review || "");
          setPeriodeMulai(d.periode_mulai || "");
          setPeriodeSelesai(d.periode_selesai || "");
          setObyekReview(d.obyek_review || "");
          setPelaksanaReview(d.pelaksana_review || "");
          setItems(
            d.items?.length
              ? d.items.map((i: ReviewLogItem) => ({ ...i, waktu: (i.waktu || "").slice(0, 5) }))
              : [emptyItem()]
          );
          setTindakLanjut(d.tindak_lanjut || "");
          setDitandatanganiDi(d.ditandatangani_di || "");
          setTanggalTtd(d.tanggal_ttd || "");
          setDibuatNama(d.dibuat_oleh_nama || "");
          setDibuatNip(d.dibuat_oleh_nip || "");
          setMengetahuiNama(d.mengetahui_nama || "");
          setMengetahuiNip(d.mengetahui_nip || "");
        }
      } catch (err) {
        toast.error(reviewLogErrMsg(err, "Gagal memuat data formulir review log."));
        router.push("/smki/review-log");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router]);

  const updateItem = (idx: number, patch: Partial<ReviewLogItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggalReview || !obyekReview.trim() || !pelaksanaReview.trim()) {
      toast.error("Tanggal review, obyek review, dan pelaksana review wajib diisi.");
      return;
    }
    if (periodeMulai && periodeSelesai && periodeSelesai < periodeMulai) {
      toast.error("Akhir periode tidak boleh sebelum awal periode.");
      return;
    }

    // Baris log yang seluruh kolomnya kosong diabaikan; baris setengah terisi ditolak.
    const filled = items.filter((i) => i.user_log || i.ip_address || i.tanggal || i.waktu || i.durasi);
    for (let n = 0; n < filled.length; n++) {
      const r = filled[n];
      if (!r.user_log.trim() || !r.ip_address.trim() || !r.tanggal || !r.waktu || !r.durasi.trim()) {
        toast.error(`Baris log ke-${n + 1}: User, IP, Tanggal, Waktu, dan Durasi wajib diisi lengkap.`);
        return;
      }
    }

    const payload: ReviewLogPayload = {
      tanggal_review: tanggalReview,
      periode_mulai: periodeMulai || null,
      periode_selesai: periodeSelesai || null,
      obyek_review: obyekReview.trim(),
      pelaksana_review: pelaksanaReview.trim(),
      tindak_lanjut: tindakLanjut.trim() || null,
      dibuat_oleh_nama: dibuatNama.trim() || null,
      dibuat_oleh_nip: dibuatNip.trim() || null,
      mengetahui_nama: mengetahuiNama.trim() || null,
      mengetahui_nip: mengetahuiNip.trim() || null,
      ditandatangani_di: ditandatanganiDi.trim() || null,
      tanggal_ttd: tanggalTtd || null,
      items: filled,
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateReviewLog(id, payload);
        toast.success("Formulir review log berhasil diperbarui.");
      } else {
        await createReviewLog(payload);
        toast.success("Formulir review log berhasil disimpan.");
      }
      back();
    } catch (err) {
      toast.error(reviewLogErrMsg(err, "Gagal menyimpan formulir review log."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <HeroBanner
        title={isEdit ? "Edit Review Log" : "Tambah Review Log"}
        subtitle="FORMULIR REVIEW LOG (FR-040) - Lengkapi identitas review, rincian log, tindak lanjut, dan pengesahan."
        breadcrumb={[
          { label: "Daftar Review Log", href: "/smki/review-log" },
          { label: isEdit ? "Edit Review Log" : "Tambah Review Log" },
        ]}
        docNo="FR-040/KOM.03.05/SANDIKAMI"
      />
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Formulir Review Log — Identitas, Rincian Log & Pengesahan
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tanda * menunjukkan isian wajib.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 size={22} className="animate-spin mx-auto mb-2" />
            Memuat data formulir review log...
          </div>
        ) : (
          <div className={submitting ? "pointer-events-none opacity-70" : ""}>
            <form className="p-6 sm:p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <SectionTitle title="Identitas Review" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Tanggal Review" required>
                    <input type="date" value={tanggalReview} onChange={(e) => setTanggalReview(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Periode Review (Mulai)">
                    <input type="date" value={periodeMulai} onChange={(e) => setPeriodeMulai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Periode Review (Selesai)">
                    <input type="date" value={periodeSelesai} onChange={(e) => setPeriodeSelesai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Obyek Review" required className="sm:col-span-2">
                    <input type="text" value={obyekReview} onChange={(e) => setObyekReview(e.target.value)} placeholder="Contoh: Log akses server aplikasi SIMPEG" className={inputCls} />
                  </FormField>
                  <FormField label="Pelaksana Review" required>
                    <input type="text" value={pelaksanaReview} onChange={(e) => setPelaksanaReview(e.target.value)} placeholder="Nama pelaksana / tim reviewer" className={inputCls} />
                  </FormField>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Rincian Log" />
                  <span className="text-xs text-slate-400">{items.length} baris</span>
                </div>
                <div className="flex flex-col gap-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Entri Log</span>
                        </div>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
                            <Trash2 size={14} /> Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        <FormField label="User">
                          <input type="text" value={it.user_log} onChange={(e) => updateItem(idx, { user_log: e.target.value })} placeholder="Username" className={inputCls} />
                        </FormField>
                        <FormField label="IP">
                          <input type="text" value={it.ip_address} onChange={(e) => updateItem(idx, { ip_address: e.target.value })} placeholder="10.0.0.1" className={inputCls} />
                        </FormField>
                        <FormField label="Tanggal">
                          <input type="date" value={it.tanggal} onChange={(e) => updateItem(idx, { tanggal: e.target.value })} className={inputCls} />
                        </FormField>
                        <FormField label="Waktu">
                          <input type="time" value={it.waktu} onChange={(e) => updateItem(idx, { waktu: e.target.value })} className={inputCls} />
                        </FormField>
                        <FormField label="Durasi">
                          <input type="text" value={it.durasi} onChange={(e) => updateItem(idx, { durasi: e.target.value })} placeholder="Contoh: 45 menit" className={inputCls} />
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    <Plus size={16} /> Tambah Entri Log
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <div className="flex flex-col gap-4">
                <SectionTitle title="Tindak Lanjut" />
                <FormField label="Tindak Lanjut" hint="Uraikan tindak lanjut atas temuan hasil review log.">
                  <textarea rows={4} value={tindakLanjut} onChange={(e) => setTindakLanjut(e.target.value)} placeholder="Tuliskan tindak lanjut" className={`${inputCls} resize-none`} />
                </FormField>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Dibuat Oleh (Nama)">
                    <input type="text" value={dibuatNama} onChange={(e) => setDibuatNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
                  </FormField>
                  <FormField label="Dibuat Oleh (NIP)">
                    <input type="text" value={dibuatNip} onChange={(e) => setDibuatNip(e.target.value)} placeholder="NIP (opsional)" className={inputCls} />
                  </FormField>
                  <div className="hidden md:block" />
                  <FormField label="Mengetahui (Nama)">
                    <input type="text" value={mengetahuiNama} onChange={(e) => setMengetahuiNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
                  </FormField>
                  <FormField label="Mengetahui (NIP)">
                    <input type="text" value={mengetahuiNip} onChange={(e) => setMengetahuiNip(e.target.value)} placeholder="NIP (opsional)" className={inputCls} />
                  </FormField>
                </div>
              </div>

              <FormActions
                onCancel={back}
                submitLabel={isEdit ? "Simpan Perubahan" : "Simpan Review Log"}
                submitting={submitting}
                note="Periksa kembali data sebelum menyimpan formulir review log."
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
