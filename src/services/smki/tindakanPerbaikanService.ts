import axios from "axios";
import { api } from "@/services/api";
import type { Fr009Errors, Fr009ListParams, Fr009ListResponse, Fr009Lookup, Fr009Payload, Fr009Record, Fr009VerifyPayload } from "./tindakanPerbaikan.types";

const endpoint = "/smki/tindakan-perbaikan";

export async function getFr009List(params: Fr009ListParams): Promise<Fr009ListResponse> {
  return (await api.get<Fr009ListResponse>(endpoint, { params })).data;
}

export async function getFr009(id: number): Promise<Fr009Record> {
  return (await api.get<{ data: Fr009Record }>(`${endpoint}/${id}`)).data.data;
}

export async function getFr009Lookup(): Promise<Fr009Lookup> {
  return (await api.get<{ data: Fr009Lookup }>(`${endpoint}/lookup`)).data.data;
}

export async function createFr009(payload: Fr009Payload): Promise<Fr009Record> {
  return (await api.post<{ data: Fr009Record }>(endpoint, payload)).data.data;
}

export async function updateFr009(id: number, payload: Fr009Payload): Promise<Fr009Record> {
  return (await api.put<{ data: Fr009Record }>(`${endpoint}/${id}`, payload)).data.data;
}

export async function deleteFr009(id: number, version: number): Promise<void> {
  await api.delete(`${endpoint}/${id}`, { data: { version } });
}

export async function submitFr009(id: number, version: number): Promise<Fr009Record> {
  return (await api.post<{ data: Fr009Record }>(`${endpoint}/${id}/submit`, { version })).data.data;
}

export async function verifyFr009(id: number, payload: Fr009VerifyPayload): Promise<Fr009Record> {
  return (await api.post<{ data: Fr009Record }>(`${endpoint}/${id}/verify`, payload)).data.data;
}

export async function readFr009Error(error: unknown): Promise<{ message: string; errors: Fr009Errors }> {
  if (axios.isAxiosError(error)) {
    let body: unknown = error.response?.data;
    if (body instanceof Blob) {
      try { body = JSON.parse(await body.text()); } catch { body = null; }
    }
    if (body && typeof body === "object") {
      const response = body as { message?: string; errors?: Fr009Errors };
      return { message: response.message || "Permintaan gagal. Periksa data dan hak akses Anda.", errors: response.errors || {} };
    }
    return { message: error.response?.status === 409 ? "Data telah berubah. Muat ulang sebelum menyimpan agar perubahan orang lain tidak tertimpa." : "Tidak dapat menghubungi server. Data pada form tetap tersedia.", errors: {} };
  }
  return { message: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.", errors: {} };
}

export async function downloadFr009(id: number, format: "docx" | "pdf"): Promise<void> {
  if (format === "pdf") {
    const [response, lookup] = await Promise.all([
      api.get<{ data: Fr009Record }>(`${endpoint}/${id}/export-pdf-data`), getFr009Lookup(),
    ]);
    const { exportFr009ToPdf } = await import("@/utils/smkiTindakanPerbaikanPdf");
    await exportFr009ToPdf(response.data.data, lookup);
    return;
  }
  const response = await api.get<Blob>(`${endpoint}/${id}/export-${format}`, { responseType: "blob" });
  const disposition = String(response.headers["content-disposition"] || "");
  const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(disposition);
  let filename = `FR-009_${id}.${format}`;
  if (match) {
    try { filename = decodeURIComponent(match[1] || match[2]); } catch { /* Use the safe fallback filename. */ }
  }
  filename = filename.replace(/[\\/\x00-\x1f]/g, "_");
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
