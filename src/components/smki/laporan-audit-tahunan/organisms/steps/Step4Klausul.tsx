import React, { memo } from "react";
import { ListChecks } from "lucide-react";
import { FormLaporanTahunanState } from "../../types";

interface Step4Props {
  formData: FormLaporanTahunanState;
  onChange: (updated: Partial<FormLaporanTahunanState>) => void;
  klausulOptions: string[];
}

export const Step4Klausul: React.FC<Step4Props> = memo(({
  formData,
  onChange,
  klausulOptions,
}) => {
  const handleToggleKlausul = (objekKode: string, klausulText: string) => {
    onChange({
      objek_audit: formData.objek_audit.map((oa) => {
        if (oa.kode !== objekKode) return oa;
        const exists = oa.klausul.includes(klausulText);
        const newKlausul = exists
          ? oa.klausul.filter((k) => k !== klausulText)
          : [...oa.klausul, klausulText];
        return { ...oa, klausul: newKlausul };
      }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <ListChecks className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Klausul Audit</h2>
          <p className="text-xs text-slate-500">
            Pilih klausul standar SMKI yang akan diterapkan pada setiap objek audit.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {formData.objek_audit.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada objek audit. Silakan tambahkan di Langkah 3.
          </p>
        ) : (
          formData.objek_audit.map((oa) => (
            <div key={oa.kode} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {oa.kode}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{oa.nama}</h3>
                <span className="text-xs text-slate-400">({oa.klausul.length} klausul terpilih)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {klausulOptions.map((k) => {
                  const isChecked = oa.klausul.includes(k);
                  return (
                    <label
                      key={k}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? "border-emerald-300 bg-emerald-50/40 text-emerald-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleKlausul(oa.kode, k)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="leading-tight font-medium">{k}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

Step4Klausul.displayName = "Step4Klausul";
