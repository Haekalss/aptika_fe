"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ajukanFr021,
  createFr021,
  createFr021Penyedia,
  deleteFr021,
  getFr021,
  getFr021Admins,
  getFr021List,
  getFr021Master,
  getFr021Riwayat,
  getFr021Snapshot,
  hitungFr021,
  kembalikanFr021,
  lookupFr021Penyedia,
  saveFr021Penilaian,
  setujuiFr021,
  updateFr021Identifikasi,
} from "@/services/smki/evaluasiPenyediaService";
import type {
  Fr021AjukanPayload,
  Fr021IdentifikasiPayload,
  Fr021KembalikanPayload,
  Fr021ListParams,
  Fr021PenilaianPayload,
  Fr021PenyediaPayload,
} from "@/services/smki/evaluasiPenyedia.types";

/**
 * Scope query: dipisah per pengguna & bidang agar cache tidak bocor
 * antar akun. Hanya aktif bila layanan SMKI diizinkan.
 */
function useFr021Scope() {
  const { user, bidang, initialized, hasServicePermission } = useAuthStore();
  return {
    key: ["smki", "fr021", user?.id, bidang?.id] as const,
    enabled: initialized && Boolean(user) && hasServicePermission("SMKI"),
  };
}

/* ───────────────────────── Query ───────────────────────── */

export function useFr021Master() {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "master"],
    queryFn: getFr021Master,
    enabled: scope.enabled,
    staleTime: 5 * 60_000,
  });
}

export function useFr021AdminOptions() {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "admins"],
    queryFn: getFr021Admins,
    enabled: scope.enabled,
    staleTime: 5 * 60_000,
  });
}

export function useFr021List(params: Fr021ListParams) {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "list", params],
    queryFn: () => getFr021List(params),
    enabled: scope.enabled,
  });
}

export function useFr021Detail(id?: number) {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "detail", id],
    queryFn: () => getFr021(id as number),
    enabled:
      scope.enabled &&
      Number.isSafeInteger(id) &&
      (id ?? 0) > 0,
    staleTime: 10_000,
  });
}

export function useFr021Riwayat(id?: number, enabled = true) {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "riwayat", id],
    queryFn: () => getFr021Riwayat(id as number),
    enabled:
      scope.enabled &&
      enabled &&
      Number.isSafeInteger(id) &&
      (id ?? 0) > 0,
  });
}

/** Autocomplete penyedia; `enabled` diatur oleh komponen saat dropdown dibuka. */
export function useFr021PenyediaLookup(q: string, enabled = true) {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "penyedia", q],
    queryFn: () => lookupFr021Penyedia(q),
    enabled: scope.enabled && enabled,
    staleTime: 30_000,
  });
}

/* ───────────────────────── Mutation ───────────────────────── */

export function useFr021Mutations() {
  const scope = useFr021Scope();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: scope.key });

  const create = useMutation({
    mutationFn: createFr021,
    onSuccess: refresh,
  });

  const updateIdentifikasi = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Fr021IdentifikasiPayload;
    }) => updateFr021Identifikasi(id, payload),
    onSuccess: refresh,
  });

  const savePenilaian = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Fr021PenilaianPayload }) =>
      saveFr021Penilaian(id, payload),
    onSuccess: refresh,
  });

  const hitung = useMutation({
    mutationFn: ({ id, version }: { id: number; version?: number }) =>
      hitungFr021(id, version),
    onSuccess: refresh,
  });

  const ajukan = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Fr021AjukanPayload }) =>
      ajukanFr021(id, payload),
    onSuccess: refresh,
  });

  const setujui = useMutation({
    mutationFn: ({ id, version }: { id: number; version?: number }) =>
      setujuiFr021(id, version),
    onSuccess: refresh,
  });

  const kembalikan = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Fr021KembalikanPayload;
    }) => kembalikanFr021(id, payload),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      deleteFr021(id, version),
    onSuccess: refresh,
  });

  const createPenyedia = useMutation({
    mutationFn: (payload: Fr021PenyediaPayload) => createFr021Penyedia(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...scope.key, "penyedia"],
      }),
  });

  return {
    create,
    updateIdentifikasi,
    savePenilaian,
    hitung,
    ajukan,
    setujui,
    kembalikan,
    remove,
    createPenyedia,
  };
}

/** Snapshot nilai per kriteria untuk satu entri riwayat. */
export function useFr021Snapshot(id?: number, logId?: number) {
  const scope = useFr021Scope();
  return useQuery({
    queryKey: [...scope.key, "snapshot", id, logId],
    queryFn: () => getFr021Snapshot(id as number, logId as number),
    enabled:
      scope.enabled &&
      Number.isSafeInteger(id) &&
      Number.isSafeInteger(logId) &&
      (id ?? 0) > 0 &&
      (logId ?? 0) > 0,
  });
}
