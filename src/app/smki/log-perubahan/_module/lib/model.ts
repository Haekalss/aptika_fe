export const outcomes = ["Berhasil", "Berhasil Sebagian", "Gagal", "Dikembalikan ke Kondisi Semula"] as const;
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
  id: string; number: string; title: string; system: string;
  unit: string; executor: string; startedAt: string; endedAt: string;
  before: string; action: string; after: string; testing: string;
  outcome: Outcome | ""; obstacles: string; followUp: string; recovery: string;
  needsFollowUp: boolean; attachments: Attachment[]; status: "Draf" | "Final";
  createdAt: string; updatedAt: string; finalizedAt: string;
  clientLogId?: string | null;
  references?: LogReferences;
}
export type LogInput = Omit<ChangeLog, "id" | "number" | "status" | "createdAt" | "updatedAt" | "finalizedAt">;
export const emptyInput: LogInput = {
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
export function validateLog(input: LogInput, final = false): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: (keyof LogInput)[] = final
    ? ["title", "system", "unit", "executor", "startedAt", "endedAt", "before", "action", "after", "testing", "outcome"]
    : ["title", "system"];
  for (const key of required) if (!String(input[key]).trim()) errors[key] = "Bagian ini wajib diisi.";
  for (const key of ["startedAt", "endedAt"] as const) {
    if (input[key] && Number.isNaN(new Date(input[key]).getTime())) errors[key] = "Waktu tidak valid.";
  }
  if (input.startedAt && input.endedAt && input.endedAt < input.startedAt) errors.endedAt = "Waktu selesai tidak boleh sebelum waktu mulai.";
  if (input.outcome && !outcomes.includes(input.outcome)) errors.outcome = "Pilih hasil pelaksanaan yang valid.";
  if (final && input.needsFollowUp && !input.followUp.trim()) errors.followUp = "Jelaskan tindak lanjut yang diperlukan.";
  if (final && !isLogReferences(input.references)) errors.system = "Pilih ulang sistem/aset dari master melalui Edit Draf.";
  if (final && !input.references?.executorId) errors.executor = "Pilih pelaksana dari master pegawai.";
  return errors;
}
export function saveDraft(input: LogInput, previous?: ChangeLog): ChangeLog {
  if (previous?.status === "Final") throw new Error("Log Final tidak dapat diubah.");
  if (Object.keys(validateLog(input)).length) throw new Error("Lengkapi judul dan sistem/aset serta periksa waktu pelaksanaan.");
  const now = new Date().toISOString();
  const id = previous?.id ?? crypto.randomUUID();
  return { ...input, id, number: previous?.number ?? `LOG-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`,
    status: "Draf", createdAt: previous?.createdAt ?? now, updatedAt: now, finalizedAt: "" };
}
export function finalizeLog(log: ChangeLog): ChangeLog {
  if (log.status !== "Draf") throw new Error("Log sudah Final.");
  if (Object.keys(validateLog(log, true)).length) throw new Error("Lengkapi seluruh data pelaksanaan sebelum finalisasi.");
  const now = new Date().toISOString();
  return { ...log, status: "Final", finalizedAt: now, updatedAt: now };
}
export function deleteDraft(logs: ChangeLog[], id: string): ChangeLog[] {
  const log = logs.find(item => item.id === id);
  if (!log) throw new Error("Log tidak ditemukan.");
  if (log.status === "Final") throw new Error("Log Final tidak dapat dihapus.");
  return logs.filter(item => item.id !== id);
}
export function formatTime(value: string): string {
  if (!value) return "Belum diisi";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })
    .format(new Date(value.length === 16 ? `${value}:00+07:00` : value));
}
