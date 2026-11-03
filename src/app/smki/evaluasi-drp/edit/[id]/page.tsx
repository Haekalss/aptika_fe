"use client";

import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import DrpEvaluasiForm from "@/components/smki/evaluasi-drp/DrpEvaluasiForm";

export default function EditDrpEvaluasiPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <DrpEvaluasiForm mode="edit" id={id} />
    </ServiceRouteGuard>
  );
}
