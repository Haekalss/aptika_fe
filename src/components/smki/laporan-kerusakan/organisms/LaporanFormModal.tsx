import React, { memo, useState, useEffect, useMemo } from "react";
import { X, Server, CheckCircle2, Loader2, FileDown } from "lucide-react";
import { DataCenterAssetItem, LaporanKerusakanItem } from "@/services/api";
import { FormSectionAset } from "./FormSectionAset";
import { FormSectionKerusakan } from "./FormSectionKerusakan";
import { FormSectionTindakan } from "./FormSectionTindakan";

interface UserOption {
  id: number;
  name: string;
  role?: string;
  email?: string;
}

interface LaporanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LaporanKerusakanItem>, autoExport?: boolean) => Promise<void>;
  editItem?: LaporanKerusakanItem | null;
  assets: DataCenterAssetItem[];
  users: UserOption[];
  supervisors?: UserOption[];
  isSupervisor?: boolean;
}

export const LaporanFormModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  assets,
  users,
  supervisors = [],
  isSupervisor = false,
}: LaporanFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoExport, setAutoExport] = useState(true);
  const [formData, setFormData] = useState<Partial<LaporanKerusakanItem>>({
    tanggal: new Date().toISOString().split("T")[0],
    jam: "09.30 WIB",
    aset_id: undefined,
    jenis_kerusakan: "",
    penyebab: "",
    uraian_tindakan: "",
    target_selesai: "",
    status: "Baru",
    penanggung_jawab_id: null,
    supervisor_id: null,
    supervisor_nama: "",
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        id: editItem.id,
        nomor_laporan: editItem.nomor_laporan,
        tanggal: editItem.tanggal,
        jam: editItem.jam,
        aset_id: editItem.aset_id,
        jenis_kerusakan: editItem.jenis_kerusakan || "",
        penyebab: editItem.penyebab || "",
        uraian_tindakan: editItem.uraian_tindakan || "",
        target_selesai: editItem.target_selesai || "",
        status: editItem.status || "Baru",
        penanggung_jawab_id: editItem.penanggung_jawab_id || null,
        supervisor_id: editItem.supervisor_id || null,
        supervisor_nama: editItem.supervisor_nama || "",
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split("T")[0],
        jam: "09.30 WIB",
        aset_id: assets.length > 0 ? assets[0].id : undefined,
        jenis_kerusakan: "",
        penyebab: "",
        uraian_tindakan: "",
        target_selesai: "",
        status: "Baru",
        penanggung_jawab_id: null,
        supervisor_id: supervisors.length > 0 ? supervisors[0].id : null,
        supervisor_nama: supervisors.length > 0 ? supervisors[0].name : "",
      });
    }
  }, [editItem, assets, supervisors, isOpen]);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === Number(formData.aset_id)) || null;
  }, [assets, formData.aset_id]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: string | number | null | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aset_id || !formData.jenis_kerusakan?.trim()) {
      alert("Mohon pilih aset dan jelaskan jenis kerusakan terlebih dahulu.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData, formData.status === "Closed" ? autoExport : false);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as Error)?.message ||
        "Terjadi kesalahan saat menyimpan data.";
      alert("Gagal menyimpan data: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editItem ? `Edit / Update Laporan Kerusakan` : `Tambah Laporan Kerusakan Data Center`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editItem
                  ? `Perbarui rincian penanganan ${editItem.nomor_laporan || ""}`
                  : "Catat insiden kerusakan aset fisik atau jaringan data center"}
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

        {/* Modal Body (Atomic Components Composition) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Section 1: Aset Data Center */}
          <FormSectionAset
            tanggal={formData.tanggal || ""}
            jam={formData.jam || ""}
            asetId={formData.aset_id}
            assets={assets}
            selectedAsset={selectedAsset}
            onChange={handleFieldChange}
          />

          {/* Section 2: Detail Kerusakan */}
          <FormSectionKerusakan
            jenisKerusakan={formData.jenis_kerusakan || ""}
            penyebab={formData.penyebab || ""}
            onChange={handleFieldChange}
          />

          {/* Section 3: Tindakan & Target */}
          <FormSectionTindakan
            uraianTindakan={formData.uraian_tindakan || ""}
            status={formData.status || "Baru"}
            targetSelesai={formData.target_selesai || ""}
            penanggungJawabId={formData.penanggung_jawab_id}
            supervisorId={formData.supervisor_id}
            users={users}
            supervisors={supervisors}
            isSupervisor={isSupervisor}
            onChange={handleFieldChange}
          />

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {formData.status === "Closed" ? (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none py-1">
                <input
                  type="checkbox"
                  checked={autoExport}
                  onChange={(e) => setAutoExport(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900">
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  Export setelah disimpan
                </span>
              </label>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-1">
                <FileDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Dokumen dapat diekspor setelah disahkan (Closed) oleh Supervisor.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editItem ? "Simpan Perubahan" : "Kirim Laporan Kerusakan"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

LaporanFormModal.displayName = "LaporanFormModal";
