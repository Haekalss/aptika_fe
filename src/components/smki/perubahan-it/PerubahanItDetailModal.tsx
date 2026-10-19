"use client";

import React, { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileDown,
  Loader2,
  Paperclip,
  Pencil,
  RotateCcw,
  Send,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
  XCircle,
  NotebookPen,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AKSI_RIWAYAT_LABEL,
  extractMessage,
  formatRentangJam,
  formatRupiah,
  formatTanggal,
  formatUkuran,
  formatWaktu,
  jenisLabel,
  risikoLabel,
  statusLabel,
  unduhLampiran,
  type AksiPerubahan,
  type Lampiran,
  type PerubahanIt,
} from "@/services/smki/perubahanIt";
import { exportPerubahanItPdf } from "@/services/smki/exportPerubahanIt";
import { exportPerubahanItDocx } from "@/services/smki/exportPerubahanItDocx";
import { RisikoBadge, StatusBadge } from "./PerubahanItBadges";
import { useModalA11y } from "./useModalA11y";

interface Props {
  open: boolean;
  item: PerubahanIt | null;
  /** true saat modal lain (aksi / hapus) tampil di atas modal ini. */
  locked?: boolean;
  onClose: () => void;
  onEdit: (item: PerubahanIt) => void;
  onDelete: (item: PerubahanIt) => void;
  onAksi: (item: PerubahanIt, aksi: AksiPerubahan) => void;
}

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        {judul}
      </h3>
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </div>
    </section>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

const teks = (v?: string | null) => (v && v.trim() ? v : "-");

