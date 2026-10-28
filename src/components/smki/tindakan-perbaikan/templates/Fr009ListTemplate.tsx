"use client";

import { useState } from "react";
import Link from "next/link";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import type { Fr009Record, Fr009SourceCode } from "@/services/smki/tindakanPerbaikan.types";
import { readFr009Error } from "@/services/smki/tindakanPerbaikanService";
import { useFr009List, useFr009Lookup, useFr009Mutations } from "../hooks/useFr009Queries";
import Fr009Header from "../organisms/Fr009Header";
import Fr009Table from "../organisms/Fr009Table";
import { selectClass } from "../molecules/PersonField";

export default function Fr009ListTemplate() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");
  const [source, setSource] = useState<Fr009SourceCode | "">("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Fr009Record | null>(null);
  const [message, setMessage] = useState("");
  const lookup = useFr009Lookup();
  const list = useFr009List({ search: search || undefined, source: source || undefined, status: status || undefined, verifikasi: verification || undefined, page, per_page: 10 });
  const { remove } = useFr009Mutations();
  async function confirmDelete() {
    if (!deleteTarget) return;
    try { await remove.mutateAsync({ id: deleteTarget.id, version: deleteTarget.version }); setDeleteTarget(null); showToast.success("Laporan berhasil dihapus."); }
    catch (error) { const parsed = await readFr009Error(error); setMessage(parsed.message); showToast.error(parsed.message); setDeleteTarget(null); }
  }
  return <ServiceRouteGuard requiredService="SMKI"><div className="space-y-6 pb-8">
    <Fr009Header title="Tindakan Perbaikan & Pencegahan" />
    <div className="flex justify-end"><Link href="/smki/tindakan-perbaikan/tambah" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white text-center shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">+ Tambah laporan</Link></div>
    <div className="grid gap-4 sm:grid-cols-3">{[["Total laporan", list.data?.summary.total], ["Perlu tindak lanjut", list.data?.summary.needs_follow_up], ["Close", list.data?.summary.closed]].map(([label, count]) => <div key={label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold mt-2">{count ?? "—"}</p></div>)}</div>
    {message && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{message}</p>}
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"><div className="p-5 border-b border-slate-100 dark:border-slate-800"><h2 className="font-bold mb-3">Daftar Laporan FR-009</h2><div className="flex flex-col md:flex-row md:flex-wrap gap-3"><SearchBar aria-label="Cari nomor, area atau pelapor" placeholder="Cari nomor, area atau pelapor..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} onClear={() => { setSearch(""); setPage(1); }} /><select aria-label="Filter sumber masalah" value={source} onChange={(event) => { setSource(event.target.value as Fr009SourceCode | ""); setPage(1); }} className={`${selectClass} md:max-w-48`}><option value="">Semua sumber masalah</option>{lookup.data?.sources.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select><select aria-label="Filter status laporan" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={`${selectClass} md:max-w-48`}><option value="">Semua status laporan</option><option value="draft">Draft</option><option value="submitted">Diajukan</option></select><select aria-label="Filter hasil verifikasi" value={verification} onChange={(event) => { setVerification(event.target.value); setPage(1); }} className={`${selectClass} md:max-w-48`}><option value="">Semua verifikasi</option><option value="Open">Open</option><option value="Close">Close</option></select><Button type="button" variant="outline" onClick={() => { setSearch(""); setSource(""); setStatus(""); setVerification(""); setPage(1); }}>Reset filter</Button></div></div>
      {list.isLoading ? <p className="py-12 text-center text-sm text-slate-500">Memuat laporan...</p> : list.isError ? <div role="alert" className="p-5 text-sm text-rose-700">Gagal memuat laporan. Periksa koneksi dan hak akses.<Button variant="outline" className="ml-3" onClick={() => void list.refetch()}>Coba lagi</Button></div> : list.data && <><Fr009Table records={list.data.data} onDelete={setDeleteTarget} />{list.data.meta.total > 0 && <Pagination currentPage={list.data.meta.current_page} totalPages={Math.max(1, list.data.meta.last_page)} totalItems={list.data.meta.total} itemsPerPage={list.data.meta.per_page} onPageChange={setPage} />}</>}
    </section>
    <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Hapus laporan FR-009?" message={`Laporan ${deleteTarget?.nomor_laporan || `Draft #${deleteTarget?.id}`} akan dihapus. Dokumen Close tidak dapat dihapus.`} loading={remove.isPending} />
  </div></ServiceRouteGuard>;
}
