"use client";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ReviewScreen from "./_module/ReviewScreen";
export default function ReviewHakAksesPage() {
  const {user, bidang} = useAuthStore();
  return <ServiceRouteGuard requiredService="SMKI">{user && bidang ? <ReviewScreen key={`${user.id}:${bidang.id}`} userId={user.id} userName={user.name} bidangId={bidang.id} bidangName={bidang.name}/> : <p role="alert" className="text-sm text-red-600">Profil pengguna belum tersedia. Muat ulang halaman.</p>}</ServiceRouteGuard>;
}
