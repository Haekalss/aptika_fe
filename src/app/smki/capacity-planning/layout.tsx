"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Fr026Access } from "@/components/smki/capacity-planning/organisms/Fr026Access";
import styles from "./layout.module.css";

export default function Fr026Layout({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    root.current?.closest("main")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <Fr026Access>
      <div ref={root} className={`${styles.root} mx-auto max-w-[1680px] space-y-6 py-4`}>
        {children}
      </div>
    </Fr026Access>
  );
}
