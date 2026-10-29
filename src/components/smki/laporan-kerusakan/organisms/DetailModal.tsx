import React, { memo } from "react";
import { X, Server, Clock, ShieldCheck, CheckCircle, FileDown } from "lucide-react";
import { LaporanKerusakanItem } from "@/services/api";
import { StatusBadge } from "../atoms/StatusBadge";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanKerusakanItem | null;
  onValidate?: (valid: boolean, catatan: string) => void;
  isSupervisor?: boolean;
  onExport?: (report: LaporanKerusakanItem) => void;
}

export const DetailModal = memo(({
  isOpen,
  onClose,
  report,
  onValidate,
  isSupervisor = false,
  onExport,
}: DetailModalProps) => {
  const [catatanValidasi, setCatatanValidasi] = React.useState("");

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {report.nama_aset}
                </h3>
                <StatusBadge status={report.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {report.nomor_laporan} • {report.kode_aset || "Aset DC"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Identitas Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">No. Dokumen</span>
              <p className="font-semibold text-slate-800">{report.no_dokumen || "F24-SMKI"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">No. Revisi</span>
              <p className="font-semibold text-slate-800">{report.no_revisi || "1.0"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Tanggal Berlaku</span>
              <p className="font-semibold text-slate-800">{report.tanggal_berlaku || "2022-01-20"}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Waktu Kejadian
              </span>
              <p className="font-semibold text-slate-800">
                {report.tanggal}, {report.jam}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Lokasi Rak
              </span>
              <p className="font-semibold text-slate-800">
                {report.lokasi_rak || "-"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Penanggung Jawab
              </span>
              <p className="font-semibold text-slate-800">
                {report.penanggung_jawab_nama || "Belum ditugaskan"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Pelapor Kerusakan
              </span>
              <p className="font-semibold text-slate-800">
                {report.pelapor_nama || "-"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Target Selesai
              </span>
              <p className="font-semibold text-slate-800">
                {report.target_selesai || "-"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Penyelesaian Aktual
              </span>
              <p className="font-semibold text-slate-800">
                {report.tanggal_selesai_aktual ? new Date(report.tanggal_selesai_aktual).toLocaleString("id-ID") : "-"}
              </p>
            </div>
          </div>

          {/* Kerusakan & Tindakan */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Gejala Kerusakan
              </h4>
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900 leading-relaxed font-medium">
                {report.jenis_kerusakan}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Dugaan Penyebab
              </h4>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 leading-relaxed">
                {report.penyebab || "Belum ada keterangan penyebab."}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Uraian Tindakan Perbaikan
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                {report.uraian_tindakan || "Belum ada tindakan yang dicatat."}
              </div>
            </div>
          </div>

          {/* Tanda Tangan & Otorisasi Dokumen (Template FR-024) */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Tanda Tangan & Otorisasi Dokumen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Kolom Disusun */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Disusun Oleh (Pelapor)
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {report.pelapor_nama || "Teknisi Data Center"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tanggal Lapor: {report.tanggal}, {report.jam}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 text-emerald-700" />
                    Tercatat Sistem
                  </span>
                </div>
              </div>

              {/* Kolom Mengetahui */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                report.status === "Closed"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-amber-200 bg-amber-50/40"
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mengetahui (Supervisor / Pejabat)
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {report.supervisor_nama || "Belum Ditentukan"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {report.status === "Closed" && report.validated_at
                    ? `Disahkan pada: ${new Date(report.validated_at).toLocaleString("id-ID")}`
                    : "Status: Menunggu Pengesahan Resmi"}
                </p>
                <div className="pt-1">
                  {report.status === "Closed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                      <ShieldCheck className="w-3 h-3" />
                      Disahkan & Sah (Closed)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 text-amber-700" />
                      Draft / Menunggu Validasi
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Validasi jika sudah Closed */}
          {report.status === "Closed" && report.catatan_validasi && (
            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs">
              <div className="flex items-center gap-2 text-purple-900 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Catatan Pengesahan Supervisor ({report.supervisor_nama || "Supervisor SMKI"}):</span>
              </div>
              <p className="text-purple-800 leading-relaxed font-medium">
                &ldquo;{report.catatan_validasi}&rdquo;
              </p>
            </div>
          )}

          {/* Supervisor Approval Action (Flowchart Step: Hasil Valid?) */}
          {isSupervisor && report.status === "Selesai" && onValidate && (
            <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <h4 className="text-sm font-bold text-emerald-950">Validasi Hasil Perbaikan (Supervisor Data Center)</h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Pemeriksaan terhadap hasil pekerjaan teknisi. Jika valid, laporan akan disahkan berstatus <strong>Closed</strong>. Jika perbaikan belum memadai, laporan dikembalikan ke teknisi untuk perbaikan lanjutan.
              </p>
              <textarea
                rows={2}
                placeholder="Catatan validasi perbaikan..."
                value={catatanValidasi}
                onChange={(e) => setCatatanValidasi(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
              />
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onValidate(false, catatanValidasi)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                >
                  Tolak (Perlu Perbaikan Ulang)
                </button>
                <button
                  type="button"
                  onClick={() => onValidate(true, catatanValidasi)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#065f46] hover:bg-[#047857] shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approval Sesuai (Closed)
                </button>
              </div>
            </div>
          )}

          {/* Riwayat Histori */}
          {report.histories && report.histories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Riwayat Penanganan
              </h4>
              <div className="space-y-2">
                {report.histories.map((hist) => (
                  <div
                    key={hist.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{hist.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(hist.created_at).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{hist.catatan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
          <div>
            {onExport && (
              report.status === "Closed" ? (
                <button
                  type="button"
                  onClick={() => onExport(report)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold shadow-sm transition"
                >
                  <FileDown className="w-4 h-4 text-emerald-700" />
                  <span>Export</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                    title="Dokumen hanya dapat diekspor setelah disahkan (Closed) oleh Supervisor"
                  >
                    <FileDown className="w-4 h-4 text-slate-400" />
                    <span>Export</span>
                  </button>
                  <span className="text-[11px] text-amber-700 hidden sm:inline">
                    * Hanya dapat diekspor setelah disahkan
                  </span>
                </div>
              )
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

DetailModal.displayName = "DetailModal";
