import { api } from "@/services/api";

export type MatrixPeran = "Kordinator" | "Team Teknis";

export interface MatrixRoleRow {
  id?: number;
  unit_label: string;
  peran: MatrixPeran;
  levels: number[];
}

export interface MatrixEmployeeRow {
  id?: number;
  aset_sdm_id?: number | null;
  nama: string;
  nip?: string | null;
  jabatan: string;
  peran: MatrixPeran;
  levels: number[];
  gap?: (number | null)[];
  usulan_training?: string | null;
}

export interface MatrixTrainingRow {
  id?: number;
  nama: string;
  jabatan: string;
  usulan_training: string;
}

export interface MatrixDocument {
  id: number;
  nomor_dokumen?: string | null;
  no_revisi?: string | null;
  tanggal_berlaku?: string | null;
  nama_unit_kerja?: string | null;
  competencies: string[];
  roles: MatrixRoleRow[];
  employees: MatrixEmployeeRow[];
  trainings: MatrixTrainingRow[];
  created_at?: string;
  updated_at?: string;
}

export interface MatrixDocumentSummary {
  id: number;
  nomor_dokumen?: string | null;
  no_revisi?: string | null;
  tanggal_berlaku?: string | null;
  nama_unit_kerja?: string | null;
  jumlah_kompetensi: number;
  roles_count: number;
  employees_count: number;
  trainings_count: number;
  updated_at?: string;
}

export interface MatrixLookup {
  peran: MatrixPeran[];
  legend: string[];
  default_competencies: string[];
  pegawai: { id: number; nama: string; nip: string; jabatan: string; unit_kerja_id: number }[];
  unit_kerja: { id: number; nama: string }[];
}

export interface MatrixPayload {
  nomor_dokumen?: string | null;
  no_revisi?: string | null;
  tanggal_berlaku?: string | null;
  nama_unit_kerja?: string | null;
  competencies: string[];
  roles: { unit_label: string; peran: MatrixPeran; levels: number[] }[];
  employees: {
    aset_sdm_id?: number | null;
    nama: string;
    nip?: string | null;
    jabatan: string;
    peran: MatrixPeran;
    levels: number[];
    usulan_training?: string | null;
  }[];
  trainings: { nama: string; jabatan: string; usulan_training: string }[];
}

const BASE = "/smki/matrix-competency";

export const DEFAULT_COMPETENCIES = [
  "K-01", "K-02", "K-03", "K-04", "K-05", "K-06", "K-07", "K-08",
  "K-09", "K-10", "K-11", "K-12", "K-13", "K-14", "K-15", "K-16",
];

export const DEFAULT_SMKI_UNITS = [
  "SMKI Sekretariat Dinas",
  "SMKI Bidang E-Government",
  "SMKI Bidang Aplikasi Informatika",
  "SMKI Bidang Informasi dan Komunikasi Publik",
  "SMKI Bidang Persandian dan Keamanan Informasi",
  "SMKI Bidang Statistik",
  "SMKI UPT Pusat Layanan Digital, Data, Dan Informasi Geospasial (PLDDIG)",
];

export const DEFAULT_KORDINATOR_LEVELS = [3, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 2, 3, 4, 4, 4];
export const DEFAULT_TEAM_TEKNIS_LEVELS = [3, 2, 2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 3, 2, 2];

export const DEFAULT_EMPLOYEE_LEVELS: { peran: MatrixPeran; levels: number[] }[] = [
  { peran: "Kordinator", levels: [3, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 2, 3, 4, 4] },
  { peran: "Team Teknis", levels: [3, 3, 3, 3, 2, 3, 3, 2, 2, 2, 2, 2, 2, 4, 2, 3] },
  { peran: "Team Teknis", levels: [3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 2, 2, 2, 4, 2, 3] },
  { peran: "Team Teknis", levels: [3, 3, 2, 2, 2, 2, 3, 2, 3, 3, 2, 2, 2, 4, 2, 3] },
  { peran: "Team Teknis", levels: [3, 3, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 2, 4, 2, 3] },
  { peran: "Team Teknis", levels: [3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 3, 4, 2, 3] },
];

