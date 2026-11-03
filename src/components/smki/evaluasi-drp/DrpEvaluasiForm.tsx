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
  createDrpEvaluasi, updateDrpEvaluasi, fetchDrpEvaluasiDetail, drpEvaluasiErrMsg,
  CHECKLIST_GROUPS, CHECKLIST_KEYS,
  DrpChecklist, DrpEvaluasiPayload, DrpProses, DrpTim, DrpWaktu,
} from "@/services/smki/drpEvaluasiService";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";
const areaCls = `${inputCls} resize-none`;

const emptyWaktu = (): DrpWaktu => ({ sistem_ti: "", rto_ideal: "", pencapaian_rto: "", kendala: "" });
const emptyProses = (): DrpProses => ({ proses: "", aktivitas: "", hasil_evaluasi: "", rekomendasi: "", pic: "" });
const emptyTim = (): DrpTim => ({ peran: "", tanggung_jawab: "", evaluasi: "", rekomendasi: "" });
const emptyChecklist = (): DrpChecklist => Object.fromEntries(CHECKLIST_KEYS.map((k) => [k, false]));
const nz = (v?: string | null) => (v ?? "").trim() || null;

/** Baris rincian dengan header bernomor + tombol hapus (pola kartu baris FR-040). */
function RowCard({ no, title, onRemove, children }: { no: number; title: string; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{no}</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

/** Organism: form tambah/ubah Laporan Evaluasi Pengujian DRP FR-039 (pola halaman Tambah Laporan FR-016). */
export default function DrpEvaluasiForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const back = () => router.push("/smki/evaluasi-drp");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [tanggal, setTanggal] = useState("");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [cakupan, setCakupan] = useState("");
  const [tipe, setTipe] = useState("");
  const [asumsiBencana, setAsumsiBencana] = useState("");
  const [asumsiSdm, setAsumsiSdm] = useState("");
  const [waktu, setWaktu] = useState<DrpWaktu[]>([emptyWaktu()]);
  const [proses, setProses] = useState<DrpProses[]>([emptyProses()]);
  const [tim, setTim] = useState<DrpTim[]>([emptyTim()]);
  const [checklist, setChecklist] = useState<DrpChecklist>(emptyChecklist());
  const [lampiran, setLampiran] = useState("");
  const [sign, setSign] = useState({
    dibuatNama: "", dibuatTgl: "", diperiksaNama: "", diperiksaTgl: "", disetujuiNama: "", disetujuiTgl: "",
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await fetchDrpEvaluasiDetail(id);
        if (res?.success) {
          const d = res.data;
          setTanggal(d.tanggal_pengujian || "");
          setMulai((d.waktu_mulai || "").slice(0, 5));
          setSelesai((d.waktu_selesai || "").slice(0, 5));
          setTujuan(d.tujuan || "");
          setCakupan(d.cakupan || "");
          setTipe(d.tipe_pengujian || "");
          setAsumsiBencana(d.asumsi_bencana || "");
          setAsumsiSdm(d.asumsi_sumber_daya || "");
          setWaktu(d.waktu?.length ? d.waktu.map((r: DrpWaktu) => ({ ...r, rto_ideal: r.rto_ideal || "", pencapaian_rto: r.pencapaian_rto || "", kendala: r.kendala || "" })) : [emptyWaktu()]);
          setProses(d.proses?.length ? d.proses.map((r: DrpProses) => ({ ...r, aktivitas: r.aktivitas || "", hasil_evaluasi: r.hasil_evaluasi || "", rekomendasi: r.rekomendasi || "", pic: r.pic || "" })) : [emptyProses()]);
          setTim(d.tim?.length ? d.tim.map((r: DrpTim) => ({ ...r, tanggung_jawab: r.tanggung_jawab || "", evaluasi: r.evaluasi || "", rekomendasi: r.rekomendasi || "" })) : [emptyTim()]);
          setChecklist({ ...emptyChecklist(), ...(d.checklist || {}) });
          setLampiran(d.lampiran || "");
          setSign({
            dibuatNama: d.dibuat_oleh_nama || "", dibuatTgl: d.dibuat_oleh_tanggal || "",
            diperiksaNama: d.diperiksa_oleh_nama || "", diperiksaTgl: d.diperiksa_oleh_tanggal || "",
            disetujuiNama: d.disetujui_oleh_nama || "", disetujuiTgl: d.disetujui_oleh_tanggal || "",
          });
        }
      } catch (err) {
        toast.error(drpEvaluasiErrMsg(err, "Gagal memuat data laporan evaluasi DRP."));
        router.push("/smki/evaluasi-drp");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router]);

  const patch = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, p: Partial<T>) =>
    setter((prev) => prev.map((r, i) => (i === idx ? { ...r, ...p } : r)));
  const drop = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !tujuan.trim() || !cakupan.trim() || !tipe.trim()) {
      toast.error("Tanggal, tujuan, cakupan, dan tipe pengujian wajib diisi.");
      return;
    }
    if (mulai && selesai && selesai < mulai) {
      toast.error("Waktu selesai tidak boleh sebelum waktu mulai.");
      return;
    }

    // Baris yang seluruh kolomnya kosong diabaikan; kolom kunci wajib bila baris terisi.
    const w = waktu.filter((r) => r.sistem_ti || r.rto_ideal || r.pencapaian_rto || r.kendala);
    const p = proses.filter((r) => r.proses || r.aktivitas || r.hasil_evaluasi || r.rekomendasi || r.pic);
    const t = tim.filter((r) => r.peran || r.tanggung_jawab || r.evaluasi || r.rekomendasi);
    if (w.some((r) => !r.sistem_ti.trim())) return void toast.error("Persyaratan Waktu: kolom Sistem TI wajib diisi.");
    if (p.some((r) => !r.proses.trim())) return void toast.error("Proses DRP: kolom Proses wajib diisi.");
    if (t.some((r) => !r.peran.trim())) return void toast.error("Team: kolom Peran wajib diisi.");

    const payload: DrpEvaluasiPayload = {
      tanggal_pengujian: tanggal,
      waktu_mulai: mulai || null,
      waktu_selesai: selesai || null,
      tujuan: tujuan.trim(),
      cakupan: cakupan.trim(),
      tipe_pengujian: tipe.trim(),
      asumsi_bencana: nz(asumsiBencana),
      asumsi_sumber_daya: nz(asumsiSdm),
      checklist,
      lampiran: nz(lampiran),
      dibuat_oleh_nama: nz(sign.dibuatNama),
      dibuat_oleh_tanggal: sign.dibuatTgl || null,
      diperiksa_oleh_nama: nz(sign.diperiksaNama),
      diperiksa_oleh_tanggal: sign.diperiksaTgl || null,
      disetujui_oleh_nama: nz(sign.disetujuiNama),
      disetujui_oleh_tanggal: sign.disetujuiTgl || null,
      waktu: w.map((r) => ({ sistem_ti: r.sistem_ti.trim(), rto_ideal: nz(r.rto_ideal), pencapaian_rto: nz(r.pencapaian_rto), kendala: nz(r.kendala) })),
      proses: p.map((r) => ({ proses: r.proses.trim(), aktivitas: nz(r.aktivitas), hasil_evaluasi: nz(r.hasil_evaluasi), rekomendasi: nz(r.rekomendasi), pic: nz(r.pic) })),
      tim: t.map((r) => ({ peran: r.peran.trim(), tanggung_jawab: nz(r.tanggung_jawab), evaluasi: nz(r.evaluasi), rekomendasi: nz(r.rekomendasi) })),
    };

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateDrpEvaluasi(id, payload);
        toast.success("Laporan evaluasi DRP berhasil diperbarui.");
      } else {
        await createDrpEvaluasi(payload);
        toast.success("Laporan evaluasi DRP berhasil disimpan.");
      }
      back();
    } catch (err) {
      toast.error(drpEvaluasiErrMsg(err, "Gagal menyimpan laporan evaluasi DRP."));
    } finally {
      setSubmitting(false);
    }
  };

  const divider = <div className="border-t border-slate-100 dark:border-slate-800" />;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <HeroBanner
        title={isEdit ? "Edit Evaluasi Pengujian DRP" : "Tambah Evaluasi Pengujian DRP"}
        subtitle="FORMULIR LAPORAN EVALUASI DAN PENGUJIAN DRP (FR-039) - Lengkapi data pengujian, evaluasi, check list BCP, dan pengesahan."
        breadcrumb={[
          { label: "Daftar Evaluasi DRP", href: "/smki/evaluasi-drp" },
          { label: isEdit ? "Edit Evaluasi DRP" : "Tambah Evaluasi DRP" },
        ]}
        docNo="FR-039/KOM.03.05/SANDIKAMI"
      />
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Laporan Evaluasi DRP — Pengujian, Evaluasi, Check List BCP & Pengesahan
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tanda * menunjukkan isian wajib.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 size={22} className="animate-spin mx-auto mb-2" />
            Memuat data laporan evaluasi DRP...
          </div>
        ) : (
          <div className={submitting ? "pointer-events-none opacity-70" : ""}>
            <form className="p-6 sm:p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <SectionTitle title="A. Evaluasi Pengujian DRP" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Tanggal Pengujian" required>
                    <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Waktu Mulai">
                    <input type="time" value={mulai} onChange={(e) => setMulai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Waktu Selesai">
                    <input type="time" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="Tujuan Pengujian" required className="sm:col-span-2 md:col-span-3">
                    <textarea rows={2} value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Tujuan pengujian DRP" className={areaCls} />
                  </FormField>
                  <FormField label="Cakupan Pengujian" required className="sm:col-span-2 md:col-span-3">
                    <textarea rows={2} value={cakupan} onChange={(e) => setCakupan(e.target.value)} placeholder="Cakupan pengujian" className={areaCls} />
                  </FormField>
                  <FormField label="Tipe Pengujian" required className="sm:col-span-2 md:col-span-3" hint="Metode atau tipe pengujian.">
                    <textarea rows={2} value={tipe} onChange={(e) => setTipe(e.target.value)} placeholder="Contoh: Simulasi (tabletop), failover teknis" className={areaCls} />
                  </FormField>
                  <FormField label="Asumsi Bencana" className="sm:col-span-2 md:col-span-3" hint="Detail asumsi bencana yang akan terjadi.">
                    <textarea rows={2} value={asumsiBencana} onChange={(e) => setAsumsiBencana(e.target.value)} className={areaCls} />
                  </FormField>
                  <FormField label="Asumsi Ketersediaan Sumber Daya" className="sm:col-span-2 md:col-span-3" hint="Asumsi ketersediaan sumber daya dari sisi SDM maupun teknikal.">
                    <textarea rows={2} value={asumsiSdm} onChange={(e) => setAsumsiSdm(e.target.value)} className={areaCls} />
                  </FormField>
                </div>
              </div>

              {divider}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Evaluasi – Persyaratan Waktu" />
                  <span className="text-xs text-slate-400">{waktu.length} baris</span>
                </div>
                {waktu.map((r, i) => (
                  <RowCard key={i} no={i + 1} title="Sistem TI" onRemove={waktu.length > 1 ? () => drop(setWaktu, i) : undefined}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField label="Sistem TI">
                        <input type="text" value={r.sistem_ti} onChange={(e) => patch(setWaktu, i, { sistem_ti: e.target.value })} placeholder="Nama sistem" className={inputCls} />
                      </FormField>
                      <FormField label="RTO Ideal">
                        <input type="text" value={r.rto_ideal ?? ""} onChange={(e) => patch(setWaktu, i, { rto_ideal: e.target.value })} placeholder="Contoh: 4 jam" className={inputCls} />
                      </FormField>
                      <FormField label="Pencapaian RTO">
                        <input type="text" value={r.pencapaian_rto ?? ""} onChange={(e) => patch(setWaktu, i, { pencapaian_rto: e.target.value })} placeholder="Contoh: 5 jam" className={inputCls} />
                      </FormField>
                      <FormField label="Kendala">
                        <input type="text" value={r.kendala ?? ""} onChange={(e) => patch(setWaktu, i, { kendala: e.target.value })} className={inputCls} />
                      </FormField>
                    </div>
                  </RowCard>
                ))}
                <AddRow label="Tambah Sistem TI" onClick={() => setWaktu((p) => [...p, emptyWaktu()])} />
              </div>

              {divider}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Evaluasi – Proses DRP" />
                  <span className="text-xs text-slate-400">{proses.length} baris</span>
                </div>
                {proses.map((r, i) => (
                  <RowCard key={i} no={i + 1} title="Proses" onRemove={proses.length > 1 ? () => drop(setProses, i) : undefined}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <FormField label="Proses">
                        <input type="text" value={r.proses} onChange={(e) => patch(setProses, i, { proses: e.target.value })} className={inputCls} />
                      </FormField>
                      <FormField label="Aktivitas">
                        <textarea rows={2} value={r.aktivitas ?? ""} onChange={(e) => patch(setProses, i, { aktivitas: e.target.value })} className={areaCls} />
                      </FormField>
                      <FormField label="Hasil Evaluasi">
                        <textarea rows={2} value={r.hasil_evaluasi ?? ""} onChange={(e) => patch(setProses, i, { hasil_evaluasi: e.target.value })} className={areaCls} />
                      </FormField>
                      <FormField label="Rekomendasi">
                        <textarea rows={2} value={r.rekomendasi ?? ""} onChange={(e) => patch(setProses, i, { rekomendasi: e.target.value })} className={areaCls} />
                      </FormField>
                      <FormField label="PIC">
                        <input type="text" value={r.pic ?? ""} onChange={(e) => patch(setProses, i, { pic: e.target.value })} className={inputCls} />
                      </FormField>
                    </div>
                  </RowCard>
                ))}
                <AddRow label="Tambah Proses DRP" onClick={() => setProses((p) => [...p, emptyProses()])} />
              </div>

              {divider}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionTitle title="Evaluasi – Team" />
                  <span className="text-xs text-slate-400">{tim.length} baris</span>
                </div>
                {tim.map((r, i) => (
                  <RowCard key={i} no={i + 1} title="Peran" onRemove={tim.length > 1 ? () => drop(setTim, i) : undefined}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField label="Peran">
                        <input type="text" value={r.peran} onChange={(e) => patch(setTim, i, { peran: e.target.value })} className={inputCls} />
                      </FormField>
                      <FormField label="Tanggung Jawab">
                        <textarea rows={2} value={r.tanggung_jawab ?? ""} onChange={(e) => patch(setTim, i, { tanggung_jawab: e.target.value })} className={areaCls} />
                      </FormField>
                      <FormField label="Evaluasi">
                        <textarea rows={2} value={r.evaluasi ?? ""} onChange={(e) => patch(setTim, i, { evaluasi: e.target.value })} className={areaCls} />
                      </FormField>
                      <FormField label="Rekomendasi">
                        <textarea rows={2} value={r.rekomendasi ?? ""} onChange={(e) => patch(setTim, i, { rekomendasi: e.target.value })} className={areaCls} />
                      </FormField>
                    </div>
                  </RowCard>
                ))}
                <AddRow label="Tambah Peran Team" onClick={() => setTim((p) => [...p, emptyTim()])} />
              </div>

              {divider}

              <div className="flex flex-col gap-4">
                <SectionTitle title="B. Check List Pengujian BCP" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
                  Tujuan: mengevaluasi efektivitas, kejelasan, kemungkinan dapat dieksekusi, serta kelengkapan BCP/DRP untuk melanjutkan fungsi bisnis penting ketika terjadi bencana.
                  Centang kriteria yang terpenuhi (dicatat di sistem; cetakan formulir tetap seperti dokumen asli).
                </p>
                <div className="flex flex-col gap-3">
                  {CHECKLIST_GROUPS.map((g) => (
                    <div key={g.kategori} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        {g.kategori} <span className="font-medium text-slate-400">({g.kategoriEn})</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        {g.items.map((it) => (
                          <label key={it.key} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!checklist[it.key]}
                              onChange={(e) => setChecklist((prev) => ({ ...prev, [it.key]: e.target.checked }))}
                              className="mt-0.5 accent-emerald-600"
                            />
                            <span>{it.teks}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {divider}

              <div className="flex flex-col gap-4">
                <SectionTitle title="Pengesahan & Lampiran" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField label="Dibuat Oleh (Nama)">
                    <input type="text" value={sign.dibuatNama} onChange={(e) => setSign({ ...sign, dibuatNama: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Diperiksa Oleh (Nama)">
                    <input type="text" value={sign.diperiksaNama} onChange={(e) => setSign({ ...sign, diperiksaNama: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Disetujui Oleh (Nama)">
                    <input type="text" value={sign.disetujuiNama} onChange={(e) => setSign({ ...sign, disetujuiNama: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal Dibuat">
                    <input type="date" value={sign.dibuatTgl} onChange={(e) => setSign({ ...sign, dibuatTgl: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal Diperiksa">
                    <input type="date" value={sign.diperiksaTgl} onChange={(e) => setSign({ ...sign, diperiksaTgl: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal Disetujui">
                    <input type="date" value={sign.disetujuiTgl} onChange={(e) => setSign({ ...sign, disetujuiTgl: e.target.value })} className={inputCls} />
                  </FormField>
                  <FormField label="Lampiran Laporan Pengujian DRP" className="sm:col-span-2 md:col-span-3" hint="Daftar/keterangan lampiran (dicetak di halaman Lampiran).">
                    <textarea rows={3} value={lampiran} onChange={(e) => setLampiran(e.target.value)} placeholder="1. Log failover&#10;2. Foto dokumentasi" className={areaCls} />
                  </FormField>
                </div>
              </div>

              <FormActions
                onCancel={back}
                submitLabel={isEdit ? "Simpan Perubahan" : "Simpan Laporan Evaluasi DRP"}
                submitting={submitting}
                note="Periksa kembali data sebelum menyimpan laporan evaluasi DRP."
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
