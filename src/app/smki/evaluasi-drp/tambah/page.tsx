"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import DrpEvaluasiForm from "@/components/smki/evaluasi-drp/DrpEvaluasiForm";

export default function TambahDrpEvaluasiPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <DrpEvaluasiForm mode="create" />
    </ServiceRouteGuard>
  );
}
