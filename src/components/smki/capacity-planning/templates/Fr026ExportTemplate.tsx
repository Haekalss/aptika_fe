"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, FileText, Info, Loader2, Printer, SlidersHorizontal } from "lucide-react";
import type { Fr026Category } from "@/services/smki/capacityPlanning.types";
import { fr026Error } from "@/services/smki/capacityPlanningService";
import { exportFr026Excel } from "@/utils/smkiCapacityPlanningExcel";
import { exportFr026Pdf } from "@/utils/smkiCapacityPlanningPdf";
import { printFr026Report } from "@/utils/smkiCapacityPlanningPrint";
import { showToast } from "@/components/ui/Toast";
import { fr026MonthLabel, fr026YearOptions } from "../form";
import { useFr026Export } from "../hooks/useFr026Queries";
import { Fr026Button } from "../atoms/Fr026Button";
import { Fr026Feedback } from "../molecules/Fr026Feedback";
import { Fr026ExportPreview } from "../organisms/Fr026ExportPreview";

type Scope = "all" | Fr026Category;
type Format = "pdf" | "excel";

const selectClass =
  "block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-[#0b1630] dark:text-white";

export function Fr026ExportTemplate({ initialYear, initialMonth }: { initialYear?: number; initialMonth?: number } = {}) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth() + 1);
  const [scope, setScope] = useState<Scope>("all");
  const [format, setFormat] = useState<Format>("pdf");
  const [busy, setBusy] = useState<"download" | "print" | null>(null);
  const query = useFr026Export(year, month);
  const data = query.data;
  const categories: Fr026Category[] = scope === "all" ? ["server", "network"] : [scope];
  const scopeLabel = scope === "all" ? "Semua: Server & Network" : scope === "server" ? "Server" : "Network";

  const download = async () => {
    if (!data) return;
    setBusy("download");
    try {
      if (format === "pdf") await exportFr026Pdf(data, categories);
      else await exportFr026Excel(data, categories);
      showToast.success(`Laporan ${format === "pdf" ? "PDF" : "Excel"} berhasil diunduh.`);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : fr026Error(error).message);
    } finally {
      setBusy(null);
    }
  };

  const print = () => {
    if (!data) return;
    setBusy("print");
    try {
      printFr026Report(data, categories);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Laporan gagal dicetak.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">FR-026 / Capacity Planning</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Ekspor Laporan</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Siapkan laporan tahunan dalam format PDF/cetak atau Excel sesuai cakupan data.
          </p>
        </div>
        <Link
          href={`/smki/capacity-planning?year=${year}&month=${month}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />Kembali ke Ringkasan
        </Link>
      </section>

      {query.isPending ? (
        <Fr026Feedback message="Menyiapkan data ekspor capacity planning..." />
      ) : query.isError ? (
        <Fr026Feedback message={fr026Error(query.error).message} error onRetry={() => void query.refetch()} />
      ) : data ? (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1e3d] xl:sticky xl:top-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-slate-600 dark:text-slate-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pengaturan laporan</h2>
            </div>

            <label className="block space-y-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
              Tahun
              <select value={year} onChange={(event) => setYear(Number(event.target.value))} className={selectClass}>
                {Array.from(new Set([year, ...fr026YearOptions()])).sort((a, b) => a - b).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
              Bulan aktif
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className={selectClass}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>{fr026MonthLabel(value)}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
              Cakupan kategori
              <select value={scope} onChange={(event) => setScope(event.target.value as Scope)} className={selectClass}>
                <option value="all">Semua: Server &amp; Network</option>
                <option value="server">Server</option>
                <option value="network">Network</option>
              </select>
            </label>

            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              {data.summary.total_assets} aset • {data.summary.annual_logs} log tersimpan. Periode Januari–Desember {year}.
            </p>

            <fieldset>
              <legend className="mb-2 block text-[13px] font-bold text-slate-700 dark:text-slate-200">Format laporan</legend>
              <div className="space-y-2">
                <FormatOption
                  active={format === "pdf"}
                  onSelect={() => setFormat("pdf")}
                  icon={<FileText size={20} />}
                  title="PDF / Cetak"
                  description="Dokumen siap cetak"
                />
                <FormatOption
                  active={format === "excel"}
                  onSelect={() => setFormat("excel")}
                  icon={<FileSpreadsheet size={20} />}
                  title="Excel (.xlsx)"
                  description="Matriks dalam 2 lembar"
                />
              </div>
            </fieldset>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p>Matriks mencakup semua 12 bulan. Bulan tanpa log tetap ditampilkan sebagai tanda —.</p>
            </div>

            <div className="space-y-2.5">
              <Fr026Button className="w-full" onClick={download} disabled={busy !== null || data.summary.total_assets === 0}>
                {busy === "download" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {format === "pdf" ? "Unduh PDF" : "Unduh Excel"}
              </Fr026Button>
              <Fr026Button className="w-full" variant="outline" onClick={print} disabled={busy !== null || data.summary.total_assets === 0}>
                <Printer size={16} />{busy === "print" ? "Menyiapkan..." : "Cetak Laporan"}
              </Fr026Button>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Pilih Excel untuk mengunduh file .xlsx dengan lembar Server dan Network.
            </p>
          </aside>

          <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pratinjau laporan tahunan</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {categories.length} halaman • Orientasi lanskap • {scopeLabel}
                </p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Pratinjau data
              </span>
            </div>

            {data.summary.total_assets === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-[#0b1e3d]">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada aset untuk diekspor</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                  Tambahkan aset Server atau Network terlebih dahulu. Laporan akan tersedia setelah minimal satu aset terdaftar.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {categories.map((category, index) => (
                  <Fr026ExportPreview
                    key={category}
                    data={data}
                    category={category}
                    month={month}
                    page={index + 1}
                    totalPages={categories.length}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function FormatOption({
  active,
  onSelect,
  icon,
  title,
  description,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/20 dark:text-slate-300"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-emerald-600 bg-emerald-600" : "border-slate-300 dark:border-slate-600"}`}>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
    </button>
  );
}
