import { api } from "@/services/api";
import { isAxiosError } from "axios";
import type { ChangeLog, LogInput } from "./model";

const endpoint = "/smki/log-perubahan";
const options = { timeout: 30000 };

export function logErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    if ((error.response?.status ?? 0) >= 500) return "Server gagal memproses log perubahan. Coba lagi.";
    const details = Object.values(error.response?.data?.errors ?? {}).flat().filter(value => typeof value === "string");
    return details.join(" ") || error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function listChangeLogs(): Promise<ChangeLog[]> {
  const response = await api.get<{ success: boolean; data: ChangeLog[] }>(endpoint, options);
  if (response.data.success !== true || !Array.isArray(response.data.data)) throw new Error("Daftar log tidak dapat dimuat.");
  return response.data.data;
}

export async function createChangeLog(input: LogInput, clientLogId?: string): Promise<ChangeLog> {
  const response = await api.post<{ success: boolean; data: ChangeLog }>(endpoint, { ...input, clientLogId }, options);
  return response.data.data;
}

export async function updateChangeLog(id: string, input: LogInput): Promise<ChangeLog> {
  const response = await api.put<{ success: boolean; data: ChangeLog }>(`${endpoint}/${id}`, input, options);
  return response.data.data;
}

export async function finalizeChangeLog(id: string): Promise<ChangeLog> {
  const response = await api.post<{ success: boolean; data: ChangeLog }>(`${endpoint}/${id}/finalisasi`, undefined, options);
  return response.data.data;
}

export async function deleteChangeLog(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`, options);
}
