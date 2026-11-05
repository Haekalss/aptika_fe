import axios from "axios";
import { api } from "@/services/api";
import type {
  Fr026Asset,
  Fr026AssetPayload,
  Fr026Dashboard,
  Fr026Log,
  Fr026LogPayload,
} from "./capacityPlanning.types";

const endpoint = "/smki/capacity-planning";

export const getFr026Dashboard = async (year: number, month: number): Promise<Fr026Dashboard> =>
  (await api.get(endpoint, { params: { year, month } })).data.data;

export const getFr026ExportData = async (year: number, month: number): Promise<Fr026Dashboard> =>
  (await api.get(`${endpoint}/export-data`, { params: { year, month } })).data.data;

export const createFr026Asset = async (payload: Fr026AssetPayload): Promise<Fr026Asset> =>
  (await api.post(`${endpoint}/assets`, payload)).data.data;

export const updateFr026Asset = async (id: number, payload: Fr026AssetPayload): Promise<Fr026Asset> =>
  (await api.put(`${endpoint}/assets/${id}`, payload)).data.data;

export const deleteFr026Asset = async (id: number): Promise<void> => {
  await api.delete(`${endpoint}/assets/${id}`);
};

export const saveFr026Log = async (assetId: number, payload: Fr026LogPayload): Promise<Fr026Log> =>
  (await api.put(`${endpoint}/assets/${assetId}/logs`, payload)).data.data;

export function fr026Error(error: unknown): { message: string; fields: Record<string, string> } {
  if (axios.isAxiosError(error)) {
    const fields = Object.fromEntries(
      Object.entries(error.response?.data?.errors ?? {}).map(([key, value]) => [
        key,
        Array.isArray(value) ? String(value[0]) : String(value),
      ])
    );
    return {
      message:
        (error.response?.status ?? 0) >= 500
          ? "Server belum dapat memproses FR-026. Coba kembali atau hubungi administrator."
          : error.response?.data?.message || "Permintaan gagal. Periksa koneksi lalu coba kembali.",
      fields,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba kembali.",
    fields: {},
  };
}
