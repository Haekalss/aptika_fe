"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
export interface MasterOption { id: string; name: string }
export interface Masters { systems: MasterOption[]; employees: MasterOption[] }
function options(value: unknown, idKey: string, nameKey: string): MasterOption[] {
  if (!Array.isArray(value)) throw new Error("Format master tidak valid.");
  return value.map((item: Record<string, unknown>) => {
    if (!item || !Number.isSafeInteger(Number(item[idKey])) || Number(item[idKey]) <= 0 || typeof item[nameKey] !== "string") throw new Error("Data master tidak valid.");
    return { id: String(item[idKey]), name: String(item[nameKey]) };
  });
}
export function useMasters() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ data: Masters | null; error: string; attempt: number }>({data: null, error: "", attempt: -1});
  useEffect(() => {
    const controller = new AbortController();
    const config = {signal: controller.signal, timeout: 15000};
    api.get<{success: boolean; data: Record<string, unknown>}>("/smki/review-hak-akses/lookup", config).then(response => {
        if (!response.data.success) throw new Error("Master gagal dimuat.");
        const { data } = response.data;
        if (!controller.signal.aborted) setResult({data: {systems: options(data.systems, "id", "name"), employees: options(data.employees, "id", "name")}, error: "", attempt});
      }).catch(() => { if (!controller.signal.aborted) setResult({data: null, error: "Master sistem dan pegawai belum dapat dimuat. Anda tetap dapat menyimpan draf. Coba lagi untuk menyimpan review lengkap.", attempt}); });
    return () => controller.abort();
  }, [attempt]);
  return {data: result.attempt === attempt ? result.data : null, error: result.attempt === attempt ? result.error : "", loading: result.attempt !== attempt, retry: () => setAttempt(value => value + 1)};
}
