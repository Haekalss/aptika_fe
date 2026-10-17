"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2, Printer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  fetchReviewLogDetail, formatPeriode, formatTanggalIndo, formatWaktu, type ReviewLog,
} from "@/services/smki/reviewLogService";

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

const joinPair = (a?: string | null, b?: string | null) =>
  [a, b && `NIP ${b}`].filter(Boolean).join(" / ") || null;

/** Organism: modal detail review log (read-only). Pola InsidenDetailModal FR-016. */
export default function ReviewLogDetailModal({
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
  const [row, setRow] = useState<ReviewLog | null>(null);
  const [failed, setFailed] = useState(false);

  // Parent me-remount via key per id; setState hanya di callback async.
  useEffect(() => {
    if (id == null) return;
    let alive = true;
    fetchReviewLogDetail(id).then(
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
      title={row ? `Detail Review Log #${row.id} — ${row.obyek_review}` : "Detail Review Log"}
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
              Memuat detail review log...
            </>
          ) : (
            "Gagal memuat detail review log."
          )}
        </div>
      ) : row ? (
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Identitas Review
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Tanggal Review" value={formatTanggalIndo(row.tanggal_review)} />
              <Field label="Periode Review" value={formatPeriode(row.periode_mulai, row.periode_selesai)} />
              <Field label="Obyek Review" value={row.obyek_review} />
              <Field label="Pelaksana Review" value={row.pelaksana_review} />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Rincian Log ({row.items?.length ?? 0})
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">NO</th>
                    <th className="py-2.5 px-3">USER</th>
                    <th className="py-2.5 px-3">IP</th>
                    <th className="py-2.5 px-3">TANGGAL</th>
                    <th className="py-2.5 px-3">WAKTU</th>
                    <th className="py-2.5 px-3">DURASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {row.items && row.items.length > 0 ? (
                    row.items.map((r, i) => (
                      <tr key={r.id ?? i}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{r.user_log}</td>
                        <td className="py-2.5 px-3">{r.ip_address}</td>
                        <td className="py-2.5 px-3">{formatTanggalIndo(r.tanggal)}</td>
                        <td className="py-2.5 px-3">{formatWaktu(r.waktu)}</td>
                        <td className="py-2.5 px-3">{r.durasi}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">Belum ada rincian log.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 p-3">
            <p className="text-[10px] font-bold text-slate-500 mb-1">Tindak Lanjut</p>
            <p className={`text-xs whitespace-pre-wrap ${row.tindak_lanjut ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
              {row.tindak_lanjut || "Belum dilengkapi"}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Pengesahan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Ditandatangani di / Tanggal" value={[row.ditandatangani_di, row.tanggal_ttd && formatTanggalIndo(row.tanggal_ttd)].filter(Boolean).join(", ") || null} />
              <Field label="Dibuat Oleh" value={joinPair(row.dibuat_oleh_nama, row.dibuat_oleh_nip)} />
              <Field label="Mengetahui" value={joinPair(row.mengetahui_nama, row.mengetahui_nip)} />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
