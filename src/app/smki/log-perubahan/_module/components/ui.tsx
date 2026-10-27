"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export const panel = "rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm";
export const control = "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400";
export const primary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const secondary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors disabled:opacity-50";
export const exportButton = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 font-bold text-xs disabled:opacity-50";
export function Badge({ value }: { value: string }) {
  const color = value === "Tersimpan" || value === "Berhasil" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
    : value === "Gagal" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
    : value === "Draf" ? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  return <span className={`inline-flex px-2 py-1 rounded-md border text-[10px] font-semibold ${color}`}>{value || "Belum diisi"}</span>;
}
export function Section({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <section className={`${panel} p-5 sm:p-6`}>
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-600 dark:text-emerald-300">{number}</span>
      <div><h2 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200">{title}</h2><p className="text-[11px] text-slate-400 mt-1">{description}</p></div>
    </div>{children}
  </section>;
}
export function Confirmation({ title, children, confirm, danger, busy = false, onClose, onConfirm }: { title: string; children: ReactNode; confirm: string; danger?: boolean; busy?: boolean; onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    cancelRef.current?.focus();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={ref} onCancel={event => { if (busy) event.preventDefault(); else onClose(); }} aria-busy={busy} aria-labelledby="fr032-dialog-title" className="w-[calc(100%_-_2rem)] max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm">
    <div className="flex items-center justify-between gap-3 mb-4"><h2 id="fr032-dialog-title" className="font-bold text-base">{title}</h2><button onClick={onClose} disabled={busy} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Tutup konfirmasi"><X size={18}/></button></div>
    <div className="text-xs leading-relaxed">{children}</div>
    <div className="flex justify-end gap-3 mt-6"><button ref={cancelRef} onClick={onClose} disabled={busy} className={secondary}>Batal</button><button onClick={onConfirm} disabled={busy} className={`${primary} ${danger ? "!bg-red-600 hover:!bg-red-700" : ""}`}>{busy ? "Memeriksa data..." : confirm}</button></div>
  </dialog>;
}
