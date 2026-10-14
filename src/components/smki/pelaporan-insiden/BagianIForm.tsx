"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import FormField from "@/components/ui/FormField";
import SectionTitle from "@/components/ui/SectionTitle";
import UploadBox from "./UploadBox";
import FormActions from "./FormActions";
import { JENIS_SISTEM_OPTIONS, KATEGORI_OPTIONS, type BagianIData } from "./types";

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

/** Organism: form Bagian I. Parent terima data + File[] untuk dikirim via FormData ke backend. */
export default function BagianIForm({
  onSubmit,
  onCancel,
  submitting = false,
}: {
  onSubmit: (data: BagianIData) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<BagianIData>({
    kategori: "",
    kategoriLainnya: "",
    jenisLayanan: "",
    tanggalLaporan: "",
    nama: "",
    jabatan: "",
    instansi: "",
    nip: "",
    noHp: "",
    email: "",
    tglKejadian: "",
    waktuKejadian: "",
    namaSistem: "",
    jenisSistem: "",
    url: "",
    ip: "",
    os: "",
    webServer: "",
    files: [],
  });
  const set = (k: keyof BagianIData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="p-6 sm:p-8 flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="flex flex-col gap-4">
        <SectionTitle title="Kategori & Jenis Pelaporan" />
        <FormField label="Kategori Insiden" required>
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 dark:text-slate-300">
            {KATEGORI_OPTIONS.map((k) => (
              <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="kategori"
                  checked={form.kategori === k}
                  onChange={() => setForm((f) => ({ ...f, kategori: k }))}
                  className="accent-emerald-600"
                />
                {k}
              </label>
            ))}
          </div>
        </FormField>
        <FormField
          label="Penjelasan kategori lainnya"
          hint="Diisi hanya jika kategori lainnya dipilih."
        >
          <input
            type="text"
            value={form.kategoriLainnya}
            onChange={set("kategoriLainnya")}
            className={inputCls}
            placeholder="Jelaskan kategori secara singkat"
          />
        </FormField>
        <FormField label="Jenis Layanan/Pelaporan" required>
          <div className="flex gap-4 text-[11px] text-slate-600 dark:text-slate-300">
            {["Proaktif", "Reaktif"].map((j) => (
              <label key={j} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="jenis_layanan"
                  checked={form.jenisLayanan === j}
                  onChange={() => setForm((f) => ({ ...f, jenisLayanan: j }))}
                  className="accent-emerald-600"
                />
                {j}
              </label>
            ))}
          </div>
        </FormField>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800" />

      <div className="flex flex-col gap-4">
        <SectionTitle title="Identitas Pelapor" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Tanggal Laporan" required>
            <input type="date" value={form.tanggalLaporan} onChange={set("tanggalLaporan")} className={inputCls} />
          </FormField>
          <FormField label="Nama" required>
            <input type="text" value={form.nama} onChange={set("nama")} placeholder="Masukkan nama pelapor" className={inputCls} />
          </FormField>
          <FormField label="Jabatan">
            <input type="text" value={form.jabatan} onChange={set("jabatan")} placeholder="Masukkan jabatan pelapor" className={inputCls} />
          </FormField>
          <FormField label="Asal Instansi" required>
            <input type="text" value={form.instansi} onChange={set("instansi")} placeholder="Masukkan asal instansi" className={inputCls} />
          </FormField>
          <FormField label="NIP">
            <input type="text" value={form.nip} onChange={set("nip")} placeholder="Masukkan NIP" className={inputCls} />
          </FormField>
          <FormField label="No HP">
            <input type="text" value={form.noHp} onChange={set("noHp")} placeholder="Masukkan nomor HP aktif" className={inputCls} />
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={set("email")} placeholder="Masukkan email aktif" className={inputCls} />
          </FormField>
          <FormField label="Mulai Tanggal Kejadian" required>
            <input type="date" value={form.tglKejadian} onChange={set("tglKejadian")} className={inputCls} />
          </FormField>
          <FormField label="Mulai Waktu Kejadian" required>
            <input type="time" value={form.waktuKejadian} onChange={set("waktuKejadian")} className={inputCls} />
          </FormField>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800" />

      <div className="flex flex-col gap-4">
        <SectionTitle title="Sistem yang Terkena Pengaruh Insiden" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Sistem" required>
            <input type="text" value={form.namaSistem} onChange={set("namaSistem")} placeholder="Masukkan nama sistem terdampak" className={inputCls} />
          </FormField>
          <FormField label="Jenis Sistem">
            <select value={form.jenisSistem} onChange={set("jenisSistem")} className={inputCls}>
              <option value="">Pilih Jenis Sistem</option>
              {JENIS_SISTEM_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </FormField>
          {(
            [
              ["url", "URL (http/https)", "Masukkan URL sistem"],
              ["ip", "IP Address", "Masukkan alamat IP"],
              ["os", "OS", "Masukkan sistem operasi"],
              ["webServer", "Web Server", "Masukkan web server"],
            ] as const
          ).map(([key, label, ph]) => (
            <FormField key={key} label={label}>
              <input
                type="text"
                value={form[key]}
                onChange={set(key)}
                placeholder={ph}
                className={inputCls}
              />
            </FormField>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800" />

      <div className="flex flex-col gap-3">
        <SectionTitle title="Bukti dari Pelapor / Lampiran" />
        <p className="text-[11px] text-slate-500">
          Harap melampirkan kejadian, tangkapan screenshot atau dokumentasi yang mendukung laporan.
        </p>
        <UploadBox
          files={form.files}
          onChange={(files) => setForm((f) => ({ ...f, files }))}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 items-start">
        <Info size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
            Bagian II dilengkapi oleh Pemilik Sistem
          </h4>
          <p className="text-[11px] text-blue-600 dark:text-blue-400">
            Setelah Bagian I disimpan, laporan diteruskan kepada Pemilik Sistem untuk melengkapi
            identitas, analisis kejadian, PIC dan tindakan penanganan.
          </p>
        </div>
      </div>

      <FormActions onCancel={onCancel} submitLabel="Simpan Laporan" submitting={submitting} />
    </form>
  );
}
