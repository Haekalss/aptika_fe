"use client";

import { useState } from "react";
import { Building2, Layers, FileEdit, CheckCircle2, Clock, Search, Plus, FileDown, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { type ChangeLog } from "../lib/model";
import { Badge, panel, control, primary, secondary, exportButton } from "./ui";

interface Props { logs: ChangeLog[]; unit: string; allBidang: boolean; writable: boolean; onAdd: () => void; onDetail: (log: ChangeLog) => void; onEdit: (log: ChangeLog) => void; onDelete: (log: ChangeLog) => void; onExport: (logs: ChangeLog[]) => void }
export default function LogDashboard({ logs, unit, allBidang, writable, onAdd, onDetail, onEdit, onDelete, onExport }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [month, setMonth] = useState("");
  const [bidangFilter, setBidangFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const filtered = logs.filter(log => (!status || log.status === status) && (!priority || log.priority === priority)
    && (!bidangFilter || String(log.references?.bidangId ?? log.unit) === bidangFilter)
    && (!month || (log.requestedAt ?? "").startsWith(month))
    && [log.number, log.rfcNumber, log.title, log.system, log.executor, log.requestedBy].join(" ").toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id")));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const bidangOptions = [...new Map(logs.map(log => [String(log.references?.bidangId ?? log.unit), log.unit])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "id"));
  const priorities = [...new Set(logs.map(log => log.priority).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, "id"));
  const cards = [
    { label: "Total Log", value: logs.length, sub: "Terdaftar di formulir FR-032", icon: Layers, text: "text-blue-600 dark:text-blue-400", box: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800" },
    { label: "Draf", value: logs.filter(log => log.status === "Draf").length, sub: "Pencatatan belum lengkap", icon: FileEdit, text: "text-purple-600 dark:text-purple-400", box: "bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800" },
    { label: "Tersimpan", value: logs.filter(log => log.status === "Tersimpan").length, sub: "Siap diekspor atau diedit", icon: CheckCircle2, text: "text-emerald-600 dark:text-emerald-400", box: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800" },
    { label: "Rilis Produksi", value: logs.filter(log => !!log.releasedAt).length, sub: "Tanggal rilis sudah dicatat", icon: Clock, text: "text-amber-600 dark:text-amber-400", box: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800" },
  ];
  return <div className="flex flex-col gap-6 pb-8">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
      <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"/>
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="max-w-2xl"><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">Formulir Log Perubahan</h1><p className="text-sm text-emerald-100 leading-relaxed">Pencatatan nomor RFC, permintaan, prioritas, dampak produksi, hasil perubahan, dan evaluasi.</p></div><div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold shrink-0"><Building2 size={16} className="text-emerald-300"/><span>{allBidang ? "Cakupan: Semua Bidang" : `Unit Kerja: ${unit}`}</span></div></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(card => <div key={card.label} className={`${panel} p-4 flex items-center justify-between gap-2`}><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{card.label}</p><p className={`text-2xl font-black ${card.text}`}>{card.value}</p><p className="text-[11px] text-slate-400 mt-1">{card.sub}</p></div><div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${card.box} ${card.text}`}><card.icon size={22}/></div></div>)}</div>
    <div className={`${panel} p-5 space-y-4`}>
      <div className="flex flex-col lg:flex-row gap-3"><div className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Cari log perubahan" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Cari No. RFC, deskripsi, sistem/aset, pemohon, atau PIC..." className={`${control} pl-10`}/></div><div className="flex gap-2 flex-wrap"><button onClick={() => onExport(filtered)} disabled={!filtered.length} className={exportButton}><FileDown size={15}/> Ekspor (DOCX)</button><button onClick={onAdd} disabled={!writable} className={primary}><Plus size={15}/> Tambah Log</button></div></div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${allBidang ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 pt-3 border-t border-slate-100 dark:border-slate-800`}>
        {allBidang && <div><label htmlFor="filter-bidang" className="block text-[11px] font-bold text-slate-500 mb-1">Bidang:</label><select id="filter-bidang" value={bidangFilter} onChange={event => { setBidangFilter(event.target.value); setPage(1); }} className={control}><option value="">Semua Bidang</option>{bidangOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div>}
        <div><label htmlFor="filter-status" className="block text-[11px] font-bold text-slate-500 mb-1">Status Dokumen:</label><select id="filter-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className={control}><option value="">Semua Status</option><option>Draf</option><option>Tersimpan</option></select></div>
        <div><label htmlFor="filter-priority" className="block text-[11px] font-bold text-slate-500 mb-1">Prioritas:</label><select id="filter-priority" value={priority} onChange={event => { setPriority(event.target.value); setPage(1); }} className={control}><option value="">Semua Prioritas</option>{priorities.map(value => <option key={value}>{value}</option>)}</select></div>
        <div><label htmlFor="filter-month" className="block text-[11px] font-bold text-slate-500 mb-1">Bulan Permintaan:</label><input id="filter-month" type="month" value={month} onChange={event => { setMonth(event.target.value); setPage(1); }} className={control}/></div>
      </div>
      {(search || status || priority || month || bidangFilter) && <button onClick={() => { setSearch(""); setStatus(""); setPriority(""); setMonth(""); setBidangFilter(""); setPage(1); }} className={secondary}><RotateCcw size={13}/> Reset Filter</button>}
    </div>
    <section className={`${panel} overflow-hidden`}>
      <div className="px-5 py-4 flex flex-wrap gap-2 items-center justify-between"><h2 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Log Perubahan TI</h2><p className="text-[11px] text-slate-400">Menampilkan {filtered.length} dari {logs.length} log</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700"><tr>{["Log Perubahan", ...(allBidang ? ["Bidang"] : []), "Sistem / Aset", "Diminta Oleh", "PIC", "Tanggal Permintaan", "Prioritas", "Status", "Aksi"].map(label => <th key={label} scope="col" className="px-5 py-3 text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visible.map(log => <tr key={log.id} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition-colors">
        <td className="px-5 py-4"><button onClick={() => onDetail(log)} className="text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600">{log.title}</button><p className="text-[10px] text-slate-400 mt-1">{log.rfcNumber || log.number}</p></td>
        {allBidang && <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{log.unit}</td>}
        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-[180px]">{log.system}</td><td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{log.requestedBy || "Belum diisi"}</td><td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{log.executor || "Belum diisi"}</td><td className="px-5 py-4 text-[11px] text-slate-600 dark:text-slate-300">{log.requestedAt || "Belum diisi"}</td><td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{log.priority || "Belum diisi"}</td><td className="px-5 py-4"><Badge value={log.status}/></td>
        <td className="px-5 py-4"><div className="flex gap-1"><button onClick={() => onDetail(log)} aria-label={`Lihat ${log.title}`} title="Lihat Detail" className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"><Eye size={15}/></button>{writable && <><button onClick={() => onEdit(log)} aria-label={`Edit ${log.title}`} title="Edit Log" className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={15}/></button><button onClick={() => onDelete(log)} aria-label={`Hapus ${log.title}`} title="Hapus Log" className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={15}/></button></>}</div></td>
      </tr>)}</tbody></table></div>
      {!visible.length && <div className="text-center py-12 px-4" role="status"><Layers size={28} className="mx-auto text-slate-300 mb-3"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">{logs.length ? "Tidak ada log yang sesuai filter" : "Belum ada log perubahan"}</p><p className="text-xs text-slate-400 mt-2">{logs.length ? "Ubah pencarian atau reset filter untuk melihat data lainnya." : "Pilih Tambah Log untuk mulai mencatat perubahan."}</p></div>}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400"><p>Menampilkan {filtered.length ? (currentPage - 1) * perPage + 1 : 0}–{Math.min(currentPage * perPage, filtered.length)} dari {filtered.length} log</p><div className="flex items-center gap-2"><select aria-label="Jumlah log per halaman" className="bg-transparent text-xs" value={perPage} onChange={event => { setPerPage(Number(event.target.value)); setPage(1); }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} per halaman</option>)}</select><button aria-label="Halaman sebelumnya" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 disabled:opacity-30"><ChevronLeft size={14}/></button><span className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">{currentPage}</span><button aria-label="Halaman berikutnya" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 disabled:opacity-30"><ChevronRight size={14}/></button></div></div>
    </section>
  </div>;
}
