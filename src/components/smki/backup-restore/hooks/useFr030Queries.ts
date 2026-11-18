"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { backupRestoreService } from "@/services/smki/backupRestoreService";
import { getTtePegawai } from "@/services/tteService";
import type { BackupRestoreFilters, BackupRestoreLookupParams } from "@/services/smki/backupRestore.types";

export function useFr030Scope() {
  const { user, bidang, initialized, hasServicePermission } = useAuthStore();
  return { key: ["smki", "fr030", user?.id, user?.role, bidang?.id] as const,
    enabled: initialized && Boolean(bidang && user && ["user", "admin"].includes(user.role)) && hasServicePermission("SMKI") };
}
export function useFr030List(filters: BackupRestoreFilters) {
  const scope = useFr030Scope();
  return useQuery({ queryKey: [...scope.key, "list", filters], queryFn: () => backupRestoreService.list(filters), enabled: scope.enabled, retry: false });
}
export function useFr030Report(id?: number) {
  const scope = useFr030Scope();
  return useQuery({ queryKey: [...scope.key, "report", id], queryFn: () => backupRestoreService.get(id!), enabled: scope.enabled && Number.isSafeInteger(id) && (id ?? 0) > 0, refetchOnMount: "always", retry: false });
}
export function useFr030Lookup(params: BackupRestoreLookupParams, enabled = true) {
  const scope = useFr030Scope();
  return useQuery({ queryKey: [...scope.key, "lookup", params], queryFn: () => backupRestoreService.lookup(params), enabled: scope.enabled && enabled, staleTime: 60_000, retry: false });
}
export function useFr030Pegawai() {
  const scope = useFr030Scope();
  return useQuery({ queryKey: [...scope.key, "pegawai"], queryFn: getTtePegawai, enabled: scope.enabled, staleTime: 60_000, retry: false });
}
export function useRefreshFr030() {
  const client = useQueryClient();
  const scope = useFr030Scope();
  return () => client.invalidateQueries({ queryKey: scope.key });
}
