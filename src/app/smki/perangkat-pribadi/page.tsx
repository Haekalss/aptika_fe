"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Layers, Loader2, MonitorSmartphone, Tablet } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import KpiGrid from "@/components/smki/pelaporan-insiden/KpiGrid";
import PerangkatFilterBar from "@/components/smki/perangkat-pribadi/PerangkatFilterBar";
import PerangkatTable from "@/components/smki/perangkat-pribadi/PerangkatTable";
import PerangkatDetailModal from "@/components/smki/perangkat-pribadi/PerangkatDetailModal";
import {
  deletePerangkatPribadi,
  fetchPerangkatPribadiList,
  perangkatErrMsg,
  JENIS_PERANGKAT_OPTIONS,
  type PerangkatPribadi,
  type PerangkatPribadiStats,
} from "@/services/smki/perangkatPribadiService";

export default function PerangkatPribadiPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const [items, setItems] = useState<PerangkatPribadi[]>([]);
  const [stats, setStats] = useState<PerangkatPribadiStats>({ total_formulir: 0, total_perangkat: 0, laptop: 0, pc: 0, tab: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PerangkatPribadi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPerangkatPribadiList({
        search: search || undefined,
        jenis_perangkat: jenis || undefined,
        page,
        per_page: 10,
      });
      if (res.success) {
        setItems(res.data ?? []);
        setStats(res.stats);
        setMeta(res.meta);
      }
    } catch {
      toast.error("Gagal memuat data formulir BYOD.");
    } finally {
      setLoading(false);
    }
  }, [search, jenis, page]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deletePerangkatPribadi(itemToDelete.id);
      toast.success("Formulir BYOD berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error(perangkatErrMsg(err, "Gagal menghapus formulir BYOD."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Daftar Formulir BYOD"
          subtitle="Formulir Bring Your Own Device. Kelola surat pernyataan penggunaan perangkat pribadi di lingkungan Diskominfo Jawa Barat. (FR-045)"
          docNo="FR-045/KOM.03/05/SANDIKAMI"
        />
        <KpiGrid
          items={[
            { label: "Total Formulir", value: stats.total_formulir, sub: "Jumlah surat pernyataan", icon: <Layers size={22} />, color: "blue" },
            { label: "Total Perangkat", value: stats.total_perangkat, sub: "Perangkat terdaftar", icon: <MonitorSmartphone size={22} />, color: "blue" },
            { label: "Laptop / PC", value: stats.laptop + stats.pc, sub: "Perangkat komputer", icon: <Laptop size={22} />, color: "emerald" },
            { label: "Tablet", value: stats.tab, sub: "Perangkat tablet", icon: <Tablet size={22} />, color: "amber" },
          ]}
        />
        <PerangkatFilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          onClearSearch={() => setSearch("")}
          jenis={jenis}
          onJenis={(v) => { setJenis(v); setPage(1); }}
          onReset={() => { setSearch(""); setJenis(""); setPage(1); }}
          onAdd={() => router.push("/smki/perangkat-pribadi/tambah")}
          jenisOptions={JENIS_PERANGKAT_OPTIONS}
        />
        <div className="flex flex-col rounded-2xl overflow-hidden">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
              <Loader2 size={22} className="animate-spin mx-auto mb-2" />
              Memuat data formulir BYOD...
            </div>
          ) : (
            <>
              <PerangkatTable
                items={items}
                offset={(meta.current_page - 1) * meta.per_page}
                totalLabel={`Menampilkan ${items.length} dari ${meta.total} data formulir`}
                onDetail={(id) => setDetailId(id)}
                onEdit={(id) => router.push(`/smki/perangkat-pribadi/edit/${id}`)}
                onPrint={(id) => router.push(`/smki/perangkat-pribadi/print/${id}`)}
                onDelete={(item) => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
              />
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </>
          )}
        </div>
        <PerangkatDetailModal
          key={detailId ?? "closed"}
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={(id) => { setDetailId(null); router.push(`/smki/perangkat-pribadi/edit/${id}`); }}
          onPrint={(id) => { setDetailId(null); router.push(`/smki/perangkat-pribadi/print/${id}`); }}
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { if (!deleting) setIsDeleteModalOpen(false); }}
          onConfirm={handleExecuteDelete}
          loading={deleting}
          title="Hapus formulir BYOD?"
          message={`Formulir BYOD "${itemToDelete?.unit_kerja}" atas nama ${itemToDelete?.nama} beserta seluruh daftar perangkatnya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isDanger={true}
        />
      </div>
    </ServiceRouteGuard>
  );
}
