import React, { useState, memo } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { FormLaporanTahunanState, AuditorItem } from "../../types";

interface Step2Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  masterAuditors: any[];
}

export const Step2TimAuditor: React.FC<Step2Props> = memo(({
  formData,
  onChange,
  masterAuditors,
}) => {
  const [showAddAuditor, setShowAddAuditor] = useState(false);
  const [newAuditorName, setNewAuditorName] = useState("");
  const [newAuditorUnit, setNewAuditorUnit] = useState("");

  const handleSelectLeadAuditor = (auditorName: string) => {
    onChange({
      lead_auditor: auditorName,
      unit_lead: formData.unit_lead || "Tim Audit Internal SMKI",
    });
  };

  const handleAddAuditor = () => {
    if (!newAuditorName.trim()) return;
    const newAud: AuditorItem = {
      id: Date.now(),
      nama: newAuditorName.trim(),
      unit: newAuditorUnit.trim() || formData.unit_lead || "Tim Audit Internal SMKI",
      peran: "Auditor",
    };
    onChange({
      auditors: [...formData.auditors, newAud],
    });
    setNewAuditorName("");
    setNewAuditorUnit("");
    setShowAddAuditor(false);
  };

  const handleRemoveAuditor = (id: number) => {
    onChange({
      auditors: formData.auditors.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tim Auditor</h2>
            <p className="text-xs text-slate-500">
              Tentukan ketua tim (Lead Auditor) dan auditor anggota untuk periode SMKI {formData.tahun_smki}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Lead Auditor <span className="text-rose-500">*</span>
            </label>
            {masterAuditors.length > 0 && (
              <span className="text-[11px] text-emerald-700 font-medium">
                Pilih dari master auditor
              </span>
            )}
          </div>

          {masterAuditors.length > 0 ? (
            <select
              value={formData.lead_auditor}
              onChange={(e) => handleSelectLeadAuditor(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
            >
              <option value="">-- Pilih dari Master Auditor --</option>
              {masterAuditors.map((aud) => (
                <option key={aud.id_auditor} value={aud.nama_auditor}>
                  {aud.nama_auditor} {aud.nip_auditor ? `(NIP: ${aud.nip_auditor})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData.lead_auditor}
              onChange={(e) => onChange({ lead_auditor: e.target.value })}
              placeholder="Nama Lead Auditor..."
              className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
            />
          )}
          <p className="text-[11px] text-slate-500">
            Memimpin dan mengoordinasikan pelaksanaan audit internal.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Unit Kerja Lead Auditor</label>
          <input
            type="text"
            value={formData.unit_lead}
            onChange={(e) => onChange({ unit_lead: e.target.value })}
            placeholder="Unit Kerja..."
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Anggota Auditor</h3>
            <p className="text-xs text-slate-500">
              {formData.auditors.length} anggota auditor ditambahkan
            </p>
          </div>
          <button
            onClick={() => setShowAddAuditor(!showAddAuditor)}
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah auditor
          </button>
        </div>

        {showAddAuditor && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Auditor</label>
              {masterAuditors.length > 0 ? (
                <select
                  value={newAuditorName}
                  onChange={(e) => setNewAuditorName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
                >
                  <option value="">-- Pilih dari Master --</option>
                  {masterAuditors.map((aud) => (
                    <option key={aud.id_auditor} value={aud.nama_auditor}>
                      {aud.nama_auditor}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newAuditorName}
                  onChange={(e) => setNewAuditorName(e.target.value)}
                  placeholder="Nama lengkap..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
                />
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Unit Kerja</label>
              <input
                type="text"
                value={newAuditorUnit}
                onChange={(e) => setNewAuditorUnit(e.target.value)}
                placeholder="Contoh: Tim Audit SMKI"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddAuditor}
                type="button"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowAddAuditor(false)}
                type="button"
                className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden table">
          <thead className="bg-slate-50">
            <tr className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 border-b border-slate-200">Nama Auditor</th>
              <th className="py-3 px-4 border-b border-slate-200">Unit Kerja</th>
              <th className="py-3 px-4 border-b border-slate-200">Peran</th>
              <th className="py-3 px-4 border-b border-slate-200 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {formData.auditors.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-xs text-slate-400">
                  Belum ada anggota auditor. Klik "Tambah auditor".
                </td>
              </tr>
            ) : (
              formData.auditors.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-4 font-semibold text-slate-700">{a.nama}</td>
                  <td className="py-3 px-4 text-slate-600">{a.unit}</td>
                  <td className="py-3 px-4 text-slate-600">{a.peran}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemoveAuditor(a.id)}
                      type="button"
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

Step2TimAuditor.displayName = "Step2TimAuditor";
