import { api } from "@/services/api";
import { isLogReferences, type LogInput } from "./model";

export interface ReferenceObject {
  id: number;
  kind: "sistem" | "aset";
  name: string;
  label: string;
}
export interface ReferenceData {
  bidang: { id: number; name: string };
  recorder: { id: number; name: string };
  employees: { id: number; name: string; position: string }[];
  objects: ReferenceObject[];
  canAccessAllBidang: boolean;
  bidangs: { id: number; name: string }[];
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Format data referensi tidak valid.");
  return value as Record<string, unknown>;
}
function rows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error("Format daftar referensi tidak valid.");
  return value.map(record);
}
function id(value: unknown): number {
  const parsed = typeof value === "string" && value.trim() ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed <= 0) throw new Error("ID referensi tidak valid.");
  return parsed;
}
function name(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Nama referensi belum lengkap. Hubungi pengelola master data.");
  return value.trim();
}
function payload(value: unknown): unknown {
  const response = record(value);
  if (response.success !== true) throw new Error("Data referensi gagal dimuat.");
  return response.data;
}

export async function loadReferences(userId: number, bidangId: number, signal?: AbortSignal, targetBidangId = bidangId): Promise<ReferenceData> {
  const options = { signal, timeout: 15000 };
  const [profileResponse, lookupResponse] = await Promise.all([
    api.get<unknown>("/me", options),
    api.get<unknown>("/smki/log-perubahan/lookup", { ...options, params: { bidang_id: targetBidangId } }),
  ]);
  const profile = record(profileResponse.data);
  if (profile.success !== true) throw new Error("Profil pengguna gagal dimuat.");
  const bidang = record(profile.bidang), recorder = record(profile.user);
  if (id(bidang.id) !== bidangId || id(recorder.id) !== userId) throw new Error("Profil atau bidang telah berubah. Muat ulang halaman.");
  const lookup = record(payload(lookupResponse.data));
  const target = record(lookup.bidang);
  if (id(target.id) !== targetBidangId) throw new Error("Bidang referensi tidak sesuai. Muat ulang halaman.");
  const objects = rows(lookup.objects).map((item): ReferenceObject => {
    if (item.kind !== "sistem" && item.kind !== "aset") throw new Error("Jenis objek referensi tidak valid.");
    return { id: id(item.id), kind: item.kind, name: name(item.name), label: name(item.label) };
  });
  return {
    bidang: { id: targetBidangId, name: name(target.name) },
    recorder: { id: userId, name: name(recorder.name) },
    employees: rows(lookup.employees).map(item => ({ id: id(item.id), name: name(item.name), position: typeof item.position === "string" ? item.position : "" })),
    objects,
    canAccessAllBidang: lookup.canAccessAllBidang === true,
    bidangs: rows(lookup.bidangs).map(item => ({ id: id(item.id), name: name(item.name) })),
  };
}

// Names remain snapshots for detail/DOCX, while IDs identify the selected master records.
export function bindReferences(input: LogInput, data: ReferenceData): LogInput {
  const ref = input.references;
  if (!isLogReferences(ref) || ref.bidangId !== data.bidang.id) {
    throw new Error("Lengkapi pilihan master data melalui Edit Draf.");
  }
  const object = data.objects.find(item => item.id === ref.objectId && item.kind === ref.objectKind);
  if (!object) throw new Error("Sistem/aset tidak tersedia untuk bidang ini. Pilih ulang melalui Edit Draf.");
  const employee = ref.executorId === null ? null : data.employees.find(item => item.id === ref.executorId);
  if (ref.executorId !== null && !employee) throw new Error("Pelaksana tidak tersedia di master pegawai. Pilih ulang melalui Edit Draf.");
  return { ...input, unit: data.bidang.name, system: object.label, executor: employee?.name ?? "", references: ref };
}
