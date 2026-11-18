"use client";

import { useCallback, useEffect, useState } from "react";
import { getDetail } from "@/services/smki/pemantauanKonfigurasiService";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Ambil & refetch detail pemantauan by id. */
export function usePemantauanDetail(id: number | null) {
  const [detail, setDetail] = useState<PemantauanDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    if (id == null) return;
    setLoading(true);
    try {
      const data = await getDetail(id);
      setDetail(data);
      setNotFound(false);
    } catch {
      setNotFound(true);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id == null) return;
    let cancelled = false;
    getDetail(id)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setNotFound(false);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { detail, setDetail, loading, notFound, refresh };
}
