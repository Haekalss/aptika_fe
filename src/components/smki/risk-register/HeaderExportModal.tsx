"use client";

import React, { useState } from "react";
import { X, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { SmkiFr002HeaderData, SmkiFr002PegawaiOption, updateSmkiRiskRegisterHeader, exportSmkiRiskRegisterExcel, exportSmkiRiskRegisterPdf } from "@/services/api";
import toast from "react-hot-toast";

interface HeaderExportModalProps {
  onClose: () => void;
  headerData?: SmkiFr002HeaderData | null;
  pegawais?: SmkiFr002PegawaiOption[];
  onHeaderUpdated: (header: SmkiFr002HeaderData) => void;
}

export default function HeaderExportModal({
  onClose,
  headerData,
  pegawais = [],
  onHeaderUpdated,
}: HeaderExportModalProps) {
  const [formData, setFormData] = useState<SmkiFr002HeaderData>(() => ({
    tahun_periode: headerData?.tahun_periode ?? new Date().getFullYear(),
    ruang_lingkup: headerData?.ruang_lingkup ?? "",
    no_revisi: headerData?.no_revisi ?? "",
    tanggal_dokumen: headerData?.tanggal_dokumen?.slice(0, 10) ?? "",
    klasifikasi: headerData?.klasifikasi ?? "Internal",
    jabatan_pengesah: headerData?.jabatan_pengesah ?? "",
    nama_pengesah: headerData?.nama_pengesah ?? "",
    nip_pengesah: headerData?.nip_pengesah ?? "",
    lock_version: headerData?.lock_version ?? 0,
  }));
  const [signer, setSigner] = useState(() => {
    const match = pegawais.find((p) =>
      p.nama === formData.nama_pengesah && (p.nip ?? "") === formData.nip_pengesah,
    );
    return match ? String(match.id) : formData.nama_pengesah ? "manual" : "";
  });

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  // Pilih pengesah dari dropdown pegawai → NIP & jabatan terisi otomatis
  const handlePengesahChange = (id: string) => {
    const found = pegawais.find((p) => String(p.id) === id);
    setSigner(id);
    setFormData((prev) => ({
      ...prev,
      nama_pengesah: found?.nama ?? "",
      nip_pengesah: found?.nip ?? "",
      jabatan_pengesah: found?.jabatan ?? "",
    }));
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (headerData === undefined || saving || exporting) return;
    setSaving(true);
    try {
      const res = await updateSmkiRiskRegisterHeader(formData);
      if (!res.success) throw new Error();
      setFormData((prev) => ({ ...prev, lock_version: res.data.lock_version }));
      onHeaderUpdated(res.data);
      toast.success("Header dokumen FR-002 berhasil diperbarui!");
    } catch (error) {
      toast.error(isAxiosError(error) && error.response?.status === 409
        ? "Header sudah diubah. Salin perubahan Anda, lalu muat ulang halaman sebelum menyimpan lagi."
        : "Gagal menyimpan perubahan header dokumen.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (format: "excel" | "pdf") => {
    setExporting(format);
    const isExcel = format === "excel";
    const label = isExcel ? "Excel" : "PDF";
    const extension = isExcel ? "xlsx" : "pdf";
    try {
      const blob = await (isExcel ? exportSmkiRiskRegisterExcel() : exportSmkiRiskRegisterPdf());
      const url = window.URL.createObjectURL(blob);
      const year = headerData === null ? new Date().getFullYear() : headerData?.tahun_periode;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-002_Risk_Register${year ? `_${year}` : ""}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 0);
      toast.success(`File ${label} FR-002 berhasil diunduh!`);
    } catch {
      toast.error(`Gagal mengunduh file ${label} FR-002.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Header & Ekspor FR-002 (.xlsx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur informasi metadata dokumen, ruang lingkup, revisi, dan pengesah resmi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup header dan ekspor"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSaveHeader}>
          <div className="p-6 space-y-4">
            <fieldset disabled={saving || headerData === undefined} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tahun Periode
                </label>
                <input
                  type="number"
                  value={formData.tahun_periode || ""}
                  onChange={(e) => setFormData({ ...formData, tahun_periode: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ruang Lingkup (Scope)
                </label>
                <input
                  type="text"
                  value={formData.ruang_lingkup}
                  onChange={(e) => setFormData({ ...formData, ruang_lingkup: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Fisik Data Center"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No. Revisi
                </label>
                <input
                  type="text"
                  value={formData.no_revisi}
                  onChange={(e) => setFormData({ ...formData, no_revisi: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 4.0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Klasifikasi Keamanan
                </label>
                <input
                  type="text"
                  value={formData.klasifikasi}
                  onChange={(e) => setFormData({ ...formData, klasifikasi: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Internal / Rahasia"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Dokumen Berlaku
                </label>
                <input
                  type="date"
                  value={formData.tanggal_dokumen || ""}
                  onChange={(e) => setFormData({ ...formData, tanggal_dokumen: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan Pengesah (Spesimen)
                </label>
                <input
                  type="text"
                  value={formData.jabatan_pengesah}
                  onChange={(e) => setFormData({ ...formData, jabatan_pengesah: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pengesah — dari Data Master Pegawai
                </label>
                {pegawais.length > 0 ? (
                  <select
                    value={signer}
                    onChange={(e) => handlePengesahChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    <option value="">— Pilih Pegawai Pengesah —</option>
                    {pegawais.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.nip ? `${p.nama} — ${p.nip}` : p.nama}{p.jabatan ? ` (${p.jabatan})` : ""}
                      </option>
                    ))}
                    {signer === "manual" && (
                      <option value="manual">{formData.nama_pengesah} (lainnya)</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.nama_pengesah}
                    onChange={(e) => setFormData({ ...formData, nama_pengesah: e.target.value, nip_pengesah: "" })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NIP Pengesah
                </label>
                <input
                  type="text"
                  value={formData.nip_pengesah || ""}
                  onChange={(e) => setFormData({ ...formData, nip_pengesah: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Otomatis terisi dari data pegawai"
                />
              </div>
            </fieldset>

            {/* Preview Banner */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Format Dokumen FR-002 Standar Template Resmi
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    31 kolom, nomor urut per kategori, formula skor otomatis, blok pengesahan + spesimen.
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Unduhan menggunakan header yang sudah tersimpan.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("excel")}
                  disabled={saving || exporting !== null}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {exporting === "excel" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Unduh Excel (.xlsx)
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={saving || exporting !== null}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {exporting === "pdf" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Unduh PDF (.pdf)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || exporting !== null || headerData === undefined}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Simpan Header
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
