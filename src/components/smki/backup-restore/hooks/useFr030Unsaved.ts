"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BEFORE_NAVIGATION_EVENT, runGuardedNavigation, type BeforeNavigationDetail } from "@/utils/guardedNavigation";

export function useFr030Unsaved(dirty: boolean) {
  const router = useRouter();
  const armed = useRef(dirty);
  const [pending, setPending] = useState<(() => void) | null>(null);
  useEffect(() => { armed.current = dirty; }, [dirty]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (armed.current) { event.preventDefault(); event.returnValue = ""; } };
    const navigation = (event: Event) => {
      if (!armed.current) return;
      event.preventDefault();
      setPending(() => (event as CustomEvent<BeforeNavigationDetail>).detail.proceed);
    };
    const anchor = (event: MouseEvent) => {
      if (!armed.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.download || (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href);
      if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
      event.preventDefault(); event.stopPropagation();
      runGuardedNavigation(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`));
    };
    window.addEventListener("beforeunload", unload);
    window.addEventListener(BEFORE_NAVIGATION_EVENT, navigation);
    document.addEventListener("click", anchor, true);
    return () => {
      window.removeEventListener("beforeunload", unload); window.removeEventListener(BEFORE_NAVIGATION_EVENT, navigation);
      document.removeEventListener("click", anchor, true);
    };
  }, [router]);
  return { pending, cancel: () => setPending(null), confirm: () => { armed.current = false; setPending(null); pending?.(); } };
}
