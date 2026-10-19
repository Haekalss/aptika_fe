"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BEFORE_NAVIGATION_EVENT, runGuardedNavigation, type BeforeNavigationDetail } from "@/utils/guardedNavigation";
import type { Fr009Errors, Fr009Record } from "@/services/smki/tindakanPerbaikan.types";
import { emptyFr009Form, recordToForm } from "../form";
import type { Fr009FormIdentity, Fr009FormState } from "../types";

export function useFr009Form(record?: Fr009Record, reporter?: { id: number; name: string } | null) {
  const router = useRouter();
  // The editor mounts only after fetching; later refetches never replace its draft.
  const [form, setForm] = useState(() => record ? recordToForm(record) : emptyFr009Form(reporter));
  const [identity, setIdentity] = useState<Fr009FormIdentity>(() => record ? { id: record.id, version: record.version, status: record.status } : {});
  const [errors, setErrors] = useState<Fr009Errors>({});
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const deferNavigation = (event: Event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      const { proceed } = (event as CustomEvent<BeforeNavigationDetail>).detail;
      setPendingNavigation(() => proceed);
    };
    const interceptLink = (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.download || (anchor.target && anchor.target !== "_self")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      runGuardedNavigation(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`));
    };
    window.addEventListener("beforeunload", warn);
    window.addEventListener(BEFORE_NAVIGATION_EVENT, deferNavigation);
    document.addEventListener("click", interceptLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener(BEFORE_NAVIGATION_EVENT, deferNavigation);
      document.removeEventListener("click", interceptLink, true);
    };
  }, [router]);
  const onChange = useCallback((changes: Partial<Fr009FormState>) => {
    setForm((previous) => ({ ...previous, ...changes }));
    dirtyRef.current = true;
    setDirty(true);
  }, []);
  const markSaved = useCallback((saved: Fr009Record) => {
    setIdentity({ id: saved.id, version: saved.version, status: saved.status });
    setForm(recordToForm(saved));
    dirtyRef.current = false;
    setDirty(false);
    setErrors({});
  }, []);
  const cancelNavigation = useCallback(() => setPendingNavigation(null), []);
  const confirmNavigation = useCallback(() => {
    const proceed = pendingNavigation;
    setPendingNavigation(null);
    // Disarm synchronously before an action changes window.location or logs out.
    dirtyRef.current = false;
    setDirty(false);
    proceed?.();
  }, [pendingNavigation]);
  return { form, identity, errors, dirty, onChange, setErrors, markSaved, pendingNavigation, cancelNavigation, confirmNavigation };
}
