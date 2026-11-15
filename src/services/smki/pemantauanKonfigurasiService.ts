// Service API modul FR-048 — Pemantauan Manajemen Konfigurasi.
// Set NEXT_PUBLIC_FR048_MOCK_API=true di .env.local untuk preview tanpa backend.
// Saat backend ready, set = false / hapus var; FE otomatis memanggil /api/smki/pemantauan-konfigurasi/*.
import { api } from "@/services/api";
import {
  mockAdminOptions,
  mockAjukan,
  mockCreateDraft,
  mockGetDetail,
  mockGetList,
  mockGetNilaiStandar,
  mockHapusDraft,
  mockKembalikan,
  mockListJenis,
  mockListObjek,
  mockJenisOptions,
  mockObjekOptions,
  mockPeriksaKesesuaian,
  mockSaveJenis,
  mockSaveKonfigurasi,
  mockSaveNilaiStandar,
  mockSaveObjek,
  mockSelesaikan,
  mockSummary,
  mockUpdateIdentifikasi,
} from "./mockPemantauanKonfigurasi";
import type {
  AdminOptionDto,
  AjukanPayload,
  IdentifikasiPayload,
  JenisKonfigurasiDto,
  KembalikanPayload,
  KonfigurasiItemDto,
  ListQuery,
  MasterJenisPayload,
  MasterObjekPayload,
  NilaiStandarDto,
  NilaiStandarRowPayload,
  ObjekDto,
  OptionDto,
  PaginatedDto,
  PemantauanDetailDto,
  PemantauanListItemDto,
  PemantauanSummaryDto,
} from "./pemantauanKonfigurasiService.types";

const USE_FR048_MOCK =
  process.env.NEXT_PUBLIC_FR048_MOCK_API === "true";

export interface Actor {
  id: number;
  name: string;
}

/** Ambil pesan error yang layak tampil dari error axios / Error biasa. */
export function getApiErrorMessage(err: unknown, fallback = "Terjadi kesalahan. Coba lagi."): string {
  if (err && typeof err === "object") {
    const anyErr = err as {
      response?: { data?: { message?: string; errors?: Record<string, string[] | string> } };
      message?: string;
    };
    const data = anyErr.response?.data;
    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first.length > 0) return String(first[0]);
      if (typeof first === "string") return first;
    }
    if (data?.message) return data.message;
    if (anyErr.message) return anyErr.message;
  }
  return fallback;
}

const unwrap = <T,>(res: { data: T | { success: boolean; data: T } }): T => {
  const body = res.data as { success?: boolean; data?: T };
  return body && typeof body === "object" && "data" in body ? (body.data as T) : (res.data as T);
};

// ─── List & summary ───────────────────────────────────────────────────────
export const getSummary = async (): Promise<PemantauanSummaryDto> => {
  if (USE_FR048_MOCK) return mockSummary();
  const res = await api.get("/smki/pemantauan-konfigurasi/summary");
  return unwrap<PemantauanSummaryDto>(res);
};

export const getList = async (query: ListQuery): Promise<PaginatedDto<PemantauanListItemDto>> => {
  if (USE_FR048_MOCK) return mockGetList(query);
  const res = await api.get("/smki/pemantauan-konfigurasi", { params: query });
  const body = res.data as {
    data?: PemantauanListItemDto[];
    meta?: PaginatedDto<PemantauanListItemDto>["meta"];
  };
  const rows = body.data ?? (Array.isArray(res.data) ? (res.data as PemantauanListItemDto[]) : []);
  const meta = body.meta ?? { page: query.page ?? 1, perPage: query.perPage ?? 10, total: rows.length, totalPages: 1 };
  return { data: rows, meta };
};

export const getDetail = async (id: number): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockGetDetail(id);
  const res = await api.get(`/smki/pemantauan-konfigurasi/${id}`);
  return unwrap<PemantauanDetailDto>(res);
};

// ─── Alur UC-01..UC-06 ────────────────────────────────────────────────────
export const createDraft = async (actor: Actor): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockCreateDraft(actor);
  const res = await api.post("/smki/pemantauan-konfigurasi", {});
  return unwrap<PemantauanDetailDto>(res);
};

export const updateIdentifikasi = async (id: number, payload: IdentifikasiPayload): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockUpdateIdentifikasi(id, payload);
  const res = await api.put(`/smki/pemantauan-konfigurasi/${id}/identifikasi`, payload);
  return unwrap<PemantauanDetailDto>(res);
};

export const saveKonfigurasi = async (id: number, items: KonfigurasiItemDto[]): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockSaveKonfigurasi(id, items);
  const res = await api.put(`/smki/pemantauan-konfigurasi/${id}/konfigurasi`, { items });
  return unwrap<PemantauanDetailDto>(res);
};

