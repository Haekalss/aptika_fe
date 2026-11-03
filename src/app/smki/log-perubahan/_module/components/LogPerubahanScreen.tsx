"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { type ChangeLog, type LogInput } from "../lib/model";
import { useChangeLogs } from "../hooks/useChangeLogs";
import { useReferences } from "../hooks/useReferences";
import { bindReferences } from "../lib/references";
import { logErrorMessage } from "../lib/api";
import { downloadLogs } from "../lib/docx";
import LogDashboard from "./LogDashboard";
import LogForm from "./LogForm";
import LogDetail from "./LogDetail";
import { Confirmation } from "./ui";

export default function LogPerubahanScreen({ scope, unit, userId, bidangId, recorderName, allBidang }: { scope: string; unit: string; userId: number; bidangId: number; recorderName: string; allBidang: boolean }) {
  const { logs, ready, storageError, save, remove } = useChangeLogs(scope);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newBidangId, setNewBidangId] = useState(bidangId);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [exportSelection, setExportSelection] = useState<ChangeLog[] | null>(null);
  const selected = logs.find(log => log.id === selectedId) ?? null;
  const references = useReferences(userId, bidangId, selected?.references?.bidangId ?? newBidangId);
  const target = logs.find(log => log.id === confirmation);
  const writable = ready && !storageError;
  const open = (log: ChangeLog, nextView: "form" | "detail") => { setSelectedId(log.id); setView(nextView); window.scrollTo(0, 0); };
  const saveForm = async (input: LogInput, status: "Draf" | "Tersimpan") => {
    if (processing) return;
    setProcessing(true);
    try {
      if (!references.data) throw new Error("Tunggu data referensi dimuat sebelum menyimpan.");
      const log = await save(bindReferences(input, references.data), status, selected ?? undefined);
      setSelectedId(log.id); setView("detail"); toast.success(status === "Draf" ? "Draf berhasil disimpan." : "Log perubahan berhasil disimpan.");
    }
    catch (error) { toast.error(logErrorMessage(error, "Log tidak dapat disimpan.")); }
    finally { setProcessing(false); }
  };
  const confirmAction = async () => {
    if (!confirmation || processing) return;
    setProcessing(true);
    try {
      await remove(confirmation);
      if (selectedId === confirmation) { setView("list"); setSelectedId(null); }
      toast.success("Log berhasil dihapus.");
      setConfirmation(null);
    } catch (error) { toast.error(logErrorMessage(error, "Perubahan tidak dapat disimpan.")); }
    finally { setProcessing(false); }
  };
  return <>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 px-1">Semua pengguna dan admin dapat melihat dan mengelola log FR-032 seluruh bidang.</p>
    {storageError && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">{storageError}</p>}
    {!ready ? <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Memuat log perubahan"><div className="h-36 rounded-2xl bg-emerald-100 dark:bg-emerald-950"/><div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800"/></div>
      : view === "form" ? <LogForm key={selectedId ?? "new"} log={selected} unit={unit} recorderName={recorderName} references={references} saving={processing} onBidangChange={setNewBidangId} onBack={() => setView(selected ? "detail" : "list")} onSave={saveForm}/>
      : view === "detail" && selected ? <LogDetail log={selected} writable={writable} onBack={() => setView("list")} onEdit={() => setView("form")} onDelete={() => setConfirmation(selected.id)} onExport={() => setExportSelection([selected])}/>
      : <LogDashboard logs={logs} unit={unit} allBidang={allBidang} writable={writable} onAdd={() => { setSelectedId(null); setNewBidangId(bidangId); setView("form"); }} onDetail={log => open(log, "detail")} onEdit={log => open(log, "form")} onDelete={log => setConfirmation(log.id)} onExport={setExportSelection}/>}
    {confirmation && target && <Confirmation title="Hapus Log Perubahan?" confirm="Ya, Hapus Log" busy={processing} danger onClose={() => setConfirmation(null)} onConfirm={confirmAction}><p className="font-bold mb-2">{target.number} · {target.title}</p><p>Log ini akan dihapus dari daftar. Pastikan pencatatan ini memang tidak diperlukan.</p></Confirmation>}
    {exportSelection && <Confirmation title="Ekspor Log Perubahan" confirm="Unduh DOCX" onClose={() => setExportSelection(null)} onConfirm={async () => {
      try { await downloadLogs(exportSelection); toast.success("Dokumen FR-032 berhasil diunduh."); setExportSelection(null); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Ekspor gagal."); }
    }}><p>Ekspor <strong>{exportSelection.length} log</strong> {exportSelection.length === 1 ? "yang dipilih" : "sesuai pencarian dan filter saat ini"} ke dokumen Word.</p><p className="mt-3">Dokumen berstatus Draf diberi penanda DRAF. Data dari format lama dicantumkan sebagai catatan historis bila tersedia.</p></Confirmation>}
  </>;
}
