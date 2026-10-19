"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { showToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuthStore";
import { runGuardedNavigation } from "@/utils/guardedNavigation";
import type { Fr009Lookup, Fr009Record } from "@/services/smki/tindakanPerbaikan.types";
import { readFr009Error } from "@/services/smki/tindakanPerbaikanService";
import { useFr009Detail, useFr009Lookup, useFr009Mutations } from "../hooks/useFr009Queries";
import { useFr009Form } from "../hooks/useFr009Form";
import { toFr009Payload } from "../form";
import Fr009Header from "../organisms/Fr009Header";
import IdentitasSection from "../organisms/IdentitasSection";
import AnalisisMasalahSection from "../organisms/AnalisisMasalahSection";
import TindakanTable from "../organisms/TindakanTable";
import VerifikasiSection from "../organisms/VerifikasiSection";
import PengesahanSection from "../organisms/PengesahanSection";
import FormActions from "../molecules/FormActions";

function Fr009FormEditor({ id, record, lookup }: { id?: number; record?: Fr009Record; lookup: Fr009Lookup }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const mutations = useFr009Mutations();
  const state = useFr009Form(record, user);
  const [message, setMessage] = useState("");
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const canSave = !id || Boolean(record?.permissions.can_update);

  async function save(submit: boolean) {
    if (!canSave || saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage("");
    state.setErrors({});
    try {
      const payload = { ...toFr009Payload(state.form), ...(state.identity.version !== undefined ? { version: state.identity.version } : {}) };
      const saved = state.identity.id ? await mutations.update.mutateAsync({ id: state.identity.id, payload }) : await mutations.create.mutateAsync(payload);
      // Retain the new ID/version when validation of the subsequent submit fails.
      state.markSaved(saved);
      if (submit) {
        const submitted = await mutations.submit.mutateAsync({ id: saved.id, version: saved.version });
        state.markSaved(submitted);
        showToast.success("Laporan berhasil diajukan. Verifikasi belum dilakukan.");
        router.push(`/smki/tindakan-perbaikan/${submitted.id}`);
      } else {
        showToast.success(state.identity.status === "submitted" ? "Perubahan disimpan sebagai draft; ajukan ulang untuk diverifikasi." : "Draft berhasil disimpan.");
        if (!id) router.replace(`/smki/tindakan-perbaikan/${saved.id}/edit`);
      }
    } catch (error) {
      const parsed = await readFr009Error(error);
      state.setErrors(parsed.errors);
      setMessage(parsed.message);
      showToast.error(parsed.message);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  const back = () => runGuardedNavigation(() => router.push("/smki/tindakan-perbaikan"));
  return <div className="max-w-6xl mx-auto space-y-6">
    <Fr009Header title={id ? "Edit Tindakan Perbaikan & Pencegahan" : "Tambah Tindakan Perbaikan & Pencegahan"}><StatusBadge status={state.identity.status === "submitted" ? "Diajukan" : "Draft"} /></Fr009Header>
      <dl className="grid gap-3 sm:grid-cols-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-xs">{[["Kode template", lookup.template.code], ["Revisi", lookup.template.revision], ["Berlaku", lookup.template.effective_date], ["Klasifikasi", lookup.template.classification]].map(([label, value]) => <div key={label}><dt className="text-slate-500 mb-1">{label}</dt><dd className="font-semibold break-words">{value}</dd></div>)}</dl>
      {!canSave && <p role="status" className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800">Laporan ini tidak dapat diubah dengan hak akses Anda.</p>}
      {state.identity.status === "submitted" && <p className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800">Mengubah konten laporan mengembalikannya ke Draft dan membatalkan verifikasi aktif. Riwayat verifikasi tetap tersimpan; ajukan kembali setelah perubahan.</p>}
      {message && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p>{message}</p>{Object.keys(state.errors).length > 0 && <ul className="list-disc pl-5 mt-2 space-y-1">{Object.entries(state.errors).map(([key, errors]) => <li key={key}>{errors[0]}</li>)}</ul>}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void save(true); }}><fieldset disabled={busy || !canSave} className="space-y-5"><IdentitasSection form={state.form} lookup={lookup} errors={state.errors} onChange={state.onChange} /><AnalisisMasalahSection form={state.form} lookup={lookup} errors={state.errors} onChange={state.onChange} /><TindakanTable jenis="koreksi" form={state.form} lookup={lookup} errors={state.errors} onChange={state.onChange} disabled={busy || !canSave} /><TindakanTable jenis="tindakan_korektif" form={state.form} lookup={lookup} errors={state.errors} onChange={state.onChange} disabled={busy || !canSave} /><VerifikasiSection record={record} /><PengesahanSection form={state.form} lookup={lookup} errors={state.errors} onChange={state.onChange} /></fieldset></form>
      <FormActions busy={busy} dirty={state.dirty} canSave={canSave} onDraft={() => void save(false)} onSubmit={() => void save(true)} onBack={back} />
    <ConfirmModal isOpen={!!state.pendingNavigation} onClose={state.cancelNavigation} onConfirm={state.confirmNavigation} title="Tinggalkan perubahan?" message="Perubahan yang belum disimpan akan hilang." confirmText="Tinggalkan halaman" isDanger={false} loading={busy} />
  </div>;
}

export default function Fr009FormTemplate({ id }: { id?: number }) {
  const detail = useFr009Detail(id);
  const lookup = useFr009Lookup();
  const invalidId = id !== undefined && (!Number.isSafeInteger(id) || id <= 0);
  const loading = lookup.isLoading || Boolean(id && detail.isLoading);
  return <ServiceRouteGuard requiredService="SMKI">
    {invalidId ? <p role="alert">ID laporan tidak valid.</p> : loading ? <p className="text-center py-12 text-sm text-slate-500">Memuat formulir...</p> : (lookup.isError && !lookup.data) || (id && detail.isError && !detail.data) ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">Formulir gagal dimuat. Periksa akses atau koneksi Anda.<Button type="button" variant="outline" className="ml-3" onClick={() => { void lookup.refetch(); if (id) void detail.refetch(); }}>Coba lagi</Button></div> : lookup.data && (!id || detail.data) && <Fr009FormEditor key={id ?? "new"} id={id} record={detail.data} lookup={lookup.data} />}
  </ServiceRouteGuard>;
}
