"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createFr009, deleteFr009, getFr009, getFr009List, getFr009Lookup, submitFr009, updateFr009, verifyFr009 } from "@/services/smki/tindakanPerbaikanService";
import type { Fr009ListParams, Fr009Payload, Fr009VerifyPayload } from "@/services/smki/tindakanPerbaikan.types";

function useFr009Scope() {
  const { user, bidang, initialized, hasServicePermission } = useAuthStore();
  return { key: ["smki", "fr009", user?.id, bidang?.id] as const, enabled: initialized && Boolean(user) && hasServicePermission("SMKI") };
}

export function useFr009Lookup() {
  const scope = useFr009Scope();
  return useQuery({ queryKey: [...scope.key, "lookup"], queryFn: getFr009Lookup, enabled: scope.enabled, staleTime: 60_000 });
}

export function useFr009List(params: Fr009ListParams) {
  const scope = useFr009Scope();
  return useQuery({ queryKey: [...scope.key, "list", params], queryFn: () => getFr009List(params), enabled: scope.enabled });
}

export function useFr009Detail(id?: number) {
  const scope = useFr009Scope();
  return useQuery({ queryKey: [...scope.key, "detail", id], queryFn: () => getFr009(id!), enabled: scope.enabled && Number.isSafeInteger(id) && (id ?? 0) > 0 });
}

export function useFr009Mutations() {
  const scope = useFr009Scope();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: scope.key });
  const create = useMutation({ mutationFn: createFr009, onSuccess: refresh });
  const update = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Fr009Payload }) => updateFr009(id, payload), onSuccess: refresh });
  const remove = useMutation({ mutationFn: ({ id, version }: { id: number; version: number }) => deleteFr009(id, version), onSuccess: refresh });
  const submit = useMutation({ mutationFn: ({ id, version }: { id: number; version: number }) => submitFr009(id, version), onSuccess: refresh });
  const verify = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Fr009VerifyPayload }) => verifyFr009(id, payload), onSuccess: refresh });
  return { create, update, remove, submit, verify };
}
