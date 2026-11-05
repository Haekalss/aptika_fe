"use client";

import { useEffect, useState } from "react";
import type { Fr021Evaluasi, Fr021Master } from "@/services/smki/evaluasiPenyedia.types";
import type { Fr021FormState } from "../types";
import type { Fr021Errors } from "@/services/smki/evaluasiPenyedia.types";
import { emptyFr021Form, recordToForm } from "../form";

export function useFr021Form(master?: Fr021Master) {
  const [form, setForm] = useState<Fr021FormState>(() => emptyFr021Form(master));
  const [errors, setErrors] = useState<Fr021Errors>({});
  const [dirty, setDirty] = useState(false);
  const [identity, setIdentity] = useState<{
    id?: number;
    version?: number;
    status?: string;
  }>({});

  const onChange = (changes: Partial<Fr021FormState>) => {
    setForm((prev) => ({ ...prev, ...changes }));
    setDirty(true);
  };

  const setErrorsState = (next: Fr021Errors) => setErrors(next);

  const markSaved = (record: Fr021Evaluasi) => {
    setIdentity({ id: record.id, version: record.version, status: record.status });
    setForm((prev) => ({ ...prev, version: record.version }));
    setErrors({});
    setDirty(false);
  };

  const loadRecord = (record: Fr021Evaluasi) => {
    setForm(recordToForm(record, master));
    setIdentity({ id: record.id, version: record.version, status: record.status });
    setErrors({});
    setDirty(false);
  };

  const reset = () => {
    setForm(emptyFr021Form(master));
    setIdentity({});
    setErrors({});
    setDirty(false);
  };

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return {
    form,
    errors,
    dirty,
    identity,
    onChange,
    setErrors: setErrorsState,
    markSaved,
    loadRecord,
    reset,
  };
}
