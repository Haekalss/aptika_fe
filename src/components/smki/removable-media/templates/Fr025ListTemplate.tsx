"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteFr025, fr025Error } from "@/services/smki/removableMediaService";
import type { Fr025Filters, Fr025Report } from "@/services/smki/removableMedia.types";
import { showToast } from "@/components/ui/Toast";
import { useFr025List } from "../hooks/useFr025Queries";
import { fr025Date } from "../form";
import { Fr025Button } from "../atoms/Fr025Button";
import { Fr025Link } from "../atoms/Fr025Link";
import { Fr025Status } from "../atoms/Fr025Status";
import { Fr025Confirm } from "../molecules/Fr025Confirm";
import { fr025Control } from "../molecules/Fr025Field";
import { Fr025Feedback } from "../molecules/Fr025Feedback";
import { Fr025Header } from "../organisms/Fr025Header";

const rowActionLinkClass = "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950";

export function Fr025ListTemplate() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Fr025Filters>({ page: 1 });
  const [deleting, setDeleting] = useState<Fr025Report | null>(null);
  const query = useFr025List(filters);
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: deleteFr025,
    onSuccess: async () => { setDeleting(null); showToast.success("Dokumen FR-025 berhasil dihapus."); await client.invalidateQueries({ queryKey: ["fr025"] }); },
    onError: (error) => showToast.error(fr025Error(error).message),
  });
  const data = query.data;
  return <>
    <Fr025Header />
    <div className="flex items-center justify-between gap-4">
      <Fr025Link href="/smki" className="text-sm font-semibold text-emerald-700">← Ringkasan SMKI</Fr025Link>
      <Fr025Link href="/smki/removable-media/tambah" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={17} />Tambah daftar</Fr025Link>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Dokumen Inventaris</h2><p className="mt-1 text-sm text-slate-500">Dokumen Draft maupun Final dapat diedit dan dihapus sesuai hak akses. Finalisasi bukan approval elektronik.</p></div><span className="whitespace-nowrap text-sm text-slate-500">{data?.meta.total ?? 0} dokumen</span></div>
      <form className="flex items-end gap-3" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, search, page: 1 }); }}>
        <label className="flex-1 space-y-1.5 text-xs font-semibold text-slate-600">Cari barang, unit, PIC, atau ID<input className={fr025Control} value={search} maxLength={100} placeholder="Contoh: Flashdisk" onChange={(event) => setSearch(event.target.value)} /></label>
        <label className="w-44 space-y-1.5 text-xs font-semibold text-slate-600">Status<select className={fr025Control} value={filters.status ?? ""} onChange={(event) => setFilters({ ...filters, status: event.target.value || undefined, page: 1 })}><option value="">Semua status</option><option value="draft">Draft</option><option value="final">Final</option></select></label>
        <Fr025Button type="submit"><Search />Cari</Fr025Button>
      </form>
    </section>
    {query.isPending ? <Fr025Feedback message="Memuat daftar inventaris..." /> : query.isError ? <Fr025Feedback message={fr025Error(query.error).message} error onRetry={() => void query.refetch()} /> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><caption className="sr-only">Daftar dokumen FR-025</caption>
        <thead className="bg-slate-50 text-xs text-slate-600"><tr>{["Referensi / Unit Kerja", "Tanggal", "Pengurus Barang", "Inventaris", "Status", "Aksi"].map((title) => <th key={title} scope="col" className={`px-5 py-4 ${title === "Aksi" ? "w-44 text-center" : ""}`}>{title}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{data?.data.map((report) => <tr key={report.id} className="hover:bg-slate-50/60">
          <td className="px-5 py-4"><Fr025Link href={`/smki/removable-media/${report.id}`} className="font-semibold text-emerald-700">{report.reference}</Fr025Link><p className="mt-1 text-xs text-slate-500">{report.unit_kerja_nama}</p></td>
          <td className="px-5 py-4">{fr025Date(report.tanggal_dokumen)}</td><td className="px-5 py-4">{report.pengurus_barang_nama || "-"}</td>
          <td className="px-5 py-4">{report.items_count ?? 0} baris<p className="mt-1 text-xs text-slate-500">{report.total_jumlah ?? 0} unit</p></td><td className="px-5 py-4"><Fr025Status status={report.status} /></td>
          <td className="w-44 px-5 py-4 align-middle">
            <div className="flex items-center justify-center gap-2">
              <Fr025Link href={`/smki/removable-media/${report.id}`} className={rowActionLinkClass} title="Lihat dokumen" aria-label={`Lihat ${report.reference}`}><Eye size={16} aria-hidden="true" /></Fr025Link>
              {report.permissions.can_update && <Fr025Link href={`/smki/removable-media/${report.id}/edit`} className={rowActionLinkClass} title="Edit dokumen" aria-label={`Edit ${report.reference}`}><Pencil size={16} aria-hidden="true" /></Fr025Link>}
              {report.permissions.can_delete && <Fr025Button size="icon" variant="ghost" className="shrink-0" title="Hapus dokumen" aria-label={`Hapus ${report.reference}`} onClick={() => setDeleting(report)}><Trash2 size={16} className="text-red-600" aria-hidden="true" /></Fr025Button>}
            </div>
          </td>
        </tr>)}</tbody></table></div>
      {!data?.data.length && <p className="p-10 text-center text-sm text-slate-500">Tidak ada dokumen yang sesuai. Buat daftar baru atau ubah filter pencarian.</p>}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4"><p className="text-xs text-slate-500">Halaman {data?.meta.current_page ?? 1} dari {data?.meta.last_page ?? 1}{query.isFetching ? " · Memperbarui..." : ""}</p><div className="flex gap-2"><Fr025Button variant="outline" disabled={(filters.page ?? 1) <= 1 || query.isFetching} onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}>Sebelumnya</Fr025Button><Fr025Button variant="outline" disabled={(filters.page ?? 1) >= (data?.meta.last_page ?? 1) || query.isFetching} onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}>Berikutnya</Fr025Button></div></div>
    </section>}
    <Fr025Confirm open={!!deleting} title="Hapus dokumen FR-025?" danger pending={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove.mutate(deleting); }}>Dokumen {deleting?.reference} ({deleting?.status === "final" ? "Final" : "Draft"}) akan dihapus dari daftar. Data master barang, merek, dan PIC tidak dihapus.</Fr025Confirm>
  </>;
}
