import axios from "axios";
import { api } from "@/services/api";
import type { BackupRestoreAttachment, BackupRestoreFilters, BackupRestoreLookup, BackupRestoreLookupParams, BackupRestorePage, BackupRestoreReport, BackupRestoreSignatory, SaveBackupRestorePayload } from "./backupRestore.types";

const endpoint = "/smki/backup-restore";
export const backupRestoreService = {
  async list(filters: BackupRestoreFilters): Promise<BackupRestorePage<BackupRestoreReport>> {
    return (await api.get(endpoint, { params: filters })).data.data;
  },
  async get(id: number): Promise<BackupRestoreReport> {
    return (await api.get(`${endpoint}/${id}`)).data.data;
  },
  async lookup(params: BackupRestoreLookupParams): Promise<BackupRestoreLookup> {
    return (await api.get(`${endpoint}/lookup`, { params })).data.data;
  },
  async create(payload: SaveBackupRestorePayload): Promise<BackupRestoreReport> {
    return (await api.post(endpoint, payload)).data.data;
  },
  async update(id: number, payload: SaveBackupRestorePayload): Promise<BackupRestoreReport> {
    return (await api.put(`${endpoint}/${id}`, payload)).data.data;
  },
  async delete(id: number, version: number): Promise<void> {
    await api.delete(`${endpoint}/${id}`, { data: { version } });
  },
  async uploadEvidence(reportId: number, entryId: number, file: File, version: number): Promise<{ attachment: BackupRestoreAttachment; version: number }> {
    const body = new FormData();
    body.append("file", file);
    body.append("version", String(version));
    return (await api.post(`${endpoint}/${reportId}/entries/${entryId}/attachments`, body)).data.data;
  },
  async downloadEvidence(reportId: number, attachmentId: number): Promise<Blob> {
    return (await api.get<Blob>(`${endpoint}/${reportId}/attachments/${attachmentId}`, { responseType: "blob" })).data;
  },
  async deleteEvidence(reportId: number, attachmentId: number, version: number): Promise<{ version: number }> {
    return (await api.delete(`${endpoint}/${reportId}/attachments/${attachmentId}`, { data: { version } })).data.data;
  },
  async specimen(reportId: number, role: BackupRestoreSignatory): Promise<Blob> {
    return (await api.get<Blob>(`${endpoint}/${reportId}/signatories/${role}/specimen`, { responseType: "blob" })).data;
  },
  async exportDocx(reportId: number): Promise<Blob> {
    return (await api.get<Blob>(`${endpoint}/${reportId}/export-docx`, { responseType: "blob" })).data;
  },
};

export async function readFr030Error(error: unknown): Promise<{ message: string; errors: Record<string, string[]>; status?: number }> {
  if (axios.isAxiosError(error)) {
    let body: unknown = error.response?.data;
    if (body instanceof Blob) {
      try { body = JSON.parse(await body.text()); } catch { body = null; }
    }
    const status = error.response?.status;
    const data = body && typeof body === "object" ? body as { message?: string; errors?: Record<string, string[]> } : {};
    return { status, message: data.message || (status === 409 ? "Data telah berubah. Isian Anda tetap tersedia; muat ulang setelah menyalin perubahan." : "Permintaan gagal. Periksa koneksi lalu coba kembali."), errors: data.errors ?? {} };
  }
  return { message: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba kembali.", errors: {} };
}
