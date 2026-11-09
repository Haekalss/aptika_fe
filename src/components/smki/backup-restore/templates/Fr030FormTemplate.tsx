"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { backupRestoreService, readFr030Error } from "@/services/smki/backupRestoreService";
import type { BackupRestoreReport } from "@/services/smki/backupRestore.types";
import { runGuardedNavigation } from "@/utils/guardedNavigation";
import { useFr030Form } from "../hooks/useFr030Form";
import { useFr030Report, useRefreshFr030 } from "../hooks/useFr030Queries";
import { useFr030Unsaved } from "../hooks/useFr030Unsaved";
import { buildFr030Payload } from "../form";
import { DocumentIdentity } from "../organisms/DocumentIdentity";
import { AnnualAssetMatrix } from "../organisms/AnnualAssetMatrix";
import { ReportSignatories } from "../organisms/ReportSignatories";

export function Fr030FormTemplate({ id }: { id?: number }) {
  const query = useFr030Report(id);
  if (id && (query.isPending || !query.isFetchedAfterMount)) return <p role="status">Memuat laporan FR-030…</p>;
  if (id && !query.data) return <div role="alert">Laporan tidak tersedia atau Anda tidak memiliki akses. <Button variant="outline" onClick={() => query.refetch()}>Coba lagi</Button></div>;
  return <>{query.isError && <p role="alert" className="text-amber-800 dark:text-amber-200">Pembaruan latar belakang gagal. Isian Anda tetap tersedia; coba lagi setelah koneksi pulih.</p>}<Fr030Editor key={id ?? "new"} record={query.data} /></>;
}

function Fr030Editor({ record }: { record?: BackupRestoreReport }) {
  const router = useRouter();
  const refresh = useRefreshFr030();
  const { form, saved, dirty, change, markSaved } = useFr030Form(record);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [reload, setReload] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const navigation = useFr030Unsaved(dirty || busy);
  function focusError(field: string) {
    const direct = document.getElementById(`fr030-${field}`);
    if (direct) { direct.focus(); return; }
    const path = /^assets\.(\d+)\.entries\.(\d+)\./.exec(field);
    if (!path) return;
    const asset = form.assets[Number(path[1])];
    const entry = buildFr030Payload(form, false).assets[Number(path[1])]?.entries[Number(path[2])];
    if (!asset || !entry) return;
    document.getElementById(`fr030-cell-${asset.client_key}-${entry.month}`)?.click();
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`fr030-${field}`)?.focus()));
  }
  async function save(finalize: boolean) {
    if (busy) return;
    setBusy(true); setMessage(""); setErrors({}); setStatus(""); setConflict(false);
    try {
      const payload = buildFr030Payload(form, finalize);
      const report = saved ? await backupRestoreService.update(saved.id, payload) : await backupRestoreService.create(payload);
      markSaved(report); setStatus("Laporan berhasil disimpan.");
      await refresh();
      if (!saved) router.replace(`/smki/backup-restore/${report.id}/edit`);
    } catch (cause) {
      const failure = await readFr030Error(cause);
      setMessage(failure.message); setErrors(failure.errors); setConflict(failure.status === 409);
      requestAnimationFrame(() => summary.current?.focus());
    } finally { setBusy(false); }
  }
  async function reloadReport() {
    if (!saved || busy) return;
    setBusy(true);
    try {
      markSaved(await backupRestoreService.get(saved.id));
      setMessage(""); setErrors({}); setConflict(false); setReload(false);
      setStatus("Data terbaru berhasil dimuat.");
    } catch (cause) { setMessage((await readFr030Error(cause)).message); }
    finally { setBusy(false); }
  }
  return <form className="space-y-6" onSubmit={event => { event.preventDefault(); void save(false); }}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900 dark:text-white">{saved ? "Edit" : "Tambah"} laporan FR-030</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200">{saved?.status === "final" ? "Final" : "Draf"}{saved && ` · Versi ${saved.version}`}</span></div>
    {message && <div ref={summary} data-fr030-errors tabIndex={-1} role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 focus:ring-2 focus:ring-red-600 dark:bg-red-950 dark:text-red-200">
      <p className="font-semibold">{message}</p><ul className="mt-2 list-disc pl-5">{Object.entries(errors).map(([field, values]) => <li key={field}><a className="underline" href={`#fr030-${field}`} onClick={event => { event.preventDefault(); focusError(field); }}>{values[0]}</a></li>)}</ul>
      <p className="mt-2">Isian Anda tetap tersedia. Periksa data sebelum mencoba kembali.</p>
      {conflict && <Button type="button" variant="outline" disabled={busy} className="mt-3" onClick={() => setReload(true)}>Muat ulang data</Button>}
    </div>}
    {status && <p role="status" className="text-emerald-800 dark:text-emerald-200">{status}</p>}
    <fieldset disabled={busy} className="min-w-0 space-y-6">
      <DocumentIdentity form={form} change={change} errors={errors} unit={saved?.unit_kerja_nama} />
      <AnnualAssetMatrix assets={form.assets} year={form.tahun} onChange={assets => change({ assets })} report={saved} dirty={dirty} busy={busy} setBusy={setBusy} onSaved={report => { markSaved(report); void refresh(); }} errors={errors} />
      <ReportSignatories form={form} change={change} saved={saved} errors={errors} />
    </fieldset>
    <Card hoverable={false} className="dark:bg-slate-900 dark:border-slate-700" data-fr030-actions>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button type="button" variant="outline" disabled={busy} onClick={() => runGuardedNavigation(() => router.push("/smki/backup-restore"))}>Kembali</Button>
        <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{busy ? "Memproses…" : dirty ? "Ada perubahan belum disimpan" : "Tidak ada perubahan belum disimpan"}</span>
          {saved?.status !== "final" && <Button type="button" variant="outline" disabled={busy} onClick={() => void save(false)}>Simpan Draf</Button>}
          <Button type="button" variant="success" disabled={busy} onClick={() => void save(true)}>{saved?.status === "final" ? "Simpan perubahan" : "Simpan & Finalisasi"}</Button>
        </div>
      </div>
    </Card>
    <ConfirmModal isOpen={Boolean(navigation.pending)} isDanger={false} title="Tinggalkan perubahan?" message="Ada perubahan belum disimpan atau proses masih berjalan. Keluar dari halaman dapat menghilangkan isian Anda." confirmText="Tinggalkan halaman" onClose={navigation.cancel} onConfirm={navigation.confirm} />
    <ConfirmModal isOpen={reload} isDanger={false} title="Muat ulang data terbaru?" message="Isian yang belum disimpan akan diganti data terbaru dari server. Salin perubahan Anda terlebih dahulu." confirmText="Muat ulang" loading={busy} onClose={() => setReload(false)} onConfirm={reloadReport} />
  </form>;
}
