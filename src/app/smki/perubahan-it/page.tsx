"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileDown,
  FilePen,
  FileText,
  Info,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  GitPullRequest,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import PerubahanItDeleteModal from "@/components/smki/perubahan-it/PerubahanItDeleteModal";
import PerubahanItDetailModal from "@/components/smki/perubahan-it/PerubahanItDetailModal";
import PerubahanItAksiModal from "@/components/smki/perubahan-it/PerubahanItAksiModal";
import PerubahanItExportModal, { type PerubahanItExportMode } from "@/components/smki/perubahan-it/PerubahanItExportModal";
import { RisikoBadge, StatusBadge } from "@/components/smki/perubahan-it/PerubahanItBadges";
import { useAuthStore } from "@/store/useAuthStore";
import {
  RISIKO_OPTIONS,
  STATUS_OPTIONS,
  aksiPerubahanIt,
  deletePerubahanIt,
  extractFieldErrors,
  extractMessage,
  formatRentangJam,
  formatRupiah,
  formatTanggalPendek,
  getPerubahanIt,
  getPerubahanItList,
  getPerubahanItLookup,
  risikoLabel,
  statusLabel,
  type AksiPayload,
  type AksiPerubahan,
  type PerubahanIt,
  type PerubahanItListMeta,
  type PerubahanItStats,
  type UnitKerjaOption,
} from "@/services/smki/perubahanIt";
import { exportPerubahanItDocx } from "@/services/smki/exportPerubahanItDocx";

const CREATE_PATH = "/smki/perubahan-it/create";
const editPath = (id: number) => `/smki/perubahan-it/edit/${id}`;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

const selectCls = `w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 ${focus}`;

const EMPTY_STATS: PerubahanItStats = {
  total: 0,
  draft: 0,
  diajukan: 0,
  dikembalikan: 0,
  diterima: 0,
  ditolak: 0,
  disetujui: 0,
  dilaksanakan: 0,
};

const EMPTY_META: PerubahanItListMeta = { current_page: 1, last_page: 1, per_page: 10, total: 0 };

