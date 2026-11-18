"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  createDaftarRole,
  deleteDaftarRole,
  fetchDaftarRole,
  updateDaftarRole,
} from "@/services/smki/daftarRoleService";
import {
  parseMatrices,
  validateMatrix,
  type MatrixInput,
  type MatrixRecord,
} from "./model";

export class MatrixSaveError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) {
    super(message);
  }
}

function serverError(error: unknown): MatrixSaveError {
  if (isAxiosError(error)) {
    const fields: Record<string, string> = {};
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === "object") {
      for (const [key, messages] of Object.entries(errors)) {
        if (Array.isArray(messages) && typeof messages[0] === "string") {
          fields[key] = messages[0];
        }
      }
    }
    const message =
      error.response?.data?.message ??
      (Object.keys(fields).length
        ? "Periksa isian yang ditandai."
        : "Data formulir belum dapat disimpan. Periksa koneksi lalu coba lagi.");
    return new MatrixSaveError(message, fields);
  }
  return error instanceof MatrixSaveError
    ? error
    : new MatrixSaveError("Penyimpanan formulir gagal. Silakan coba kembali.");
}

/** Data FR-033 diambil dari REST API Laravel, mengikuti pola modul SMKI lainnya. */
export function useMatrices() {
  const [matrices, setMatrices] = useState<MatrixRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = await fetchDaftarRole();
        if (controller.signal.aborted) return;
        setMatrices(parseMatrices(JSON.stringify(data)));
        setError("");
        setReady(true);
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Daftar formulir FR-033 gagal dimuat dari server. Periksa koneksi lalu pilih Coba Lagi.",
          );
          setReady(true);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  const save = async (
    input: MatrixInput,
    complete: boolean,
    previous?: MatrixRecord,
  ): Promise<MatrixRecord> => {
    const fields = validateMatrix(input, complete);
    if (Object.keys(fields).length) {
      throw new MatrixSaveError("Lengkapi atau perbaiki isian yang ditandai.", fields);
    }
    try {
      const payload = { ...input, status: complete ? "Tersimpan" : "Draf" };
      const response = previous
        ? await updateDaftarRole(previous.id, payload)
        : await createDaftarRole(payload);
      if (!response.success) throw new Error("Penyimpanan gagal.");
      const [record] = parseMatrices(JSON.stringify([response.data]));
      setMatrices((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      return record;
    } catch (error) {
      throw serverError(error);
    }
  };

  const remove = async (id: string) => {
    await deleteDaftarRole(id);
    setMatrices((current) => current.filter((item) => item.id !== id));
  };

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { matrices, ready, error, save, remove, retry };
}
