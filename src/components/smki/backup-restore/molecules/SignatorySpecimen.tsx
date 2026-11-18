"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { api } from "@/services/api";
import { backupRestoreService } from "@/services/smki/backupRestoreService";
import type { BackupRestoreSignatory } from "@/services/smki/backupRestore.types";

export function SignatorySpecimen({ reportId, role, pegawaiId }: { reportId?: number; role: BackupRestoreSignatory; pegawaiId: number | null }) {
  const [state, setState] = useState<{ src?: string; error?: boolean }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false, url: string | undefined;
    const request = reportId ? backupRestoreService.specimen(reportId, role) : api.get<Blob>(`/tte/spesimen/${pegawaiId}`, { responseType: "blob" }).then(response => response.data);
    request.then(blob => {
      if (cancelled) return;
      url = URL.createObjectURL(blob); setState({ src: url });
    }).catch(() => { if (!cancelled) setState({ error: true }); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [reportId, role, pegawaiId, attempt]);
  if (state.error) return <div role="alert" className="text-sm text-red-700 dark:text-red-300">Spesimen belum dapat dimuat. <Button type="button" variant="outline" size="sm" onClick={() => { setState({}); setAttempt(n => n + 1); }}>Coba lagi</Button></div>;
  if (!state.src) return <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Memuat spesimen…</p>;
  // Blob URLs are authenticated previews, not optimizable public image sources.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={state.src} width={300} height={121} className="max-w-full h-auto rounded-lg bg-white" alt={`Spesimen ${role === "pelaksana" ? "Pelaksana" : "Penanggung Jawab"}`} />;
}
