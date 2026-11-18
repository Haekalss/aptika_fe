import { api } from "@/services/api";

const BASE = "/smki/daftar-role";

export interface DaftarRoleParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface DaftarRoleLookup {
  bidangs: Array<{ id: number; name: string; code: string }>;
  employees: Array<{ id: number; name: string; nip: string; position: string }>;
}

/** Ambil daftar formulir FR-033 dari API (semua halaman). */
export const fetchDaftarRole = async (params?: DaftarRoleParams) => {
  const all: unknown[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await api.get(BASE, {
      params: { ...params, page, per_page: 100 },
      timeout: 15000,
    });
    if (!res.data?.success || !Array.isArray(res.data.data)) {
      throw new Error("Format respons daftar role tidak valid.");
    }
    all.push(...res.data.data);
    lastPage = Number(res.data.meta?.last_page ?? 1);
    page += 1;
  } while (page <= lastPage);
  return all;
};

export const fetchDaftarRoleLookup = async (): Promise<DaftarRoleLookup> => {
  const res = await api.get(`${BASE}/lookup`, { timeout: 15000 });
  if (!res.data?.success) throw new Error("Master daftar role gagal dimuat.");
  return res.data.data;
};

export const fetchDaftarRoleById = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createDaftarRole = async (payload: Record<string, unknown>) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateDaftarRole = async (id: string, payload: Record<string, unknown>) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteDaftarRole = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const downloadDaftarRoleDocx = async (id: string) => {
  const res = await api.get(`${BASE}/${id}/export-docx`, { responseType: "blob" });
  return res.data as Blob;
};
