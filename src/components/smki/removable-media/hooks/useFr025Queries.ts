import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getFr025, getFr025List, getFr025Lookup } from "@/services/smki/removableMediaService";
import type { Fr025Filters } from "@/services/smki/removableMedia.types";

export function useFr025Scope() {
  return useAuthStore((state) => `${state.user?.id ?? 0}:${state.user?.role ?? ""}:${state.bidang?.id ?? 0}`);
}

export function useFr025List(filters: Fr025Filters) {
  const scope = useFr025Scope();
  return useQuery({ queryKey: ["fr025", scope, "list", filters], queryFn: () => getFr025List(filters), retry: false });
}
export function useFr025Report(id?: number) {
  const scope = useFr025Scope();
  return useQuery({ queryKey: ["fr025", scope, "report", id], queryFn: () => getFr025(id!), enabled: !!id, retry: false, refetchOnWindowFocus: false });
}
export function useFr025Lookup(id?: number) {
  const scope = useFr025Scope();
  return useQuery({ queryKey: ["fr025", scope, "lookup", id], queryFn: () => getFr025Lookup(id), retry: false, refetchOnWindowFocus: false });
}
