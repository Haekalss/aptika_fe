"use client";

import Button from "@/components/ui/Button";
import { Save, Send } from "lucide-react";

export default function FormActions({ busy, dirty, canSave, onDraft, onSubmit, onBack }: { busy: boolean; dirty: boolean; canSave: boolean; onDraft: () => void; onSubmit: () => void; onBack: () => void }) {
  return <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm backdrop-blur">
    <Button type="button" variant="outline" onClick={onBack} disabled={busy}>Kembali</Button>
    <div className="flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500" aria-live="polite">{busy ? "Menyimpan..." : dirty ? "Ada perubahan belum disimpan" : "Tidak ada perubahan belum disimpan"}</span>{canSave && <><Button type="button" variant="outline" disabled={busy} onClick={onDraft}><Save />Simpan draft</Button><Button type="button" variant="success" disabled={busy} onClick={onSubmit}><Send />Simpan & ajukan laporan</Button></>}</div>
  </div>;
}
