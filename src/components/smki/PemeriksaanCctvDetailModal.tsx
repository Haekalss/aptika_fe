"use client";

import React from "react";
import { X, Video, CalendarDays, HardDrive, Clock3, MapPin, User } from "lucide-react";
import { PemeriksaanCctv, formatTanggalIndo, kondisiBadgeClass } from "@/services/smki/pemeriksaanCctvService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: PemeriksaanCctv | null;
}

const Badge = ({ value }: { value: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap ${kondisiBadgeClass(value)}`}>{value}</span>
);

export default function PemeriksaanCctvDetailModal({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;
  const items = data.items || [];
  const th = "text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap";
  const td = "px-3 py-2.5 align-top text-xs text-slate-700 dark:text-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center"><Video size={18} /></div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 text-[11px] font-bold mb-1">ID: PMK-{String(data.id).padStart(3, "0")}</span>
              <h3 className="text-base font-bold">Detail Pemeriksaan CCTV</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Hasil checklist monitoring dan pemeliharaan CCTV.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><MapPin size={12} /> Lingkup</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.lingkup}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><HardDrive size={12} /> Perangkat Perekaman</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.perangkat_perekaman}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><CalendarDays size={12} /> Tanggal Pemeriksaan</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatTanggalIndo(data.tanggal_pemeriksaan)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><Clock3 size={12} /> Kesesuaian Waktu</p>
              <Badge value={data.kesesuaian_waktu} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><User size={12} /> Pemeriksa CCTV</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.nama_pemeriksa || "-"}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3">Rincian CCTV ({items.length})</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[860px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className={th}>No</th><th className={th}>Kode</th><th className={th}>Nama CCTV</th><th className={th}>Lokasi</th>
                    <th className={th}>Fungsi</th><th className={th}>Rekaman</th><th className={th}>Obstacle</th>
                    <th className={th}>Keterangan</th><th className={th}>Tindak Lanjut</th><th className={th}>Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id ?? idx} className="border-t border-slate-100 dark:border-slate-800/70">
                      <td className={td}>{idx + 1}</td>
                      <td className={`${td} font-semibold whitespace-nowrap`}>{it.kode_cctv}</td>
                      <td className={td}>{it.nama_cctv}</td>
                      <td className={td}>{it.lokasi}</td>
                      <td className={td}><Badge value={it.fungsi} /></td>
                      <td className={td}><Badge value={it.rekaman} /></td>
                      <td className={td}><Badge value={it.obstacle} /></td>
                      <td className={`${td} whitespace-pre-line`}>{it.keterangan || "-"}</td>
                      <td className={`${td} whitespace-pre-line`}>{it.tindak_lanjut || "-"}</td>
                      <td className={td}>{it.petugas || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">Terakhir diperbarui: {formatTanggalIndo(data.updated_at)}</p>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">Tutup Detail</button>
          </div>
        </div>
      </div>
    </div>
  );
}
