"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import type { Fr025Lookup, Fr025Payload, Fr025Report } from "@/services/smki/removableMedia.types";
import { fr025Error, saveFr025 } from "@/services/smki/removableMediaService";
import { fr025Form, fr025Payload } from "../form";
import { useFr025Lookup, useFr025Report, useFr025Scope } from "../hooks/useFr025Queries";
import { useFr025Unsaved } from "../hooks/useFr025Unsaved";
import { Fr025Button } from "../atoms/Fr025Button";
import { Fr025Link } from "../atoms/Fr025Link";
import { Fr025Confirm } from "../molecules/Fr025Confirm";
import { Fr025Feedback } from "../molecules/Fr025Feedback";
import { Fr025Header } from "../organisms/Fr025Header";
import { ItemsEditor } from "../organisms/ItemsEditor";
import { ReportIdentity } from "../organisms/ReportIdentity";
import { ReportSignatories } from "../organisms/ReportSignatories";

function Editor({ lookup, report }: { lookup: Fr025Lookup; report?: Fr025Report }) {
  const finalReport = report?.status === "final";
  const [form, setForm] = useState(() => fr025Form(report, lookup.template));
  const [baseline] = useState(() => JSON.stringify(fr025Payload(form, false, report?.version)));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = !saved && JSON.stringify(fr025Payload(form, false, report?.version)) !== baseline;
  useFr025Unsaved(dirty);
  const router = useRouter();
  const client = useQueryClient();
  const scope = useFr025Scope();
  const save = useMutation({
    mutationFn: (payload: Fr025Payload) => saveFr025(payload, report?.id),
    onMutate: () => { setErrors({}); setMessage(""); },
    onSuccess: (result) => {
      setSaved(true); setConfirmFinal(false);
      client.setQueryData(["fr025", scope, "report", result.id], result);
      void client.invalidateQueries({ queryKey: ["fr025", scope, "list"] });
      showToast.success(finalReport ? "Perubahan dokumen Final FR-025 berhasil disimpan." : result.status === "final" ? "Dokumen FR-025 berhasil difinalisasi." : "Draft FR-025 berhasil disimpan.");
      router.push(`/smki/removable-media/${result.id}`, { scroll: false });
    },
    onError: (error) => {
      const detail = fr025Error(error); setErrors(detail.fields); setMessage(detail.message); setConfirmFinal(false);
      requestAnimationFrame(() => { const first = document.querySelector<HTMLElement>('.fr025-module [aria-invalid="true"]'); first?.scrollIntoView({ block: "center" }); first?.focus({ preventScroll: true }); });
    },
  });
  const submit = (finalize: boolean) => save.mutate(fr025Payload(form, finalize || finalReport, report?.version));
  return <form noValidate onSubmit={(event) => { event.preventDefault(); submit(false); }} className="space-y-6">
    {message && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{Object.keys(errors).length ? "Periksa isian yang ditandai sebelum menyimpan." : message}</p><button type="button" className="mt-2 underline" onClick={() => { if (!dirty || window.confirm("Muat ulang dan buang perubahan yang belum disimpan?")) { setSaved(true); window.location.reload(); } }}>Muat ulang data terbaru</button></div>}
    <fieldset disabled={save.isPending} className="min-w-0 space-y-6">
      <ReportIdentity form={form} lookup={lookup} errors={errors} disabled={save.isPending} onChange={(value) => setForm({ ...form, ...value })} />
      <ItemsEditor items={form.items} lookup={lookup} errors={errors} disabled={save.isPending} onChange={(items) => setForm({ ...form, items })} />
      <ReportSignatories form={form} lookup={lookup} errors={errors} disabled={save.isPending} onChange={(value) => setForm({ ...form, ...value })} />
      <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Fr025Link href={report ? `/smki/removable-media/${report.id}` : "/smki/removable-media"} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Kembali</Fr025Link>
        <div className="flex items-center gap-3"><p className="mr-2 text-xs text-slate-500">{dirty ? "Ada perubahan belum disimpan" : "Tidak ada perubahan belum disimpan"}</p><Fr025Button type="submit" variant={finalReport ? "success" : "outline"} disabled={save.isPending}><Save />{save.isPending ? "Menyimpan..." : finalReport ? "Simpan perubahan" : "Simpan draft"}</Fr025Button>{!finalReport && <Fr025Button onClick={() => setConfirmFinal(true)} disabled={save.isPending}><CheckCircle2 />Simpan & finalisasi</Fr025Button>}</div>
      </div>
    </fieldset>
    <Fr025Confirm open={confirmFinal} title="Finalisasi daftar inventaris?" pending={save.isPending} onCancel={() => setConfirmFinal(false)} onConfirm={() => submit(true)}>Pastikan seluruh barang dan identitas sudah lengkap dan benar. Dokumen Final tetap dapat diedit atau dihapus sesuai hak akses. Finalisasi bukan approval Kepala Unit atau tanda tangan elektronik.</Fr025Confirm>
  </form>;
}

export function Fr025FormTemplate({ id }: { id?: number }) {
  const detail = useFr025Report(id);
  const lookup = useFr025Lookup(id);
  const loading = lookup.isPending || (!!id && detail.isPending);
  const error = lookup.error || (id ? detail.error : null);
  return <>
    <Fr025Header title={id ? "Edit Daftar Removable Media" : "Tambah Daftar Removable Media"} />
    <Fr025Link href="/smki/removable-media" className="inline-block text-sm font-semibold text-emerald-700">← Kembali ke daftar</Fr025Link>
    {loading ? <Fr025Feedback message="Memuat form dan master data..." /> : error ? <Fr025Feedback message={fr025Error(error).message} error onRetry={() => { void lookup.refetch(); if (id) void detail.refetch(); }} /> : id && !detail.data?.permissions.can_update ? <Fr025Feedback message="Anda tidak memiliki izin mengubah dokumen ini." error /> : lookup.data && <Editor key={id ?? "new"} lookup={lookup.data} report={detail.data} />}
  </>;
}
