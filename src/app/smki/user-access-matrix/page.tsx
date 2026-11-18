"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import MatrixScreen from "./_module/MatrixScreen";

export default function UserAccessMatrixPage() {
  const { user, bidang } = useAuthStore();
  return (
    <ServiceRouteGuard requiredService="SMKI">
      {user && bidang ? (
        <MatrixScreen
          key={`${user.id}:${bidang.id}`}
          bidangName={bidang.name}
        />
      ) : (
        <p role="alert" className="text-sm text-red-600">
          Profil pengguna belum tersedia. Muat ulang halaman.
        </p>
      )}
    </ServiceRouteGuard>
  );
}
