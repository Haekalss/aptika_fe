"use client";

import React, { memo } from "react";
import {
  X,
  FileText,
  Users,
  Target,
  CalendarDays,
  UserCheck,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { LaporanAuditTahunanData } from "@/services/api";
import { StatusBadge } from "../atoms/StatusBadge";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LaporanAuditTahunanData | null;
  onExport?: (id: number, tahun: number | string) => void;
  isExporting?: boolean;
}

const MONTHS_NAME = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
];

export const DetailModal: React.FC<DetailModalProps> = memo(({
  isOpen,
  onClose,
  item,
  onExport,
  isExporting = false,
}) => {
  if (!isOpen || !item) return null;

  const leadAuditor = item.tim_auditor?.find((t) => t.peran === "Lead Auditor");
  const otherAuditors = (item.tim_auditor || []).filter((t) => t.peran !== "Lead Auditor");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 text-emerald-100 px-2.5 py-0.5 rounded-full">
                FR-008 SMKI
              </span>
              <StatusBadge status={item.status || "Draft"} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{item.no_dokumen}</span>
              <span className="text-sm font-medium text-emerald-200">
                (Tahun {item.tahun_smki})
              </span>
            </h2>
            <p className="text-xs text-emerald-100/90">
              Revisi: {item.no_revisi} • Berlaku: {item.tanggal_berlaku}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Informasi & Tujuan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Kriteria & Tujuan Audit</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Kriteria Audit:</span>
                <p className="text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200">
                  {item.kriteria_audit || "-"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tujuan Audit:</span>
                <p className="text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200">
                  {item.tujuan || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Tim Auditor */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Tim Auditor</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Lead Auditor Card */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  LA
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Lead Auditor
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {leadAuditor?.nama_auditor || "-"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Unit: {leadAuditor?.unit_kerja || "-"}
                  </p>
                </div>
              </div>

              {/* Anggota Auditor */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Anggota Tim Auditor ({otherAuditors.length})
                </span>
                {otherAuditors.length === 0 ? (
                  <p className="text-slate-400 italic text-xs">Tidak ada anggota auditor tambahan</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {otherAuditors.map((aud, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-700">{aud.nama_auditor}</span>
                        <span className="text-slate-500 text-[11px]">{aud.unit_kerja}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Objek Audit, Klausul & Jadwal */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Objek Audit & Jadwal Pelaksanaan ({item.objek_audit?.length || 0} Objek)</span>
              </h3>
            </div>

            {(!item.objek_audit || item.objek_audit.length === 0) ? (
              <p className="text-slate-400 italic text-xs text-center py-4">
                Belum ada objek audit yang terdaftar
              </p>
            ) : (
              <div className="space-y-3">
                {item.objek_audit.map((obj, idx) => {
                  const scheduleMonths = (obj.jadwal || []).map((j: any) =>
                    typeof j === "number" ? j : j.bulan
                  );

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {obj.kode_objek}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {obj.objek_audit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Unit: <strong>{obj.unit_kerja}</strong></span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-500">Ruang Lingkup: </span>
                        <span>{obj.ruang_lingkup}</span>
                      </div>

                      {/* Klausul */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Klausul / Dokumen ISO 27001:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(!obj.klausul || obj.klausul.length === 0) ? (
                            <span className="text-slate-400 text-xs italic">-</span>
                          ) : (
                            obj.klausul.map((k: any, kidx: number) => {
                              const text = typeof k === "string" ? k : (k.klausul_annex || k.uraian_klausul);
                              return (
                                <span
                                  key={kidx}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{text}</span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Timeline 12 Bulan Grid */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Jadwal Pelaksanaan (12 Bulan):
                        </span>
                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center">
                          {MONTHS_NAME.map((mName, mIdx) => {
                            const monthNum = mIdx + 1;
                            const isScheduled = scheduleMonths.includes(monthNum);
                            return (
                              <div
                                key={mIdx}
                                className={`py-1 rounded text-[11px] font-bold transition-all ${
                                  isScheduled
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                                title={`Bulan ${mName}: ${isScheduled ? "Terjadwal Audit" : "Tidak Terjadwal"}`}
                              >
                                {mName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Penyusun & Pengesah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Disusun Oleh</span>
              </span>
              <p className="font-bold text-slate-800 text-sm">{item.disusun_oleh || "-"}</p>
              <p className="text-slate-500 text-xs">{item.jabatan_penyusun || "-"}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Disahkan Oleh</span>
              </span>
              <p className="font-bold text-slate-800 text-sm">{item.disahkan_oleh || "-"}</p>
              <p className="text-slate-500 text-xs">{item.jabatan_pengesah || "-"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Formulir Program Tahunan Audit Internal SMKI (FR-008)
          </div>

          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={() => onExport(item.id!, item.tahun_smki)}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>Unduh Dokumen (DOCX)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DetailModal.displayName = "DetailModal";
