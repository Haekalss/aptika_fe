"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Users,
  SquarePen,
  Trash2,
  BadgeCheck,
  FileDown,
  X,
  Eye,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import AsetSdmDeleteModal from "@/components/smki/daftar-aset-sdm/Asetsdmdeleteconfirm";
import AsetSdmExportModal from "@/components/smki/daftar-aset-sdm/AsetSdmExportModal";
import AsetSdmDetailModal from "@/components/smki/daftar-aset-sdm/AsetSdmDetailModal";
import { exportAsetSdm, AsetSdmExportOptions } from "@/services/smki/exportAsetSdm";
import { useAuthStore } from "@/store/useAuthStore";
import {
  AsetSdm,
  AsetSdmLookup,
  AsetSdmMeta,
  AsetSdmStats,
  deleteAsetSdm,
  getAsetSdmLookup,
  getDaftarAsetSdmAll,
} from "@/services/smki/daftarAsetSDM";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

const selectCls = `w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 ${focus}`;

const getErrMsg = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

export default function AsetSdmPage() {
  const router = useRouter();
  const { bidang } = useAuthStore();

  const [items, setItems] = useState<AsetSdm[]>([]);
  const [stats, setStats] = useState<AsetSdmStats>({ total_aset: 0, total_jabatan: 0, total_unit: 0 });
  const [meta, setMeta] = useState<AsetSdmMeta>({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [lookup, setLookup] = useState<AsetSdmLookup>({ pangkat_golongan: [], jabatan: [], unit_kerja: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pangkat, setPangkat] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unit, setUnit] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AsetSdm | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [detailTarget, setDetailTarget] = useState<AsetSdm | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const requestId = useRef(0);

    // Dokumen dikunci (tidak bisa scroll sampai blank space), lalu halaman ini
  // menjadi area scroll sendiri dengan tinggi menyesuaikan sisa layar.
  // Scrollbar disembunyikan, scroll tetap berfungsi.
  const unlockRef = useRef<(() => void) | null>(null);
  const rootRef = useCallback((node: HTMLDivElement | null) => {
    if (unlockRef.current) {
      unlockRef.current();
      unlockRef.current = null;
    }
    if (!node) return;

    // 1. Kunci scroll dokumen dan semua induk yang bisa scroll
    const saved: { el: HTMLElement; overflowY: string; scrollTop: number }[] = [];
    const lock = (el: HTMLElement) => {
      saved.push({ el, overflowY: el.style.overflowY, scrollTop: el.scrollTop });
      el.scrollTop = 0;
      el.style.overflowY = "hidden";
    };
    lock(document.documentElement);
    lock(document.body);
    let el: HTMLElement | null = node.parentElement;
    while (el && el !== document.body) {
      const oy = window.getComputedStyle(el).overflowY;
      if (oy === "auto" || oy === "scroll") lock(el);
      el = el.parentElement;
    }
    window.scrollTo(0, 0);

    // 2. Halaman ini menjadi area scroll dengan tinggi sisa layar
    node.style.overflowY = "auto";
    const fit = () => {
      const top = node.getBoundingClientRect().top;
      node.style.maxHeight = `${Math.max(240, window.innerHeight - top - 16)}px`;
    };
    fit();
    const t1 = window.setTimeout(fit, 150);
    const t2 = window.setTimeout(fit, 600);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);

    unlockRef.current = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      node.style.maxHeight = "";
      node.style.overflowY = "";
      saved.forEach(({ el, overflowY, scrollTop }) => {
        el.style.overflowY = overflowY;
        el.scrollTop = scrollTop;
      });
    };
  }, []);

  // Debounce pencarian agar tidak memanggil API di setiap ketikan
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadLookup = useCallback(async () => {
    try {
      setLookup(await getAsetSdmLookup({ scope: "all" }));
    } catch {
      /* opsi filter gagal dimuat: dropdown tetap kosong, tabel tetap berfungsi */
    }
  }, []);

  const load = useCallback(async () => {
    const myId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getDaftarAsetSdmAll({
        search: debouncedSearch || undefined,
        pangkat_golongan: pangkat || undefined,
        jabatan: jabatan || undefined,
        unit_kerja_id: unit || undefined,
        page,
        per_page: perPage,
      });
      if (myId !== requestId.current) return; // abaikan respons yang sudah usang

      setItems(res.data);
      setStats(res.stats);
      setMeta(res.meta);

      // Halaman melebihi batas (mis. setelah hapus data terakhir di halaman itu)
      if (res.data.length === 0 && page > 1 && res.meta.last_page < page) {
        setPage(Math.max(1, res.meta.last_page));
      }
    } catch (err: any) {
      if (myId !== requestId.current) return;
      setError(getErrMsg(err, "Gagal memuat daftar aset SDM."));
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  }, [debouncedSearch, pangkat, jabatan, unit, page, perPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadLookup();
  }, [loadLookup]);

  const hasFilter = !!(search || pangkat || jabatan || unit);
  const resetFilter = () => {
    setSearch("");
    setDebouncedSearch("");
    setPangkat("");
    setJabatan("");
    setUnit("");
    setPage(1);
  };

  const totalPages = Math.max(1, meta.last_page);
  const currentPage = meta.current_page;
  const start = (currentPage - 1) * meta.per_page;
  const rows = items;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAsetSdm(deleteTarget.id);
      toast.success("Data aset SDM berhasil dihapus.");
      if (expanded === deleteTarget.id) setExpanded(null);
      setDeleteTarget(null);
      await Promise.all([load(), loadLookup()]);
    } catch (err: any) {
      toast.error(getErrMsg(err, "Gagal menghapus data aset SDM."));
    } finally {
      setDeleting(false);
    }
  };

  const handleExecuteExport = async (options: AsetSdmExportOptions) => {
    setExportLoading(true);
    try {
      const total = await exportAsetSdm(
        options,
        {
          search: search.trim() || undefined,
          pangkat_golongan: pangkat || undefined,
          jabatan: jabatan || undefined,
          unit_kerja_id: unit || undefined,
        },
        bidang?.name
      );
      const formatLabel = { xlsx: "Excel", pdf: "PDF", docx: "Word" }[options.format];
      toast.success(`${total} data berhasil diekspor ke ${formatLabel}.`);
      setExportModalOpen(false);
    } catch (err: any) {
      toast.error(getErrMsg(err, "Gagal mengekspor data aset SDM."));
    } finally {
      setExportLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Aset SDM",
      value: stats.total_aset,
      sub: "Personel tercatat",
      icon: <Layers size={20} aria-hidden="true" />,
      tone: "text-blue-700 dark:text-blue-300",
      chip: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
    },
    {
      label: "Jumlah Jabatan",
      value: stats.total_jabatan,
      sub: "Jabatan yang terwakili",
      icon: <BadgeCheck size={20} aria-hidden="true" />,
      tone: "text-slate-700 dark:text-slate-200",
      chip: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    },
    {
      label: "Unit / Tim",
      value: stats.total_unit,
      sub: "Unit atau tim yang terwakili",
      icon: <SquarePen size={20} aria-hidden="true" />,
      tone: "text-purple-700 dark:text-purple-300",
      chip: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900",
    },
  ];

  const th = "px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div
        ref={rootRef}
        id="aset-sdm-page"
                className="flex min-w-0 flex-col gap-5 pb-2 [&>*]:shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
          <style>{`
            *:has(#aset-sdm-page) { scrollbar-width: none; -ms-overflow-style: none; }
            *:has(#aset-sdm-page)::-webkit-scrollbar { display: none; width: 0; height: 0; }
          `}</style>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Users size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
                  Daftar Aset SDM
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Inventaris sumber daya manusia, kompetensi, dan tanggung jawab dalam pengelolaan keamanan informasi.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-200" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileDown size={16} className="text-emerald-200" />
                <span>Format Ekspor: <strong className="text-white">Microsoft Word (.docx)</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{s.label}</p>
                <p className={`mt-1 text-3xl font-black ${s.tone}`}>{loading && items.length === 0 ? "-" : s.value}</p>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">{s.sub}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${s.chip}`}>{s.icon}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                type="text"
                aria-label="Cari aset SDM"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIP, kode aset, atau jabatan..."
                className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-400 ${focus}`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus kata kunci"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-800 ${focus}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              disabled={exportLoading}
              title="Unduh daftar aset SDM ke file Excel (.xlsx), PDF, atau Word (.docx)"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-50 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50 ${focus}`}
            >
              {exportLoading ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <FileDown size={15} aria-hidden="true" />
              )}
              <span>Ekspor (Excel / PDF / Word)</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/smki/daftar-aset-sdm/create")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 ${focus}`}
            >
              <Plus size={15} aria-hidden="true" /> Tambah Aset SDM
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div>
              <label htmlFor="f-pangkat" className="mb-1.5 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Pangkat / Golongan
              </label>
              <select
                id="f-pangkat"
                value={pangkat}
                onChange={(e) => { setPangkat(e.target.value); setPage(1); }}
                className={selectCls}
              >
                <option value="">Semua Pangkat / Golongan</option>
                {lookup.pangkat_golongan.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-jabatan" className="mb-1.5 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Jabatan
              </label>
              <select
                id="f-jabatan"
                value={jabatan}
                onChange={(e) => { setJabatan(e.target.value); setPage(1); }}
                className={selectCls}
              >
                <option value="">Semua Jabatan</option>
                {lookup.jabatan.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-unit" className="mb-1.5 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Unit / Tim
              </label>
              <select
                id="f-unit"
                value={unit}
                onChange={(e) => { setUnit(e.target.value); setPage(1); }}
                className={selectCls}
              >
                <option value="">Semua Unit / Tim</option>
                {lookup.unit_kerja.map((o) => (
                  <option key={o.id} value={String(o.id)}>{o.nama}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilter}
              disabled={!hasFilter}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
            >
              <RotateCcw size={13} aria-hidden="true" /> Reset
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Daftar Aset SDM</h2>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {meta.total} personel
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className={th}>Nama / Kode Aset</th>
                  <th className={th}>Jabatan / TMT</th>
                  <th className={th}>Unit Kerja</th>
                  <th className={th}>Jabatan SMKI</th>
                  <th className={th}>Pendidikan</th>
                  <th className={`${th} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center" role="status">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-emerald-600" aria-hidden="true" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Memuat data aset SDM...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center" role="alert">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <AlertCircle size={30} className="text-rose-600" aria-hidden="true" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Data gagal dimuat</span>
                        {/* <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p> */}
                        <button type="button" onClick={load} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                          Coba lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <AlertCircle size={30} className="text-amber-600" aria-hidden="true" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {hasFilter ? "Tidak ada data yang cocok" : "Belum ada aset SDM"}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {hasFilter
                            ? "Ubah kata kunci atau filter untuk melihat data lain."
                            : "Tambahkan personel pertama untuk mulai menyusun inventaris SDM."}
                        </p>
                        {hasFilter ? (
                          <button type="button" onClick={resetFilter} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                            Bersihkan filter
                          </button>
                        ) : (
                          <button type="button" onClick={() => router.push("/smki/daftar-aset-sdm/create")} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                            Tambah Aset SDM
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((item) => {
                    const isOpen = expanded === item.id;
                    return (
                      <React.Fragment key={item.id}>
                        <tr className={`border-b border-slate-100 dark:border-slate-800/70 ${isOpen ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setExpanded(isOpen ? null : item.id)}
                                aria-expanded={isOpen}
                                aria-controls={`detail-${item.id}`}
                                aria-label={`${isOpen ? "Tutup" : "Buka"} rincian ${item.nama}`}
                                className={`rounded-md p-1 text-slate-600 hover:text-emerald-700 dark:text-slate-300 ${focus}`}
                              >
                                {isOpen ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
                              </button>
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <Users size={16} aria-hidden="true" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{item.nama}</div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  {item.nip}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{item.jabatan || "-"}</div>
                            {item.tmt_jabatan_label && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-400">TMT {item.tmt_jabatan_label}</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">{item.unit_kerja}</td>
                          <td className="px-4 py-3.5">{item.jabatan_smki}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                              {item.jenjang} {item.jurusan}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400">Lulus {item.tahun_lulus}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setDetailTarget(item)}
                                aria-label={`Lihat detail ${item.nama}`}
                                title="Lihat detail"
                                className={`rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 ${focus}`}
                              >
                                <Eye size={15} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push(`/smki/daftar-aset-sdm/edit/${item.id}`)}
                                aria-label={`Ubah data ${item.nama}`}
                                title="Ubah data"
                                className={`rounded-lg p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-amber-950/40 ${focus}`}
                              >
                                <Pencil size={15} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                aria-label={`Hapus data ${item.nama}`}
                                title="Hapus data"
                                className={`rounded-lg p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 ${focus}`}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr id={`detail-${item.id}`} className="border-b border-slate-100 bg-emerald-50/40 dark:border-slate-800/70 dark:bg-emerald-950/10">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                  <h3 className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                      <ClipboardList size={13} aria-hidden="true" />
                                    </span>
                                    Tanggung Jawab
                                  </h3>
                                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{item.tanggung_jawab}</p>
                                </div>
                                <div>
                                  <h3 className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                      <GraduationCap size={13} aria-hidden="true" />
                                    </span>
                                    Pelatihan yang Pernah Diikuti
                                  </h3>
                                  {item.pelatihan.length === 0 ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Belum ada pelatihan tercatat.</p>
                                  ) : (
                                    <ul className="flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-300">
                                      {item.pelatihan.map((p, i) => (
                                        <li key={p.id ?? i} className="flex justify-between gap-3">
                                          <span>{p.nama}</span>
                                          <span className="font-semibold text-slate-600 dark:text-slate-400">{p.tahun}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 text-xs dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">
              Menampilkan {meta.total === 0 ? 0 : start + 1}–{start + rows.length} dari {meta.total} aset SDM
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="per-page" className="sr-only">Jumlah data per halaman</label>
              <select
                id="per-page"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className={`rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focus}`}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>{n} per halaman</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || loading}
                aria-label="Halaman sebelumnya"
                className={`rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <span className="min-w-[32px] rounded-lg bg-emerald-700 px-2.5 py-1.5 text-center font-bold text-white" aria-current="page">
                {currentPage}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || loading}
                aria-label="Halaman berikutnya"
                className={`rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AsetSdmDeleteModal
        open={!!deleteTarget}
        nama={deleteTarget?.nama ?? ""}
        kode={deleteTarget?.kode_aset ?? ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <AsetSdmDetailModal
        open={!!detailTarget}
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <AsetSdmExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExecuteExport}
        loading={exportLoading}
      />
    </ServiceRouteGuard>
  );
}