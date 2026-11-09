"use client";

import React, { useState } from "react";
import { isAxiosError } from "axios";
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  SmkiFr002KategoriItem,
  SmkiFr002AnnexItem,
  SmkiFr002RisikoItem,
  SmkiFr002PegawaiOption,
  createSmkiRiskRegister,
  updateSmkiRiskRegister,
} from "@/services/api";
import toast from "react-hot-toast";

interface RiskRegisterModalProps {
  onClose: () => void;
  kategoris: SmkiFr002KategoriItem[];
  annexes: SmkiFr002AnnexItem[];
  pegawais?: SmkiFr002PegawaiOption[];
  editItem?: SmkiFr002RisikoItem | null;
  onSuccess: () => void;
}

export default function RiskRegisterModal({
  onClose,
  kategoris,
  annexes,
  pegawais = [],
  editItem,
  onSuccess,
}: RiskRegisterModalProps) {
  // Stepper state 1 to 4
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [kodeKategori, setKodeKategori] = useState(editItem?.kode_kategori || "A");
  const [namaAsetProses, setNamaAsetProses] = useState(editItem?.nama_aset_proses || "");
  const [kerawanan, setKerawanan] = useState(editItem?.kerawanan_vulnerability || "");
  const [ancaman, setAncaman] = useState(editItem?.ancaman_threat || "");
  const cia = editItem ? (editItem.kategori_cia ?? "").toUpperCase() : "CIA";
  const [ciaC, setCiaC] = useState(cia.includes("C"));
  const [ciaI, setCiaI] = useState(cia.includes("I"));
  const [ciaA, setCiaA] = useState(cia.includes("A"));
  const [uraianDampak, setUraianDampak] = useState(editItem?.uraian_dampak || "");

  // Inherent Risk
  const [inherentL, setInherentL] = useState(editItem?.inherent_likelihood || 1);
  const [inherentI, setInherentI] = useState(editItem?.inherent_impact || 1);

  // Existing Control
  const [existingControl, setExistingControl] = useState(editItem?.existing_control || "");
  const [referensiDokumen, setReferensiDokumen] = useState(editItem?.referensi_dokumen || "");
  const [kodeAnnex, setKodeAnnex] = useState(editItem?.kode_annex || "");
  const [kontrolAnnexIso, setKontrolAnnexIso] = useState(editItem?.kontrol_annex_iso || "");
  const [currentL, setCurrentL] = useState(editItem?.current_likelihood || 1);
  const [currentI, setCurrentI] = useState(editItem?.current_impact || 1);

  // RTP & Residual
  const treatment = editItem?.treatment_plan;
  const [opsiTreatment, setOpsiTreatment] = useState(treatment?.opsi_penanggulangan || "");
  const [uraianRtp, setUraianRtp] = useState(treatment?.uraian_rencana || "");
  const [targetSelesai, setTargetSelesai] = useState(treatment?.target_selesai?.slice(0, 10) || "");
  const [pic, setPic] = useState(treatment?.pic_penanggung_jawab || "");
  const [prioritas, setPrioritas] = useState(treatment?.prioritas || "Menengah");
  const [ownership, setOwnership] = useState(treatment?.ownership || "Bidang Aplikasi Informatika");
  const [statusMonitoring, setStatusMonitoring] = useState<"Open" | "On Progress" | "Closed">(treatment?.status_monitoring || "Open");
  const [keterangan, setKeterangan] = useState(treatment?.keterangan || "");
  const [residualL, setResidualL] = useState(editItem?.residual_likelihood || 1);
  const [residualI, setResidualI] = useState(editItem?.residual_impact || 1);

  // When Annex dropdown changes, update Kontrol name
  const handleAnnexChange = (annexCode: string) => {
    setKodeAnnex(annexCode);
    const found = annexes.find((a) => a.kode_annex === annexCode);
    setKontrolAnnexIso(found?.nama_kontrol_iso || "");
  };

  // Calculators — mengikuti formula template resmi FR-002
  // Skor 1-4 Rendah, 5-11 Menengah, 12-15 Tinggi, 16-24 Sangat Tinggi, 25 Ekstrim.
  const calcRisk = (l: number, i: number) => {
    const score = l * i;
    let label = "Rendah";
    let color = "bg-emerald-600 text-white";
    let status = "Dapat Diterima";

    if (score >= 25) {
      label = "Ekstrim";
      color = "bg-rose-700 text-white";
      status = "Kontrol/Transfer/Void";
    } else if (score >= 16) {
      label = "Sangat Tinggi";
      color = "bg-red-600 text-white";
      status = "Kontrol/Transfer/Void";
    } else if (score >= 12) {
      label = "Tinggi";
      color = "bg-orange-500 text-white";
      status = "Kontrol/Transfer/Void";
    } else if (score >= 5) {
      label = "Menengah";
      color = "bg-amber-500 text-white";
      status = "Kontrol/Transfer/Void";
    }

    return { score, label, color, status };
  };

  const inherent = calcRisk(inherentL, inherentI);
  const current = calcRisk(currentL, currentI);
  const residual = calcRisk(residualL, residualI);

  // Submit action
  const handleSubmit = async () => {
    if (loading) return;
    if (!namaAsetProses.trim()) {
      toast.error("Nama Aset / Proses / Layanan wajib diisi!");
      setStep(1);
      return;
    }

    const ciaArr = [];
    if (ciaC) ciaArr.push("C");
    if (ciaI) ciaArr.push("I");
    if (ciaA) ciaArr.push("A");
    const kategoriCia = ciaArr.join(", ") || "I, A";

    const payload = {
      kode_kategori: kodeKategori,
      nama_aset_proses: namaAsetProses,
      kerawanan_vulnerability: kerawanan,
      ancaman_threat: ancaman,
      kategori_cia: kategoriCia,
      uraian_dampak: uraianDampak,
      inherent_likelihood: inherentL,
      inherent_impact: inherentI,
      existing_control: existingControl,
      referensi_dokumen: referensiDokumen,
      kode_annex: kodeAnnex,
      kontrol_annex_iso: kontrolAnnexIso || kodeAnnex,
      current_likelihood: currentL,
      current_impact: currentI,
      residual_likelihood: residualL,
      residual_impact: residualI,
      opsi_penanggulangan: opsiTreatment,
      uraian_rencana: uraianRtp,
      target_selesai: targetSelesai || null,
      pic_penanggung_jawab: pic,
      prioritas: prioritas,
      ownership: ownership,
      status_monitoring: statusMonitoring,
      keterangan: keterangan || null,
    };

    setLoading(true);
    try {
      if (editItem) {
        const res = await updateSmkiRiskRegister(editItem.id, { ...payload, lock_version: editItem.lock_version });
        if (!res.success) throw new Error();
        toast.success("Data risiko FR-002 berhasil diperbarui!");
      } else {
        const res = await createSmkiRiskRegister(payload);
        if (!res.success) throw new Error();
        toast.success("Data risiko FR-002 berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(isAxiosError(error) && error.response?.status === 409
        ? "Data risiko sudah diubah. Salin perubahan Anda, lalu muat ulang halaman sebelum mengedit lagi."
        : "Gagal menyimpan data risiko.");
    } finally {
      setLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: "Identifikasi Aset" },
    { num: 2, label: "Inherent Risk" },
    { num: 3, label: "Existing Control" },
    { num: 4, label: "Treatment & Residual" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header Modal */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                RECORD BARU • FORMULIR RESMI
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {editItem ? "Edit Data Risiko FR-002" : "Tambah Data Risiko FR-002"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Tutup formulir risiko"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            {stepsHeader.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                disabled={loading}
                className={`flex items-center gap-2 pb-2 text-left border-b-2 transition ${
                  step === s.num
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
                    : step > s.num
                    ? "border-emerald-300 text-slate-600 dark:text-slate-400 font-medium"
                    : "border-transparent text-slate-400 dark:text-slate-500 font-medium"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    step === s.num
                      ? "bg-emerald-600 text-white"
                      : step > s.num
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  {s.num}
                </div>
                <span className="text-xs truncate hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <fieldset disabled={loading} className="p-6">
          {/* STEP 1: IDENTIFIKASI ASET */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Aset (Format Resmi A—E)
                </label>
                <select
                  value={kodeKategori}
                  onChange={(e) => setKodeKategori(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {kategoris.map((k) => (
                    <option key={k.kode_kategori} value={k.kode_kategori}>
                      {k.kode_kategori}. {k.nama_kategori_aset}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Aset / Proses / Layanan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaAsetProses}
                  onChange={(e) => setNamaAsetProses(e.target.value)}
                  placeholder="Contoh: Dokumen Kebijakan Keamanan Informasi / Server Database"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kerawanan (Vulnerability)
                  </label>
                  <textarea
                    rows={3}
                    value={kerawanan}
                    onChange={(e) => setKerawanan(e.target.value)}
                    placeholder="Kerentanan atau kelemahan sistem / proses..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ancaman (Threat)
                  </label>
                  <textarea
                    rows={3}
                    value={ancaman}
                    onChange={(e) => setAncaman(e.target.value)}
                    placeholder="Potensi ancaman yang dapat mengeksploitasi kerawanan..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori Ancaman (CIA Triad)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition ${
                        ciaC
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={ciaC}
                        onChange={(e) => setCiaC(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm font-black">C</span>
                      <span className="text-[10px] mt-0.5">Confidentiality</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition ${
                        ciaI
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={ciaI}
                        onChange={(e) => setCiaI(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm font-black">I</span>
                      <span className="text-[10px] mt-0.5">Integrity</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition ${
                        ciaA
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={ciaA}
                        onChange={(e) => setCiaA(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm font-black">A</span>
                      <span className="text-[10px] mt-0.5">Availability</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Uraian Dampak (Impact Description)
                  </label>
                  <textarea
                    rows={3}
                    value={uraianDampak}
                    onChange={(e) => setUraianDampak(e.target.value)}
                    placeholder="Jelaskan dampak terhadap operasional dan reputasi organisasi..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INHERENT RISK */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kemungkinan / Likelihood (1—5)
                  </label>
                  <select
                    value={inherentL}
                    onChange={(e) => setInherentL(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 — Sangat Rendah</option>
                    <option value={2}>2 — Rendah</option>
                    <option value={3}>3 — Menengah</option>
                    <option value={4}>4 — Tinggi</option>
                    <option value={5}>5 — Sangat Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dampak / Impact (1—5)
                  </label>
                  <select
                    value={inherentI}
                    onChange={(e) => setInherentI(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 — Tidak Signifikan</option>
                    <option value={2}>2 — Kecil</option>
                    <option value={3}>3 — Menengah</option>
                    <option value={4}>4 — Besar</option>
                    <option value={5}>5 — Sangat Besar</option>
                  </select>
                </div>
              </div>

              {/* Inherent Score Card (Mockup Style) */}
              <div className="rounded-2xl bg-emerald-900 text-white p-6 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    RISIKO TANPA PENGENDALIAN (INHERENT RISK)
                  </span>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-3xl font-black bg-emerald-800/80 px-4 py-2 rounded-xl">
                      {inherentL}
                    </span>
                    <span className="text-xl font-bold text-emerald-300">&times;</span>
                    <span className="text-3xl font-black bg-emerald-800/80 px-4 py-2 rounded-xl">
                      {inherentI}
                    </span>
                    <span className="text-xl font-bold text-emerald-300">=</span>
                    <span className="text-4xl font-extrabold">{inherent.score}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`rounded-xl px-4 py-2 text-sm font-extrabold uppercase shadow-sm ${inherent.color}`}
                  >
                    {inherent.score} - {inherent.label}
                  </span>
                  <span className="text-xs text-emerald-200 mt-2 font-medium">
                    Status: {inherent.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <p>
                  Nilai dihitung otomatis dari <strong>Likelihood &times; Impact</strong>. Skor{" "}
                  {inherent.score} memerlukan pengendalian sesuai kriteria matriks risiko FR-002.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: EXISTING CONTROL */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Existing Control (Pengendalian Saat Ini)
                </label>
                <textarea
                  rows={3}
                  value={existingControl}
                  onChange={(e) => setExistingControl(e.target.value)}
                  placeholder="Review dokumen dan diseminasi minimal satu kali dalam setahun..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Referensi Dokumen
                  </label>
                  <input
                    type="text"
                    value={referensiDokumen}
                    onChange={(e) => setReferensiDokumen(e.target.value)}
                    placeholder="e.g. Kebijakan SMKI / SOP Pengendalian Dokumen"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kontrol Annex ISO 27001
                  </label>
                  <select
                    value={kodeAnnex}
                    onChange={(e) => handleAnnexChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">— Pilih Kontrol Annex ISO 27001 —</option>
                    {annexes.map((a) => (
                      <option key={a.kode_annex} value={a.kode_annex}>
                        {a.kode_annex} — {a.nama_kontrol_iso.replace(new RegExp(`^${a.kode_annex}\\s*`), "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Likelihood (Setelah Existing Control)
                  </label>
                  <select
                    value={currentL}
                    onChange={(e) => setCurrentL(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 — Sangat Rendah</option>
                    <option value={2}>2 — Rendah</option>
                    <option value={3}>3 — Menengah</option>
                    <option value={4}>4 — Tinggi</option>
                    <option value={5}>5 — Sangat Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Impact (Setelah Existing Control)
                  </label>
                  <select
                    value={currentI}
                    onChange={(e) => setCurrentI(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 — Tidak Signifikan</option>
                    <option value={2}>2 — Kecil</option>
                    <option value={3}>3 — Menengah</option>
                    <option value={4}>4 — Besar</option>
                    <option value={5}>5 — Sangat Besar</option>
                  </select>
                </div>
              </div>

              {/* Current Risk Card */}
              <div className="rounded-2xl bg-emerald-950 text-white p-6 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    CURRENT RISK (RISIKO SAAT INI SETELAH EXISTING CONTROL)
                  </span>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-3xl font-black bg-emerald-900/80 px-4 py-2 rounded-xl">
                      {currentL}
                    </span>
                    <span className="text-xl font-bold text-emerald-400">&times;</span>
                    <span className="text-3xl font-black bg-emerald-900/80 px-4 py-2 rounded-xl">
                      {currentI}
                    </span>
                    <span className="text-xl font-bold text-emerald-400">=</span>
                    <span className="text-4xl font-extrabold">{current.score}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-xl px-4 py-1.5 text-xs font-extrabold uppercase shadow-sm ${current.color}`}
                  >
                    {current.score} - {current.label}
                  </span>
                  <span className="rounded-lg bg-emerald-800/80 text-emerald-200 px-3 py-1 text-[11px] font-semibold">
                    {current.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TREATMENT & RESIDUAL */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rencana Penanggulangan Risiko (Risk Treatment Plan)
                </label>
                <input
                  type="text"
                  value={opsiTreatment}
                  onChange={(e) => setOpsiTreatment(e.target.value)}
                  placeholder="e.g. Menerapkan pengingat review dan persetujuan dokumen digital"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Uraian Detail Rencana Mitigasi
                </label>
                <textarea
                  rows={2}
                  value={uraianRtp}
                  onChange={(e) => setUraianRtp(e.target.value)}
                  placeholder="Menetapkan pemilik dokumen dan jadwal review berkala secara otomatis..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Selesai
                  </label>
                  <input
                    type="date"
                    value={targetSelesai}
                    onChange={(e) => setTargetSelesai(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIC (Person In Charge) — dari Data Master Pegawai
                  </label>
                  {pegawais.length > 0 ? (
                    <select
                      value={pic}
                      onChange={(e) => setPic(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">— Pilih Pegawai —</option>
                      {pegawais.map((p) => {
                        const label = p.nip ? `${p.nama} — ${p.nip}` : p.nama;
                        return (
                          <option key={p.id} value={p.nama}>
                            {p.jabatan ? `${label} (${p.jabatan})` : label}
                          </option>
                        );
                      })}
                      {pic && !pegawais.some((p) => p.nama === pic) && (
                        <option value={pic}>{pic} (lainnya)</option>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={pic}
                      onChange={(e) => setPic(e.target.value)}
                      placeholder="Nama penanggung jawab rencana mitigasi"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioritas Penanganan
                  </label>
                  <select
                    value={prioritas}
                    onChange={(e) => setPrioritas(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sangat Tinggi">Sangat Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ownership (Kepemilikan Risiko)
                  </label>
                  <input
                    type="text"
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Monitoring
                  </label>
                  <select
                    value={statusMonitoring}
                    onChange={(e) => setStatusMonitoring(e.target.value as "Open" | "On Progress" | "Closed")}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan (Kolom Ket Template)
                  </label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Keterangan tambahan monitoring..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residual Likelihood
                  </label>
                  <select
                    value={residualL}
                    onChange={(e) => setResidualL(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 — Sangat Rendah</option>
                    <option value={2}>2 — Rendah</option>
                    <option value={3}>3 — Menengah</option>
                    <option value={4}>4 — Tinggi</option>
                    <option value={5}>5 — Sangat Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residual Impact
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={residualI}
                      onChange={(e) => setResidualI(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value={1}>1 — Tidak Signifikan</option>
                      <option value={2}>2 — Kecil</option>
                      <option value={3}>3 — Menengah</option>
                      <option value={4}>4 — Besar</option>
                      <option value={5}>5 — Sangat Besar</option>
                    </select>
                    <span
                      className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 ${residual.color}`}
                    >
                      {residual.score}-{residual.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </fieldset>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Langkah {step} dari 4
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Sebelumnya
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-sm transition"
              >
                Lanjutkan
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Simpan Data Risiko
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
