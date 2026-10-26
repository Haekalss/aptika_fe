"use client";

import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import PerangkatPribadiForm from "@/components/smki/perangkat-pribadi/PerangkatPribadiForm";

export default function EditPerangkatPribadiPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <PerangkatPribadiForm mode="edit" id={id} />
    </ServiceRouteGuard>
  );
}
