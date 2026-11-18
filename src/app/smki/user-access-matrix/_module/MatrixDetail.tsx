"use client";

import { type ReactNode } from "react";
import { ArrowLeft, FileDown, Pencil, Trash2 } from "lucide-react";
import { formatDate, type MatrixRecord } from "./model";
import { Badge, Section, exportButton, panel, primary, secondary } from "./ui";

function Value({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-slate-500 mb-1.5">{label}</dt>
      <dd className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
        {children || "Belum diisi"}
      </dd>
    </div>
  );
}

export default function MatrixDetail({
  matrix,
  onBack,
  onEdit,
  onDelete,
  onExport,
}: {
  matrix: MatrixRecord;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  return (
    <div className="space-y-5 pb-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-violet-600"
      >
        <ArrowLeft size={15} /> Manajemen User Access Matrix
      </button>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <span className="text-xs font-semibold text-violet-600">{matrix.number}</span>
            <Badge value={matrix.status} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            User Access Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            {matrix.unit} · {matrix.documentNumber}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-start">
          <button onClick={onExport} className={exportButton}>
            <FileDown size={15} /> Ekspor (DOCX)
          </button>
          <button onClick={onEdit} className={secondary}>
            <Pencil size={15} /> Ubah Formulir
          </button>
        </div>
      </div>

      {matrix.status === "Draf" && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs p-4">
          Formulir masih Draf. Pilih Ubah Formulir untuk melengkapi isian, lalu pilih Simpan.
        </p>
      )}

      <Section number="01" title="Detail Dokumen" description="Informasi kop pada dokumen Word.">
        <dl className="grid sm:grid-cols-3 gap-5">
          <Value label="No. Dokumen">{matrix.documentNumber}</Value>
          <Value label="No. Revisi">{matrix.revision}</Value>
          <Value label="Tanggal Berlaku">{formatDate(matrix.effectiveDate)}</Value>
        </dl>
      </Section>

      <Section number="02" title="Unit Kerja" description="Unit kerja yang menggunakan daftar role ini.">
        <dl className="grid sm:grid-cols-2 gap-5">
          <Value label="Unit Kerja">{matrix.unit}</Value>
          <Value label="Dibuat Oleh">{matrix.recorderName}</Value>
        </dl>
      </Section>

      <Section
        number="03"
        title="Daftar Role dan Hak Akses"
        description={`${matrix.roles.length} role tercatat dalam formulir ini.`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead>
              <tr>
                {["No", "Role", "Akses pada sistem"].map((label) => (
                  <th key={label} scope="col" className="border border-slate-200 dark:border-slate-700 p-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.roles.map((row, index) => (
                <tr key={row.id}>
                  <td className="border border-slate-200 dark:border-slate-700 p-3">{index + 1}</td>
                  <td className="border border-slate-200 dark:border-slate-700 p-3">{row.role || "Belum diisi"}</td>
                  <td className="border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap">
                    {row.access || "Belum diisi"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section number="04" title="Catatan" description="Catatan pada formulir FR-033.">
        <p className="text-xs whitespace-pre-wrap break-words">{matrix.note}</p>
      </Section>

      <Section number="05" title="Penanda Tangan" description="Identitas penanda tangan pada dokumen cetak.">
        <dl className="grid sm:grid-cols-2 gap-5">
          <Value label="Tempat">{matrix.city}</Value>
          <Value label="Tanggal Dokumen">{formatDate(matrix.documentDate)}</Value>
          <Value label="1. Dibuat Oleh">
            {matrix.preparedBy}
            {matrix.preparedByNip && (
              <span className="block text-[10px] text-slate-400 mt-0.5">
                NIP: {matrix.preparedByNip}
              </span>
            )}
          </Value>
          <Value label="2. Mengetahui">
            {matrix.approvedBy}
            {matrix.approvedByNip && (
              <span className="block text-[10px] text-slate-400 mt-0.5">
                NIP: {matrix.approvedByNip}
              </span>
            )}
          </Value>
        </dl>
      </Section>

      <div className={`${panel} p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}>
        <div className="text-[10px] text-slate-400 space-y-1">
          <p>Dibuat: {formatDate(matrix.createdAt)}</p>
          <p>Diperbarui: {formatDate(matrix.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={`${secondary} text-red-600`} onClick={onDelete}>
            <Trash2 size={15} /> Hapus Formulir
          </button>
          <button className={primary} onClick={onEdit}>
            <Pencil size={15} /> Ubah Formulir
          </button>
        </div>
      </div>
    </div>
  );
}
