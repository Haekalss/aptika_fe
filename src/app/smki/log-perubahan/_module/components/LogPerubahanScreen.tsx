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
  const { logs, localLogs, ready, storageError, save, finalize, remove } = useChangeLogs(scope);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newBidangId, setNewBidangId] = useState(bidangId);
  const [confirmation, setConfirmation] = useState<{ action: "delete" | "finalize"; id: string } | null>(null);
  const [exportSelection, setExportSelection] = useState<ChangeLog[] | null>(null);
  const selected = logs.find(log => log.id === selectedId) ?? null;
  const references = useReferences(userId, bidangId, selected?.references?.bidangId ?? newBidangId);
  const target = logs.find(log => log.id === confirmation?.id);
  const writable = ready && !storageError;
  const open = (log: ChangeLog, nextView: "form" | "detail") => { setSelectedId(log.id); setView(nextView); window.scrollTo(0, 0); };
  const saveForm = async (input: LogInput) => {
    if (processing) return;
    setProcessing(true);
    try {
      if (!references.data) throw new Error("Tunggu data referensi dimuat sebelum menyimpan.");
      const log = await save(bindReferences(input, references.data), selected ?? undefined);
      setSelectedId(log.id); setView("detail"); toast.success("Draf log perubahan berhasil disimpan.");
    }
    catch (error) { toast.error(logErrorMessage(error, "Draf tidak dapat disimpan.")); }
    finally { setProcessing(false); }
  };
  const confirmAction = async () => {
    if (!confirmation || processing) return;
    setProcessing(true);
    try {
      if (confirmation.action === "delete") { await remove(confirmation.id); if (selectedId === confirmation.id) { setView("list"); setSelectedId(null); } toast.success("Draf log berhasil dihapus."); }
      else {
        await finalize(confirmation.id); toast.success("Log berhasil difinalisasi.");
      }
      setConfirmation(null);
    } catch (error) { toast.error(logErrorMessage(error, "Perubahan tidak dapat disimpan.")); }
    finally { setProcessing(false); }
  };
  return <>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 px-1">Semua pengguna dan admin dapat melihat dan mengelola log FR-032 seluruh bidang.</p>
    {!!localLogs.length && <p role="status" className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">{localLogs.length} log lama masih tersimpan di browser. Pilih Edit Draf lalu simpan untuk memindahkan draf yang referensinya belum lengkap ke server. Dokumen Final lama tetap tersedia sebagai arsip lokal untuk dilihat dan diekspor.</p>}
    {storageError && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">{storageError}</p>}
    {!ready ? <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Memuat log perubahan"><div className="h-36 rounded-2xl bg-emerald-100 dark:bg-emerald-950"/><div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800"/></div>
      : view === "form" ? <LogForm key={selectedId ?? "new"} log={selected} unit={unit} recorderName={recorderName} references={references} saving={processing} onBidangChange={setNewBidangId} onBack={() => setView(selected ? "detail" : "list")} onSave={saveForm}/>
      : view === "detail" && selected ? <LogDetail log={selected} writable={writable} finalizable={!localLogs.some(log => log.id === selected.id)} onBack={() => setView("list")} onEdit={() => setView("form")} onFinalize={() => setConfirmation({ action: "finalize", id: selected.id })} onExport={() => setExportSelection([selected])}/>
      : <LogDashboard logs={logs} unit={unit} allBidang={allBidang} writable={writable} onAdd={() => { setSelectedId(null); setNewBidangId(bidangId); setView("form"); }} onDetail={log => open(log, "detail")} onEdit={log => open(log, "form")} onDelete={log => setConfirmation({ action: "delete", id: log.id })} onExport={setExportSelection}/>}
    {confirmation && target && <Confirmation title={confirmation.action === "delete" ? "Hapus Draf Log Perubahan?" : "Finalisasi Log Perubahan?"} confirm={confirmation.action === "delete" ? "Ya, Hapus Draf" : "Ya, Finalisasi"} busy={processing} danger={confirmation.action === "delete"} onClose={() => setConfirmation(null)} onConfirm={confirmAction}><p className="font-bold mb-2">{target.number} · {target.title}</p><p>{confirmation.action === "delete" ? "Draf ini akan dihapus. Pastikan pencatatan ini memang tidak diperlukan." : "Pastikan seluruh rincian pelaksanaan sudah benar. Dokumen Final akan terkunci dari perubahan dan penghapusan biasa."}</p></Confirmation>}
    {exportSelection && <Confirmation title="Ekspor Log Perubahan" confirm="Unduh DOCX" onClose={() => setExportSelection(null)} onConfirm={async () => {
      try { await downloadLogs(exportSelection); toast.success("Dokumen FR-032 berhasil diunduh."); setExportSelection(null); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Ekspor gagal."); }
    }}><p>Ekspor <strong>{exportSelection.length} log</strong> {exportSelection.length === 1 ? "yang dipilih" : "sesuai pencarian dan filter saat ini"} ke dokumen Word.</p><p className="mt-3">Dokumen berstatus Draf diberi penanda DRAF. Lampiran dicantumkan sebagai daftar nama berkas.</p></Confirmation>}
  </>;
}
