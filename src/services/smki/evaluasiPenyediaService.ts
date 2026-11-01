import axios from "axios";
import { api } from "@/services/api";
import * as mock from "./evaluasiPenyedia.mock";
import type {
  Fr021AjukanPayload,
  Fr021Errors,
  Fr021Evaluasi,
  Fr021IdentifikasiPayload,
  Fr021KembalikanPayload,
  Fr021ListParams,
  Fr021ListResponse,
  Fr021Log,
  Fr021Master,
  Fr021PenilaianPayload,
  Fr021Penyedia,
  Fr021PenyediaPayload,
  Fr021UserRef,
} from "./evaluasiPenyedia.types";

/**
 * Service API FR-021 — Evaluasi Kinerja Penyedia Barang/Jasa.
 *
 * Kontrak endpoint mengikuti PRD FR-021 §9. Selama backend belum siap,
 * set `NEXT_PUBLIC_FR021_MOCK=1` untuk memakai data mock.
 */

const endpoint = "/smki/evaluasi-penyedia";
const penyediaEndpoint = "/smki/penyedia";

const USE_MOCK = process.env.NEXT_PUBLIC_FR021_MOCK === "1";

/* ───────────────────────── Daftar & detail ───────────────────────── */

export async function getFr021List(
  params: Fr021ListParams
): Promise<Fr021ListResponse> {
  if (USE_MOCK) return mock.getFr021List(params);
  return (await api.get<Fr021ListResponse>(endpoint, { params })).data;
}

export async function getFr021(id: number): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.getFr021(id);
  return (await api.get<{ data: Fr021Evaluasi }>(`${endpoint}/${id}`)).data.data;
}

/* ───────────────────────── Step 1 — identifikasi ───────────────────────── */

export async function createFr021(
  payload: Fr021IdentifikasiPayload
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.createFr021(payload);
  return (await api.post<{ data: Fr021Evaluasi }>(endpoint, payload)).data.data;
}

export async function updateFr021Identifikasi(
  id: number,
  payload: Fr021IdentifikasiPayload
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.updateFr021Identifikasi(id, payload);
  return (
    await api.put<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/identifikasi`, payload)
  ).data.data;
}

/* ───────────────────────── Step 2 — penilaian ───────────────────────── */

export async function saveFr021Penilaian(
  id: number,
  payload: Fr021PenilaianPayload
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.saveFr021Penilaian(id, payload);
  return (
    await api.put<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/penilaian`, payload)
  ).data.data;
}

export async function hitungFr021(
  id: number,
  version?: number
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.hitungFr021(id);
  return (
    await api.post<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/hitung`, { version })
  ).data.data;
}

/* ───────────────────────── Step 3 — pengajuan ───────────────────────── */

export async function ajukanFr021(
  id: number,
  payload: Fr021AjukanPayload
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.ajukanFr021(id, payload);
  return (
    await api.post<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/ajukan`, payload)
  ).data.data;
}

/* ───────────────────────── Step 4 — tinjauan Atasan ───────────────────────── */

export async function setujuiFr021(
  id: number,
  version?: number
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.setujuiFr021(id);
  return (
    await api.post<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/setujui`, { version })
  ).data.data;
}

export async function kembalikanFr021(
  id: number,
  payload: Fr021KembalikanPayload
): Promise<Fr021Evaluasi> {
  if (USE_MOCK) return mock.kembalikanFr021(id, payload);
  return (
    await api.post<{ data: Fr021Evaluasi }>(`${endpoint}/${id}/kembalikan`, payload)
  ).data.data;
}

/* ───────────────────────── Riwayat ───────────────────────── */

export async function getFr021Riwayat(id: number): Promise<Fr021Log[]> {
  if (USE_MOCK) return mock.getFr021Riwayat(id);
  return (await api.get<{ data: Fr021Log[] }>(`${endpoint}/${id}/riwayat`)).data.data;
}

export async function getFr021Snapshot(
  id: number,
  logId: number
): Promise<Fr021Log> {
  if (USE_MOCK) return mock.getFr021Snapshot(id, logId);
  return (
    await api.get<{ data: Fr021Log }>(`${endpoint}/${id}/riwayat/${logId}/penilaian`)
  ).data.data;
}

/* ───────────────────────── Hapus draft ───────────────────────── */

export async function deleteFr021(id: number, version: number): Promise<void> {
  if (USE_MOCK) return mock.deleteFr021(id);
  await api.delete(`${endpoint}/${id}`, { data: { version } });
}

/* ───────────────────────── Master & lookup ───────────────────────── */

export async function getFr021Master(): Promise<Fr021Master> {
  if (USE_MOCK) return mock.getFr021Master();
  return (
    await api.get<{ data: Fr021Master }>(`${endpoint}/master`)
  ).data.data;
}

export async function getFr021Admins(): Promise<Fr021UserRef[]> {
  if (USE_MOCK) return mock.getFr021Admins();
  return (await api.get<{ data: Fr021UserRef[] }>(`${endpoint}/admins`)).data.data;
}

export async function lookupFr021Penyedia(q: string): Promise<Fr021Penyedia[]> {
  if (USE_MOCK) return mock.lookupFr021Penyedia(q);
  return (
    await api.get<{ data: Fr021Penyedia[] }>(penyediaEndpoint, {
      params: { q },
    })
  ).data.data;
}

export async function createFr021Penyedia(
  payload: Fr021PenyediaPayload
): Promise<Fr021Penyedia> {
  if (USE_MOCK) return mock.createFr021Penyedia(payload);
  return (
    await api.post<{ data: Fr021Penyedia }>(penyediaEndpoint, payload)
  ).data.data;
}

/* ───────────────────────── Normalisasi error ───────────────────────── */

/**
 * Ubah error axios menjadi `{ message, errors }` yang siap dipakai UI.
 * `errors` berisi pesan per field (respons 422 Laravel).
 */
export async function readFr021Error(
  error: unknown
): Promise<{ message: string; errors: Fr021Errors }> {
  if (axios.isAxiosError(error) || (error as { isAxiosError?: boolean })?.isAxiosError) {
    let body: unknown = (error as { response?: { data?: unknown } }).response?.data;
    if (body instanceof Blob) {
      try {
        body = JSON.parse(await body.text());
      } catch {
        body = null;
      }
    }
    if (body && typeof body === "object") {
      const response = body as { message?: string; errors?: Fr021Errors };
      return {
        message:
          response.message ||
          "Permintaan gagal. Periksa data dan hak akses Anda.",
        errors: response.errors || {},
      };
    }

    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      return { message: "Anda tidak berhak melakukan tindakan ini.", errors: {} };
    }
    if (status === 404) {
      return {
        message: "Evaluasi tidak ditemukan atau bukan milik Anda.",
        errors: {},
      };
    }
    if (status === 409) {
      return {
        message:
          "Status data telah berubah. Muat ulang halaman sebelum melanjutkan.",
        errors: {},
      };
    }
    return {
      message:
        "Tidak dapat menghubungi server. Data pada form tetap tersedia.",
      errors: {},
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan. Silakan coba lagi.",
    errors: {},
  };
}
