"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ReviuCctvForm from "@/components/smki/reviu-cctv/ReviuCctvForm";

export default function TambahReviuCctvPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <ReviuCctvForm mode="create" />
    </ServiceRouteGuard>
  );
}
