"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, Layers } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import KpiGrid from "@/components/smki/pelaporan-insiden/KpiGrid";
import FilterBar from "@/components/smki/pelaporan-insiden/FilterBar";
import InsidenTable from "@/components/smki/pelaporan-insiden/InsidenTable";
import InsidenDetailModal from "@/components/smki/pelaporan-insiden/InsidenDetailModal";
import InsidenExportModal from "@/components/smki/pelaporan-insiden/InsidenExportModal";
import InsidenExportPickModal from "@/components/smki/pelaporan-insiden/InsidenExportPickModal";
import { useInsidenLookup } from "@/components/smki/pelaporan-insiden/useInsidenLookup";
import { type InsidenReport } from "@/components/smki/pelaporan-insiden/types";
import { useAuthStore } from "@/store/useAuthStore";
import {
  deleteInsiden,
  downloadInsidenDocx,
  fetchInsidenList,
  toTableItem,
  type InsidenDocxParams,
} from "@/services/smki/pelaporanInsidenService";

export default function PelaporanInsidenPage() {
  const router = useRouter();
  const { user, isAdminAptika } = useAuthStore();
  const isAdmin = user?.role === "admin" || isAdminAptika;
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InsidenReport[]>([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, dalam_penanganan: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const { kategoriOptions, statusOptions, docDefaults } = useInsidenLookup();
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InsidenReport | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [pickOpen, setPickOpen] = useState(false);
  const [exportId, setExportId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchInsidenList({
        search: search || undefined,
        kategori: kategoriFilter,
        status: statusFilter,
        page,
        per_page: 10,
      });
      if (res.success) {
        setItems((res.data ?? []).map(toTableItem));
        setStats(res.stats);
        setMeta(res.meta);
      }
    } catch {
      toast.error("Gagal memuat data laporan insiden.");
    } finally {
      setLoading(false);
    }
  }, [search, kategoriFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteInsiden(itemToDelete.id);
      toast.success("Laporan insiden berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      toast.error(
        e?.response?.status === 403
          ? "Hanya admin yang dapat menghapus laporan."
          : e?.response?.data?.message ?? "Gagal menghapus laporan insiden."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDoExport = async (params: InsidenDocxParams) => {
    if (exportId == null) return;
    setExporting(true);
    try {
      await downloadInsidenDocx(exportId, params);
      toast.success("Dokumen FR-016 (.docx) berhasil diunduh.");
      setExportId(null);
    } catch {
      toast.error("Gagal mengunduh dokumen FR-016.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Daftar Laporan Insiden"
          subtitle="Formulir pelaporan insiden keamanan informasi Kelola laporan, kelengkapan dan penanganan insiden keamanan di lingkungan Diskominfo Jawa Barat. (FR-016)"
        />
        <KpiGrid
          items={[
            { label: "Total Laporan", value: stats.total, sub: "Jumlah seluruh laporan", icon: <Layers size={22} />, color: "blue" },
            { label: "Menunggu Pemilik Sistem", value: stats.menunggu, sub: "Laporan baru masuk", icon: <Clock size={22} />, color: "amber" },
            { label: "Dalam Penanganan", value: stats.dalam_penanganan, sub: "Sedang diinvestigasi", icon: <Loader2 size={22} />, color: "blue" },
            { label: "Selesai", value: stats.selesai, sub: "Insiden tertangani", icon: <CheckCircle2 size={22} />, color: "emerald" },
          ]}
        />
        <FilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onClearSearch={() => setSearch("")}
          kategori={kategoriFilter}
          onKategori={(v) => { setKategoriFilter(v); setPage(1); }}
          status={statusFilter}
          onStatus={(v) => { setStatusFilter(v); setPage(1); }}
          onReset={() => { setSearch(""); setKategoriFilter("Semua Kategori"); setStatusFilter("Semua Status"); setPage(1); }}
          onAdd={() => router.push("/smki/pelaporan-insiden/tambah")}
          onExport={() => setPickOpen(true)}
          kategoriOptions={kategoriOptions}
          statusOptions={statusOptions}
        />
        <div className="flex flex-col rounded-2xl overflow-hidden">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat data laporan insiden...
            </div>
          ) : (
            <>
              <InsidenTable
                items={items}
                totalLabel={`Menampilkan ${items.length} dari ${meta.total} data laporan`}
                onDetail={(id) => setDetailId(id)}
                onEdit={(id) => router.push(`/smki/pelaporan-insiden/edit/${id}`)}
                onDelete={isAdmin ? (item) => { setItemToDelete(item); setIsDeleteModalOpen(true); } : undefined}
              />
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </>
          )}
        </div>
        <InsidenDetailModal
          key={detailId ?? "closed"}
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => { setDetailId(null); router.push(`/smki/pelaporan-insiden/edit/${id}`); }}
        />
        <InsidenExportPickModal
          isOpen={pickOpen}
          onClose={() => setPickOpen(false)}
          items={items}
          onPick={(id) => { setPickOpen(false); setExportId(id); }}
        />
        <InsidenExportModal
          key={exportId ?? "closed"}
          isOpen={exportId != null}
          onClose={() => { if (!exporting) setExportId(null); }}
          onExport={handleDoExport}
          exporting={exporting}
          defaults={docDefaults}
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { if (!deleting) setIsDeleteModalOpen(false); }}
          onConfirm={handleExecuteDelete}
          loading={deleting}
          title="Hapus laporan insiden?"
          message={`Laporan "${itemToDelete?.nama_sistem}" (${itemToDelete?.kategori_insiden} — ${itemToDelete?.tanggal_laporan}) oleh ${itemToDelete?.pelapor} akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
        />
      </div>
    </ServiceRouteGuard>
  );
}
