import React, { memo } from "react";
import { FileText } from "lucide-react";
import { FormLaporanTahunanState } from "../../types";

interface Step1Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
}

export const Step1Informasi: React.FC<Step1Props> = memo(({ formData, onChange }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Informasi Audit</h2>
          <p className="text-xs text-slate-500">
            Tetapkan periode, dasar audit, dan identitas dokumen tahunan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Tahun SMKI <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={2000}
            max={2100}
            value={formData.tahun_smki}
            onChange={(e) => onChange({ tahun_smki: e.target.value })}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />
          <p className="text-[11px] text-slate-500">Periode pelaksanaan audit internal tahunan.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            No. Dokumen <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.no_dokumen}
            onChange={(e) => onChange({ no_dokumen: e.target.value })}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            No. Revisi <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.no_revisi}
            onChange={(e) => onChange({ no_revisi: e.target.value })}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Tanggal Berlaku <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={formData.tanggal_berlaku}
            onChange={(e) => onChange({ tanggal_berlaku: e.target.value })}
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Kriteria Audit <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={2}
          value={formData.kriteria_audit}
          onChange={(e) => onChange({ kriteria_audit: e.target.value })}
          className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Tujuan <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          value={formData.tujuan}
          onChange={(e) => onChange({ tujuan: e.target.value })}
          className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
        />
      </div>
    </div>
  );
});

Step1Informasi.displayName = "Step1Informasi";
