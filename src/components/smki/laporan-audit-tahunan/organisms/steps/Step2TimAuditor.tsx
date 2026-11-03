import React, { useState, memo } from "react";
import { Users, Plus, Trash2, Sparkles } from "lucide-react";
import { FormLaporanTahunanState, AuditorItem } from "../../types";

interface Step2Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  masterAuditors: any[];
  masterPegawai?: any[];
}

export const Step2TimAuditor: React.FC<Step2Props> = memo(({
  formData,
  onChange,
  masterAuditors,
  masterPegawai = [],
}) => {
  const [showAddAuditor, setShowAddAuditor] = useState(false);
  const [newAuditorName, setNewAuditorName] = useState("");
  const [newAuditorUnit, setNewAuditorUnit] = useState("");

  const handleSelectLeadAuditor = (auditorName: string) => {
    if (!auditorName) return;
    onChange({
      lead_auditor: auditorName,
      unit_lead: formData.unit_lead || "Tim Audit Internal SMKI",
    });
  };

  const handleSelectMemberMaster = (val: string) => {
    if (!val) return;
    // Check if in masterAuditors
    const fromAud = masterAuditors.find((a) => a.nama_auditor === val);
    if (fromAud) {
      setNewAuditorName(fromAud.nama_auditor);
      setNewAuditorUnit(formData.unit_lead || "Tim Audit Internal SMKI");
      return;
    }
    // Check if in masterPegawai
    const fromPeg = masterPegawai.find((p) => p.nama === val);
    if (fromPeg) {
      setNewAuditorName(fromPeg.nama);
      setNewAuditorUnit(fromPeg.jabatan || formData.unit_lead || "Tim Audit Internal SMKI");
      return;
    }
    setNewAuditorName(val);
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
              Tentukan ketua tim (Lead Auditor) dan auditor anggota untuk periode SMKI {formData.tahun_smki} dari data master atau input manual.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Lead Auditor <span className="text-rose-500">*</span>
            </label>
            {(masterAuditors.length > 0 || masterPegawai.length > 0) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" /> Master Data
              </span>
            )}
          </div>

          {(masterAuditors.length > 0 || masterPegawai.length > 0) && (
            <div>
              <select
                value={
                  masterAuditors.some((a) => a.nama_auditor === formData.lead_auditor)
                    ? formData.lead_auditor
                    : masterPegawai.some((p) => p.nama === formData.lead_auditor)
                    ? formData.lead_auditor
                    : ""
                }
                onChange={(e) => handleSelectLeadAuditor(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition mb-2"
              >
                <option value="">-- Pilih dari Master Auditor / Pegawai --</option>
                {masterAuditors.length > 0 && (
                  <optgroup label="Master Auditor Internal SMKI">
                    {masterAuditors.map((aud) => (
                      <option key={`aud-${aud.id_auditor}`} value={aud.nama_auditor}>
                        {aud.nama_auditor} {aud.nip_auditor ? `(NIP: ${aud.nip_auditor})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {masterPegawai.length > 0 && (
                  <optgroup label="Master Pegawai Diskominfo">
                    {masterPegawai.map((peg) => (
                      <option key={`peg-${peg.id}`} value={peg.nama}>
                        {peg.nama} {peg.jabatan ? `— ${peg.jabatan}` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          <input
            type="text"
            value={formData.lead_auditor}
            onChange={(e) => onChange({ lead_auditor: e.target.value })}
            placeholder="Atau ketik nama Lead Auditor..."
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
          />
          <p className="text-[11px] text-slate-500">
            Memimpin dan mengoordinasikan pelaksanaan audit internal.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Unit Kerja Lead Auditor</label>
          <input
            type="text"
            value={formData.unit_lead}
            onChange={(e) => onChange({ unit_lead: e.target.value })}
            placeholder="Unit Kerja..."
            className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 transition"
          />
          <p className="text-[11px] text-slate-500">
            Contoh: Tim Audit Internal SMKI / Bidang Persandian & Keamanan Informasi
          </p>
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
              {(masterAuditors.length > 0 || masterPegawai.length > 0) && (
                <select
                  value=""
                  onChange={(e) => handleSelectMemberMaster(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none mb-1.5"
                >
                  <option value="">-- Pilih dari Master --</option>
                  {masterAuditors.length > 0 && (
                    <optgroup label="Master Auditor SMKI">
                      {masterAuditors.map((aud) => (
                        <option key={`m-aud-${aud.id_auditor}`} value={aud.nama_auditor}>
                          {aud.nama_auditor}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {masterPegawai.length > 0 && (
                    <optgroup label="Master Pegawai">
                      {masterPegawai.map((peg) => (
                        <option key={`m-peg-${peg.id}`} value={peg.nama}>
                          {peg.nama}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              )}
              <input
                type="text"
                value={newAuditorName}
                onChange={(e) => setNewAuditorName(e.target.value)}
                placeholder="Atau ketik nama auditor..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
              />
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
                type="button"
                onClick={handleAddAuditor}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowAddAuditor(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {formData.auditors.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Belum ada anggota auditor yang ditambahkan.</p>
            <p className="text-[11px] text-slate-400">
              Klik &quot;Tambah auditor&quot; di atas untuk memilih dari master auditor atau input manual.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {formData.auditors.map((aud) => (
              <div
                key={aud.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{aud.nama}</p>
                  <p className="text-xs text-slate-500">{aud.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {aud.peran}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuditor(aud.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Step2TimAuditor.displayName = "Step2TimAuditor";
