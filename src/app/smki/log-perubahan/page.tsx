"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import LogPerubahanScreen from "./_module/components/LogPerubahanScreen";

export default function LogPerubahanPage() {
  const { user, bidang, isAdminAptika } = useAuthStore();
  return <ServiceRouteGuard requiredService="SMKI">
    {user && bidang ? <LogPerubahanScreen key={`${bidang.id}:${user.id}:${isAdminAptika}`} scope={`bidang-${bidang.id}:user-${user.id}`} unit={bidang.name} userId={user.id} bidangId={bidang.id} recorderName={user.name} allBidang={isAdminAptika}/>
      : <p role="alert" className="text-sm text-red-600">Profil dan bidang pengguna belum tersedia. Muat ulang halaman atau hubungi administrator.</p>}
  </ServiceRouteGuard>;
}
