"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import FormField from "@/components/ui/FormField";
import SectionTitle from "@/components/ui/SectionTitle";
import StatusBadge from "@/components/ui/StatusBadge";
import Lightbox from "@/components/ui/Lightbox";
import BuktiThumb, { BuktiDownloadLink } from "./BuktiThumb";
import UploadBox from "./UploadBox";
import type { BagianIIData } from "./types";

export const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

export type SetField = (
  k: keyof BagianIIData
) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

export function IdentitasSection({ form, set }: { form: BagianIIData; set: SetField }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <SectionTitle title="Identitas Instansi" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Nama Instansi">
            <input type="text" value={form.namaInstansi} onChange={set("namaInstansi")} placeholder="Masukkan nama instansi pemilik sistem" className={inputCls} />
          </FormField>
          <FormField label="Telp/Fax">
            <input type="text" value={form.telpFax} onChange={set("telpFax")} placeholder="Masukkan nomor telepon atau fax" className={inputCls} />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.emailInstansi} onChange={set("emailInstansi")} placeholder="Masukkan email instansi" className={inputCls} />
          </FormField>
          <FormField label="Alamat Lengkap" className="md:col-span-3">
            <input type="text" value={form.alamat} onChange={set("alamat")} placeholder="Masukkan alamat lengkap instansi" className={inputCls} />
          </FormField>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <div className="flex flex-col gap-4">
        <SectionTitle title="Administrator/Pemilik Sistem (PIC)" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(
            [
              ["namaPic", "Nama", "Masukkan nama penanggung jawab sistem"],
              ["jabatanPic", "Jabatan", "Masukkan jabatan penanggung jawab"],
              ["nipPic", "NIP", "Masukkan NIP"],
              ["noHpPic", "No HP", "Masukkan nomor HP aktif"],
              ["emailPic", "Email", "Masukkan email aktif"],
            ] as const
          ).map(([key, label, ph]) => (
            <FormField key={key} label={label}>
              <input type="text" value={form[key]} onChange={set(key)} placeholder={ph} className={inputCls} />
            </FormField>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KejadianSection({
  form,
  set,
  setForm,
}: {
  form: BagianIIData;
  set: SetField;
  setForm: React.Dispatch<React.SetStateAction<BagianIIData>>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <SectionTitle title="Rincian Kejadian & Dampak Insiden" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Lokasi Insiden">
            <input type="text" value={form.lokasi} onChange={set("lokasi")} placeholder="Masukkan lokasi insiden" className={inputCls} />
          </FormField>
          <FormField label="Deskripsi Kejadian (harus disertai bukti/screenshot)" className="md:col-span-3">
            <textarea rows={4} value={form.deskripsi} onChange={set("deskripsi")} placeholder="Jelaskan kronologi kejadian secara rinci" className={`${inputCls} resize-none`} />
          </FormField>
          <FormField label="Internet Services Provider (ISP)">
            <input type="text" value={form.isp} onChange={set("isp")} placeholder="Masukkan nama penyedia internet" className={inputCls} />
          </FormField>
          <FormField label="Down time/system down">
            <div className="flex gap-4 text-[11px] text-slate-600 dark:text-slate-300 mt-2">
              {["Ya", "Tidak"].map((v) => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="downtime"
                    checked={form.downtime === v}
                    onChange={() => setForm((f) => ({ ...f, downtime: v }))}
                    className="accent-emerald-600"
                  />
                  {v}
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="Durasi waktu system down" hint="Bila status Down time/system down = Ya">
            <input type="text" value={form.durasi} onChange={set("durasi")} placeholder="Masukkan durasi gangguan" className={inputCls} />
          </FormField>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <div className="flex flex-col gap-3">
        <SectionTitle title="Tindakan Teknis/Kebijakan yang Sudah Dilakukan Pertama Kali" />
        <textarea rows={4} value={form.tindakan} onChange={set("tindakan")} placeholder="Jelaskan tindakan penanganan awal yang sudah dilakukan" className={`${inputCls} resize-none`} />
      </div>
    </div>
  );
}

export function LampiranStatusSection({
  form,
  setForm,
  existingPemilik = null,
  pemilikId,
  pemilikRemoved = false,
  onRemovePemilik,
  onRestorePemilik,
  canEditStatus,
}: {
  form: BagianIIData;
  setForm: React.Dispatch<React.SetStateAction<BagianIIData>>;
  existingPemilik?: { nama: string; url: string } | null;
  pemilikId?: number | string | null;
  pemilikRemoved?: boolean;
  onRemovePemilik?: () => void;
  onRestorePemilik?: () => void;
  canEditStatus: boolean;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionTitle title="Lampiran Administrator Pemilik Sistem" />
        <p className="text-[11px] text-slate-500">
          Tambahkan lampiran di sini selain yang telah disampaikan Pelapor.
        </p>
        {existingPemilik && !pemilikRemoved && (
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <BuktiThumb nama={existingPemilik.nama} src={existingPemilik.url} size="sm" onPreview={() => setPreview(true)} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {existingPemilik.nama}
                </p>
                <p className="text-[10px] text-slate-500">Telah diunggah • Lampiran Pemilik Sistem</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {pemilikId != null ? (
                <BuktiDownloadLink id={pemilikId} tipe="pemilik" label="Unduh" />
              ) : (
                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed">
                  Unduh
                </span>
              )}
              {onRemovePemilik && (
                <button
                  type="button"
                  onClick={onRemovePemilik}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        )}
        {existingPemilik && pemilikRemoved && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              File lama ({existingPemilik.nama}) akan dihapus saat disimpan.
            </p>
            {onRestorePemilik && (
              <button
                type="button"
                onClick={onRestorePemilik}
                className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
              >
                Batalkan
              </button>
            )}
          </div>
        )}
        <UploadBox
          label="Bukti tambahan pemilik sistem"
          files={form.files}
          onChange={(files) => setForm((f) => ({ ...f, files }))}
        />
        {preview && existingPemilik && (
          <Lightbox
            images={[{
              src: existingPemilik.url,
              nama: existingPemilik.nama,
              onDownload: pemilikId != null ? async () => {
                const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
                await downloadBukti(pemilikId, "pemilik");
              } : undefined,
            }]}
            index={0}
            onClose={() => setPreview(false)}
            onIndex={() => {}}
          />
        )}
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <div className="flex flex-col gap-3">
        <SectionTitle title="Status Laporan" />
        {canEditStatus ? (
          <>
            <p className="text-[11px] text-slate-500">Status merupakan urutan alur penanganan laporan insiden.</p>
            <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {["Menunggu Pemilik Sistem", "Dalam Penanganan", "Selesai"].map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status_laporan"
                    checked={form.status === s}
                    onChange={() => setForm((f) => ({ ...f, status: s }))}
                    className="accent-emerald-600"
                  />
                  {s}
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <StatusBadge status={form.status || "Menunggu Pemilik Sistem"} />
            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              Status penanganan diubah oleh Admin CSIRT. Hubungi admin jika status perlu diperbarui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
