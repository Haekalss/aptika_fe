"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, Plus, Trash2, ScrollText, ClipboardList, PenLine, Info } from "lucide-react";
import toast from "react-hot-toast";
import {
  createReviewLog, updateReviewLog, fetchReviewLogDetail, reviewLogErrMsg,
  ReviewLogItem, ReviewLogPayload,
} from "@/services/smki/reviewLogService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const emptyItem = (): ReviewLogItem => ({ user_log: "", ip_address: "", tanggal: "", waktu: "", durasi: "" });

export default function ReviewLogForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

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
        toast.error(reviewLogErrMsg(err, "Gagal memuat data formulir"));
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!tanggalReview) return toast.error("Tanggal Review wajib diisi.");
    if (!obyekReview.trim()) return toast.error("Obyek Review wajib diisi.");
    if (!pelaksanaReview.trim()) return toast.error("Pelaksana Review wajib diisi.");
    if (periodeMulai && periodeSelesai && periodeSelesai < periodeMulai)
      return toast.error("Akhir periode tidak boleh sebelum awal periode.");

    // Baris log yang seluruh kolomnya kosong diabaikan; baris setengah terisi ditolak.
    const filled = items.filter((i) => i.user_log || i.ip_address || i.tanggal || i.waktu || i.durasi);
    for (let n = 0; n < filled.length; n++) {
      const r = filled[n];
      if (!r.user_log.trim() || !r.ip_address.trim() || !r.tanggal || !r.waktu || !r.durasi.trim()) {
        return toast.error(`Baris log ke-${n + 1}: User, IP, Tanggal, Waktu, dan Durasi wajib diisi lengkap.`);
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
      router.push("/smki/review-log");
    } catch (err) {
      toast.error(reviewLogErrMsg(err, "Gagal menyimpan formulir review log"));
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
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => router.push("/smki/review-log")} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="text-[10.5px] font-extrabold tracking-widest uppercase text-slate-400 mb-1">FR-040 &gt; {isEdit ? "Ubah Formulir" : "Formulir Baru"}</div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{isEdit ? "Ubah Review Log" : "Tambah Review Log"}</h1>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">FR-040/KOM.03.05/SANDIKAMI · Rev 1.0 · Berlaku 07-Jul-2022</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => router.push("/smki/review-log")} disabled={submitting} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all">Batal</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isEdit ? "Simpan Perubahan" : "Simpan Formulir"}
          </button>
        </div>
      </div>

      {/* A. Identitas review */}
      <section className={cardCls}>
        {sectionHead(<ScrollText size={18} />, "Identitas Review", "Informasi umum pelaksanaan review log.")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tanggal Review <span className="text-rose-500">*</span></label>
            <input type="date" value={tanggalReview} onChange={(e) => setTanggalReview(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Periode Review</label>
            <div className="flex items-center gap-2">
              <input type="date" value={periodeMulai} onChange={(e) => setPeriodeMulai(e.target.value)} className={inputCls} />
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">s.d.</span>
              <input type="date" value={periodeSelesai} onChange={(e) => setPeriodeSelesai(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Obyek Review <span className="text-rose-500">*</span></label>
            <input type="text" value={obyekReview} onChange={(e) => setObyekReview(e.target.value)} placeholder="Contoh: Log akses server aplikasi SIMPEG" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Pelaksana Review <span className="text-rose-500">*</span></label>
            <input type="text" value={pelaksanaReview} onChange={(e) => setPelaksanaReview(e.target.value)} placeholder="Nama pelaksana / tim reviewer" className={inputCls} />
          </div>
        </div>
      </section>

      {/* B. Log */}
      <section className={cardCls}>
        {sectionHead(<ClipboardList size={18} />, "Rincian Log", "Isi satu baris untuk setiap entri log yang ditinjau (User, IP, Tanggal, Waktu, Durasi).")}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 w-12 text-center">No</th>
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">IP</th>
                <th className="px-3 py-2.5">Tanggal</th>
                <th className="px-3 py-2.5">Waktu</th>
                <th className="px-3 py-2.5">Durasi</th>
                <th className="px-3 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-2 py-2"><input type="text" value={it.user_log} onChange={(e) => updateItem(idx, { user_log: e.target.value })} placeholder="Username" className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="text" value={it.ip_address} onChange={(e) => updateItem(idx, { ip_address: e.target.value })} placeholder="10.0.0.1" className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="date" value={it.tanggal} onChange={(e) => updateItem(idx, { tanggal: e.target.value })} className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="time" value={it.waktu} onChange={(e) => updateItem(idx, { waktu: e.target.value })} className={inputCls} /></td>
                  <td className="px-2 py-2"><input type="text" value={it.durasi} onChange={(e) => updateItem(idx, { durasi: e.target.value })} placeholder="45 menit" className={inputCls} /></td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-800/60 disabled:opacity-30" title="Hapus baris">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
          <Plus size={14} /> Tambah Baris Log
        </button>

        <div className="mt-5">
          <label className={labelCls}>Tindak Lanjut</label>
          <textarea rows={4} value={tindakLanjut} onChange={(e) => setTindakLanjut(e.target.value)} placeholder="Uraikan tindak lanjut atas temuan hasil review log..." className={`${inputCls} resize-none`} />
        </div>
      </section>

      {/* C. Pengesahan */}
      <section className={cardCls}>
        {sectionHead(<PenLine size={18} />, "Pengesahan", "Tempat, tanggal, serta pihak yang membuat dan mengetahui formulir.")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelCls}>Kota (Ditandatangani di)</label>
            <input type="text" value={ditandatanganiDi} onChange={(e) => setDitandatanganiDi(e.target.value)} placeholder="Bandung" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tanggal Tanda Tangan</label>
            <input type="date" value={tanggalTtd} onChange={(e) => setTanggalTtd(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Dibuat Oleh</p>
            <input type="text" value={dibuatNama} onChange={(e) => setDibuatNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
            <input type="text" value={dibuatNip} onChange={(e) => setDibuatNip(e.target.value)} placeholder="NIP (opsional)" className={inputCls} />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Mengetahui</p>
            <input type="text" value={mengetahuiNama} onChange={(e) => setMengetahuiNama(e.target.value)} placeholder="Nama lengkap" className={inputCls} />
            <input type="text" value={mengetahuiNip} onChange={(e) => setMengetahuiNip(e.target.value)} placeholder="NIP (opsional)" className={inputCls} />
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400 font-medium">
          <Info size={13} className="mt-0.5 flex-shrink-0" />
          <span>Nama dan NIP tampil pada kolom tanda tangan di dokumen cetak. Kosongkan bila ingin ditandatangani manual.</span>
        </div>
      </section>
    </form>
  );
}
