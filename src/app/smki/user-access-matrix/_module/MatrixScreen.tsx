"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileDown,
  FileEdit,
  KeyRound,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  formatDate,
  type MatrixInput,
  type MatrixRecord,
} from "./model";
import { useMatrices } from "./useMatrices";
import { useMasters } from "./useMasters";
import { downloadMatricesDocx } from "./docx";
import { Badge, Confirmation, control, exportButton, panel, primary, secondary } from "./ui";
import MatrixForm from "./MatrixForm";
import MatrixDetail from "./MatrixDetail";

export default function MatrixScreen({
  bidangName,
}: {
  bidangName: string;
}) {
  const { matrices, ready, error, save, remove, retry } = useMatrices();
  const masters = useMasters();
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [unit, setUnit] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleting, setDeleting] = useState<MatrixRecord | null>(null);
  const [exporting, setExporting] = useState<MatrixRecord[] | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = matrices.find((item) => item.id === selectedId) ?? null;
  const open = (record: MatrixRecord | null, target: typeof view) => {
    setSelectedId(record?.id ?? null);
    setView(target);
    window.scrollTo(0, 0);
  };

  const filtered = matrices.filter((record) => {
    const matchStatus = !status || record.status === status;
    const matchMonth = !month || record.documentDate.startsWith(month);
    const matchUnit = !unit || record.unit === unit;
    const haystack = [
      record.number,
      record.documentNumber,
      record.unit,
      ...record.roles.flatMap((row) => [row.role, row.access]),
    ].join(" ").toLocaleLowerCase("id");
    return matchStatus && matchMonth && matchUnit && haystack.includes(search.trim().toLocaleLowerCase("id"));
  });
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const cards = [
    { title: "Total Formulir", value: matrices.length, note: "Terdaftar di FR-033", icon: ClipboardCheck, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { title: "Draf", value: matrices.filter((item) => item.status === "Draf").length, note: "Belum final", icon: FileEdit, color: "text-violet-600 bg-violet-50 border-violet-200" },
    { title: "Tersimpan", value: matrices.filter((item) => item.status === "Tersimpan").length, note: "Formulir sudah lengkap", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { title: "Total Role", value: matrices.reduce((sum, item) => sum + item.roles.length, 0), note: "Pada seluruh formulir", icon: KeyRound, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

  const onSave = async (input: MatrixInput, complete: boolean) => {
    const record = await save(input, complete, selected ?? undefined);
    open(record, "detail");
    toast.success(complete ? "Formulir berhasil disimpan." : "Draf formulir berhasil disimpan.");
  };

  const resetFilter = () => {
    setSearch("");
    setStatus("");
    setMonth("");
    setUnit("");
    setPage(1);
  };

  if (!ready) {
    return <p role="status" className="text-sm text-slate-500 p-6">Memuat formulir FR-033...</p>;
  }

  return (
    <>
      <p className="mb-5 text-xs text-slate-500" role="status">
        Pengelola unit kerja dapat mencatat role, ruang lingkup akses, dan penanda tangan pada formulir daftar role.
      </p>
      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <p>{error}</p>
          <button className={`${secondary} mt-3`} onClick={retry}>Coba Lagi</button>
        </div>
      )}

      {view === "form" ? (
        <MatrixForm
          key={selectedId ?? "new"}
          matrix={selected}
          bidangName={bidangName}
          masters={masters.data}
          masterLoading={masters.loading}
          masterError={masters.error}
          masterRetry={masters.retry}
          onBack={() => setView(selected ? "detail" : "list")}
          onSave={onSave}
        />
      ) : view === "detail" && selected ? (
        <MatrixDetail
          matrix={selected}
          onBack={() => setView("list")}
          onEdit={() => open(selected, "form")}
          onDelete={() => setDeleting(selected)}
          onExport={() => setExporting([selected])}
        />
      ) : (
        <div className="space-y-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.title} className={`${panel} p-4 flex items-center justify-between gap-2`}>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{card.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{card.note}</p>
                </div>
                <div className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                  <card.icon size={21} />
                </div>
              </div>
            ))}
          </div>

          <div className={`${panel} p-5 space-y-4`}>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Cari formulir daftar role"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  placeholder="Cari nomor, unit kerja, atau role..."
                  className={`${control} pl-10`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setExporting(filtered)} disabled={!filtered.length} className={exportButton}>
                  <FileDown size={15} /> Ekspor (DOCX)
                </button>
                <button onClick={() => open(null, "form")} disabled={!!error} className={primary}>
                  <Plus size={15} /> Tambah Formulir
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label htmlFor="uam-status" className="block text-[11px] font-bold text-slate-500 mb-1">Status Dokumen:</label>
                <select id="uam-status" className={control} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                  <option value="">Semua Status</option>
                  <option>Draf</option>
                  <option>Tersimpan</option>
                </select>
              </div>
              <div>
                <label htmlFor="uam-month" className="block text-[11px] font-bold text-slate-500 mb-1">Bulan Dokumen:</label>
                <input id="uam-month" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} className={control} />
              </div>
              <div>
                <label htmlFor="uam-unit" className="block text-[11px] font-bold text-slate-500 mb-1">Unit Kerja:</label>
                <select
                  id="uam-unit"
                  className={control}
                  value={unit}
                  onChange={(event) => { setUnit(event.target.value); setPage(1); }}
                >
                  <option value="">Semua Unit Kerja</option>
                  {masters.data?.units.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </div>
            </div>
            {(search || status || month || unit) && (
              <button className={secondary} onClick={resetFilter}><RotateCcw size={13} /> Reset Filter</button>
            )}
          </div>

          <section className={`${panel} overflow-hidden`}>
            <div className="px-5 py-4 flex flex-wrap justify-between gap-2">
              <h2 className="text-sm font-bold">Daftar User Access Matrix</h2>
              <p className="text-[11px] text-slate-400">Menampilkan {filtered.length} dari {matrices.length} formulir</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
                  <tr>
                    {["Formulir", "Unit Kerja", "Jumlah Role", "Last Update", "Status", "Aksi"].map((label) => (
                      <th key={label} scope="col" className="px-5 py-3 text-[10px] uppercase font-semibold text-slate-500">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visible.map((record) => (
                    <tr key={record.id} className="hover:bg-violet-50/30 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <button className="text-xs font-bold text-left hover:text-violet-600" onClick={() => open(record, "detail")}>
                          User Access Matrix
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1">{record.number} · {record.documentNumber}</p>
                      </td>
                      <td className="px-5 py-4 text-xs">{record.unit || "Belum diisi"}</td>
                      <td className="px-5 py-4 text-xs">{record.roles.length}</td>
                      <td className="px-5 py-4 text-[11px]">{formatDate(record.updatedAt.slice(0, 10), false)}</td>
                      <td className="px-5 py-4"><Badge value={record.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button aria-label={`Lihat ${record.number}`} title="Lihat Detail" onClick={() => open(record, "detail")} className="p-2 text-slate-400 hover:text-violet-600"><Eye size={15} /></button>
                          <button aria-label={`Ubah ${record.number}`} title="Ubah" onClick={() => open(record, "form")} className="p-2 text-slate-400 hover:text-blue-600"><Pencil size={15} /></button>
                          <button aria-label={`Ekspor ${record.number}`} title="Ekspor DOCX" onClick={() => setExporting([record])} className="p-2 text-slate-400 hover:text-emerald-600"><FileDown size={15} /></button>
                          <button aria-label={`Hapus ${record.number}`} title="Hapus" onClick={() => setDeleting(record)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!visible.length && (
              <div role="status" className="text-center px-5 py-12">
                <ClipboardCheck size={28} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">
                  {matrices.length ? "Tidak ada formulir sesuai filter" : "Belum ada formulir FR-033"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {matrices.length ? "Ubah pencarian atau reset filter." : "Pilih Tambah Formulir untuk mulai mencatat role dan akses."}
                </p>
              </div>
            )}
            <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <p>Menampilkan {filtered.length ? (currentPage - 1) * perPage + 1 : 0}–{Math.min(currentPage * perPage, filtered.length)} dari {filtered.length} formulir</p>
              <div className="flex items-center gap-2">
                <select aria-label="Jumlah formulir per halaman" value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setPage(1); }} className="bg-transparent">
                  {[10, 20, 50].map((size) => <option key={size} value={size}>{size} per halaman</option>)}
                </select>
                <button aria-label="Halaman sebelumnya" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="p-2 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span className="px-3 py-2 rounded-lg bg-violet-600 text-white">{currentPage}</span>
                <button aria-label="Halaman berikutnya" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} className="p-2 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          </section>
        </div>
      )}

      {deleting && (
        <Confirmation
          title="Yakin hapus formulir?"
          confirm="Ya, Hapus"
          danger
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await remove(deleting.id);
              if (selectedId === deleting.id) open(null, "list");
              setDeleting(null);
              toast.success("Formulir berhasil dihapus.");
            } catch {
              toast.error("Formulir gagal dihapus. Silakan coba lagi.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="font-bold mb-2">{deleting.number} · {deleting.unit}</p>
          <p>Formulir beserta daftar role di dalamnya akan dihapus. Pastikan dokumen ini tidak lagi diperlukan.</p>
        </Confirmation>
      )}

      {exporting && (
        <Confirmation
          title="Ekspor Formulir FR-033"
          confirm="Unduh DOCX"
          busy={busy}
          onClose={() => setExporting(null)}
          onConfirm={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await downloadMatricesDocx(exporting);
              setExporting(null);
              toast.success("Dokumen FR-033 berhasil diunduh.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Ekspor dokumen gagal. Silakan coba kembali.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>Ekspor {exporting.length} formulir ke dokumen Word sesuai kop formulir FR-033. Tanda tangan dicetak sebagai spesimen nama dan diisi di luar aplikasi.</p>
        </Confirmation>
      )}
    </>
  );
}
