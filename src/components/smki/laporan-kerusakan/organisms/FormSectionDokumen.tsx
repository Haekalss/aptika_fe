import React, { memo } from "react";

interface FormSectionDokumenProps {
  noDokumen: string;
  noRevisi: string;
  tanggalBerlaku: string;
  onChange: (field: string, value: string) => void;
}

const inputCls =
  "w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

export const FormSectionDokumen = memo(({
  noDokumen,
  noRevisi,
  tanggalBerlaku,
  onChange,
}: FormSectionDokumenProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
        0
      </span>
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Identitas Dokumen (FR-024)
      </h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          No. Dokumen <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          maxLength={100}
          value={noDokumen}
          onChange={(e) => onChange("no_dokumen", e.target.value)}
          className={inputCls}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          No. Revisi <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          maxLength={50}
          value={noRevisi}
          onChange={(e) => onChange("no_revisi", e.target.value)}
          className={inputCls}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Tanggal Berlaku <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          value={tanggalBerlaku}
          onChange={(e) => onChange("tanggal_berlaku", e.target.value)}
          className={inputCls}
          required
        />
      </div>
    </div>
  </div>
));

FormSectionDokumen.displayName = "FormSectionDokumen";

