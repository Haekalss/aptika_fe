"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { useFr021Detail } from "@/components/smki/evaluasi-penyedia/hooks/useFr021Queries";
import EvaluasiPenyediaWizardTemplate from "@/components/smki/evaluasi-penyedia/templates/EvaluasiPenyediaWizardTemplate";
import EvaluasiPenyediaDetailTemplate from "@/components/smki/evaluasi-penyedia/templates/EvaluasiPenyediaDetailTemplate";
import EvaluasiPenyediaTinjauTemplate from "@/components/smki/evaluasi-penyedia/templates/EvaluasiPenyediaTinjauTemplate";

export default function EvaluasiPenyediaDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = Number(params?.id);
  const { user } = useAuthStore();
  const detail = useFr021Detail(id);

  if (detail.isLoading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <p className="py-12 text-center text-sm text-slate-500">
          Memuat evaluasi...
        </p>
      </ServiceRouteGuard>
    );
  }

  const record = detail.data;
  const isAssignedAdmin =
    user?.role === "admin" && !!record && record.admin_id === user?.id;

  let content: React.ReactNode;
  if (record?.status === "diajukan" && isAssignedAdmin) {
    content = <EvaluasiPenyediaTinjauTemplate />;
  } else if (record?.status === "diajukan" || record?.status === "selesai") {
    content = <EvaluasiPenyediaDetailTemplate />;
  } else {
    content = <EvaluasiPenyediaWizardTemplate />;
  }

  return (
    <Suspense
      fallback={
        <ServiceRouteGuard requiredService="SMKI">
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat evaluasi...</p>
          </div>
        </ServiceRouteGuard>
      }
    >
      {content}
    </Suspense>
  );
}
