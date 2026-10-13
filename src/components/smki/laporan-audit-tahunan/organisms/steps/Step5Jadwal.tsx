import React, { memo } from "react";
import { CalendarDays } from "lucide-react";
import { FormLaporanTahunanState } from "../../types";

interface Step5Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  months: { idx: number; name: string }[];
}

export const Step5Jadwal: React.FC<Step5Props> = memo(({
  formData,
  onChange,
  months,
}) => {
  const handleToggleJadwal = (objekKode: string, monthIdx: number) => {
    onChange({
      objek_audit: formData.objek_audit.map((oa) => {
        if (oa.kode !== objekKode) return oa;
        const exists = oa.jadwal.includes(monthIdx);
        const newJadwal = exists
          ? oa.jadwal.filter((m) => m !== monthIdx)
          : [...oa.jadwal, monthIdx];
        return { ...oa, jadwal: newJadwal };
      }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Jadwal Audit Internal</h2>
          <p className="text-xs text-slate-500">
            Alokasikan bulan pelaksanaan audit untuk setiap objek audit di tahun {formData.tahun_smki}.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden min-w-[700px]">
          <thead className="bg-slate-50">
            <tr className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center">
              <th className="py-3 px-4 border-b border-slate-200 border-r text-left w-64">
                Objek Audit
              </th>
              {months.map((m) => (
                <th key={m.idx} className="py-3 px-2 border-b border-slate-200">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {formData.objek_audit.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-4 text-center text-xs text-slate-400">
                  Belum ada objek audit. Silakan tambahkan di Langkah 3.
                </td>
              </tr>
            ) : (
              formData.objek_audit.map((oa) => (
                <tr key={oa.kode}>
                  <td className="py-3 px-4 border-r border-slate-100">
                    <div className="text-xs font-bold text-slate-700">
                      {oa.kode} - {oa.nama}
                    </div>
                    <div className="text-[10px] text-slate-400">{oa.unit}</div>
                  </td>
                  {months.map((m) => {
                    const isChecked = oa.jadwal.includes(m.idx);
                    return (
                      <td key={m.idx} className="py-2 px-1 text-center">
                        <label className="flex items-center justify-center w-full h-full cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleJadwal(oa.kode, m.idx)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

Step5Jadwal.displayName = "Step5Jadwal";
