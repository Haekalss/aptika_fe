"use client";

import { ArrowLeft, Printer, FileDown, FileText, Loader2, Trash2, CheckCircle2, Undo2, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Fr048StatusBadge from "../atoms/Fr048StatusBadge";
import { unduhPdf, unduhDocx } from "../lib/export";
import { showToast } from "@/components/ui/Toast";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";
import { formatTanggal, periodeLabel } from "../constants";

/** Header detail + aksi utama sesuai status & role. */
export default function Fr048DetailHeader({
  detail,
  isAssignedAdmin,
  isOwner,
  onSelesaikan,
  onKembalikan,
  onAjukanUlang,
  onHapus,
  busy = false,
}: {
  detail: PemantauanDetailDto;
  isAssignedAdmin: boolean;
  isOwner: boolean;
  onSelesaikan?: () => void;
  onKembalikan?: () => void;
  onAjukanUlang?: () => void;
  onHapus?: () => void;
  busy?: boolean;
}) {
  const router = useRouter();
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const canReview = isAssignedAdmin && detail.status === "diajukan";
  const canAjukanUlang = isOwner && detail.status === "revisi";

  const doExport = async (kind: "pdf" | "docx") => {
    if (exporting) return;
    setExporting(kind);
    try {
      if (kind === "pdf") await unduhPdf(detail);
      else await unduhDocx(detail);
      showToast.success(kind === "pdf" ? "PDF terunduh." : "DOCX terunduh.");
    } catch (err) {
      console.error(err);
      showToast.error(`Gagal membuat ${kind.toUpperCase()}. Coba lagi.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={() => router.push("/smki/pemantauan-konfigurasi")}
          aria-label="Kembali ke daftar"
          className="mt-0.5 h-9 w-9 flex-shrink-0 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate" title={detail.objekList.map((o) => o.objekNama).join(", ")}>
            {detail.objekList.map((o) => o.objekNama).join(", ") || "Pemantauan Konfigurasi"}
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {detail.noFormulir || "(No. formulir belum diisi)"} · {periodeLabel(detail.periode)} · {formatTanggal(detail.tanggalPemantauan)} · Siklus #{detail.siklus}
          </p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <Fr048StatusBadge status={detail.status} />
            <span className="text-[10px] text-slate-500">Pelaksana: <b>{detail.pelaksanaNama}</b>{detail.adminNama ? ` → Admin: ${detail.adminNama}` : ""}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => window.open(`/smki/pemantauan-konfigurasi/print/${detail.id}`, "_blank")}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Printer size={14} /> Cetak
        </button>
        <button
          type="button"
          onClick={() => doExport("pdf")}
          disabled={exporting !== null}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50"
        >
          {exporting === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} PDF
        </button>
        <button
          type="button"
          onClick={() => doExport("docx")}
          disabled={exporting !== null}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-50"
        >
          {exporting === "docx" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} DOCX
        </button>
        {detail.status === "draft" && isOwner && onHapus && (
          <button type="button" onClick={onHapus} disabled={busy} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50">
            <Trash2 size={14} /> Hapus
          </button>
        )}
        {canAjukanUlang && onAjukanUlang && (
          <button type="button" onClick={onAjukanUlang} disabled={busy} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50">
            <Send size={14} /> Ajukan Ulang
          </button>
        )}
        {canReview && onKembalikan && (
          <button type="button" onClick={onKembalikan} disabled={busy} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 disabled:opacity-50">
            <Undo2 size={14} /> Kembalikan
          </button>
        )}
        {canReview && onSelesaikan && (
          <button type="button" onClick={onSelesaikan} disabled={busy} className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
            <CheckCircle2 size={14} /> Tandatangani & Selesaikan
          </button>
        )}
      </div>
    </div>
  );
}
