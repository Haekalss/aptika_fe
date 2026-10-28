"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Fr025Access } from "@/components/smki/removable-media/organisms/Fr025Access";
import styles from "./layout.module.css";

export default function Fr025Layout({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { root.current?.closest("main")?.scrollTo({ top: 0 }); }, [pathname]);
  return <Fr025Access><div ref={root} className={`${styles.root} fr025-module mx-auto max-w-[1680px] space-y-6 py-4`}>{children}</div></Fr025Access>;
}
