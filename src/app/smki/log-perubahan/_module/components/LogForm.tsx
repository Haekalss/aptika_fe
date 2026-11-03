"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ArrowLeft, Save, UploadCloud, Paperclip, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { type ChangeLog, type LogInput, defaultDocumentNumber, emptyInput, validateLog } from "../lib/model";
import type { ReferenceData } from "../lib/references";
import { Section, control, primary, secondary, panel } from "./ui";

interface Props {
  log: ChangeLog | null; unit: string; recorderName: string;
  references: { data: ReferenceData | null; error: string; loading: boolean; retry: () => void };
  onBack: () => void; onSave: (input: LogInput, status: "Draf" | "Tersimpan") => void; saving?: boolean;
  onBidangChange: (id: number) => void;
}

type TextField = "documentNumber" | "documentRevision" | "documentEffectiveDate" | "rfcNumber" |
  "title" | "requestedBy" | "requestedAt" | "changeType" | "priority" | "productionImpact" |
  "resultNotes" | "releasedAt" | "evaluationNotes" | "issuedAt" | "preparedBy" | "approvedBy";

export default function LogForm({ log, unit, recorderName, references, onBack, onSave, onBidangChange, saving = false }: Props) {
  const [input, setInput] = useState<LogInput>({ ...emptyInput, preparedBy: recorderName, unit, ...log, documentNumber: log?.documentNumber || defaultDocumentNumber });
  const [objectValue, setObjectValue] = useState(log?.references ? `${log.references.objectKind}:${log.references.objectId}` : "");
  const [employeeValue, setEmployeeValue] = useState(log?.references?.executorId ? String(log.references.executorId) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reading, setReading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const data = references.data;
  const selectedObject = data?.objects.find(item => `${item.kind}:${item.id}` === objectValue);
  const selectedEmployee = data?.employees.find(item => String(item.id) === employeeValue);
  const update = (key: TextField, value: string) => {
    setInput(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: "" }));
  };
  const field = (key: TextField, label: string, options: { type?: string; multiline?: boolean; placeholder?: string } = {}) => (
    <div key={key}>
      <label htmlFor={`log-${key}`} className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">{label} <span className="text-red-500" aria-label="wajib untuk Simpan">*</span></label>
      {options.multiline
        ? <textarea id={`log-${key}`} rows={3} maxLength={key === "title" ? 255 : 5000} value={input[key] ?? ""} onChange={event => update(key, event.target.value)} className={`${control} resize-y`} aria-invalid={!!errors[key]}/>
        : <input id={`log-${key}`} type={options.type ?? "text"} maxLength={255} value={input[key] ?? ""} onChange={event => update(key, event.target.value)} placeholder={options.placeholder} className={control} aria-invalid={!!errors[key]}/>}
      {errors[key] && <p className="text-[11px] text-red-600 mt-1" role="alert">{errors[key]}</p>}
    </div>
  );
  const save = (status: "Draf" | "Tersimpan") => {
    if (!data || references.loading) return;
    const next: LogInput = {
      ...input, unit: data.bidang.name, system: selectedObject?.label ?? "", executor: selectedEmployee?.name ?? "",
      references: selectedObject ? {
        bidangId: data.bidang.id, recorderId: log?.references?.recorderId ?? data.recorder.id,
        recorderName: log?.references?.recorderName ?? data.recorder.name,
        objectKind: selectedObject.kind, objectId: selectedObject.id, executorId: selectedEmployee?.id ?? null,
      } : undefined,
    };
    const nextErrors = validateLog(next, status === "Tersimpan");
    if (!selectedObject) nextErrors.system = "Pilih sistem atau aset dari master data.";
    if (employeeValue && !selectedEmployee) nextErrors.executor = "Pilih ulang PIC dari master pegawai.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(`log-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    onSave(next, status);
  };
  const addAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (input.attachments.length + files.length > 5 || files.reduce((sum, file) => sum + file.size, input.attachments.reduce((sum, file) => sum + file.size, 0)) > 3 * 1024 * 1024) {
      toast.error("Maksimal 5 lampiran dengan total ukuran 3 MB per log."); return;
    }
    if (files.some(file => !/\.(pdf|docx|xlsx|png|jpe?g)$/i.test(file.name))) { toast.error("Gunakan PDF, DOCX, XLSX, PNG, atau JPG."); return; }
    setReading(true);
    try {
      const attachments = await Promise.all(files.map(file => new Promise<{ id: string; name: string; size: number; dataUrl: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, size: file.size, dataUrl: String(reader.result) });
        reader.onerror = () => reject(new Error("Lampiran tidak dapat dibaca."));
        reader.readAsDataURL(file);
      })));
      setInput(previous => ({ ...previous, attachments: [...previous.attachments, ...attachments] }));
    } catch { toast.error("Lampiran tidak dapat dibaca. Coba pilih ulang berkas."); }
    finally { setReading(false); }
  };
  return <div className="space-y-5 pb-8">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={15}/> Manajemen Log Perubahan</button>
    <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{log ? "Edit Log Perubahan" : "Formulir Log Perubahan"}</h1><p className="text-xs text-slate-400 mt-2">Isi satu baris log sesuai kolom formulir FR-032. Gunakan Simpan Draf jika isian belum lengkap.</p></div>
    {references.loading && <p role="status" className="text-xs text-slate-500">Memuat data referensi...</p>}
    {references.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"><p>{references.error}</p><button type="button" onClick={references.retry} className={`${secondary} mt-3`}>Coba Lagi</button></div>}
    {log && !log.references && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">Log lama perlu dipilih ulang sistem/aset dan PIC dari master data saat diedit.</p>}
    <form noValidate onSubmit={event => { event.preventDefault(); save("Tersimpan"); }} className="space-y-5">
      <p className="text-[11px] text-slate-500 dark:text-slate-400"><span className="font-bold text-red-500" aria-hidden="true">*</span> Wajib untuk Simpan. Draf cukup mengisi Deskripsi Perubahan dan referensi sistem/aset.</p>
      <Section number="01" title="Detail Dokumen" description="Informasi pada kop dokumen Word.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field("documentNumber", "No. Dokumen", { placeholder: "FR-032/KOM.03.05/SANDIKAMI" })}
          {field("documentRevision", "No. Revisi", { placeholder: "0.0" })}
          {field("documentEffectiveDate", "Tanggal Berlaku", { type: "date" })}
        </div>
      </Section>
      <Section number="02" title="Log Perubahan" description="Isian sesuai sebelas kolom formulir FR-032.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("rfcNumber", "No. RFC", { placeholder: "Nomor Request for Change" })}
          {field("title", "Deskripsi Perubahan", { multiline: true })}
          {field("requestedBy", "Diminta Oleh")}
          {field("requestedAt", "Tanggal Permintaan", { type: "date" })}
          {field("changeType", "Jenis Perubahan", { placeholder: "Contoh: Normal / Darurat" })}
          {field("priority", "Prioritas Perubahan", { placeholder: "Contoh: Tinggi" })}
          <div className="sm:col-span-2">{field("productionImpact", "Dampak ke Lingkungan Produksi", { multiline: true })}</div>
          <div>
            <label htmlFor="log-executor" className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">PIC Perubahan <span className="text-red-500" aria-label="wajib untuk Simpan">*</span></label>
            <select id="log-executor" value={employeeValue} disabled={!data || references.loading} onChange={event => { setEmployeeValue(event.target.value); setErrors(previous => ({ ...previous, executor: "" })); }} className={control} aria-invalid={!!errors.executor}>
              <option value="">Pilih PIC dari master pegawai</option>
              {employeeValue && !selectedEmployee && <option value={employeeValue} disabled>PIC lama tidak tersedia — pilih ulang</option>}
              {data?.employees.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {data && !data.employees.length && <p className="text-[10px] text-slate-400 mt-1">Master pegawai belum tersedia. Hubungi pengelola master data.</p>}
            {errors.executor && <p role="alert" className="text-[11px] text-red-600 mt-1">{errors.executor}</p>}
          </div>
          <div className="sm:col-span-2">{field("resultNotes", "Catatan Hasil Perubahan", { multiline: true })}</div>
          {field("releasedAt", "Tanggal Rilis ke Produksi", { type: "date" })}
          <div className="sm:col-span-2">{field("evaluationNotes", "Catatan Hasil Evaluasi Perubahan", { multiline: true })}</div>
        </div>
      </Section>
      <Section number="03" title="Referensi Internal" description="Sistem atau aset dan bidang terkait pencatatan log.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="log-system" className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">Nama Sistem / Aset <span className="text-red-500">*</span></label>
            <select id="log-system" value={objectValue} disabled={!data || references.loading} onChange={event => { setObjectValue(event.target.value); setErrors(previous => ({ ...previous, system: "" })); }} className={control} aria-invalid={!!errors.system}>
              <option value="">Pilih sistem atau aset TI</option>
              {objectValue && !selectedObject && <option value={objectValue} disabled>Referensi lama tidak tersedia — pilih ulang</option>}
              <optgroup label="Sistem / Aplikasi">{data?.objects.filter(item => item.kind === "sistem").map(item => <option key={`sistem:${item.id}`} value={`sistem:${item.id}`}>{item.label}</option>)}</optgroup>
              <optgroup label="Aset TI Bidang">{data?.objects.filter(item => item.kind === "aset").map(item => <option key={`aset:${item.id}`} value={`aset:${item.id}`}>{item.label}</option>)}</optgroup>
            </select>
            {errors.system && <p role="alert" className="text-[11px] text-red-600 mt-1">{errors.system}</p>}
          </div>
          <div><label htmlFor="log-unit" className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">Unit Kerja / Bidang</label>
            {data?.canAccessAllBidang && !log
              ? <select id="log-unit" value={data.bidang.id} disabled={saving} onChange={event => { setObjectValue(""); onBidangChange(Number(event.target.value)); }} className={control}>{data.bidangs.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              : <input id="log-unit" readOnly value={data?.bidang.name ?? log?.unit ?? unit} className={`${control} cursor-default`}/>}
          </div>
        </div>
      </Section>
      <Section number="04" title="Penerbitan" description="Nama pembuat dan pihak yang dicantumkan sebagai penyetuju dokumen. Isian ini tidak memicu alur persetujuan aplikasi.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field("issuedAt", "Diterbitkan Pada", { type: "date" })}
          {field("preparedBy", "Dibuat Oleh")}
          {field("approvedBy", "Disetujui Oleh")}
        </div>
      </Section>
      <Section number="05" title="Bukti Pendukung" description="Lampiran opsional untuk dokumentasi perubahan.">
        <input ref={fileInput} type="file" multiple accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" className="sr-only" aria-label="Pilih lampiran pendukung" onChange={addAttachments}/>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <div className="flex gap-3 items-center"><UploadCloud size={24} className="text-emerald-500"/><div><p className="text-xs font-bold text-slate-600 dark:text-slate-300">Unggah bukti perubahan</p><p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, XLSX, PNG, JPG · Maks. 5 berkas / total 3 MB</p></div></div>
          <button type="button" onClick={() => fileInput.current?.click()} disabled={reading} className={secondary}>{reading ? "Membaca berkas..." : "Pilih Berkas"}</button>
        </div>
        <ul className="space-y-2 mt-3">{input.attachments.map(file => <li key={file.id} className="flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3"><div className="flex items-center gap-2 min-w-0"><Paperclip size={16} className="text-emerald-600 shrink-0"/><div className="min-w-0"><p className="text-xs font-semibold truncate">{file.name}</p><p className="text-[10px] text-slate-400">{Math.ceil(file.size / 1024)} KB</p></div></div><button type="button" aria-label={`Hapus lampiran ${file.name}`} onClick={() => setInput(previous => ({ ...previous, attachments: previous.attachments.filter(item => item.id !== file.id) }))} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={15}/></button></li>)}</ul>
      </Section>
      <div className={`${panel} p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}><div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Simpan pencatatan perubahan?</p><p className="text-[10px] text-slate-400 mt-1">Simpan memerlukan seluruh kolom bertanda bintang. Draf dapat dilengkapi kemudian.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={onBack} disabled={saving} className={secondary}>Batal</button><button type="button" onClick={() => save("Draf")} disabled={saving || reading || references.loading || !data} className={secondary}>Simpan Draf</button><button type="submit" disabled={saving || reading || references.loading || !data} className={primary}><Save size={15}/> {saving ? "Menyimpan..." : "Simpan"}</button></div></div>
    </form>
  </div>;
}
