"use client";

import { useEffect, useState } from "react";
import { loadReferences, type ReferenceData } from "../lib/references";

export function useReferences(userId: number, bidangId: number, targetBidangId = bidangId) {
  const [result, setResult] = useState<{ key: string; data: ReferenceData | null; error: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${userId}:${bidangId}:${targetBidangId}:${attempt}`;
  useEffect(() => {
    const controller = new AbortController();
    loadReferences(userId, bidangId, controller.signal, targetBidangId)
      .then(data => { if (!controller.signal.aborted) setResult({ key, data, error: "" }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ key, data: null, error: "Data referensi gagal dimuat. Pastikan server tersedia dan akun memiliki akses SMKI, lalu coba lagi." }); });
    return () => controller.abort();
  }, [userId, bidangId, targetBidangId, key]);
  const current = result?.key === key ? result : null;
  return { data: current?.data ?? null, error: current?.error ?? "", loading: !current, retry: () => setAttempt(value => value + 1) };
}
