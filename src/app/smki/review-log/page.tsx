"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, Layers, MessageSquareWarning, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import KpiGrid from "@/components/smki/pelaporan-insiden/KpiGrid";
import ReviewLogFilterBar from "@/components/smki/review-log/ReviewLogFilterBar";
import ReviewLogTable from "@/components/smki/review-log/ReviewLogTable";
import ReviewLogDetailModal from "@/components/smki/review-log/ReviewLogDetailModal";
import {
  deleteReviewLog,
  fetchReviewLogList,
  formatTanggalIndo,
  reviewLogErrMsg,
  type ReviewLog,
  type ReviewLogStats,
} from "@/services/smki/reviewLogService";

export default function ReviewLogPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [items, setItems] = useState<ReviewLog[]>([]);
  const [stats, setStats] = useState<ReviewLogStats>({ total_review: 0, total_log: 0, review_bulan_ini: 0, ada_tindak_lanjut: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ReviewLog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReviewLogList({
        search: search || undefined,
        tanggal_dari: dari || undefined,
        tanggal_sampai: sampai || undefined,
        page,
        per_page: 10,
      });
      if (res.success) {
        setItems(res.data ?? []);
        setStats(res.stats);
        setMeta(res.meta);
      }
    } catch {
      toast.error("Gagal memuat data review log.");
    } finally {
      setLoading(false);
    }
  }, [search, dari, sampai, page]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteReviewLog(itemToDelete.id);
      toast.success("Formulir review log berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(reviewLogErrMsg(err, "Gagal menghapus formulir review log."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Daftar Review Log"
          subtitle="Formulir review log akses dan aktivitas sistem. Kelola hasil review, rincian log, dan tindak lanjut di lingkungan Diskominfo Jawa Barat. (FR-040)"
          docNo="FR-040/KOM.03.05/SANDIKAMI"
        />
        <KpiGrid
          items={[
            { label: "Total Review", value: stats.total_review, sub: "Jumlah seluruh formulir", icon: <Layers size={22} />, color: "blue" },
            { label: "Entri Log Ditinjau", value: stats.total_log, sub: "Baris log pada seluruh formulir", icon: <ClipboardList size={22} />, color: "blue" },
            { label: "Review Bulan Ini", value: stats.review_bulan_ini, sub: "Formulir bulan berjalan", icon: <CalendarDays size={22} />, color: "emerald" },
            { label: "Ada Tindak Lanjut", value: stats.ada_tindak_lanjut, sub: "Memerlukan tindak lanjut", icon: <MessageSquareWarning size={22} />, color: "amber" },
          ]}
        />
        <ReviewLogFilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onClearSearch={() => setSearch("")}
          dari={dari}
          onDari={(v) => { setDari(v); setPage(1); }}
          sampai={sampai}
          onSampai={(v) => { setSampai(v); setPage(1); }}
          onReset={() => { setSearch(""); setDari(""); setSampai(""); setPage(1); }}
          onAdd={() => router.push("/smki/review-log/tambah")}
        />
        <div className="flex flex-col rounded-2xl overflow-hidden">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat data review log...
            </div>
          ) : (
            <>
              <ReviewLogTable
                items={items}
                offset={(meta.current_page - 1) * meta.per_page}
                totalLabel={`Menampilkan ${items.length} dari ${meta.total} data review log`}
                onDetail={(id) => setDetailId(id)}
                onEdit={(id) => router.push(`/smki/review-log/edit/${id}`)}
                onPrint={(id) => router.push(`/smki/review-log/print/${id}`)}
                onDelete={(item) => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
              />
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </>
          )}
        </div>
        <ReviewLogDetailModal
          key={detailId ?? "closed"}
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => { setDetailId(null); router.push(`/smki/review-log/edit/${id}`); }}
          onPrint={(id) => { setDetailId(null); router.push(`/smki/review-log/print/${id}`); }}
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { if (!deleting) setIsDeleteModalOpen(false); }}
          onConfirm={handleExecuteDelete}
          loading={deleting}
          title="Hapus review log?"
          message={`Formulir review log "${itemToDelete?.obyek_review}" (${itemToDelete ? formatTanggalIndo(itemToDelete.tanggal_review) : ""}) oleh ${itemToDelete?.pelaksana_review} beserta seluruh rincian lognya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
        />
      </div>
    </ServiceRouteGuard>
  );
}
