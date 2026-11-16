"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { usePemantauanDetail } from "@/components/smki/pemantauan-konfigurasi/hooks/usePemantauanDetail";
import Fr048WizardTemplate from "@/components/smki/pemantauan-konfigurasi/templates/Fr048WizardTemplate";
import Fr048DetailTemplate from "@/components/smki/pemantauan-konfigurasi/templates/Fr048DetailTemplate";

export default function PemantauanDetailPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <Workspace />
    </ServiceRouteGuard>
  );
}

function Workspace() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const { user } = useAuthStore();
  const { detail, setDetail, loading, notFound, refresh } = usePemantauanDetail(Number.isFinite(id) ? id : null);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 size={16} className="animate-spin" /> Memuat pemantauan...
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Pemantauan tidak ditemukan</p>
        <p className="text-[11px] text-slate-500 max-w-sm">Data mungkin sudah dihapus atau Anda tidak memiliki hak akses ke pemantauan ini.</p>
        <button type="button" onClick={() => router.push("/smki/pemantauan-konfigurasi")} className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white text-[11px] font-bold">
          <ArrowLeft size={14} /> Kembali ke Daftar
        </button>
      </div>
    );
  }

  const isOwner = user?.id != null && user.id === detail.pelaksanaId;
  const editable = isOwner && (detail.status === "draft" || detail.status === "revisi");

  return editable ? (
    <Fr048WizardTemplate detail={detail} onSaved={(d) => setDetail(d)} />
  ) : (
    <Fr048DetailTemplate detail={detail} onChanged={refresh} />
  );
}
