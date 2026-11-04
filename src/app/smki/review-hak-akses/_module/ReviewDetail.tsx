"use client";
import { ArrowLeft, Pencil, FileDown, Trash2 } from "lucide-react";
import { type ReactNode } from "react";
import TteSpecimen from "@/components/smki/TteSpecimen";
import { formatDate, type Review } from "./model";
import { Badge, Section, primary, secondary, exportButton, panel } from "./ui";
function Value({label, children}: {label: string; children: ReactNode}) {return <div><dt className="text-[11px] font-bold text-slate-500 mb-1.5">{label}</dt><dd className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{children || "Belum diisi"}</dd></div>;}
export default function ReviewDetail({review, onBack, onEdit, onDelete, onExport}: {review: Review; onBack: () => void; onEdit: () => void; onDelete: () => void; onExport: () => void}) {
  return <div className="space-y-5 pb-8">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-slate-500 font-semibold"><ArrowLeft size={15}/> Manajemen Review Hak Akses</button>
    <div className="flex flex-col sm:flex-row gap-4 justify-between"><div><div className="flex gap-2 items-center mb-2"><span className="text-xs font-semibold text-emerald-600">{review.number}</span><Badge value={review.status}/></div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{review.title}</h1><p className="text-xs text-slate-400 mt-2">Hasil pemeriksaan kesesuaian hak akses pengguna.</p></div><div className="flex flex-wrap gap-2 items-start"><button onClick={onExport} className={exportButton}><FileDown size={15}/> Ekspor (DOCX)</button><button onClick={onEdit} className={secondary}><Pencil size={15}/> Edit Review</button></div></div>
    {review.status === "Draf" && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs p-4">Review masih Draf. Pilih Edit Review untuk melengkapi isian, lalu pilih Simpan.</p>}
    <Section number="01" title="Detail Dokumen" description="Informasi kop pada dokumen Word."><dl className="grid sm:grid-cols-3 gap-5"><Value label="No. Dokumen">{review.documentNumber}</Value><Value label="No. Revisi">{review.documentRevision}</Value><Value label="Tanggal Berlaku">{formatDate(review.documentEffectiveDate)}</Value></dl></Section>
    <Section number="02" title="Identitas Review" description="Identitas pelaksana dan periode pemeriksaan."><dl className="grid sm:grid-cols-2 gap-5"><Value label="Bidang">{review.bidangName}</Value><Value label="Obyek Review">{review.objectName}</Value><Value label="Periode Review">{formatDate(review.periodStart)} s.d. {formatDate(review.periodEnd)}</Value><Value label="Tanggal Review">{formatDate(review.reviewDate)}</Value><Value label="Pelaksana Review">{review.reviewer}</Value><Value label="Pencatat">{review.recorderName}</Value></dl></Section>
    <Section number="03" title="Daftar Pengguna yang Terdaftar dalam Sistem" description={`${review.accounts.length} pengguna tercatat dalam review ini.`}>
      <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left text-xs"><thead><tr>{["No", "User ID yang Ada di Log Sistem", "Tingkat Hak Akses", "Ket. Status User ID"].map(label => <th key={label} scope="col" className="border border-slate-200 dark:border-slate-700 p-3">{label}</th>)}</tr></thead><tbody>{review.accounts.map((account, index) => <tr key={account.id}><td className="border border-slate-200 dark:border-slate-700 p-3">{index + 1}</td><td className="border border-slate-200 dark:border-slate-700 p-3 break-all">{account.username || "Belum diisi"}</td><td className="border border-slate-200 dark:border-slate-700 p-3">{account.currentAccess || "Belum diisi"}</td><td className="border border-slate-200 dark:border-slate-700 p-3"><Badge value={account.userStatus}/></td></tr>)}</tbody></table></div>
    </Section>
    <Section number="04" title="Tindak Lanjut" description="Tindak lanjut hasil review hak akses."><p className="text-xs whitespace-pre-wrap break-words">{review.followUp || "Belum ada tindak lanjut yang dicatat."}</p></Section>
    <Section number="05" title="Penanda Tangan" description="Identitas penanda tangan tercantum di dalam kotak spesimen TTE.">
      <dl className="grid sm:grid-cols-2 gap-5"><Value label="Tempat">{review.location}</Value><Value label="Tanggal Dokumen">{formatDate(review.signedAt)}</Value></dl>
      <div className="grid sm:grid-cols-2 gap-4 mt-5">{[
        {label: "Dibuat Oleh", name: review.preparedBy, nip: review.preparedByNip},
        {label: "Mengetahui", name: review.acknowledgedBy, nip: review.acknowledgedByNip},
      ].map(signer => <div key={signer.label} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
        <h3 className="text-[11px] font-bold text-slate-500">{signer.label}</h3>
        {signer.name ? <TteSpecimen key={`${signer.name}:${signer.nip}`} nama={signer.name} nip={signer.nip} showQr={false} width={260} className="max-w-full"/> : <p className="text-xs text-slate-500">Belum dipilih</p>}
      </div>)}</div>
    </Section>
    <div className={`${panel} p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}><div className="text-[10px] text-slate-400 space-y-1"><p>Dibuat: {formatDate(review.createdAt)}</p><p>Diperbarui: {formatDate(review.updatedAt)}</p></div><div className="flex flex-wrap gap-2"><button className={`${secondary} text-red-600`} onClick={onDelete}><Trash2 size={15}/> Hapus Review</button><button className={primary} onClick={onEdit}><Pencil size={15}/> Edit Review</button></div></div>
  </div>;
}
