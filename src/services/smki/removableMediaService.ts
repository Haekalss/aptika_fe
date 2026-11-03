import axios from "axios";
import { api } from "@/services/api";
import type { Fr025Filters, Fr025List, Fr025Lookup, Fr025Payload, Fr025Report } from "./removableMedia.types";

const endpoint = "/smki/removable-media";
export const getFr025List = async (filters: Fr025Filters): Promise<Fr025List> => (await api.get(endpoint, { params: filters })).data;
export const getFr025 = async (id: number): Promise<Fr025Report> => (await api.get(`${endpoint}/${id}`)).data.data;
export const getFr025Lookup = async (id?: number): Promise<Fr025Lookup> => (await api.get(`${endpoint}/lookup`, { params: { report_id: id } })).data.data;
export const saveFr025 = async (payload: Fr025Payload, id?: number): Promise<Fr025Report> => (
  id ? await api.put(`${endpoint}/${id}`, payload) : await api.post(endpoint, payload)
).data.data;
export const deleteFr025 = async (report: Fr025Report): Promise<void> => { await api.delete(`${endpoint}/${report.id}`, { data: { version: report.version } }); };
export async function downloadFr025Pdf(id: number): Promise<void> {
  const report: Fr025Report = (await api.get(`${endpoint}/${id}/export-data`)).data.data;
  const { exportFr025Pdf } = await import("@/utils/smkiRemovableMediaPdf");
  await exportFr025Pdf(report);
}
export function fr025Error(error: unknown): { message: string; fields: Record<string, string> } {
  if (axios.isAxiosError(error)) {
    const fields = Object.fromEntries(Object.entries(error.response?.data?.errors ?? {}).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]));
    return { message: (error.response?.status ?? 0) >= 500 ? "Server belum dapat memproses FR-025. Coba kembali atau hubungi administrator." : error.response?.data?.message || "Permintaan gagal. Periksa koneksi lalu coba kembali.", fields };
  }
  return { message: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba kembali.", fields: {} };
}