export const periksaKesesuaian = async (id: number): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockPeriksaKesesuaian(id);
  const res = await api.post(`/smki/pemantauan-konfigurasi/${id}/periksa`);
  return unwrap<PemantauanDetailDto>(res);
};

export const ajukan = async (id: number, payload: AjukanPayload, actor: Actor): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockAjukan(id, payload, actor);
  const res = await api.post(`/smki/pemantauan-konfigurasi/${id}/ajukan`, payload);
  return unwrap<PemantauanDetailDto>(res);
};

export const selesaikan = async (id: number, actor: Actor): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockSelesaikan(id, actor);
  const res = await api.post(`/smki/pemantauan-konfigurasi/${id}/selesaikan`, {});
  return unwrap<PemantauanDetailDto>(res);
};

export const kembalikan = async (id: number, payload: KembalikanPayload, actor: Actor): Promise<PemantauanDetailDto> => {
  if (USE_FR048_MOCK) return mockKembalikan(id, payload.catatan, actor);
  const res = await api.post(`/smki/pemantauan-konfigurasi/${id}/kembalikan`, payload);
  return unwrap<PemantauanDetailDto>(res);
};

export const hapusDraft = async (id: number): Promise<void> => {
  if (USE_FR048_MOCK) return mockHapusDraft(id);
  await api.delete(`/smki/pemantauan-konfigurasi/${id}`);
};

// ─── Lookup ───────────────────────────────────────────────────────────────
export const getJenisOptions = async (): Promise<OptionDto[]> => {
  if (USE_FR048_MOCK) return mockJenisOptions();
  const res = await api.get("/smki/pemantauan-konfigurasi/lookup/jenis");
  return unwrap<OptionDto[]>(res);
};

export const getObjekOptions = async (jenisId: number): Promise<OptionDto[]> => {
  if (USE_FR048_MOCK) return mockObjekOptions(jenisId);
  const res = await api.get("/smki/pemantauan-konfigurasi/lookup/objek", { params: { jenis_id: jenisId } });
  return unwrap<OptionDto[]>(res);
};

export const getAdminOptions = async (): Promise<AdminOptionDto[]> => {
  if (USE_FR048_MOCK) return mockAdminOptions();
  const res = await api.get("/smki/pemantauan-konfigurasi/lookup/admins");
  return unwrap<AdminOptionDto[]>(res);
};

// ─── Master (admin) ───────────────────────────────────────────────────────
export const listJenis = async (): Promise<JenisKonfigurasiDto[]> => {
  if (USE_FR048_MOCK) return mockListJenis();
  const res = await api.get("/smki/pemantauan-konfigurasi/master/jenis");
  return unwrap<JenisKonfigurasiDto[]>(res);
};

export const saveJenis = async (payload: MasterJenisPayload & { id?: number }): Promise<JenisKonfigurasiDto> => {
  if (USE_FR048_MOCK) return mockSaveJenis(payload);
  const res = payload.id
    ? await api.put(`/smki/pemantauan-konfigurasi/master/jenis/${payload.id}`, payload)
    : await api.post("/smki/pemantauan-konfigurasi/master/jenis", payload);
  return unwrap<JenisKonfigurasiDto>(res);
};

export const listObjek = async (): Promise<ObjekDto[]> => {
  if (USE_FR048_MOCK) return mockListObjek();
  const res = await api.get("/smki/pemantauan-konfigurasi/master/objek");
  return unwrap<ObjekDto[]>(res);
};

export const saveObjek = async (payload: MasterObjekPayload & { id?: number }): Promise<ObjekDto> => {
  if (USE_FR048_MOCK) return mockSaveObjek(payload);
  const res = payload.id
    ? await api.put(`/smki/pemantauan-konfigurasi/master/objek/${payload.id}`, payload)
    : await api.post("/smki/pemantauan-konfigurasi/master/objek", payload);
  return unwrap<ObjekDto>(res);
};

export const getNilaiStandar = async (objekId?: number): Promise<NilaiStandarDto[]> => {
  if (USE_FR048_MOCK) return mockGetNilaiStandar(objekId);
  const res = await api.get("/smki/pemantauan-konfigurasi/master/nilai-standar", { params: objekId ? { objek_id: objekId } : {} });
  return unwrap<NilaiStandarDto[]>(res);
};

export const saveNilaiStandar = async (objekId: number, rows: NilaiStandarRowPayload[]): Promise<NilaiStandarDto[]> => {
  if (USE_FR048_MOCK) return mockSaveNilaiStandar(objekId, rows);
  const res = await api.put(`/smki/pemantauan-konfigurasi/master/nilai-standar/${objekId}`, { rows });
  return unwrap<NilaiStandarDto[]>(res);
};
