"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import type { InsidenDocxParams } from "@/services/smki/pelaporanInsidenService";

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

/** Molecule: modal isi kop dokumen FR-016 sebelum export.
 * Parent me-remount via key setiap dibuka agar isian kembali ke defaults.
 */
export default function InsidenExportModal({
  isOpen,
  onClose,
  onExport,
  exporting,
  defaults,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: InsidenDocxParams) => void;
  exporting: boolean;
  defaults: { no_dokumen: string; no_revisi: string; tanggal_berlaku: string };
}) {
  const [noDokumen, setNoDokumen] = useState(defaults.no_dokumen);
  const [noRevisi, setNoRevisi] = useState(defaults.no_revisi);
  const [tanggalBerlaku, setTanggalBerlaku] = useState(defaults.tanggal_berlaku);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!exporting) onClose();
      }}
      title="Export Dokumen FR-016 (.docx)"
      footer={
        <>
          <button
            type="button"
            disabled={exporting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => onExport({ no_dokumen: noDokumen, no_revisi: noRevisi, tanggal_berlaku: tanggalBerlaku })}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow transition-all"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            {exporting ? "Mengekspor..." : "Unduh DOCX"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[11px] text-slate-500">
          Isian ini tercetak di kop tabel dokumen Word. Tanggal berlaku tidak lagi fix 2022 — isi sesuai kebutuhan.
        </p>
        <FormField label="No. Dokumen">
          <input type="text" value={noDokumen} onChange={(e) => setNoDokumen(e.target.value)} placeholder="F16-SMKI" className={inputCls} />
        </FormField>
        <FormField label="No. Revisi">
          <input type="text" value={noRevisi} onChange={(e) => setNoRevisi(e.target.value)} placeholder="1.0" className={inputCls} />
        </FormField>
        <FormField label="Tanggal Berlaku" hint='Contoh: 14 Februari 2022. Boleh tanggal berjalan, mis. hari ini.'>
          <input type="text" value={tanggalBerlaku} onChange={(e) => setTanggalBerlaku(e.target.value)} placeholder="14 Februari 2022" className={inputCls} />
        </FormField>
      </div>
    </Modal>
  );
}
