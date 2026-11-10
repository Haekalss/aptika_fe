"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useFr030Scope } from "@/components/smki/backup-restore/hooks/useFr030Queries";
import styles from "./layout.module.css";
import { Fr030Header } from "@/components/smki/backup-restore/organisms/Fr030Header";

export default function Fr030Layout({ children }: { children: ReactNode }) {
  const scope = useFr030Scope();
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { root.current?.closest("main")?.scrollTo({ top: 0 }); }, [pathname]);
  return <ServiceRouteGuard requiredService="SMKI">{scope.enabled ? <div ref={root} className={`${styles.root} min-w-0 space-y-6 py-2 text-slate-800 dark:text-slate-100 dark:[&_.text-slate-600]:text-slate-200`}><Fr030Header />{children}</div> : <p role="alert">Anda tidak memiliki akses modul FR-030.</p>}</ServiceRouteGuard>;
}
