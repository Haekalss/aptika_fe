"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Server, Layers, Lightbulb, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import KpiGrid from "@/components/smki/pelaporan-insiden/KpiGrid";
import DrpEvaluasiFilterBar from "@/components/smki/evaluasi-drp/DrpEvaluasiFilterBar";
import DrpEvaluasiTable from "@/components/smki/evaluasi-drp/DrpEvaluasiTable";
import DrpEvaluasiDetailModal from "@/components/smki/evaluasi-drp/DrpEvaluasiDetailModal";
import {
  deleteDrpEvaluasi,
  downloadDrpEvaluasiDocx,
  fetchDrpEvaluasiList,
  formatTanggalIndo,
  drpEvaluasiErrMsg,
  type DrpEvaluasi,
  type DrpEvaluasiStats,
} from "@/services/smki/drpEvaluasiService";

export default function DrpEvaluasiPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [items, setItems] = useState<DrpEvaluasi[]>([]);
  const [stats, setStats] = useState<DrpEvaluasiStats>({ total_evaluasi: 0, evaluasi_bulan_ini: 0, total_sistem: 0, total_rekomendasi: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DrpEvaluasi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDrpEvaluasiList({
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
      toast.error("Gagal memuat data evaluasi DRP.");
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
      await downloadDrpEvaluasiDocx(id);
      toast.success("Dokumen FR-039 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-039.");
    }
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteDrpEvaluasi(itemToDelete.id);
      toast.success("Laporan evaluasi DRP berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(drpEvaluasiErrMsg(err, "Gagal menghapus laporan evaluasi DRP."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Daftar Evaluasi Pengujian DRP"
          subtitle="Laporan evaluasi dan pengujian Disaster Recovery Plan. Kelola hasil pengujian, evaluasi RTO, proses, tim, dan check list BCP di lingkungan Diskominfo Jawa Barat. (FR-039)"
          docNo="FR-039/KOM.03.05/SANDIKAMI"
        />
        <KpiGrid
          items={[
            { label: "Total Laporan", value: stats.total_evaluasi, sub: "Jumlah seluruh laporan", icon: <Layers size={22} />, color: "blue" },
            { label: "Sistem TI Diuji", value: stats.total_sistem, sub: "Baris persyaratan waktu (RTO)", icon: <Server size={22} />, color: "blue" },
            { label: "Pengujian Bulan Ini", value: stats.evaluasi_bulan_ini, sub: "Formulir bulan berjalan", icon: <CalendarDays size={22} />, color: "emerald" },
            { label: "Rekomendasi", value: stats.total_rekomendasi, sub: "Proses dengan rekomendasi", icon: <Lightbulb size={22} />, color: "amber" },
          ]}
        />
        <DrpEvaluasiFilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onClearSearch={() => setSearch("")}
          dari={dari}
          onDari={(v) => { setDari(v); setPage(1); }}
          sampai={sampai}
          onSampai={(v) => { setSampai(v); setPage(1); }}
          onReset={() => { setSearch(""); setDari(""); setSampai(""); setPage(1); }}
          onAdd={() => router.push("/smki/evaluasi-drp/tambah")}
        />
        <div className="flex flex-col rounded-2xl overflow-hidden">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat data evaluasi DRP...
            </div>
          ) : (
            <>
              <DrpEvaluasiTable
                items={items}
                offset={(meta.current_page - 1) * meta.per_page}
                totalLabel={`Menampilkan ${items.length} dari ${meta.total} data evaluasi DRP`}
                onDetail={(id) => setDetailId(id)}
                onEdit={(id) => router.push(`/smki/evaluasi-drp/edit/${id}`)}
                onPrint={(id) => router.push(`/smki/evaluasi-drp/print/${id}`)}
                onDocx={handleDocx}
                onDelete={(item) => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
              />
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </>
          )}
        </div>
        <DrpEvaluasiDetailModal
          key={detailId ?? "closed"}
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => { setDetailId(null); router.push(`/smki/evaluasi-drp/edit/${id}`); }}
          onPrint={(id) => { setDetailId(null); router.push(`/smki/evaluasi-drp/print/${id}`); }}
          onDocx={handleDocx}
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { if (!deleting) setIsDeleteModalOpen(false); }}
          onConfirm={handleExecuteDelete}
          loading={deleting}
          title="Hapus laporan evaluasi DRP?"
          message={`Laporan evaluasi DRP "${itemToDelete?.tujuan}" (${itemToDelete ? formatTanggalIndo(itemToDelete.tanggal_pengujian) : ""}) beserta seluruh rincian evaluasinya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
        />
      </div>
    </ServiceRouteGuard>
  );
}
