"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { showToast } from "@/components/ui/Toast";
import type { Fr021Evaluasi, Fr021ListParams } from "@/services/smki/evaluasiPenyedia.types";
import { readFr021Error } from "@/services/smki/evaluasiPenyediaService";
import { useAuthStore } from "@/store/useAuthStore";
import { useFr021List, useFr021Mutations } from "../hooks/useFr021Queries";
import { FR021_ROUTES } from "../constants";
import RingkasanKpi from "../organisms/RingkasanKpi";
import FilterBar from "../organisms/FilterBar";
import EvaluasiTable from "../organisms/EvaluasiTable";

export default function EvaluasiPenyediaListTemplate() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [sifat, setSifat] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Fr021Evaluasi | null>(null);
  const [message, setMessage] = useState("");

  const params: Fr021ListParams = {
    q: search || undefined,
    sifat: (sifat || undefined) as Fr021ListParams["sifat"],
    status: (status || undefined) as Fr021ListParams["status"],
    page,
    per_page: 10,
  };

  const list = useFr021List(params);
  const { remove } = useFr021Mutations();

  const isAtasan = user?.role === "admin";

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({
        id: deleteTarget.id,
        version: deleteTarget.version,
      });
      setDeleteTarget(null);
      showToast.success("Evaluasi draft berhasil dihapus.");
    } catch (error) {
      const parsed = await readFr021Error(error);
      setMessage(parsed.message);
      showToast.error(parsed.message);
      setDeleteTarget(null);
    }
  }

  function handleAction(
    record: Fr021Evaluasi,
    action: "lanjutkan" | "tinjau" | "lihat"
  ) {
    if (action === "tinjau") {
      router.push(`${FR021_ROUTES.detail(record.id)}?langkah=tinjauan`);
      return;
    }
    router.push(FR021_ROUTES.detail(record.id));
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Daftar Evaluasi Penyedia
            </h1>
            <p className="text-xs text-slate-500">
              Formulir FR-021 — penilaian kinerja penyedia barang/jasa.
            </p>
          </div>
          <Link
            href="/smki/evaluasi-penyedia/baru"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white text-center shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            + Tambah Evaluasi
          </Link>
        </div>

        <RingkasanKpi summary={list.data?.summary} />

        {message && (
          <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
            {message}
          </p>
        )}

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold mb-3">Daftar Evaluasi Penyedia</h2>
            <FilterBar
              search={search}
              sifat={sifat}
              status={status}
              onSearchChange={(value: string) => {
                setSearch(value);
                setPage(1);
              }}
              onSifatChange={(value: string) => {
                setSifat(value);
                setPage(1);
              }}
              onStatusChange={(value: string) => {
                setStatus(value);
                setPage(1);
              }}
              onReset={() => {
                setSearch("");
                setSifat("");
                setStatus("");
                setPage(1);
              }}
            />
          </div>

          {list.isLoading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Memuat evaluasi...
            </p>
          ) : list.isError ? (
            <div role="alert" className="p-5 text-sm text-rose-700">
              Gagal memuat evaluasi. Periksa koneksi dan hak akses.
              <Button
                variant="outline"
                className="ml-3"
                onClick={() => void list.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : (
            list.data && (
              <>
                <div className="p-5">
                  <EvaluasiTable
                    records={list.data.data}
                    currentUserId={user?.id}
                    isAtasan={!!isAtasan}
                    onAction={handleAction}
                    onDelete={setDeleteTarget}
                  />
                </div>
                {list.data.meta.total > 0 && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800">
                    <Pagination
                      currentPage={list.data.meta.current_page}
                      totalPages={Math.max(1, list.data.meta.last_page)}
                      totalItems={list.data.meta.total}
                      itemsPerPage={list.data.meta.per_page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )
          )}
        </section>

        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Hapus evaluasi draft?"
          message={`Evaluasi ${deleteTarget?.penyedia?.nama_penyedia ?? ""} (No. Kontrak ${deleteTarget?.no_kontrak ?? "-"}) akan dihapus (soft delete).`}
          loading={remove.isPending}
        />
      </div>
    </ServiceRouteGuard>
  );
}
