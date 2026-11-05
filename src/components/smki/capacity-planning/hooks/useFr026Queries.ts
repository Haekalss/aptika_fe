import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getFr026Dashboard, getFr026ExportData } from "@/services/smki/capacityPlanningService";

export function useFr026Scope() {
  return useAuthStore(
    (state) => `${state.user?.id ?? 0}:${state.user?.role ?? ""}:${state.bidang?.id ?? 0}`
  );
}

export function useFr026Dashboard(year: number, month: number) {
  const scope = useFr026Scope();
  return useQuery({
    queryKey: ["fr026", scope, "dashboard", year, month],
    queryFn: () => getFr026Dashboard(year, month),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useFr026Export(year: number, month: number) {
  const scope = useFr026Scope();
  return useQuery({
    queryKey: ["fr026", scope, "export", year, month],
    queryFn: () => getFr026ExportData(year, month),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
