"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import PerangkatPribadiForm from "@/components/smki/perangkat-pribadi/PerangkatPribadiForm";

export default function TambahPerangkatPribadiPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <PerangkatPribadiForm mode="create" />
    </ServiceRouteGuard>
  );
}