export function buildDefaultEmployees(compCount: number = DEFAULT_COMPETENCIES.length): MatrixEmployeeRow[] {
  const fit = (base: number[]) =>
    Array.from({ length: compCount }, (_, i) => base[i] ?? base[base.length - 1] ?? 0);

  return DEFAULT_EMPLOYEE_LEVELS.map((row) => ({
    aset_sdm_id: null,
    nama: "",
    nip: "",
    jabatan: row.peran,
    peran: row.peran,
    levels: fit(row.levels),
    usulan_training: "",
  }));
}

export const LEVEL_LEGEND = [
  { level: 0, text: "0 - Tidak perlu memiliki pengetahuan", bg: "bg-[#FF99CC] text-slate-900 border-pink-300" },
  { level: 1, text: "1 - Harus memiliki pengetahuan dasar", bg: "bg-[#FFFF99] text-slate-900 border-amber-300" },
  { level: 2, text: "2 - Harus dilakukan dengan dukungan", bg: "bg-white text-slate-800 border-slate-200" },
  { level: 3, text: "3 - Harus memiliki pengetahuan & melakukannya secara mandiri", bg: "bg-white text-slate-800 border-slate-200" },
  { level: 4, text: "4 - Harus pandai teori dan praktis dan bisa melatih", bg: "bg-[#00FF00] text-slate-900 border-emerald-400" },
];

export function buildDefaultRoles(compCount: number = DEFAULT_COMPETENCIES.length): MatrixRoleRow[] {
  const fit = (base: number[]) =>
    Array.from({ length: compCount }, (_, i) => base[i] ?? base[base.length - 1] ?? 0);

  return DEFAULT_SMKI_UNITS.flatMap((unit_label) => [
    { unit_label, peran: "Kordinator" as const, levels: fit(DEFAULT_KORDINATOR_LEVELS) },
    { unit_label, peran: "Team Teknis" as const, levels: fit(DEFAULT_TEAM_TEKNIS_LEVELS) },
  ]);
}

export const LEVEL_OPTIONS = [0, 1, 2, 3, 4];

export async function getMatrixList(params?: { search?: string; page?: number; per_page?: number }) {
  const res = await api.get(BASE, { params });
  return res.data as {
    success: boolean;
    data: MatrixDocumentSummary[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
    stats?: { total_dokumen: number; total_roles: number; total_employees: number };
  };
}

export async function getMatrixLookup(): Promise<MatrixLookup> {
  const res = await api.get(`${BASE}/lookup`);
  return res.data.data as MatrixLookup;
}

export async function getMatrixDetail(id: number | string): Promise<MatrixDocument> {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data as MatrixDocument;
}

export async function createMatrix(payload: MatrixPayload): Promise<MatrixDocument> {
  const res = await api.post(BASE, payload);
  return res.data.data as MatrixDocument;
}

export async function updateMatrix(id: number | string, payload: MatrixPayload): Promise<MatrixDocument> {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data.data as MatrixDocument;
}

export async function deleteMatrix(id: number | string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

/** Gap = level pegawai - level standar peran yang sama (dalam dokumen yang sama). */
export function calcGap(levels: number[], standard: number[] | null | undefined): (number | null)[] {
  if (!standard) return levels.map(() => null);
  return levels.map((v, i) => {
    const s = standard[i];
    if (v === null || v === undefined || s === null || s === undefined) return null;
    return Number(v) - Number(s);
  });
}

export function standardForPeran(
  roles: MatrixRoleRow[],
  peran: MatrixPeran,
  unitKerja?: string | null
): number[] | null {
  const target = (unitKerja ?? "").trim().toLowerCase();
  if (target) {
    const matched = roles.find((r) => {
      if (r.peran !== peran) return false;
      const u = (r.unit_label ?? "").trim().toLowerCase();
      return u === target || u.includes(target) || target.includes(u);
    });
    if (matched) return matched.levels;
  }
  const found = roles.find((r) => r.peran === peran);
  return found ? found.levels : null;
}

export const errMsg = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0]?.[0];
    if (first) return first;
  }
  return data?.message || (err as Error)?.message || fallback;
};
