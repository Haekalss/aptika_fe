"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  ShieldAlert,
  Plus,
  Search,
  FileSpreadsheet,
  Grid,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  SmkiFr002RisikoItem,
  SmkiFr002Metrics,
  SmkiFr002HeaderData,
  SmkiFr002LookupResponse,
  getSmkiRiskRegisterList,
  getSmkiRiskRegisterLookup,
  deleteSmkiRiskRegister,
} from "@/services/api";
import RiskRegisterModal from "@/components/smki/risk-register/RiskRegisterModal";
import RiskMatrixModal from "@/components/smki/risk-register/RiskMatrixModal";
import HeaderExportModal from "@/components/smki/risk-register/HeaderExportModal";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const emptyMetrics: SmkiFr002Metrics = {
  total_risiko: 0,
  risiko_tinggi_ekstrim: 0,
  risiko_dapat_diterima: 0,
  data_dihapus: 0,
  count_per_kategori: {},
};

export default function RiskRegisterPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <RiskRegister />
    </ServiceRouteGuard>
  );
}

function RiskRegister() {
  // Filter tabs: ALL, A, B, C, D, E
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const lookupKey = ["fr002", userId, "lookup"] as const;
  const listKey = ["fr002", userId, "list"] as const;
  const lookup = useQuery({
    queryKey: lookupKey,
    queryFn: getSmkiRiskRegisterLookup,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const list = useQuery({
    queryKey: [...listKey, activeTab, search],
    queryFn: ({ signal }) => getSmkiRiskRegisterList({
      kategori: activeTab,
      search: search || undefined,
    }, signal),
    retry: false,
  });
  const reference = lookup.data?.data;
  const headerData = reference ? reference.header ?? null : undefined;
  const items = list.data?.data ?? [];
  const metrics = list.data?.metrics ?? emptyMetrics;

  // Modals state
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SmkiFr002RisikoItem | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SmkiFr002RisikoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshList = () => {
    void queryClient.invalidateQueries({ queryKey: listKey });
  };

  const handleHeaderUpdated = (header: SmkiFr002HeaderData) => {
    queryClient.setQueryData<SmkiFr002LookupResponse>(lookupKey, (prev) =>
      prev && { ...prev, data: { ...prev.data, header } },
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await deleteSmkiRiskRegister(deleteTarget.id, deleteTarget.lock_version);
      if (!res.success) throw new Error();
      toast.success("Data risiko berhasil dihapus (soft delete).");
      setDeleteTarget(null);
      refreshList();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Data risiko sudah diubah. Periksa data terbaru sebelum menghapus.");
        setDeleteTarget(null);
        refreshList();
      } else {
        toast.error("Gagal menghapus data risiko.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Badge CIA Triad
  const renderCiaBadges = (ciaStr: string) => {
    const raw = (ciaStr || "").toUpperCase();
    const hasC = raw.includes("C");
    const hasI = raw.includes("I");
    const hasA = raw.includes("A");

    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        {hasC && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            C
          </span>
        )}
        {hasI && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            I
          </span>
        )}
        {hasA && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            A
          </span>
        )}
      </div>
    );
  };

  // Inherent Score Badge
  const renderScoreBadge = (score: number, cat: string) => {
    let color = "bg-emerald-600 text-white";
    if (score >= 25) color = "bg-rose-700 text-white";
    else if (score >= 16) color = "bg-red-600 text-white";
    else if (score >= 12) color = "bg-orange-500 text-white";
    else if (score >= 5) color = "bg-amber-500 text-white";

    return (
      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${color}`}>
        {score} - {cat}
      </span>
    );
  };

  return (
    <div className="min-h-screen space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
              <span>Sistem Manajemen Keamanan Informasi (SMKI)</span>
              <span>/</span>
              <span className="text-white">Risk Register</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Daftar Risiko Keamanan Informasi (Risk Register)
            </h1>
            <p className="mt-2 text-xs md:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Kelola identifikasi aset, penilaian matriks risiko (Inherent, Current, Residual),
              kontrol ISO 27001, dan rencana mitigasi risiko keamanan informasi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsHeaderOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white border border-white/20 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
              <span>Format Export: Excel (.xlsx) / PDF / Header</span>
            </button>
          </div>
        </div>
      </div>

      {lookup.isError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <span>Gagal memuat referensi Risk Register.</span>
          <button type="button" className="font-semibold underline" onClick={() => void lookup.refetch()}>Coba lagi</button>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Risiko */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TOTAL RISIKO
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.total_risiko}
              </div>
              <p className="text-xs text-slate-500 mt-1">Terdaftar dalam 5 Kategori Aset</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Risiko Tinggi / Ekstrim */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                RISIKO TINGGI / EKSTRIM
              </span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {metrics.risiko_tinggi_ekstrim}
              </div>
              <p className="text-xs text-slate-500 mt-1">Inherent Risk perlu pengendalian</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Risiko Dapat Diterima */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                RISIKO DAPAT DITERIMA
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.risiko_dapat_diterima}
              </div>
              <p className="text-xs text-slate-500 mt-1">Setelah Existing Control & Mitigasi</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Data Dihapus */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DATA DIHAPUS
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.data_dihapus}
              </div>
              <p className="text-xs text-slate-500 mt-1">Dalam arsip / tempat sampah</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Trash2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Categories A to E & Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        {/* Tab Button Pills */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "ALL"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            Semua Kategori ({metrics.total_risiko})
          </button>
          <button
            onClick={() => setActiveTab("A")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "A"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            A. Informasi ({metrics.count_per_kategori["A"] || 0})
          </button>
          <button
            onClick={() => setActiveTab("B")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "B"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            B. Software ({metrics.count_per_kategori["B"] || 0})
          </button>
          <button
            onClick={() => setActiveTab("C")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "C"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            C. Hardware & Network ({metrics.count_per_kategori["C"] || 0})
          </button>
          <button
            onClick={() => setActiveTab("D")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "D"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            D. Utility ({metrics.count_per_kategori["D"] || 0})
          </button>
          <button
            onClick={() => setActiveTab("E")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "E"
                ? "bg-emerald-700 text-white shadow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            E. SDM & Pihak Ketiga ({metrics.count_per_kategori["E"] || 0})
          </button>
        </div>

        {/* Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aset, ancaman, kontrol ISO..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMatrixOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Grid className="h-4 w-4 text-emerald-600" />
              <span>Matriks Risiko (5&times;5)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHeaderOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Header & Ekspor (.xlsx/.pdf)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditItem(null);
                setIsRiskModalOpen(true);
              }}
              disabled={!reference}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Data Risiko</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Data Risiko</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {items.length} record aktif
            </p>
          </div>
          <button
            onClick={() => setIsHeaderOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
          >
            <Eye className="h-4 w-4" />
            <span>Preview dokumen resmi</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">NO</th>
                <th className="px-4 py-3.5 min-w-[200px]">KATEGORI & NAMA ASET / LAYANAN</th>
                <th className="px-4 py-3.5 min-w-[260px]">KERAWANAN & ANCAMAN (CIA)</th>
                <th className="px-4 py-3.5 min-w-[140px] text-center">INHERENT RISK (L &times; I)</th>
                <th className="px-4 py-3.5 min-w-[260px]">EXISTING CONTROL & ISO 27001</th>
                <th className="px-4 py-3.5 min-w-[140px] text-center">CURRENT RISK (L &times; I)</th>
                <th className="px-4 py-3.5 min-w-[100px] text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {list.isPending ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      <span>Memuat data Risk Register FR-002...</span>
                    </div>
                  </td>
                </tr>
              ) : list.isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-rose-700">
                    <p role="alert">Gagal memuat data Risk Register.</p>
                    <button type="button" className="mt-2 font-semibold underline" onClick={() => void list.refetch()}>Coba lagi</button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data risiko pada kategori ini.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                  >
                    {/* NO */}
                    <td className="px-4 py-4 text-center font-bold text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    {/* Kategori & Aset */}
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 mb-1">
                        {item.kode_kategori}. {item.kategori_aset?.nama_kategori_aset?.split("(")[0] || item.kode_kategori}
                      </span>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {item.nama_aset_proses}
                      </div>
                    </td>

                    {/* Kerawanan & Ancaman */}
                    <td className="px-4 py-4 space-y-1">
                      <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                        {item.kerawanan_vulnerability || "-"}
                      </p>
                      <p className="text-slate-500 text-[11px] line-clamp-1">
                        {item.ancaman_threat || "-"}
                      </p>
                      {renderCiaBadges(item.kategori_cia)}
                    </td>

                    {/* Inherent Risk */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-[11px] text-slate-500 block mb-1">
                        L: <strong>{item.inherent_likelihood}</strong> &times; I:{" "}
                        <strong>{item.inherent_impact}</strong>
                      </span>
                      {renderScoreBadge(item.inherent_score, item.inherent_kategori)}
                    </td>

                    {/* Existing Control */}
                    <td className="px-4 py-4 space-y-1">
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.existing_control || "-"}
                      </p>
                      {item.kontrol_annex_iso && (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span className="truncate max-w-[220px]">{item.kontrol_annex_iso}</span>
                        </div>
                      )}
                    </td>

                    {/* Current Risk */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-[11px] text-slate-500 block mb-1">
                        L: <strong>{item.current_likelihood}</strong> &times; I:{" "}
                        <strong>{item.current_impact}</strong>
                      </span>
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white">
                        {item.current_score} - {item.current_kategori}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditItem(item);
                            setIsRiskModalOpen(true);
                          }}
                          disabled={!reference}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition disabled:opacity-50"
                          title="Edit Data Risiko"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition"
                          title="Hapus Risiko"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Wizard Tambah/Edit Risiko */}
      {isRiskModalOpen && reference && (
        <RiskRegisterModal
          key={editItem?.id ?? "new"}
          onClose={() => {
            setIsRiskModalOpen(false);
            setEditItem(null);
          }}
          kategoris={reference.kategoris}
          annexes={reference.annexes}
          pegawais={reference.pegawais}
          editItem={editItem}
          onSuccess={refreshList}
        />
      )}

      {/* Modal Matriks Risiko 5x5 */}
      <RiskMatrixModal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />

      {/* Modal Header & Ekspor */}
      {isHeaderOpen && (
        <HeaderExportModal
          key={headerData === undefined ? "loading" : "loaded"}
          onClose={() => setIsHeaderOpen(false)}
          headerData={headerData}
          pegawais={reference?.pegawais}
          onHeaderUpdated={handleHeaderUpdated}
        />
      )}

      {/* Confirmation Modal Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hapus Data Risiko?
                </h3>
                <p className="text-xs text-slate-500">
                  Aksi ini akan memindahkan data risiko ke arsip soft delete.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              Aset: <strong>{deleteTarget.nama_aset_proses}</strong>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 text-white px-5 py-2 text-xs font-bold hover:bg-rose-700 transition"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
