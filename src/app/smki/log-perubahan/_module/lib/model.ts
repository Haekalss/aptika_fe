export const outcomes = ["Berhasil", "Berhasil Sebagian", "Gagal", "Dikembalikan ke Kondisi Semula"] as const;
export const defaultDocumentNumber = "FR-032/KOM.03.05/SANDIKAMI";
export type Outcome = (typeof outcomes)[number];
export interface Attachment { id: string; name: string; size: number; dataUrl: string }
export interface LogReferences {
  bidangId: number;
  recorderId: number;
  recorderName: string;
  executorId: number | null;
  objectKind: "sistem" | "aset";
  objectId: number;
}
export interface ChangeLog {
  documentNumber?: string; documentRevision?: string; documentEffectiveDate?: string;
  rfcNumber?: string; requestedBy?: string; requestedAt?: string; changeType?: string;
  priority?: string; productionImpact?: string; resultNotes?: string; releasedAt?: string;
  evaluationNotes?: string; issuedAt?: string; preparedBy?: string; approvedBy?: string;
  id: string; number: string; title: string; system: string;
  unit: string; executor: string; startedAt: string; endedAt: string;
  before: string; action: string; after: string; testing: string;
  outcome: Outcome | ""; obstacles: string; followUp: string; recovery: string;
  needsFollowUp: boolean; attachments: Attachment[]; status: "Draf" | "Tersimpan";
  createdAt: string; updatedAt: string;
  clientLogId?: string | null;
  references?: LogReferences;
}
export type LogInput = Omit<ChangeLog, "id" | "number" | "status" | "createdAt" | "updatedAt">;
export const emptyInput: LogInput = {
  documentNumber: defaultDocumentNumber, documentRevision: "", documentEffectiveDate: "",
  rfcNumber: "", requestedBy: "", requestedAt: "", changeType: "", priority: "",
  productionImpact: "", resultNotes: "", releasedAt: "", evaluationNotes: "",
  issuedAt: "", preparedBy: "", approvedBy: "",
  title: "", system: "", unit: "", executor: "", startedAt: "", endedAt: "",
  before: "", action: "", after: "", testing: "", outcome: "", obstacles: "", followUp: "",
  recovery: "", needsFollowUp: false, attachments: [],
};
export function isLogReferences(value: unknown): value is LogReferences {
  if (!value || typeof value !== "object") return false;
  const ref = value as Record<string, unknown>;
  const isId = (id: unknown) => typeof id === "number" && Number.isSafeInteger(id) && id > 0;
  return isId(ref.bidangId) && isId(ref.recorderId) && isId(ref.objectId)
    && (ref.executorId === null || isId(ref.executorId))
    && ["sistem", "aset"].includes(String(ref.objectKind))
    && typeof ref.recorderName === "string" && !!ref.recorderName.trim();
}
export function validateLog(input: LogInput, complete = false): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: (keyof LogInput)[] = complete
    ? ["documentNumber", "documentRevision", "documentEffectiveDate", "rfcNumber", "title", "requestedBy", "requestedAt", "changeType", "priority", "productionImpact", "executor", "resultNotes", "releasedAt", "evaluationNotes", "issuedAt", "preparedBy", "approvedBy", "system", "unit"]
    : ["title", "system"];
  for (const key of required) if (!String(input[key]).trim()) errors[key] = "Bagian ini wajib diisi.";
  for (const key of ["startedAt", "endedAt", "requestedAt", "releasedAt", "issuedAt", "documentEffectiveDate"] as const) {
    if (input[key] && Number.isNaN(new Date(input[key]).getTime())) errors[key] = "Waktu tidak valid.";
  }
  if (input.startedAt && input.endedAt && input.endedAt < input.startedAt) errors.endedAt = "Waktu selesai tidak boleh sebelum waktu mulai.";
  if (input.requestedAt && input.releasedAt && input.releasedAt < input.requestedAt) errors.releasedAt = "Tanggal rilis tidak boleh sebelum tanggal permintaan.";
  if (input.outcome && !outcomes.includes(input.outcome)) errors.outcome = "Pilih hasil pelaksanaan yang valid.";
  if (complete && !isLogReferences(input.references)) errors.system = "Pilih sistem/aset dari master data.";
  if (complete && !input.references?.executorId) errors.executor = "Pilih PIC dari master pegawai.";
  return errors;
}
export function formatTime(value: string): string {
  if (!value) return "Belum diisi";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })
    .format(new Date(value.length === 16 ? `${value}:00+07:00` : value));
}
