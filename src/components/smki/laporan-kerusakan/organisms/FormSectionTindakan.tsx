import React, { memo } from "react";

interface UserOption {
  id: number;
  name: string;
  role?: string;
  email?: string;
}

interface FormSectionTindakanProps {
  uraianTindakan: string;
  status: string;
  targetSelesai: string;
  penanggungJawabId?: number | null;
  supervisorId?: number | null;
  users: UserOption[];
  supervisors?: UserOption[];
  isSupervisor?: boolean;
  onChange: (field: string, value: string | number | null) => void;
}

export const FormSectionTindakan = memo(({
  uraianTindakan,
  status,
  targetSelesai,
  penanggungJawabId,
  supervisorId,
  users,
  supervisors = [],
  isSupervisor = false,
  onChange,
}: FormSectionTindakanProps) => {
  const supervisorList = supervisors.length > 0 ? supervisors : users;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
          3
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Tindakan Perbaikan, Penugasan & Tanda Tangan Mengetahui
        </h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Uraian Tindakan Penanganan
        </label>
        <textarea
          rows={3}
          placeholder="Catat tindakan pemeriksaan yang telah/akan dilakukan, kontak vendor, penggantian modul..."
          value={uraianTindakan}
          onChange={(e) => onChange("uraian_tindakan", e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Penanggung Jawab (Teknisi Penanganan)
          </label>
          <select
            value={penanggungJawabId || ""}
            onChange={(e) => onChange("penanggung_jawab_id", e.target.value ? Number(e.target.value) : null)}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">-- Tetapkan Teknisi --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "admin" ? "Supervisor" : "Teknisi"})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Teknisi yang ditugaskan menangani insiden kerusakan di lapangan.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Pejabat / Supervisor (TTD Mengetahui)</span>
          </label>
          <select
            value={supervisorId || ""}
            onChange={(e) => {
              const selectedId = e.target.value ? Number(e.target.value) : null;
              onChange("supervisor_id", selectedId);
              const selectedUser = supervisorList.find((s) => s.id === selectedId);
              if (selectedUser) {
                onChange("supervisor_nama", selectedUser.name);
              }
            }}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
          >
            <option value="">-- Pilih Supervisor / Pejabat Mengetahui --</option>
            {supervisorList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role === "admin" ? "Supervisor SMKI" : "Pejabat APTIKA"})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Nama pejabat yang menandatangani kolom &quot;Mengetahui&quot; pada dokumen fisik.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Status Penanganan
          </label>
          <select
            value={status || "Baru"}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="Baru">Baru</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai (Menunggu Validasi Supervisor)</option>
            {isSupervisor && <option value="Closed">Closed (Disahkan & Disetujui)</option>}
          </select>
          {!isSupervisor && (
            <span className="text-[10px] text-amber-600 mt-1 block">
              * Status &quot;Closed&quot; hanya dapat disahkan setelah validasi oleh Supervisor.
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Target Selesai
          </label>
          <input
            type="date"
            value={targetSelesai}
            onChange={(e) => onChange("target_selesai", e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Estimasi target waktu penyelesaian perbaikan perangkat.
          </span>
        </div>
      </div>
    </div>
  );
});

FormSectionTindakan.displayName = "FormSectionTindakan";

