"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2, Printer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  fetchPerangkatPribadiDetail, formatTanggalIndo, type PerangkatPribadi,
} from "@/services/smki/perangkatPribadiService";

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

/** Organism: modal detail formulir BYOD (read-only). Pola InsidenDetailModal FR-016. */
export default function PerangkatDetailModal({
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
  const [row, setRow] = useState<PerangkatPribadi | null>(null);
  const [failed, setFailed] = useState(false);

  // Parent me-remount via key per id; setState hanya di callback async.
  useEffect(() => {
    if (id == null) return;
    let alive = true;
    fetchPerangkatPribadiDetail(id).then(
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
      title={row ? `Detail Formulir BYOD #${row.id} — ${row.unit_kerja}` : "Detail Formulir BYOD"}
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
              Memuat detail formulir BYOD...
            </>
          ) : (
            "Gagal memuat detail formulir BYOD."
          )}
        </div>
      ) : row ? (
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Yang Bertanda Tangan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Nama" value={row.nama} />
              <Field label="NIP" value={row.nip} />
              <Field label="Jabatan" value={row.jabatan} />
              <Field label="Unit Kerja" value={row.unit_kerja} />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Daftar Perangkat Pribadi ({row.perangkat?.length ?? 0})
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">NO</th>
                    <th className="py-2.5 px-3">NAMA</th>
                    <th className="py-2.5 px-3">NIP</th>
                    <th className="py-2.5 px-3">JENIS</th>
                    <th className="py-2.5 px-3">MEREK/TIPE</th>
                    <th className="py-2.5 px-3">NOMOR SERI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {row.perangkat?.map((p, i) => (
                    <tr key={p.id ?? i}>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{p.nama}</td>
                      <td className="py-2.5 px-3">{p.nip || "-"}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={p.jenis_perangkat} uppercase /></td>
                      <td className="py-2.5 px-3">{p.merek_tipe}</td>
                      <td className="py-2.5 px-3">{p.nomor_seri}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Pengesahan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Ditandatangani di" value={row.ditandatangani_di} />
              <Field label="Tanggal" value={row.tanggal_ttd ? formatTanggalIndo(row.tanggal_ttd) : null} />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