export default function PerubahanItDetailModal({ open, item, locked = false, onClose, onEdit, onDelete, onAksi }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mencetak, setMencetak] = useState(false);
  const [mengekspor, setMengekspor] = useState(false);
  const [mengunduhId, setMengunduhId] = useState<number | null>(null);

  useModalA11y(open, locked, onClose, dialogRef);

  if (!open || !item) return null;

  const izin = item.izin;

  const cetak = async () => {
    setMencetak(true);
    try {
      await exportPerubahanItPdf(item);
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal membuat PDF formulir."));
    } finally {
      setMencetak(false);
    }
  };

  const ekspor = async () => {
    setMengekspor(true);
    try {
      await exportPerubahanItDocx([item]);
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal membuat DOCX formulir."));
    } finally {
      setMengekspor(false);
    }
  };

  const unduh = async (l: Lampiran) => {
    setMengunduhId(l.id);
    try {
      await unduhLampiran(item.id, l);
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal mengunduh lampiran."));
    } finally {
      setMengunduhId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-rfc-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="detail-rfc-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
                {item.no_rfc}
              </h2>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              Dibuat {formatTanggal(item.tanggal)} · Formulir Permintaan Perubahan TI (FR-015)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Isi */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {item.status === "dikembalikan" && item.catatan_pengembalian && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="font-extrabold">Dikembalikan oleh Koordinator Agen</p>
              <p className="mt-1 whitespace-pre-wrap">{item.catatan_pengembalian}</p>
            </div>
          )}
          {item.status === "ditolak" && item.alasan_penolakan && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              <p className="font-extrabold">Ditolak oleh Penanggung Jawab Perangkat</p>
              <p className="mt-1 whitespace-pre-wrap">{item.alasan_penolakan}</p>
            </div>
          )}

          <Bagian judul="Informasi Pemohon">
            <dl>
              <Baris label="Judul Perubahan">{teks(item.judul)}</Baris>
              <Baris label="Pemohon">{teks(item.pemohon)}</Baris>
              <Baris label="Unit Kerja">{teks(item.unit_kerja)}</Baris>
              <Baris label="Perangkat Daerah">{teks(item.perangkat_daerah)}</Baris>
              <Baris label="Nomor Surat / Contact Person">{teks(item.nomor_surat_kontak)}</Baris>
            </dl>
          </Bagian>

          <Bagian judul="Informasi Data">
            <dl>
              <Baris label="Jenis Perubahan">{jenisLabel(item.jenis_perubahan)}</Baris>
              <Baris label="Perubahan yang diharapkan">{teks(item.perubahan_diharapkan)}</Baris>
              <Baris label="Latar belakang perubahan">{teks(item.latar_belakang)}</Baris>
              <Baris label="Rincian perubahan yang diajukan">{teks(item.rincian_perubahan)}</Baris>
              <Baris label="Risiko bila tidak dilakukan">
                <div className="flex flex-col gap-1.5">
                  <RisikoBadge tingkat={item.tingkat_risiko} />
                  {item.tingkat_risiko && <span className="sr-only">{risikoLabel(item.tingkat_risiko)}</span>}
                  <span>{teks(item.keterangan_risiko)}</span>
                </div>
              </Baris>
              <Baris label="Solusi yang diharapkan">{teks(item.solusi_diharapkan)}</Baris>
              <Baris label="Risiko Perubahan">{teks(item.risiko_perubahan)}</Baris>
              <Baris label="Alternatif Perubahan">{teks(item.alternatif_perubahan)}</Baris>
              <Baris label="Biaya Perubahan">{formatRupiah(item.estimasi_biaya)}</Baris>
              <Baris label="Waktu Perubahan">
                {item.tanggal_perubahan
                  ? `${formatTanggal(item.tanggal_perubahan)}${
                      formatRentangJam(item.jam_mulai, item.jam_selesai)
                        ? ` · ${formatRentangJam(item.jam_mulai, item.jam_selesai)}`
                        : ""
                    }`
                  : "-"}
              </Baris>
              <Baris label="Lampiran">
                {item.lampiran.length === 0 ? (
                  "-"
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {item.lampiran.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <Paperclip size={13} className="flex-shrink-0 text-slate-500" aria-hidden="true" />
                          <span className="truncate">{l.nama_asli}</span>
                          <span className="flex-shrink-0 text-[11px] text-slate-500">{formatUkuran(l.ukuran)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => unduh(l)}
                          disabled={mengunduhId === l.id}
                          aria-label={`Unduh ${l.nama_asli}`}
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                        >
                          {mengunduhId === l.id ? (
                            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Download size={12} aria-hidden="true" />
                          )}
                          Unduh
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Baris>
            </dl>
          </Bagian>

          <Bagian judul="Persetujuan & Pelaksanaan">
            <dl>
              <Baris label="Diajukan Pemohon">{item.tanggal_diajukan ? formatWaktu(item.tanggal_diajukan) : "-"}</Baris>
              <Baris label="Diterima Koordinator Agen">
                {item.diterima_pada ? `${teks(item.diterima_oleh_nama)} · ${formatWaktu(item.diterima_pada)}` : "-"}
              </Baris>
              <Baris label="Persetujuan Penanggung Jawab">
                {item.disetujui_pada ? `${teks(item.disetujui_oleh_nama)} · ${formatWaktu(item.disetujui_pada)}` : "-"}
              </Baris>
              <Baris label="Dilaksanakan Agen">
                {item.dilaksanakan_pada
                  ? `${teks(item.dilaksanakan_oleh_nama)} · ${formatTanggal(item.tanggal_pelaksanaan)}`
                  : "-"}
              </Baris>
              <Baris label="Catatan pelaksanaan">{teks(item.catatan_pelaksanaan)}</Baris>
            </dl>
          </Bagian>

          <section>
            <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Riwayat Tahapan
            </h3>
            {item.riwayat.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">Belum ada riwayat.</p>
            ) : (
              <ol className="relative ml-2 border-l border-slate-200 dark:border-slate-700">
                {[...item.riwayat].reverse().map((r) => (
                  <li key={r.id} className="mb-4 ml-4 last:mb-0">
                    <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-600 dark:border-slate-900" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {AKSI_RIWAYAT_LABEL[r.aksi] ?? r.aksi}
                      <span className="ml-2 font-medium text-slate-500 dark:text-slate-400">
                        → {statusLabel(r.status_ke)}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {r.nama_user} · {formatWaktu(r.waktu)}
                    </p>
                    {r.catatan && (
                      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                        {r.catatan}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Footer aksi */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={cetak}
            disabled={mencetak}
            className={`${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:ring-emerald-600`}
          >
            {mencetak ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <FileDown size={14} aria-hidden="true" />}
            Cetak PDF
          </button>
          <button
            type="button"
            onClick={ekspor}
            disabled={mengekspor}
            className={`${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:ring-emerald-600`}
          >
            {mengekspor ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <FileDown size={14} aria-hidden="true" />}
            Ekspor DOCX
          </button>

          {izin.can_delete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className={`${btn} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-800 dark:hover:bg-rose-950/40 focus-visible:ring-rose-600`}
            >
              <XCircle size={14} aria-hidden="true" /> Hapus
            </button>
          )}
          {izin.can_edit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className={`${btn} border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-slate-800 dark:hover:bg-amber-950/40 focus-visible:ring-amber-600`}
            >
              <Pencil size={14} aria-hidden="true" /> Ubah
            </button>
          )}
          {izin.can_ajukan && (
            <button
              type="button"
              onClick={() => onAksi(item, "ajukan")}
              className={`${btn} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600`}
            >
              <Send size={14} aria-hidden="true" /> {item.status === "dikembalikan" ? "Ajukan Ulang" : "Ajukan"}
            </button>
          )}
          {izin.can_kembalikan && (
            <button
              type="button"
              onClick={() => onAksi(item, "kembalikan")}
              className={`${btn} bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600`}
            >
              <RotateCcw size={14} aria-hidden="true" /> Kembalikan
            </button>
          )}
          {izin.can_terima && (
            <button
              type="button"
              onClick={() => onAksi(item, "terima")}
              className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600`}
            >
              <CheckCircle2 size={14} aria-hidden="true" /> Terima
            </button>
          )}
          {izin.can_tolak && (
            <button
              type="button"
              onClick={() => onAksi(item, "tolak")}
              className={`${btn} bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600`}
            >
              <ThumbsDown size={14} aria-hidden="true" /> Tolak
            </button>
          )}
          {izin.can_setujui && (
            <button
              type="button"
              onClick={() => onAksi(item, "setujui")}
              className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600`}
            >
              <ThumbsUp size={14} aria-hidden="true" /> Setujui
            </button>
          )}
          {izin.can_laksanakan && (
            <>
              <button
                type="button"
                onClick={() => onAksi(item, "simpan_catatan")}
                className={`${btn} border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-800 dark:hover:bg-blue-950/40 focus-visible:ring-blue-600`}
              >
                <NotebookPen size={14} aria-hidden="true" /> Simpan Catatan
              </button>
              <button
                type="button"
                onClick={() => onAksi(item, "laksanakan")}
                className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600`}
              >
                <Wrench size={14} aria-hidden="true" /> Tandai Dilaksanakan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
