"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import FormField from "@/components/ui/FormField";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { showToast } from "@/components/ui/Toast";
import type { Fr009Errors, Fr009Lookup, Fr009Record, Fr009Verification } from "@/services/smki/tindakanPerbaikan.types";
import { readFr009Error } from "@/services/smki/tindakanPerbaikanService";
import PersonField from "../molecules/PersonField";
import { isAuditSource } from "../form";
import { useFr009Mutations } from "../hooks/useFr009Queries";
import FormSection from "./FormSection";

export default function VerifikasiSection({ record, lookup, allowVerify = false }: { record?: Fr009Record; lookup?: Fr009Lookup; allowVerify?: boolean }) {
  const { verify } = useFr009Mutations();
  const [decision, setDecision] = useState<Fr009Verification | "">("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [auditor, setAuditor] = useState({ id: record?.id_auditor ?? null, name: record?.auditor_nama ?? "" });
  const [supervisor, setSupervisor] = useState({ id: record?.atasan_id ?? null, name: record?.atasan_nama ?? "" });
  const [errors, setErrors] = useState<Fr009Errors>({});
  const [message, setMessage] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [reviewedVersion, setReviewedVersion] = useState(record?.version);
  const canVerify = allowVerify && record?.permissions.can_verify && record.status === "submitted" && lookup;
  const staleReview = reviewedVersion !== record?.version;

  const saveVerification = async () => {
    if (!record || !decision || staleReview) return;
    setMessage("");
    setErrors({});
    try {
      const saved = await verify.mutateAsync({ id: record.id, payload: { version: reviewedVersion ?? record.version, verifikasi: decision, tanggal_verifikasi: date, catatan_verifikasi: notes, id_auditor: auditor.id, auditor_nama: auditor.name, atasan_id: supervisor.id, atasan_nama: supervisor.name } });
      setReviewedVersion(saved.version);
      showToast.success(`Hasil verifikasi ${decision} disimpan.`);
      setConfirmClose(false);
      setDecision("");
      setDate("");
      setNotes("");
    } catch (error) {
      const detail = await readFr009Error(error);
      setMessage(detail.message);
      setErrors(detail.errors);
      setConfirmClose(false);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
    }
  };

  return <FormSection number={5} title="Verifikasi Tindak Lanjut" hint="Open / Close adalah keputusan verifikasi, bukan status Draft / Diajukan.">
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><StatusBadge status={record?.verifikasi ?? "Belum diverifikasi"} /><span className="text-xs text-slate-500">Tanggal: {record?.tanggal_verifikasi?.slice(0, 10) || "—"}</span></div>
      {record?.catatan_verifikasi && <p className="text-sm whitespace-pre-wrap">{record.catatan_verifikasi}</p>}
      {!canVerify && <p className="text-xs text-slate-500">Verifikasi dilakukan Admin pada laporan yang sudah diajukan. Pengisian form tidak otomatis menutup temuan.</p>}
      {canVerify && <div className="space-y-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 p-4">
        <fieldset disabled={verify.isPending} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Keputusan verifikasi" required error={errors.verifikasi?.[0]}><fieldset className="flex gap-4 py-3"><legend className="sr-only">Keputusan verifikasi</legend>{(["Open", "Close"] as const).map((option) => <label key={option} className="flex items-center gap-2 text-sm"><input type="radio" name={`verification-${record.id}`} value={option} checked={decision === option} onChange={() => setDecision(option)} className="accent-emerald-600" />{option}</label>)}</fieldset></FormField><Input label="Tanggal verifikasi" type="date" value={date} onChange={(event) => setDate(event.target.value)} error={errors.tanggal_verifikasi?.[0]} /></div>
          <Input label="Catatan verifikasi" textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} error={errors.catatan_verifikasi?.[0]} />
          <div className="grid gap-4 sm:grid-cols-2">
            {isAuditSource(record.sumber_codes) && <PersonField label="Auditor pada verifikasi" required id={auditor.id} name={auditor.name} options={lookup.auditors.map((item) => ({ id: item.id_auditor, name: item.nama_auditor }))} onChange={(id, name) => setAuditor({ id, name })} error={errors.id_auditor?.[0] || errors.auditor_nama?.[0]} />}
            <PersonField label="Atasan terkait pada verifikasi" required id={supervisor.id} name={supervisor.name} options={lookup.users} onChange={(id, name) => setSupervisor({ id, name })} error={errors.atasan_id?.[0] || errors.atasan_nama?.[0]} />
          </div>
          {staleReview && <p role="alert" className="text-xs text-amber-800">Konten laporan berubah sejak peninjauan dimulai. Muat ulang halaman dan tinjau kembali sebelum memverifikasi.</p>}
          <Button type="button" variant="success" disabled={staleReview || !decision || !date || !notes.trim()} onClick={() => decision === "Close" ? setConfirmClose(true) : void saveVerification()}>{verify.isPending ? "Menyimpan..." : "Simpan verifikasi"}</Button>
        </fieldset>
        {message && <p role="alert" className="text-xs text-rose-700">{message}</p>}
      </div>}
      {!!record?.verifications?.length && <details className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"><summary className="cursor-pointer text-xs font-bold">Riwayat verifikasi ({record.verifications.length})</summary><ol className="space-y-3 mt-3">{record.verifications.map((entry) => <li key={entry.id} className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs"><div className="flex flex-wrap gap-2"><StatusBadge status={entry.verifikasi} /><span>{entry.tanggal_verifikasi.slice(0, 10)} · versi konten {entry.content_version}</span></div><p className="whitespace-pre-wrap mt-2">{entry.catatan_verifikasi}</p><p className="text-slate-500 mt-1">Auditor: {entry.auditor_nama || "—"} · Atasan: {entry.atasan_nama || "—"} · Akun verifikator: #{entry.verified_by ?? "—"}</p></li>)}</ol></details>}
    </div>
    <ConfirmModal isOpen={confirmClose} onClose={() => setConfirmClose(false)} onConfirm={saveVerification} title="Konfirmasi penutupan temuan" message="Pastikan akar masalah dan tindakan telah memenuhi persyaratan Close. Server akan memvalidasi kelengkapan laporan sebelum menutup temuan." confirmText="Simpan Close" isDanger={false} loading={verify.isPending} />
  </FormSection>;
}
