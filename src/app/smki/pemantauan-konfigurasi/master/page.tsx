"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Fr048MasterTemplate from "@/components/smki/pemantauan-konfigurasi/templates/Fr048MasterTemplate";

export default function PemantauanKonfigurasiMasterPage() {
  // requireAdmin: konten khusus admin di-hide/tidak bisa diakses oleh role user
  return (
    <ServiceRouteGuard requiredService="SMKI" requireAdmin>
      <Fr048MasterTemplate />
    </ServiceRouteGuard>
  );
}
