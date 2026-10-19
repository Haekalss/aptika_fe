"use client";

import React, { useEffect, useState } from "react";
import { FileDown, Loader2, Printer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  fetchDrpEvaluasiDetail, formatTanggalIndo, formatWaktuPengujian, CHECKLIST_GROUPS, type DrpEvaluasi,
} from "@/services/smki/drpEvaluasiService";

function Field({ label, value }: { label: string; value?: string | null }) {
  const empty = !value || value === "";
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p
        className={`text-xs font-semibold break-words ${
          empty
            ? "text-slate-400 dark:text-slate-500 italic font-medium"
            : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {empty ? "Belum dilengkapi" : value}
      </p>
    </div>
  );
}

function MiniTable({ heads, rows, empty }: { heads: string[]; rows: (string | null | undefined)[][]; empty: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
          <tr>
            <th className="py-2.5 px-3 w-12 text-center">NO</th>
            {heads.map((h) => (<th key={h} className="py-2.5 px-3">{h}</th>))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {rows.length > 0 ? rows.map((r, i) => (
            <tr key={i} className="align-top">
              <td className="py-2.5 px-3 text-center font-bold text-slate-400">{i + 1}</td>
              {r.map((c, j) => (<td key={j} className={`py-2.5 px-3 whitespace-pre-wrap ${j === 0 ? "font-semibold text-slate-800 dark:text-slate-200" : ""}`}>{c || "-"}</td>))}
            </tr>
          )) : (
            <tr><td colSpan={heads.length + 1} className="py-6 text-center text-slate-400">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">{children}</h4>
);
const HR = () => <div className="border-t border-slate-100 dark:border-slate-800" />;

/** Organism: modal detail evaluasi DRP (read-only). Pola InsidenDetailModal FR-016. */
export default function DrpEvaluasiDetailModal({
  id,
  onClose,
  onEdit,
  onPrint,
  onDocx,
}: {
  id: number | null;
  onClose: () => void;
  onEdit: (id: number) => void;
  onPrint: (id: number) => void;
  onDocx: (id: number) => void;
}) {
  const [row, setRow] = useState<DrpEvaluasi | null>(null);
  const [failed, setFailed] = useState(false);

  // Parent me-remount via key per id; setState hanya di callback async.
  useEffect(() => {
    if (id == null) return;
    let alive = true;
    fetchDrpEvaluasiDetail(id).then(
      (res) => {
        if (alive) setRow(res.data);
      },
      () => {
        if (alive) setFailed(true);
      }
    );
    return () => {
      alive = false;
    };
  }, [id]);

  const loading = id != null && row == null && !failed;

  return (
    <Modal
      isOpen={id != null}
      onClose={onClose}
      title={row ? `Detail Evaluasi DRP #${row.id} — ${formatTanggalIndo(row.tanggal_pengujian)}` : "Detail Evaluasi DRP"}
      size="xl"
      footer={
        row ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => onDocx(row.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
            >
              <FileDown size={13} />
              Unduh .docx
            </button>
            <button
              type="button"
              onClick={() => onPrint(row.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all"
            >
              <Printer size={13} />
              Cetak
            </button>
            <button
              type="button"
              onClick={() => onEdit(row.id)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
            >
              Edit
            </button>
          </>
        ) : undefined
      }
    >
      {loading || failed ? (
        <div className="py-12 text-center text-xs text-slate-400">
          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat detail evaluasi DRP...
            </>
          ) : (
            "Gagal memuat detail evaluasi DRP."
          )}
        </div>
      ) : row ? (
        <div className="flex flex-col gap-5">
          <div>
            <H>A. Evaluasi Pengujian DRP</H>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tanggal dan Waktu Pengujian" value={formatWaktuPengujian(row.tanggal_pengujian, row.waktu_mulai, row.waktu_selesai)} />
              <Field label="Tipe Pengujian" value={row.tipe_pengujian} />
              <Field label="Tujuan Pengujian" value={row.tujuan} />
              <Field label="Cakupan Pengujian" value={row.cakupan} />
              <Field label="Asumsi Bencana" value={row.asumsi_bencana} />
              <Field label="Asumsi Ketersediaan Sumber Daya" value={row.asumsi_sumber_daya} />
            </div>
          </div>
          <HR />
          <div>
            <H>Evaluasi – Persyaratan Waktu ({row.waktu?.length ?? 0})</H>
            <MiniTable heads={["SISTEM TI", "RTO IDEAL", "PENCAPAIAN RTO", "KENDALA"]} empty="Belum ada data."
              rows={(row.waktu ?? []).map((r) => [r.sistem_ti, r.rto_ideal, r.pencapaian_rto, r.kendala])} />
          </div>
          <div>
            <H>Evaluasi – Proses DRP ({row.proses?.length ?? 0})</H>
            <MiniTable heads={["PROSES", "AKTIVITAS", "HASIL EVALUASI", "REKOMENDASI", "PIC"]} empty="Belum ada data."
              rows={(row.proses ?? []).map((r) => [r.proses, r.aktivitas, r.hasil_evaluasi, r.rekomendasi, r.pic])} />
          </div>
          <div>
            <H>Evaluasi – Team ({row.tim?.length ?? 0})</H>
            <MiniTable heads={["PERAN", "TANGGUNG JAWAB", "EVALUASI", "REKOMENDASI"]} empty="Belum ada data."
              rows={(row.tim ?? []).map((r) => [r.peran, r.tanggung_jawab, r.evaluasi, r.rekomendasi])} />
          </div>
          <HR />
          <div>
            <H>B. Check List Pengujian BCP</H>
            <div className="flex flex-col gap-3">
              {CHECKLIST_GROUPS.map((g) => (
                <div key={g.kategori} className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 p-3">
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5">{g.kategori} ({g.kategoriEn})</p>
                  <ul className="flex flex-col gap-1">
                    {g.items.map((it) => {
                      const ok = !!row.checklist?.[it.key];
                      return (
                        <li key={it.key} className="flex items-start gap-2 text-xs">
                          <span className={`mt-0.5 inline-flex w-4 h-4 shrink-0 items-center justify-center rounded border text-[10px] font-black ${ok ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 text-transparent"}`}>✓</span>
                          <span className={ok ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>{it.teks}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <HR />
          <div>
            <H>Pengesahan & Lampiran</H>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Dibuat Oleh" value={[row.dibuat_oleh_nama, row.dibuat_oleh_tanggal && formatTanggalIndo(row.dibuat_oleh_tanggal)].filter(Boolean).join(" — ") || null} />
              <Field label="Diperiksa Oleh" value={[row.diperiksa_oleh_nama, row.diperiksa_oleh_tanggal && formatTanggalIndo(row.diperiksa_oleh_tanggal)].filter(Boolean).join(" — ") || null} />
              <Field label="Disetujui Oleh" value={[row.disetujui_oleh_nama, row.disetujui_oleh_tanggal && formatTanggalIndo(row.disetujui_oleh_tanggal)].filter(Boolean).join(" — ") || null} />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1">Lampiran Laporan Pengujian DRP</p>
              <p className={`text-xs whitespace-pre-wrap ${row.lampiran ? "text-slate-700 dark:text-slate-200" : "text-slate-400 italic"}`}>{row.lampiran || "Belum dilengkapi"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
