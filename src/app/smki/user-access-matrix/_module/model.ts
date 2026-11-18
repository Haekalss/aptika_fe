export const MATRIX_STATUSES = ["Draf", "Tersimpan"] as const;
export type MatrixStatus = (typeof MATRIX_STATUSES)[number];

export interface RoleRow {
  id: string;
  role: string;
  access: string;
}

export interface MatrixInput {
  documentNumber: string;
  revision: string;
  effectiveDate: string;
  unit: string;
  roles: RoleRow[];
  note: string;
  city: string;
  documentDate: string;
  preparedById: string;
  preparedBy: string;
  preparedByNip: string;
  approvedById: string;
  approvedBy: string;
  approvedByNip: string;
}

export interface MatrixRecord extends MatrixInput {
  id: string;
  number: string;
  status: MatrixStatus;
  recorderId: number;
  recorderName: string;
  createdAt: string;
  updatedAt: string;
}

export type Errors = Record<string, string>;

export const DEFAULT_NOTE =
  "Role dapat ditambahkan sesuai dengan kondisi masing-masing Unit Kerja.";

export const blankRole = (): RoleRow => ({
  id: crypto.randomUUID(),
  role: "",
  access: "",
});

export function blankMatrix(unitName: string): MatrixInput {
  return {
    documentNumber: "FR-033/KOM.03.05/SANDIKAMI",
    revision: "0.0",
    effectiveDate: "",
    unit: unitName,
    roles: [blankRole(), blankRole()],
    note: DEFAULT_NOTE,
    city: "Bandung",
    documentDate: "",
    preparedById: "",
    preparedBy: "",
    preparedByNip: "",
    approvedById: "",
    approvedBy: "",
    approvedByNip: "",
  };
}

export function validateMatrix(input: MatrixInput, complete: boolean): Errors {
  const errors: Errors = {};
  const required: (keyof MatrixInput)[] = complete
    ? [
        "documentNumber",
        "revision",
        "effectiveDate",
        "unit",
        "documentDate",
        "city",
        "preparedById",
        "approvedById",
      ]
    : [];
  for (const key of required) {
    if (!String(input[key] ?? "").trim()) errors[key] = "Bagian ini wajib diisi.";
  }

  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  for (const key of ["effectiveDate", "documentDate"] as const) {
    if (input[key] && !validDate(input[key])) errors[key] = "Tanggal tidak valid.";
  }

  if (complete && !input.roles.some((row) => row.role.trim() || row.access.trim())) {
    errors.roles = "Tambahkan minimal satu role.";
  }
  input.roles.forEach((row, index) => {
    if (!row.role.trim() && !row.access.trim()) return;
    if (complete) {
      if (!row.role.trim()) errors[`roles.${index}.role`] = "Nama role wajib diisi.";
      if (!row.access.trim()) errors[`roles.${index}.access`] = "Akses pada sistem wajib diisi.";
    }
  });
  return errors;
}

export function formatDate(value: string, long = true): string {
  if (!value) return "Belum diisi";
  const date = new Date(
    value.length === 10 ? `${value}T00:00:00+07:00` : value,
  );
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: long ? "long" : "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function parseMatrices(raw: string | null): MatrixRecord[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Format penyimpanan formulir tidak valid.");
  return data.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Data formulir tidak valid.");
    const row = item as Record<string, unknown>;
    for (const key of [
      "id", "number", "documentNumber", "revision", "effectiveDate", "unit",
      "city", "documentDate", "recorderName", "createdAt", "updatedAt",
    ]) {
      if (typeof row[key] !== "string") throw new Error("Data formulir tidak lengkap.");
    }
    if (!MATRIX_STATUSES.includes(row.status as MatrixStatus)) {
      throw new Error("Status formulir tidak valid.");
    }
    if (!Array.isArray(row.roles)) throw new Error("Daftar role tidak valid.");
    const roles = row.roles.map((value: Record<string, unknown>) => {
      if (!value || typeof value !== "object") throw new Error("Baris role tidak valid.");
      return {
        id: typeof value.id === "string" ? value.id : blankRole().id,
        role: typeof value.role === "string" ? value.role : "",
        access: typeof value.access === "string" ? value.access : "",
      };
    });
    return {
      documentNumber: row.documentNumber as string,
      revision: row.revision as string,
      effectiveDate: row.effectiveDate as string,
      unit: row.unit as string,
      roles,
      note: typeof row.note === "string" ? row.note : DEFAULT_NOTE,
      city: typeof row.city === "string" ? row.city : "Bandung",
      documentDate: row.documentDate as string,
      preparedById: typeof row.preparedById === "string" ? row.preparedById : "",
      preparedBy: typeof row.preparedBy === "string" ? row.preparedBy : "",
      preparedByNip: typeof row.preparedByNip === "string" ? row.preparedByNip : "",
      approvedById: typeof row.approvedById === "string" ? row.approvedById : "",
      approvedBy: typeof row.approvedBy === "string" ? row.approvedBy : "",
      approvedByNip: typeof row.approvedByNip === "string" ? row.approvedByNip : "",
      id: row.id as string,
      number: row.number as string,
      status: row.status as MatrixStatus,
      recorderId: typeof row.recorderId === "number" ? row.recorderId : 0,
      recorderName: row.recorderName as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };
  });
}
