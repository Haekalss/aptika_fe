"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { showToast } from "@/components/ui/Toast";
import { downloadFr009, readFr009Error } from "@/services/smki/tindakanPerbaikanService";
import { useFr009Detail, useFr009Lookup } from "../hooks/useFr009Queries";
import Fr009Header from "../organisms/Fr009Header";
import Fr009Preview from "../organisms/Fr009Preview";

export default function Fr009DetailTemplate({ id }: { id: number }) {
  const detail = useFr009Detail(id);
  const lookup = useFr009Lookup();
  const [exporting, setExporting] = useState<"docx" | "pdf" | null>(null);
  const invalid = !Number.isSafeInteger(id) || id <= 0;
  async function exportDocument(format: "docx" | "pdf") {
    if (exporting) return;
    try { setExporting(format); await downloadFr009(id, format); showToast.success(`${format.toUpperCase()} berhasil dibuat.`); }
    catch (error) { showToast.error((await readFr009Error(error)).message); }
    finally { setExporting(null); }
  }
  return <ServiceRouteGuard requiredService="SMKI"><div className="max-w-6xl mx-auto space-y-6 pb-8">
    <Fr009Header title="Detail Tindakan Perbaikan & Pencegahan" />
    <Link href="/smki/tindakan-perbaikan" className="inline-block text-xs font-semibold text-emerald-700 dark:text-emerald-300">← Kembali ke daftar</Link>
    {invalid ? <p role="alert">ID laporan tidak valid.</p> : detail.isLoading || lookup.isLoading ? <p className="py-12 text-center text-sm text-slate-500">Memuat laporan...</p> : detail.isError || lookup.isError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">Laporan tidak tersedia atau akses ditolak.<Button variant="outline" className="ml-3" onClick={() => { void detail.refetch(); void lookup.refetch(); }}>Coba lagi</Button></div> : detail.data && lookup.data && <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><div className="flex flex-wrap gap-2 items-center"><StatusBadge status={detail.data.status === "draft" ? "Draft" : "Diajukan"} /><StatusBadge status={detail.data.verifikasi || "Belum diverifikasi"} /><span className="text-xs text-slate-500">Versi {detail.data.version} · {lookup.data.template.classification}</span></div><div className="flex flex-wrap gap-2">{detail.data.permissions.can_update && <Link className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold" href={`/smki/tindakan-perbaikan/${id}/edit`}><Pencil size={14} />Edit</Link>}{detail.data.permissions.can_export && <><Button variant="outline" size="sm" disabled={!!exporting} onClick={() => void exportDocument("docx")}><Download />{exporting === "docx" ? "Menyiapkan..." : "DOCX"}</Button><Button variant="success" size="sm" disabled={!!exporting} title="Unduh PDF langsung dari browser" onClick={() => void exportDocument("pdf")}><Download />{exporting === "pdf" ? "Menyiapkan..." : "PDF"}</Button></>}</div></div>
      {detail.data.status === "draft" && <p className="text-xs text-slate-500">Dokumen masih Draft. Ekspor tidak mengajukan laporan atau mengubah keputusan verifikasi.</p>}
      <Fr009Preview record={detail.data} lookup={lookup.data} />
    </>}
  </div></ServiceRouteGuard>;
}
