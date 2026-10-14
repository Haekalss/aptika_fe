import React, { memo } from "react";
import { UserCheck } from "lucide-react";
import { FormLaporanTahunanState } from "../../types";

interface Step6Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
}

export const Step6Pengesah: React.FC<Step6Props> = memo(({ formData, onChange }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penyusun & Pengesah</h2>
          <p className="text-xs text-slate-500">
            Tentukan penanggung jawab dokumen formulir rencana tahunan ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Penyusun */}
        <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
              1
            </span>
            Disusun Oleh
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Nama Penyusun <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.disusun_oleh}
                onChange={(e) => onChange({ disusun_oleh: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Jabatan / Peran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jabatan_penyusun}
                onChange={(e) => onChange({ jabatan_penyusun: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
            </div>
          </div>
        </div>

        {/* Pengesah */}
        <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
              2
            </span>
            Disahkan Oleh
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Nama Pengesah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.disahkan_oleh}
                onChange={(e) => onChange({ disahkan_oleh: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Jabatan / Peran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jabatan_pengesah}
                onChange={(e) => onChange({ jabatan_pengesah: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Step6Pengesah.displayName = "Step6Pengesah";
