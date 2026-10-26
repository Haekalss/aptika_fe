"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Lightbox from "@/components/ui/Lightbox";
import StatusBadge from "@/components/ui/StatusBadge";
import BuktiThumb, { BuktiDownloadLink } from "./BuktiThumb";
import { fetchInsidenDetail, type InsidenRow } from "@/services/smki/pelaporanInsidenService";

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

function joinPair(a?: string | null, b?: string | null): string | null {
  const left = (a ?? "").trim();
  const right = (b ?? "").trim();
  if (left && right) return `${left} / ${right}`;
  return left || right || null;
}

function BuktiRow({
  title,
  nama,
  url,
  id,
  tipe,
  onPreview,
}: {
  title: string;
  nama?: string | null;
  url?: string | null;
  id: number;
  tipe: "pelapor" | "pemilik";
  onPreview?: () => void;
}) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-[11px] text-slate-400">
        {title}: belum ada lampiran.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-3 flex items-center gap-3">
      <BuktiThumb nama={nama} src={url} onPreview={onPreview} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-500">{title} • klik gambar untuk pratinjau</p>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{nama ?? "lampiran"}</p>
      </div>
      <BuktiDownloadLink id={id} tipe={tipe} />
    </div>
  );
}

/** Organism: modal detail laporan (read-only Bagian I + II). */
export default function InsidenDetailModal({
  id,
  onClose,
  onEdit,
}: {
  id: number | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}) {
  const [row, setRow] = useState<InsidenRow | null>(null);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Parent me-remount via key per id, jadi tidak perlu reset di sini.
  // setState hanya di callback async (lolos aturan set-state-in-effect).
  useEffect(() => {
    if (id == null) return;
    let alive = true;
    fetchInsidenDetail(id).then(
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
      title={row ? `Detail Laporan #${row.id} — ${row.nama_sistem}` : "Detail Laporan Insiden"}
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
              onClick={() => onEdit(row.id)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
            >
              Lengkapi / Edit
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
              Memuat detail laporan...
            </>
          ) : (
            "Gagal memuat detail laporan."
          )}
        </div>
      ) : row ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={row.kategori_insiden} uppercase />
            <StatusBadge status={row.status_laporan} />
            <span className="text-[11px] text-slate-400 font-medium">
              {new Date(row.tanggal_laporan).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {" • "}
              {row.jenis_layanan}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Bagian I — Identitas Pelapor & Sistem
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Pelapor" value={`${row.nama_pelapor}${row.jabatan_pelapor ? ` / ${row.jabatan_pelapor}` : ""}`} />
              <Field label="Asal Instansi / NIP" value={joinPair(row.instansi_pelapor, row.nip_pelapor)} />
              <Field label="No HP / Email" value={joinPair(row.no_hp_pelapor, row.email_pelapor)} />
              <Field label="Waktu Kejadian" value={new Date(row.waktu_kejadian).toLocaleString("id-ID")} />
              <Field label="Sistem / Jenis" value={`${row.nama_sistem}${row.jenis_sistem ? ` / ${row.jenis_sistem}` : ""}`} />
              <Field label="URL / IP" value={joinPair(row.url, row.ip_address)} />
              <Field label="OS / Web Server" value={joinPair(row.os, row.web_server)} />
              {row.kategori_lainnya && <Field label="Kategori Lainnya" value={row.kategori_lainnya} />}
            </div>
            <div className="mt-3">
              <BuktiRow title="Bukti pelapor" nama={row.bukti_pelapor_nama} url={row.bukti_pelapor_url} id={row.id} tipe="pelapor" onPreview={() => setLightbox(0)} />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-3">
              Bagian II — Pemilik Sistem & Penanganan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Instansi Pemilik" value={row.nama_instansi_pemilik} />
              <Field label="Telp/Fax" value={row.telp_fax_instansi} />
              <Field label="Email Instansi" value={row.email_instansi} />
              <Field label="Alamat" value={row.alamat_instansi} />
              <Field label="PIC" value={row.nama_pic ? `${row.nama_pic}${row.jabatan_pic ? ` / ${row.jabatan_pic}` : ""}` : null} />
              <Field label="NIP PIC" value={row.nip_pic} />
              <Field label="No HP / Email PIC" value={row.nama_pic ? joinPair(row.no_hp_pic, row.email_pic) : null} />
              <Field label="Lokasi Insiden" value={row.lokasi_insiden} />
              <Field label="ISP" value={row.isp} />
              <Field label="Downtime" value={row.is_downtime ? `Ya${row.durasi_downtime ? ` (${row.durasi_downtime})` : ""}` : "Tidak"} />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-500 mb-1">Deskripsi Kejadian</p>
                <p className={`text-xs whitespace-pre-wrap ${row.deskripsi_kejadian ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                  {row.deskripsi_kejadian || "Belum dilengkapi"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-500 mb-1">Tindakan Awal</p>
                <p className={`text-xs whitespace-pre-wrap ${row.tindakan_awal ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                  {row.tindakan_awal || "Belum dilengkapi"}
                </p>
              </div>
              <BuktiRow title="Bukti pemilik sistem" nama={row.bukti_pemilik_nama} url={row.bukti_pemilik_url} id={row.id} tipe="pemilik" onPreview={() => setLightbox(1)} />
            </div>
          </div>
        </div>
      ) : null}
      {lightbox != null && row && (
        <Lightbox
          images={[
            ...(row.bukti_pelapor_url ? [{
              src: row.bukti_pelapor_url,
              nama: row.bukti_pelapor_nama ?? "Bukti pelapor",
              onDownload: async () => {
                const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
                await downloadBukti(row.id, "pelapor");
              },
            }] : []),
            ...(row.bukti_pemilik_url ? [{
              src: row.bukti_pemilik_url,
              nama: row.bukti_pemilik_nama ?? "Bukti pemilik",
              onDownload: async () => {
                const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
                await downloadBukti(row.id, "pemilik");
              },
            }] : []),
          ]}
          index={Math.min(lightbox, 1)}
          onClose={() => setLightbox(null)}
          onIndex={(i) => setLightbox(i)}
        />
      )}
    </Modal>
  );
}
