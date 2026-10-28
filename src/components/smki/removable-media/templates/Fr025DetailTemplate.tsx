"use client";

import { useState } from "react";
import { Download, Pencil } from "lucide-react";
import Card from "@/components/ui/Card";
import { showToast } from "@/components/ui/Toast";
import { downloadFr025Pdf, fr025Error } from "@/services/smki/removableMediaService";
import { useFr025Report } from "../hooks/useFr025Queries";
import { fr025Date } from "../form";
import { Fr025Button } from "../atoms/Fr025Button";
import { Fr025Link } from "../atoms/Fr025Link";
import { Fr025Status } from "../atoms/Fr025Status";
import { Fr025Feedback } from "../molecules/Fr025Feedback";
import { Fr025Header } from "../organisms/Fr025Header";
import { InventoryTable } from "../organisms/InventoryTable";

export function Fr025DetailTemplate({ id }: { id: number }) {
  const query = useFr025Report(id);
  const [exporting, setExporting] = useState(false);
  const report = query.data;
  const download = async () => {
    setExporting(true);
    try { await downloadFr025Pdf(id); showToast.success("PDF FR-025 berhasil dibuat."); }
    catch (error) { showToast.error(fr025Error(error).message); }
    finally { setExporting(false); }
  };
  return <>
    <Fr025Header title="Detail Daftar Removable Media" />
    <Fr025Link href="/smki/removable-media" className="inline-block text-sm font-semibold text-emerald-700">← Kembali ke daftar</Fr025Link>
    {query.isPending ? <Fr025Feedback message="Memuat detail inventaris..." /> : query.isError ? <Fr025Feedback error message={fr025Error(query.error).message} onRetry={() => void query.refetch()} /> : report && <>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Fr025Status status={report.status} /><span className="text-sm text-slate-500">{report.reference} · Versi {report.version}</span></div><div className="flex gap-3">{report.permissions.can_update && <Fr025Link href={`/smki/removable-media/${id}/edit`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"><Pencil size={16} />Edit</Fr025Link>}{report.permissions.can_export && <Fr025Button onClick={() => void download()} disabled={exporting}><Download />{exporting ? "Membuat PDF..." : "PDF"}</Fr025Button>}</div></div>
      <Card hoverable={false} title="Identitas Dokumen"><dl className="grid grid-cols-3 gap-x-8 gap-y-6">{[
        ["Unit Kerja", report.unit_kerja_nama], ["Tanggal Dokumen", fr025Date(report.tanggal_dokumen)], ["Tempat", report.tempat],
        ["No. Dokumen", report.nomor_dokumen], ["No. Revisi", report.nomor_revisi], ["Tanggal Berlaku", fr025Date(report.tanggal_berlaku)],
        ["Dibuat Oleh", report.created_by_nama], ["Kepala Unit Kerja (Mengetahui)", report.kepala_unit_nama], ["Pengurus Barang", report.pengurus_barang_nama],
      ].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1.5 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{value || "-"}</dd></div>)}</dl></Card>
      <InventoryTable items={report.items ?? []} />
      <p className="text-xs leading-relaxed text-slate-500">Dokumen Final tetap dapat diedit dan dihapus sesuai hak akses. Nama pihak yang mengetahui dan Pengurus Barang bukan tanda tangan elektronik maupun approval melalui akun mereka.</p>
    </>}
  </>;
}
