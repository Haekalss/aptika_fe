"use client";

import { useCallback, useState } from "react";
import type { BackupRestoreReport, Fr030FormState } from "@/services/smki/backupRestore.types";
import { createEmptyFr030Form, hydrateFr030Form } from "../form";

export function useFr030Form(report?: BackupRestoreReport) {
  // Mount the editor only after its first fetch; background queries never overwrite typed values.
  const [form, setForm] = useState(() => report ? hydrateFr030Form(report) : createEmptyFr030Form(Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()))));
  const [saved, setSaved] = useState(report);
  const [dirty, setDirty] = useState(false);
  const change = useCallback((changes: Partial<Fr030FormState>) => {
    setForm(previous => ({ ...previous, ...changes }));
    setDirty(true);
  }, []);
  const markSaved = useCallback((record: BackupRestoreReport) => {
    setSaved(record);
    setForm(hydrateFr030Form(record));
    setDirty(false);
  }, []);
  return { form, saved, dirty, change, markSaved };
}
