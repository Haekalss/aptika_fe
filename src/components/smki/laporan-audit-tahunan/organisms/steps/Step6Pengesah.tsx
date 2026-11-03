import React, { memo } from "react";
import { UserCheck, Sparkles } from "lucide-react";
import { FormLaporanTahunanState } from "../../types";

interface Step6Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  masterPegawai?: any[];
}

export const Step6Pengesah: React.FC<Step6Props> = memo(({ formData, onChange, masterPegawai = [] }) => {
  const handleSelectPenyusun = (nama: string) => {
    if (!nama) return;
    const selected = masterPegawai.find((p) => p.nama === nama);
    onChange({
      disusun_oleh: nama,
      jabatan_penyusun: selected?.jabatan || formData.jabatan_penyusun || "Pengelola SMKI",
    });
  };

  const handleSelectPengesah = (nama: string) => {
    if (!nama) return;
    const selected = masterPegawai.find((p) => p.nama === nama);
    onChange({
      disahkan_oleh: nama,
      jabatan_pengesah: selected?.jabatan || formData.jabatan_pengesah || "Kepala Bidang Aplikasi Informatika",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penyusun & Pengesah</h2>
          <p className="text-xs text-slate-500">
            Tentukan penanggung jawab dokumen formulir rencana tahunan ini dari data master pegawai atau input manual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Penyusun */}
        <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                1
              </span>
              Disusun Oleh
            </h3>
            {masterPegawai.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Master Pegawai
              </span>
            )}
          </div>

          <div className="space-y-3">
            {masterPegawai.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Pilih dari Master Pegawai
                </label>
                <select
                  value={masterPegawai.some((p) => p.nama === formData.disusun_oleh) ? formData.disusun_oleh : ""}
                  onChange={(e) => handleSelectPenyusun(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
                >
                  <option value="">-- Pilih dari Master Pegawai --</option>
                  {masterPegawai.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} {p.jabatan ? `— ${p.jabatan}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Nama Penyusun <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.disusun_oleh}
                onChange={(e) => onChange({ disusun_oleh: e.target.value })}
                placeholder="Nama lengkap penyusun..."
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
                placeholder="Contoh: Pengelola SMKI"
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
            </div>
          </div>
        </div>

        {/* Pengesah */}
        <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                2
              </span>
              Disahkan Oleh
            </h3>
            {masterPegawai.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Master Pegawai
              </span>
            )}
          </div>

          <div className="space-y-3">
            {masterPegawai.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Pilih dari Master Pegawai
                </label>
                <select
                  value={masterPegawai.some((p) => p.nama === formData.disahkan_oleh) ? formData.disahkan_oleh : ""}
                  onChange={(e) => handleSelectPengesah(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
                >
                  <option value="">-- Pilih dari Master Pegawai --</option>
                  {masterPegawai.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} {p.jabatan ? `— ${p.jabatan}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Nama Pengesah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.disahkan_oleh}
                onChange={(e) => onChange({ disahkan_oleh: e.target.value })}
                placeholder="Nama lengkap pimpinan / pejabat pengesah..."
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
                placeholder="Contoh: Kepala Bidang Aplikasi Informatika"
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
