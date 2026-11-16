"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Fr048ListTemplate from "@/components/smki/pemantauan-konfigurasi/templates/Fr048ListTemplate";

export default function PemantauanKonfigurasiPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <Fr048ListTemplate />
    </ServiceRouteGuard>
  );
}
