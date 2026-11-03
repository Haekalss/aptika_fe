export const userStatuses = ["Aktif", "Tidak Aktif"] as const;
export interface ReviewAccount {
  id: string; username: string; currentAccess: string; userStatus: (typeof userStatuses)[number] | "";
}
export interface ReviewInput {
  documentNumber: string; documentRevision: string; documentEffectiveDate: string;
  title: string; periodStart: string; periodEnd: string; reviewDate: string;
  bidangId: number; bidangName: string; objectId: string; objectName: string;
  reviewerId: string; reviewer: string; followUp: string;
  location: string; signedAt: string; preparedBy: string; acknowledgedBy: string;
  accounts: ReviewAccount[];
}
export interface Review extends ReviewInput {
  id: string; number: string; status: "Draf" | "Tersimpan";
  recorderId: number; recorderName: string; createdAt: string; updatedAt: string;
}
export type Errors = Record<string, string>;
export const blankAccount = (): ReviewAccount => ({ id: crypto.randomUUID(), username: "", currentAccess: "", userStatus: "" });
export function blankReview(bidangId: number, bidangName: string): ReviewInput {
  return { documentNumber: "FR-034/KOM.03.05/SANDIKAMI", documentRevision: "1.0", documentEffectiveDate: "",
    title: "Review Hak Akses", periodStart: "", periodEnd: "", reviewDate: "", bidangId, bidangName,
    objectId: "", objectName: "", reviewerId: "", reviewer: "", followUp: "",
    location: "Bandung", signedAt: "", preparedBy: "", acknowledgedBy: "", accounts: [blankAccount()] };
}
export function validateReview(input: ReviewInput, complete: boolean): Errors {
  const errors: Errors = {};
  const required: (keyof ReviewInput)[] = complete
    ? ["documentNumber", "documentRevision", "documentEffectiveDate", "periodStart", "periodEnd", "reviewDate", "objectId", "reviewerId", "location", "signedAt", "preparedBy", "acknowledgedBy"] : [];
  for (const key of required) if (!String(input[key] ?? "").trim()) errors[key] = "Bagian ini wajib diisi.";
  const dateValid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  for (const key of ["documentEffectiveDate", "periodStart", "periodEnd", "reviewDate", "signedAt"] as const) {
    if (input[key] && !dateValid(input[key])) errors[key] = "Tanggal tidak valid.";
  }
  if (input.periodStart && input.periodEnd && input.periodEnd < input.periodStart) errors.periodEnd = "Akhir periode tidak boleh sebelum awal periode.";
  if (complete && !input.accounts.length) errors.accounts = "Tambahkan minimal satu pengguna yang direview.";
  const seen = new Set<string>();
  input.accounts.forEach((account, index) => {
    if (complete) for (const key of ["username", "currentAccess", "userStatus"] as const) {
      if (!account[key].trim()) errors[`accounts.${index}.${key}`] = "Bagian ini wajib diisi.";
    }
    if (account.userStatus && !userStatuses.includes(account.userStatus)) errors[`accounts.${index}.userStatus`] = "Pilih Aktif atau Tidak Aktif.";
    const identity = account.username.trim().toLocaleLowerCase("id");
    if (identity) {
      if (seen.has(identity)) errors[`accounts.${index}.username`] = "User ID sudah dicatat pada baris lain.";
      seen.add(identity);
    }
  });
  return errors;
}
export function formatDate(value: string): string {
  if (!value) return "Belum diisi";
  const date = new Date(value.length === 10 ? `${value}T00:00:00+07:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", {dateStyle: "long", timeZone: "Asia/Jakarta"}).format(date);
}
// Read older records without guessing account activity from the previous review decision.
export function parseReviews(raw: string | null): Review[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Format penyimpanan review tidak valid.");
  return data.map(item => {
    if (!item || typeof item !== "object") throw new Error("Data review tidak valid.");
    for (const key of ["id", "number", "title", "documentNumber", "documentRevision", "documentEffectiveDate", "periodStart", "periodEnd", "reviewDate", "bidangName", "reviewer", "recorderName", "createdAt", "updatedAt"]) {
      if (typeof item[key] !== "string") throw new Error("Data review tidak lengkap.");
    }
    if (!["Draf", "Tersimpan"].includes(item.status) || typeof item.bidangId !== "number" || typeof item.recorderId !== "number" || !Array.isArray(item.accounts)) throw new Error("Identitas review tidak valid.");
    const legacy = item.objectId === undefined;
    const accounts = item.accounts.map((account: Record<string, unknown>) => {
      if (!account || typeof account !== "object" || ["id", "username", "currentAccess"].some(key => typeof account[key] !== "string")) throw new Error("Data pengguna tidak valid.");
      if (account.userStatus !== undefined && account.userStatus !== "" && !userStatuses.includes(account.userStatus as typeof userStatuses[number])) throw new Error("Status pengguna tidak valid.");
      return {...account, userStatus: account.userStatus ?? ""} as unknown as ReviewAccount;
    });
    const oldSystems = new Map<string, string>();
    if (legacy) for (const account of item.accounts) {
      if (typeof account.systemId === "string" && account.systemId && typeof account.systemName === "string") oldSystems.set(account.systemId, account.systemName);
    }
    const [objectId, objectName] = oldSystems.size === 1 ? [...oldSystems][0] : ["", ""];
    const result = {
      ...item, accounts, reviewerId: item.reviewerId ?? "",
      objectId: item.objectId ?? objectId, objectName: item.objectName ?? objectName,
      followUp: item.followUp ?? "", location: item.location ?? "Bandung", signedAt: item.signedAt ?? "",
      preparedBy: item.preparedBy ?? item.recorderName, acknowledgedBy: item.acknowledgedBy ?? "",
      status: legacy ? "Draf" : item.status,
    };
    for (const key of ["reviewerId", "objectId", "objectName", "followUp", "location", "signedAt", "preparedBy", "acknowledgedBy"]) {
      if (typeof result[key] !== "string") throw new Error("Isian review tidak valid.");
    }
    return result as Review;
  });
}
