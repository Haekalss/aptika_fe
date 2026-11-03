import { useEffect, useId, useRef } from "react";
import { Fr025Button } from "../atoms/Fr025Button";

export function Fr025Confirm({ open, title, children, onCancel, onConfirm, pending, danger = false }: {
  open: boolean; title: string; children: React.ReactNode; onCancel: () => void; onConfirm: () => void; pending?: boolean; danger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`} onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/40">
    <h2 id={`${id}-title`} className="text-lg font-bold text-slate-900">{title}</h2>
    <div id={`${id}-body`} className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
    <div className="mt-6 flex justify-end gap-3">
      <Fr025Button variant="outline" onClick={onCancel} disabled={pending}>Batal</Fr025Button>
      <Fr025Button variant={danger ? "destructive" : "success"} onClick={onConfirm} disabled={pending}>{pending ? "Memproses..." : "Ya, lanjutkan"}</Fr025Button>
    </div>
  </dialog>;
}
