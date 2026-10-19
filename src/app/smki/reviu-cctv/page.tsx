"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ClipboardList, Layers, Timer, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import KpiGrid from "@/components/smki/pelaporan-insiden/KpiGrid";
import ReviuCctvFilterBar from "@/components/smki/reviu-cctv/ReviuCctvFilterBar";
import ReviuCctvTable from "@/components/smki/reviu-cctv/ReviuCctvTable";
import ReviuCctvDetailModal from "@/components/smki/reviu-cctv/ReviuCctvDetailModal";
import {
  deleteReviuCctv,
  downloadReviuCctvDocx,
  fetchReviuCctvList,
  formatTanggalIndo,
  reviuCctvErrMsg,
  type ReviuCctv,
  type ReviuCctvStats,
} from "@/services/smki/reviuCctvService";

export default function ReviuCctvPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [items, setItems] = useState<ReviuCctv[]>([]);
  const [stats, setStats] = useState<ReviuCctvStats>({ total_reviu: 0, total_uraian: 0, reviu_bulan_ini: 0, tindak_lanjut_aktif: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ReviuCctv | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReviuCctvList({
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
      toast.error("Gagal memuat data reviu CCTV.");
    } finally {
      setLoading(false);
    }
  }, [search, dari, sampai, page]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleDocx = async (id: number) => {
    try {
      await downloadReviuCctvDocx(id);
      toast.success("Dokumen FR-038 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-038.");
    }
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteReviuCctv(itemToDelete.id);
      toast.success("Formulir reviu CCTV berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(reviuCctvErrMsg(err, "Gagal menghapus formulir reviu CCTV."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Daftar Reviu CCTV"
          subtitle="Formulir reviu monitoring dan pemeliharaan CCTV. Kelola hasil reviu, uraian, dan tindak lanjut di lingkungan Diskominfo Jawa Barat. (FR-038)"
          docNo="FR-038/KOM.03.05/SANDIKAMI"
        />
        <KpiGrid
          items={[
            { label: "Total Reviu", value: stats.total_reviu, sub: "Jumlah seluruh formulir", icon: <Layers size={22} />, color: "blue" },
            { label: "Uraian Reviu", value: stats.total_uraian, sub: "Baris uraian pada seluruh formulir", icon: <ClipboardList size={22} />, color: "blue" },
            { label: "Reviu Bulan Ini", value: stats.reviu_bulan_ini, sub: "Formulir bulan berjalan", icon: <CalendarDays size={22} />, color: "emerald" },
            { label: "Tindak Lanjut Aktif", value: stats.tindak_lanjut_aktif, sub: "Target selesai belum lewat", icon: <Timer size={22} />, color: "amber" },
          ]}
        />
        <ReviuCctvFilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onClearSearch={() => setSearch("")}
          dari={dari}
          onDari={(v) => { setDari(v); setPage(1); }}
          sampai={sampai}
          onSampai={(v) => { setSampai(v); setPage(1); }}
          onReset={() => { setSearch(""); setDari(""); setSampai(""); setPage(1); }}
          onAdd={() => router.push("/smki/reviu-cctv/tambah")}
        />
        <div className="flex flex-col rounded-2xl overflow-hidden">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat data reviu CCTV...
            </div>
          ) : (
            <>
              <ReviuCctvTable
                items={items}
                offset={(meta.current_page - 1) * meta.per_page}
                totalLabel={`Menampilkan ${items.length} dari ${meta.total} data reviu CCTV`}
                onDetail={(id) => setDetailId(id)}
                onEdit={(id) => router.push(`/smki/reviu-cctv/edit/${id}`)}
                onPrint={(id) => router.push(`/smki/reviu-cctv/print/${id}`)}
                onDocx={handleDocx}
                onDelete={(item) => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
              />
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </>
          )}
        </div>
        <ReviuCctvDetailModal
          key={detailId ?? "closed"}
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => { setDetailId(null); router.push(`/smki/reviu-cctv/edit/${id}`); }}
          onPrint={(id) => { setDetailId(null); router.push(`/smki/reviu-cctv/print/${id}`); }}
          onDocx={handleDocx}
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { if (!deleting) setIsDeleteModalOpen(false); }}
          onConfirm={handleExecuteDelete}
          loading={deleting}
          title="Hapus reviu CCTV?"
          message={`Formulir reviu CCTV "${itemToDelete?.obyek_reviu}" (${itemToDelete ? formatTanggalIndo(itemToDelete.tanggal_reviu) : ""}) oleh ${itemToDelete?.pelaksana_reviu} beserta seluruh uraian reviunya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
        />
      </div>
    </ServiceRouteGuard>
  );
}