const th = "px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export default function PerubahanItPage() {
  const router = useRouter();
  const { bidang } = useAuthStore();

  const [items, setItems] = useState<PerubahanIt[]>([]);
  const [stats, setStats] = useState<PerubahanItStats>(EMPTY_STATS);
  const [meta, setMeta] = useState<PerubahanItListMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("");
  const [risiko, setRisiko] = useState("");
  const [unitOptions, setUnitOptions] = useState<UnitKerjaOption[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [detailItem, setDetailItem] = useState<PerubahanIt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PerubahanIt | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [aksiTarget, setAksiTarget] = useState<{ item: PerubahanIt; aksi: AksiPerubahan } | null>(null);
  const [aksiBusy, setAksiBusy] = useState(false);
  const [aksiErrors, setAksiErrors] = useState<Record<string, string>>({});
  const [aksiMessage, setAksiMessage] = useState<string | null>(null);

  // Debounce pencarian supaya tidak memanggil API di setiap ketikan
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [search]);

  // Cegah respons lama menimpa respons terbaru
    // Cegah respons lama menimpa respons terbaru
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

  const load = useCallback(async () => {
    const myId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getPerubahanItList({
        search: debouncedSearch,
        status,
        unit_kerja_id: unit,
        tingkat_risiko: risiko,
        page,
        per_page: perPage,
      });
      if (myId !== requestId.current) return;
      setItems(res.data);
      setStats(res.stats);
      setMeta(res.meta);

      // Jika halaman melebihi batas (mis. setelah hapus data terakhir di halaman), mundur satu halaman
      if (res.data.length === 0 && res.meta.current_page > 1 && res.meta.last_page < res.meta.current_page) {
        setPage(res.meta.last_page);
      }
    } catch (err: any) {
      if (myId !== requestId.current) return;
      setError(extractMessage(err, "Gagal memuat daftar perubahan TI."));
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  }, [debouncedSearch, status, unit, risiko, page, perPage]);

  useEffect(() => {
    load();
  }, [load]);

  // Opsi filter "Unit Kerja": seluruh isi tabel master unit kerja
  const loadUnits = useCallback(async () => {
    try {
      setUnitOptions((await getPerubahanItLookup("all")).unit_kerja);
    } catch {
      /* filter unit kerja boleh kosong; daftar tetap bisa dipakai */
    }
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const hasFilter = !!(search || status || unit || risiko);
  const resetFilter = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setUnit("");
    setRisiko("");
    setPage(1);
  };

  const start = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const end = (meta.current_page - 1) * meta.per_page + items.length;

  /** Sinkronkan item yang terbuka di modal dengan data terbaru dari server. */
  const syncDetail = (updated: PerubahanIt) => {
    setDetailItem((cur) => (cur && cur.id === updated.id ? updated : cur));
  };

  const openDetail = async (item: PerubahanIt) => {
    setDetailItem(item); // tampilkan data dari list dulu, lalu segarkan agar riwayat/izin terbaru
    try {
      syncDetail(await getPerubahanIt(item.id));
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setDetailItem(null);
        toast.error("Data perubahan TI tidak ditemukan.");
        load();
      }
    }
  };

  /** Cetak satu formulir ke DOCX langsung dari baris tabel. */
  const cetakDocx = async (item: PerubahanIt) => {
    setPrintingId(item.id);
    try {
      await exportPerubahanItDocx([item]);
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal membuat DOCX formulir."));
    } finally {
      setPrintingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const message = await deletePerubahanIt(deleteTarget.id);
      toast.success(message || "Data perubahan TI berhasil dihapus.");
      if (detailItem?.id === deleteTarget.id) setDetailItem(null);
      if (expanded === deleteTarget.id) setExpanded(null);
      setDeleteTarget(null);
      load();
      loadUnits();
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal menghapus data perubahan TI."));
    } finally {
      setDeleting(false);
    }
  };

  const openAksi = (item: PerubahanIt, aksi: AksiPerubahan) => {
    setAksiErrors({});
    setAksiMessage(null);
    setAksiTarget({ item, aksi });
  };

  const submitAksi = async (payload: AksiPayload) => {
    if (!aksiTarget) return;
    setAksiBusy(true);
    setAksiErrors({});
    setAksiMessage(null);
    try {
      const { message, data } = await aksiPerubahanIt(aksiTarget.item.id, aksiTarget.aksi, payload);
      toast.success(message || "Aksi berhasil diproses.");
      setAksiTarget(null);
      syncDetail(data);
      load();
    } catch (err: any) {
      const mapped = extractFieldErrors(err);
      if (err?.response?.status === 422 && Object.keys(mapped).length > 0) {
        setAksiErrors(mapped);
        // Kesalahan isian formulir saat "ajukan" dari detail: arahkan pemohon melengkapi lewat form ubah
        if (aksiTarget.aksi === "ajukan") {
          setAksiMessage("Isian formulir belum lengkap. Buka Ubah untuk melengkapi: " + Object.values(mapped).join(" "));
        }
      } else {
        setAksiMessage(extractMessage(err, "Aksi gagal diproses."));
      }
    } finally {
      setAksiBusy(false);
    }
  };

  const filterAktif = [
    debouncedSearch && `Kata kunci: "${debouncedSearch}"`,
    status && `Status: ${statusLabel(status)}`,
    risiko && `Risiko: ${risikoLabel(risiko)}`,
    unit && `Unit: ${unitOptions.find((u) => String(u.id) === unit)?.nama ?? unit}`,
  ].filter(Boolean) as string[];

  const doExport = async (mode: PerubahanItExportMode) => {
    setExporting(true);
    try {
      const filtered = mode === "filtered";
      const res = await getPerubahanItList({
        search: filtered ? debouncedSearch : undefined,
        status: filtered ? status : undefined,
        tingkat_risiko: filtered ? risiko : undefined,
        unit_kerja_id: filtered ? unit : undefined,
        per_page: -1,
      });
      const total = await exportPerubahanItDocx(res.data);
      toast.success(`${total} formulir berhasil diekspor.`);
      setExportOpen(false);
    } catch (err: any) {
      toast.error(extractMessage(err, "Gagal mengekspor data."));
    } finally {
      setExporting(false);
    }
  };

  const kartu = [
    {
      label: "Total Permintaan",
      value: stats.total,
      sub: "Terdaftar di formulir FR-015",
      icon: <Layers size={20} aria-hidden="true" />,
      tone: "text-blue-600 dark:text-blue-400",
      chip: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
    },
    {
      label: "Menunggu Persetujuan",
      value: stats.diajukan + stats.diterima,
      sub: "Perlu ditinjau & disetujui",
      icon: <Clock size={20} aria-hidden="true" />,
      tone: "text-amber-600 dark:text-amber-400",
      chip: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
    },
    {
      label: "Disetujui",
      value: stats.disetujui,
      sub: "Siap dijadwalkan",
      icon: <CheckCircle2 size={20} aria-hidden="true" />,
      tone: "text-emerald-600 dark:text-emerald-400",
      chip: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
    },
    {
      label: "Draf",
      value: stats.draft,
      sub: "Belum diajukan",
      icon: <FilePen size={20} aria-hidden="true" />,
      tone: "text-purple-600 dark:text-purple-400",
      chip: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900",
    },
  ];

  const filters = [
    {
      id: "f-status",
      label: "Status Permintaan:",
      val: status,
      set: setStatus,
      all: "Semua Status",
      opts: STATUS_OPTIONS.map((o) => ({ value: o.value as string, label: o.label })),
    },
    {
      id: "f-risiko",
      label: "Tingkat Risiko:",
      val: risiko,
      set: setRisiko,
      all: "Semua Risiko",
      opts: RISIKO_OPTIONS.map((o) => ({ value: o.value as string, label: o.label })),
    },
    {
      id: "f-unit",
      label: "Unit Kerja:",
      val: unit,
      set: setUnit,
      all: "Semua Unit Kerja",
      opts: unitOptions.map((u) => ({ value: String(u.id), label: u.nama })),
    },
  ];

  const card = "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div
        ref={rootRef}
        className="flex flex-col gap-6 overflow-hidden pb-2 [&>*]:shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <GitPullRequest size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
                  Formulir Permintaan Perubahan TI
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Pengelolaan permintaan perubahan teknologi informasi, termasuk latar belakang, rincian, risiko, solusi, biaya,
                  dan waktu perubahan.
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

        {/* Ringkasan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kartu.map((k) => (
            <div key={k.label} className={`flex items-center justify-between p-5 ${card}`}>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{k.label}</p>
                <p className={`mt-1 text-3xl font-black ${k.tone}`}>{loading && items.length === 0 ? "-" : k.value}</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{k.sub}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${k.chip}`}>{k.icon}</div>
            </div>
          ))}
        </div>

        {/* Pencarian & filter */}
        <div className={`p-5 ${card}`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                type="text"
                aria-label="Cari permintaan perubahan"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor, judul perubahan, atau pemohon..."
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
            {/* <button
              type="button"
              onClick={() => setExportOpen(true)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/60 ${focus}`}
            >
              <FileDown size={15} aria-hidden="true" /> Ekspor (DOCX)
            </button> */}
            <button
              type="button"
              onClick={() => router.push(CREATE_PATH)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 ${focus}`}
            >
              <Plus size={15} aria-hidden="true" /> Tambah Permintaan
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 md:grid-cols-3">
            {filters.map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="mb-1.5 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {f.label}
                </label>
                <div className="relative">
                  <select
                    id={f.id}
                    value={f.val}
                    onChange={(e) => {
                      f.set(e.target.value);
                      setPage(1);
                    }}
                    className={`${selectCls} appearance-none pr-9`}
                  >
                    <option value="">{f.all}</option>
                    {f.opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel */}
        <div className={`overflow-hidden ${card}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Daftar Permintaan Perubahan TI</h2>
            <div className="flex items-center gap-3">
              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilter}
                  className={`inline-flex items-center gap-1 rounded-md text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}
                >
                  <RotateCcw size={12} aria-hidden="true" /> Reset filter
                </button>
              )}
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Menampilkan {items.length} Data dari {meta.total} Data
              </span>
            </div>
          </div>

          <div className="overflow-x-auto" aria-busy={loading}>
            <table className="w-full min-w-[1040px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className={`${th} pl-14`}>Permintaan Perubahan</th>
                  <th className={th}>Pemohon</th>
                  <th className={th}>Risiko</th>
                  <th className={th}>Estimasi Biaya</th>
                  <th className={th}>Waktu Perubahan</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center" role="status">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-emerald-600" aria-hidden="true" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Memuat data perubahan TI...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center" role="alert">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <AlertCircle size={30} className="text-rose-600" aria-hidden="true" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Data gagal dimuat</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
                        <button type="button" onClick={load} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                          Coba lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <AlertCircle size={30} className="text-amber-600" aria-hidden="true" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {hasFilter ? "Tidak ada data yang cocok" : "Belum ada permintaan perubahan TI"}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {hasFilter
                            ? "Ubah kata kunci atau filter untuk melihat data lain."
                            : "Buat permintaan pertama untuk memulai proses perubahan TI."}
                        </p>
                        {hasFilter ? (
                          <button type="button" onClick={resetFilter} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                            Bersihkan filter
                          </button>
                        ) : (
                          <button type="button" onClick={() => router.push(CREATE_PATH)} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
                            Tambah Permintaan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const open = expanded === item.id;
                    const jam = formatRentangJam(item.jam_mulai, item.jam_selesai);
                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`border-b border-slate-100 dark:border-slate-800/70 ${
                            open ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setExpanded(open ? null : item.id)}
                                aria-expanded={open}
                                aria-controls={`rincian-${item.id}`}
                                aria-label={`${open ? "Tutup" : "Buka"} rincian ${item.judul || item.no_rfc}`}
                                className={`rounded-md p-1 text-slate-600 hover:text-emerald-700 dark:text-slate-300 ${focus}`}
                              >
                                {open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
                              </button>
                              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <FileText size={16} aria-hidden="true" />
                              </span>
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                title="Lihat detail permintaan"
                                className={`rounded-md text-left ${focus}`}
                              >
                                <span className="block font-bold text-slate-900 hover:text-emerald-700 dark:text-white">
                                  {item.judul || "(Tanpa judul)"}
                                </span>
                                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{item.no_rfc}</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{item.pemohon || "-"}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.unit_kerja || "-"}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <RisikoBadge tingkat={item.tingkat_risiko} />
                          </td>
                          <td className="px-4 py-3.5 font-medium">{formatRupiah(item.estimasi_biaya)}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-slate-800 dark:text-slate-100">{formatTanggalPendek(item.tanggal_perubahan)}</div>
                            {jam && <div className="text-[11px] text-slate-500 dark:text-slate-400">{jam}</div>}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                aria-label={`Lihat detail ${item.no_rfc}`}
                                title="Lihat detail"
                                className={`rounded-lg p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/40 ${focus}`}
                              >
                                <Eye size={15} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => cetakDocx(item)}
                                disabled={printingId === item.id}
                                aria-label={`Cetak DOCX ${item.no_rfc}`}
                                title="Cetak (DOCX)"
                                className={`rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-emerald-950/40 ${focus}`}
                              >
                                {printingId === item.id ? (
                                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                                ) : (
                                  <FileDown size={15} aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push(editPath(item.id))}
                                disabled={!item.izin.can_edit}
                                aria-label={`Ubah ${item.no_rfc}`}
                                title={item.izin.can_edit ? "Ubah" : "Hanya Draft atau Dikembalikan yang bisa diubah"}
                                className={`rounded-lg p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:text-slate-300 dark:hover:bg-amber-950/40 ${focus}`}
                              >
                                <Pencil size={15} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                disabled={!item.izin.can_delete}
                                aria-label={`Hapus ${item.no_rfc}`}
                                title={item.izin.can_delete ? "Hapus" : "Hanya Draft yang bisa dihapus"}
                                className={`rounded-lg p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 dark:text-slate-300 dark:hover:bg-rose-950/40 ${focus}`}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {open && (
                          <tr id={`rincian-${item.id}`} className="border-b border-slate-100 bg-emerald-50/40 dark:border-slate-800/70 dark:bg-emerald-950/10">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid gap-5 md:grid-cols-3">
                                {[
                                  { icon: <Info size={13} aria-hidden="true" />, judul: "Latar Belakang", isi: item.latar_belakang },
                                  { icon: <SlidersHorizontal size={13} aria-hidden="true" />, judul: "Rincian Perubahan", isi: item.rincian_perubahan },
                                  {
                                    icon: <Info size={13} aria-hidden="true" />,
                                    judul: "Risiko & Solusi",
                                    isi: [item.risiko_perubahan, item.solusi_diharapkan].filter(Boolean).join(" "),
                                  },
                                ].map((b) => (
                                  <div key={b.judul}>
                                    <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                                      <span className="text-emerald-700 dark:text-emerald-400">{b.icon}</span>
                                      {b.judul}
                                    </h3>
                                    <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                      {b.isi || "-"}
                                    </p>
                                  </div>
                                ))}
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

          {/* Pagination server-side */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 text-xs dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">
              Menampilkan {start}–{end} dari {meta.total} permintaan
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="per-page" className="sr-only">
                Jumlah data per halaman
              </label>
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
                  <option key={n} value={n}>
                    {n} per halaman
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage(Math.max(1, meta.current_page - 1))}
                disabled={meta.current_page <= 1 || loading}
                aria-label="Halaman sebelumnya"
                className={`rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <span className="min-w-[32px] rounded-lg bg-emerald-700 px-2.5 py-1.5 text-center font-bold text-white" aria-current="page">
                {meta.current_page}
              </span>
              <button
                type="button"
                onClick={() => setPage(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page || loading}
                aria-label="Halaman berikutnya"
                className={`rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PerubahanItDetailModal
        open={!!detailItem}
        item={detailItem}
        locked={!!aksiTarget || !!deleteTarget}
        onClose={() => setDetailItem(null)}
        onEdit={(it) => router.push(editPath(it.id))}
        onDelete={(it) => setDeleteTarget(it)}
        onAksi={openAksi}
      />

      <PerubahanItAksiModal
        open={!!aksiTarget}
        aksi={aksiTarget?.aksi ?? null}
        noRfc={aksiTarget?.item.no_rfc ?? ""}
        submitting={aksiBusy}
        serverErrors={aksiErrors}
        serverMessage={aksiMessage}
        onCancel={() => setAksiTarget(null)}
        onSubmit={submitAksi}
      />

      <PerubahanItExportModal
        open={exportOpen}
        loading={exporting}
        filterAktif={filterAktif}
        onClose={() => setExportOpen(false)}
        onExport={doExport}
      />

      <PerubahanItDeleteModal
        open={!!deleteTarget}
        noRfc={deleteTarget?.no_rfc ?? ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </ServiceRouteGuard>
  );
}