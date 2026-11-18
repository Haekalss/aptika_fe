"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export interface MasterOption {
  id: string;
  name: string;
  nip?: string;
}
export interface Masters {
  units: MasterOption[];
  employees: MasterOption[];
}

function toOptions(
  value: unknown,
  nameKeys: string[],
  nipKey?: string,
): MasterOption[] {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)
      ? ((value as { data: unknown[] }).data)
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = row.id ?? row.unit_kerja_id;
    const name = nameKeys.map((key) => row[key]).find((v) => typeof v === "string" && v.trim());
    if (id === undefined || id === null || typeof name !== "string") return [];
    return [{
      id: String(id),
      name,
      nip: nipKey && typeof row[nipKey] === "string" ? (row[nipKey] as string) : "",
    }];
  });
}

export function useMasters() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    data: Masters | null;
    error: string;
    attempt: number;
  }>({ data: null, error: "", attempt: -1 });

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal, timeout: 15000 };
    Promise.all([api.get("/bidangs", config), api.get("/master/pegawai", config)])
      .then(([units, employees]) => {
        if (!units.data?.success && !Array.isArray(units.data)) {
          throw new Error("Master unit kerja tidak valid.");
        }
        if (controller.signal.aborted) return;
        setResult({
          data: {
            units: toOptions(units.data, ["name", "nama"]),
            employees: toOptions(employees.data, ["nama", "name"], "nip"),
          },
          error: "",
          attempt,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({
            data: null,
            error:
              "Master unit kerja/pegawai belum dapat dimuat. Anda tetap dapat menyimpan draf; coba lagi untuk menyimpan formulir final.",
            attempt,
          });
        }
      });
    return () => controller.abort();
  }, [attempt]);

  return {
    data: result.attempt === attempt ? result.data : null,
    error: result.attempt === attempt ? result.error : "",
    loading: result.attempt !== attempt,
    retry: () => setAttempt((value) => value + 1),
  };
}
