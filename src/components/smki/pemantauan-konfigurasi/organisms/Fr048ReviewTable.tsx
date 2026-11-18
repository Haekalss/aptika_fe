"use client";

import { KESESUAIAN_MAP } from "../constants";
import type { PemantauanObjekDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Tabel kesesuaian read-only per objek (UC-03/UC-05). Baris Tidak Sesuai disorot. */
export default function Fr048ReviewTable({ objekList }: { objekList: PemantauanObjekDto[] }) {
  return (
    <div className="flex flex-col gap-4">
      {objekList.map((objek) => (
        <div key={objek.objekId} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">{objek.objekNama}</span>
            <span className="text-[9px] font-bold text-slate-400">{objek.items.length} baris</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2 font-bold">Nama Konfigurasi</th>
                  <th className="px-3 py-2 font-bold">Nilai Aktual</th>
                  <th className="px-3 py-2 font-bold">Nilai Standar</th>
                  <th className="px-3 py-2 font-bold">Kesesuaian</th>
                  <th className="px-3 py-2 font-bold">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {objek.items.map((item, i) => {
                  const notOk = item.kesesuaian === "tidak_sesuai";
                  const badge = item.kesesuaian ? KESESUAIAN_MAP[item.kesesuaian] : null;
                  return (
                    <tr key={item.id ?? i} className={`border-t border-slate-100 dark:border-slate-800 text-[11px] ${notOk ? "bg-rose-50/60 dark:bg-rose-950/20" : ""}`}>
                      <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{item.namaKonfigurasi}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.nilaiAktual}</td>
                      <td className="px-3 py-2 text-slate-500 italic">{item.nilaiStandar ?? "—"}</td>
                      <td className="px-3 py-2">{badge ? <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-md border ${badge.badgeClass}`}>{badge.label}</span> : <span className="text-slate-400 italic">Belum</span>}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300 max-w-[240px]">{item.keterangan || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
