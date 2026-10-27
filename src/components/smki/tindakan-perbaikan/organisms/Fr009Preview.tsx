import StatusBadge from "@/components/ui/StatusBadge";
import type { Fr009Action, Fr009ActionType, Fr009Lookup, Fr009Record } from "@/services/smki/tindakanPerbaikan.types";
import FormSection from "./FormSection";
import VerifikasiSection from "./VerifikasiSection";
import { isAuditSource } from "../form";

function Value({ label, value }: { label: string; value?: string | null }) {
  return <div><dt className="text-xs text-slate-500 mb-1">{label}</dt><dd className="text-sm whitespace-pre-wrap break-words">{value || "—"}</dd></div>;
}

function PreviewActions({ items, jenis }: { items: Fr009Action[]; jenis: Fr009ActionType }) {
  const actions = items.filter((item) => item.jenis === jenis).sort((a, b) => a.urutan - b.urutan);
  return <div className="overflow-x-auto"><table className="block md:table w-full text-left text-xs">
    <caption className="sr-only">{jenis === "koreksi" ? "Koreksi" : "Tindakan korektif"}</caption>
    <thead className="hidden md:table-header-group bg-slate-50 dark:bg-slate-800"><tr>{["No.", "Uraian", "PIC", "Batas waktu"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
    <tbody className="block md:table-row-group">{actions.map((item, row) => <tr key={item.id ?? row} className="block md:table-row border-t border-slate-100 dark:border-slate-800 align-top">
      <td className="block md:table-cell p-3"><span className="md:hidden">Tindakan </span>{row + 1}</td>
      <td className="block md:table-cell p-3 whitespace-pre-wrap break-words min-w-0 md:min-w-64"><span className="block md:hidden text-slate-500 mb-1">Uraian</span>{item.uraian || "—"}</td>
      <td className="block md:table-cell p-3 min-w-0 md:min-w-40"><span className="block md:hidden text-slate-500 mb-1">PIC</span>{item.pic_nama || "—"}</td>
      <td className="block md:table-cell p-3 min-w-0 md:min-w-32"><span className="block md:hidden text-slate-500 mb-1">Batas waktu</span>{item.batas_waktu?.slice(0, 10) || "—"}</td>
    </tr>)}</tbody>
  </table>{!actions.length && <p className="p-4 text-slate-500 text-xs">Belum ada tindakan.</p>}</div>;
}

export default function Fr009Preview({ record, lookup }: { record: Fr009Record; lookup: Fr009Lookup }) {
  return <div className="space-y-5">
    <FormSection number={1} title="Identitas Laporan"><dl className="grid gap-5 md:grid-cols-2"><Value label="No. laporan" value={record.nomor_laporan} /><Value label="Tanggal" value={record.tanggal_laporan?.slice(0, 10)} /><Value label="Divisi / Area" value={record.area} /><Value label="Unit kerja" value={lookup.units.find((unit) => unit.id_unit_kerja === record.id_unit_kerja)?.nama_unit_kerja} /><Value label="Diajukan kepada" value={record.diajukan_kepada_nama} /><Value label="Dilaporkan oleh" value={record.dilaporkan_oleh_nama} /></dl></FormSection>
    <FormSection number={2} title="Masalah & Akar Masalah"><dl className="space-y-5"><Value label="Sumber masalah" value={record.sumber_codes.map((code) => lookup.sources.find((source) => source.code === code)?.label ?? code).join(", ")} />{record.sumber_codes.includes("lainnya") && <Value label="Penjelasan lainnya" value={record.sumber_lainnya} />}<Value label="Deskripsi Masalah / Potensial Masalah" value={record.deskripsi} /><div><dt className="text-xs text-slate-500 mb-1">Status temuan</dt><dd>{record.status_temuan ? <StatusBadge status={record.status_temuan} /> : "—"}</dd></div><Value label="Akar Masalah" value={record.akar_masalah} /></dl></FormSection>
    {(["koreksi", "tindakan_korektif"] as const).map((jenis, index) => <FormSection key={jenis} number={index + 3} title={jenis === "koreksi" ? "Koreksi (Perbaikan Seketika)" : "Tindakan Korektif"} hint={jenis === "tindakan_korektif" ? "Supaya ketidaksesuaian tidak terjadi kembali." : undefined}><PreviewActions items={record.items} jenis={jenis} /></FormSection>)}
    <VerifikasiSection record={record} lookup={lookup} allowVerify />
    <FormSection number={6} title="Auditor & Atasan Terkait"><dl className="grid gap-5 md:grid-cols-2"><Value label="Auditor" value={isAuditSource(record.sumber_codes) ? record.auditor_nama : "Tidak diperlukan untuk sumber non-audit"} /><Value label="Atasan terkait" value={record.atasan_nama} /></dl><p className="mt-4 text-xs text-slate-500">Nama pada dokumen bukan bukti tanda tangan elektronik. Akun pelaksana verifikasi dicatat terpisah.</p></FormSection>
  </div>;
}
