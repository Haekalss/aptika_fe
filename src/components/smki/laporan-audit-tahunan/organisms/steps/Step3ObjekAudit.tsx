import React, { useState, memo } from "react";
import { Target, Plus, Trash2, Sparkles } from "lucide-react";
import { FormLaporanTahunanState, ObjekAuditItem } from "../../types";

interface Step3Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  masterBidang: any[];
}

export const Step3ObjekAudit: React.FC<Step3Props> = memo(({
  formData,
  onChange,
  masterBidang,
}) => {
  const [showAddObjek, setShowAddObjek] = useState(false);
  const [newObjekKode, setNewObjekKode] = useState("");
  const [newObjekNama, setNewObjekNama] = useState("");
  const [newObjekLingkup, setNewObjekLingkup] = useState("");
  const [newObjekUnit, setNewObjekUnit] = useState("");

  // Hasilkan kode OA-XX yang belum dipakai (kode dipakai sebagai key & identitas objek)
  const generateUniqueKodes = (count: number, existing: string[]): string[] => {
    const used = new Set(existing.map((k) => k.trim().toUpperCase()));
    const result: string[] = [];
    let n = 1;
    while (result.length < count) {
      const kode = `OA-${String(n).padStart(2, "0")}`;
      if (!used.has(kode)) {
        used.add(kode);
        result.push(kode);
      }
      n++;
    }
    return result;
  };

  const handleLoadFromMasterBidang = () => {
    if (!masterBidang.length) {
      alert("Master Bidang Auditee kosong.");
      return;
    }
    const kodes = generateUniqueKodes(
      masterBidang.length,
      formData.objek_audit.map((oa) => oa.kode)
    );
    const newItems: ObjekAuditItem[] = masterBidang.map((b, idx) => ({
      kode: kodes[idx],
      nama: `Audit Penerapan SMKI ${b.bidang_auditee}`,
      lingkup: `Pengendalian keamanan informasi, kepatuhan prosedur, dan aset pada ${b.bidang_auditee}`,
      unit: b.bidang_auditee,
      klausul: [
        "Klausul 4 (Konteks Organisasi)",
        "Klausul 6 (Perencanaan)",
        "Annex A.5 (Pengendalian Organisasi)",
      ],
      jadwal: [Math.min(12, ((idx * 2) % 12) + 1)],
    }));

    onChange({
      objek_audit: [...formData.objek_audit, ...newItems],
    });
    alert(`Berhasil menambahkan ${newItems.length} objek audit dari master Bidang Auditee!`);
  };

  const handleAddObjek = () => {
    if (!newObjekNama.trim()) return;
    const existingKodes = formData.objek_audit.map((oa) => oa.kode);
    const manualKode = newObjekKode.trim();
    if (
      manualKode &&
      existingKodes.some((k) => k.trim().toUpperCase() === manualKode.toUpperCase())
    ) {
      alert(`Kode objek "${manualKode}" sudah digunakan. Gunakan kode lain.`);
      return;
    }
    const nextKode = manualKode || generateUniqueKodes(1, existingKodes)[0];
    const newObj: ObjekAuditItem = {
      kode: nextKode,
      nama: newObjekNama.trim(),
      lingkup: newObjekLingkup.trim() || "Penerapan kebijakan dan kontrol keamanan informasi",
      unit: newObjekUnit.trim() || masterBidang[0]?.bidang_auditee || "-",
      klausul: ["Klausul 4 (Konteks Organisasi)", "Klausul 5 (Kepemimpinan)"],
      jadwal: [1],
    };
    onChange({
      objek_audit: [...formData.objek_audit, newObj],
    });
    setNewObjekKode("");
    setNewObjekNama("");
    setNewObjekLingkup("");
    setNewObjekUnit("");
    setShowAddObjek(false);
  };

  const handleRemoveObjek = (kode: string) => {
    onChange({
      objek_audit: formData.objek_audit.filter((oa) => oa.kode !== kode),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Objek Audit</h2>
            <p className="text-xs text-slate-500">
              Tentukan area, unit kerja, atau proses bisnis yang akan diaudit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {masterBidang.length > 0 && (
            <button
              onClick={handleLoadFromMasterBidang}
              type="button"
              title="Generate objek audit otomatis dari master Bidang Auditee"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Isi Semua Master Bidang ({masterBidang.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowAddObjek(!showAddObjek)}
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah objek
          </button>
        </div>
      </div>

      {showAddObjek && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Kode Objek</label>
            <input
              type="text"
              value={newObjekKode}
              onChange={(e) => setNewObjekKode(e.target.value)}
              placeholder={`OA-${String(formData.objek_audit.length + 1).padStart(2, "0")}`}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Objek</label>
            <input
              type="text"
              value={newObjekNama}
              onChange={(e) => setNewObjekNama(e.target.value)}
              placeholder="Nama proses / layanan..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Ruang Lingkup</label>
            <input
              type="text"
              value={newObjekLingkup}
              onChange={(e) => setNewObjekLingkup(e.target.value)}
              placeholder="Lingkup audit..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Unit Kerja (Master)
              </label>
              {masterBidang.length > 0 ? (
                <select
                  value={newObjekUnit}
                  onChange={(e) => {
                    setNewObjekUnit(e.target.value);
                    if (!newObjekNama) {
                      setNewObjekNama(`Audit SMKI ${e.target.value}`);
                    }
                  }}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
                >
                  <option value="">-- Pilih Master Unit --</option>
                  {masterBidang.map((b) => (
                    <option key={b.id_bidang_auditee} value={b.bidang_auditee}>
                      {b.bidang_auditee}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newObjekUnit}
                  onChange={(e) => setNewObjekUnit(e.target.value)}
                  placeholder="Unit..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none"
                />
              )}
            </div>
            <button
              onClick={handleAddObjek}
              type="button"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition self-end h-[34px]"
            >
              Tambah
            </button>
          </div>
        </div>
      )}

      <div>
        <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden table">
          <thead className="bg-slate-50">
            <tr className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 border-b border-slate-200">Kode</th>
              <th className="py-3 px-4 border-b border-slate-200">Nama Objek Audit</th>
              <th className="py-3 px-4 border-b border-slate-200">Ruang Lingkup</th>
              <th className="py-3 px-4 border-b border-slate-200">Unit Kerja</th>
              <th className="py-3 px-4 border-b border-slate-200 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {formData.objek_audit.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-xs text-slate-400">
                  Belum ada objek audit. Klik "Tambah objek" atau "Isi Semua Master Bidang".
                </td>
              </tr>
            ) : (
              formData.objek_audit.map((oa) => (
                <tr key={oa.kode}>
                  <td className="py-3 px-4 font-bold text-slate-700">{oa.kode}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">{oa.nama}</td>
                  <td className="py-3 px-4 text-slate-600">{oa.lingkup}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                      {oa.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemoveObjek(oa.kode)}
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

Step3ObjekAudit.displayName = "Step3ObjekAudit";
