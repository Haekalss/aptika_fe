"use client";

import { ArrowLeft, Pencil, FileDown, Trash2, Paperclip, AlertCircle } from "lucide-react";
import { type ChangeLog, formatTime } from "../lib/model";
import { Badge, Section, secondary, exportButton, panel } from "./ui";

interface Props { log: ChangeLog; onBack: () => void; onEdit: () => void; onDelete: () => void; onExport: () => void; writable: boolean }
function Value({ label, value }: { label: string; value?: string }) {
  return <div><dt className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">{label}</dt><dd className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">{value || "Belum diisi"}</dd></div>;
}
function date(value?: string) {
  return value ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00+07:00")) : "";
}
export default function LogDetail({ log, onBack, onEdit, onDelete, onExport, writable }: Props) {
  const legacy = [log.before, log.action, log.after, log.testing, log.outcome, log.obstacles, log.followUp, log.recovery].some(Boolean);
  return <div className="space-y-5 pb-8">
    <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={15}/> Manajemen Log Perubahan</button>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div><div className="flex flex-wrap items-center gap-2 mb-2"><span className="text-xs font-semibold text-emerald-600">{log.number}</span><Badge value={log.status}/></div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{log.title}</h1><p className="text-xs text-slate-400 mt-2">Rincian formulir log perubahan TI.</p></div>
      <div className="flex gap-2 flex-wrap"><button onClick={onExport} className={exportButton}><FileDown size={15}/> Ekspor (DOCX)</button>{writable && <><button onClick={onEdit} className={secondary}><Pencil size={14}/> Edit</button><button onClick={onDelete} className={secondary}><Trash2 size={14}/> Hapus</button></>}</div>
    </div>
    {log.status === "Draf" && <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs"><AlertCircle size={18} className="shrink-0"/><p>Log ini masih Draf. Pilih Edit, lengkapi isian bertanda bintang, lalu tekan Simpan.</p></div>}
    <Section number="01" title="Detail Dokumen" description="Informasi pada kop dokumen Word."><dl className="grid grid-cols-1 sm:grid-cols-3 gap-5"><Value label="No. Dokumen" value={log.documentNumber}/><Value label="No. Revisi" value={log.documentRevision}/><Value label="Tanggal Berlaku" value={date(log.documentEffectiveDate)}/></dl></Section>
    <Section number="02" title="Log Perubahan" description="Sebelas kolom formulir FR-032."><dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Value label="No. RFC" value={log.rfcNumber}/><Value label="Deskripsi Perubahan" value={log.title}/>
      <Value label="Diminta Oleh" value={log.requestedBy}/><Value label="Tanggal Permintaan" value={date(log.requestedAt)}/>
      <Value label="Jenis Perubahan" value={log.changeType}/><Value label="Prioritas Perubahan" value={log.priority}/>
      <Value label="Dampak ke Lingkungan Produksi" value={log.productionImpact}/><Value label="PIC Perubahan" value={log.executor}/>
      <Value label="Catatan Hasil Perubahan" value={log.resultNotes}/><Value label="Tanggal Rilis ke Produksi" value={date(log.releasedAt)}/>
      <Value label="Catatan Hasil Evaluasi Perubahan" value={log.evaluationNotes}/>
    </dl></Section>
    <Section number="03" title="Referensi Internal" description="Sistem atau aset terkait pencatatan."><dl className="grid grid-cols-1 sm:grid-cols-3 gap-5"><Value label="Sistem / Aset" value={log.system}/><Value label="Unit Kerja / Bidang" value={log.unit}/><Value label="Pencatat" value={log.references?.recorderName}/></dl></Section>
    <Section number="04" title="Penerbitan" description="Nama yang dicantumkan pada dokumen, tanpa alur persetujuan aplikasi."><dl className="grid grid-cols-1 sm:grid-cols-3 gap-5"><Value label="Diterbitkan Pada" value={date(log.issuedAt)}/><Value label="Dibuat Oleh" value={log.preparedBy}/><Value label="Disetujui Oleh" value={log.approvedBy}/></dl></Section>
    {legacy && <details className={`${panel} p-5`}><summary className="text-xs font-bold cursor-pointer">Data historis dari format sebelumnya</summary><dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5"><Value label="Kondisi Sebelum" value={log.before}/><Value label="Tindakan" value={log.action}/><Value label="Kondisi Sesudah" value={log.after}/><Value label="Hasil Pengujian" value={log.testing}/><Value label="Hasil Pelaksanaan" value={log.outcome}/><Value label="Kendala" value={log.obstacles}/><Value label="Tindak Lanjut" value={log.followUp}/><Value label="Catatan Pemulihan" value={log.recovery}/></dl></details>}
    {!!log.attachments.length && <div className={`${panel} p-5`}><h2 className="text-sm font-bold mb-4">Lampiran Lama</h2><ul className="space-y-2">{log.attachments.map(file => <li key={file.id}><a href={file.dataUrl} download={file.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"><Paperclip size={16}/><span className="text-xs font-semibold break-all">{file.name}</span><FileDown size={15} className="ml-auto"/></a></li>)}</ul></div>}
    <div className={`${panel} p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}><div className="text-[10px] text-slate-400 space-y-1"><p>Dibuat: {formatTime(log.createdAt)} WIB</p><p>Terakhir diperbarui: {formatTime(log.updatedAt)} WIB</p></div></div>
  </div>;
}
