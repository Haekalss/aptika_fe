import type { ReactNode } from "react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";

export function Fr025Access({ children }: { children: ReactNode }) {
  const { user, hasServicePermission } = useAuthStore();
  const authorized = user && ["admin", "user"].includes(user.role) && hasServicePermission("SMKI");
  // The existing guard redirects but still renders children; keep FR-025 queries unmounted on denial.
  return <ServiceRouteGuard requiredService="SMKI">{authorized ? children : <p role="alert" className="p-6 text-sm text-red-600">Anda tidak memiliki akses modul FR-025.</p>}</ServiceRouteGuard>;
}
