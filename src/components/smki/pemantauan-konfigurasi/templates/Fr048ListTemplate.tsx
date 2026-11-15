"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuthStore";
import { createDraft, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import { usePemantauanList } from "../hooks/usePemantauanList";
import Fr048SummaryCards from "../molecules/Fr048SummaryCards";
import Fr048FilterBar from "../molecules/Fr048FilterBar";
import Fr048PemantauanTable from "../organisms/Fr048PemantauanTable";
import Fr048ConfirmDialog from "../atoms/Fr048ConfirmDialog";

/** Halaman daftar pemantauan (UC-07) — kartu ringkasan + filter + tabel + paginasi. */
export default function Fr048ListTemplate() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const {
    summary, rows, page, totalPages, total, loading,
    filter, setFilter, setStatusFilter, setPage, jenisOptions, removeDraft,
  } = usePemantauanList();
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const draft = await createDraft({ id: user.id, name: user.name });
      router.push(`/smki/pemantauan-konfigurasi/${draft.id}`);
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal membuat pemantauan."));
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Fr048SummaryCards summary={summary} active={filter.status} onSelect={setStatusFilter} />
      <Fr048FilterBar value={filter} jenisOptions={jenisOptions} onChange={setFilter} />

      {!isAdmin && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-500" /> Hanya pemantauan milik Anda yang tampil.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 disabled:opacity-60 transition-colors"
          >
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Tambah Pemantauan
          </button>
        </div>
      )}

      <Fr048PemantauanTable
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onOpen={(id) => router.push(`/smki/pemantauan-konfigurasi/${id}`)}
        onDelete={(id) => setDeleteId(id)}
        isAdmin={isAdmin}
      />

      <Fr048ConfirmDialog
        open={deleteId != null}
        title="Hapus Draft"
        message="Draft pemantauan akan disembunyikan (soft delete). Tindakan ini tidak dapat dibatalkan dari UI."
        confirmLabel="Hapus"
        variant="danger"
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId == null) return;
          setDeleting(true);
          await removeDraft(deleteId);
          setDeleting(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
