import type { BackupRestoreAsset, BackupRestoreEntry, BackupRestoreReport, Fr030FormState, SaveBackupRestorePayload } from "@/services/smki/backupRestore.types";
import type { TtePegawai } from "@/services/tteService";

export function fr030SignerIdentity(role: "pelaksana" | "penanggung_jawab", id: number | null, options: TtePegawai[], saved?: BackupRestoreReport, refresh = false) {
  const fields = ["nama", "nip", "jabatan", "pangkat"] as const;
  const historical = Boolean(!refresh && saved && id === saved[`${role}_pegawai_id`] && (id !== null || fields.some(field => saved[`${role}_${field}`]?.trim())));
  const master = options.find(option => option.id === id);
  const values = Object.fromEntries(fields.map(field => [field, historical ? saved?.[`${role}_${field}`] : master?.[field]])) as Record<typeof fields[number], string | null | undefined>;
  return { ...values, historical, missing: fields.filter(field => !values[field]?.trim()).map(field => field === "nip" ? "NIP" : field) };
}

export function filledFr030Entries(entries: BackupRestoreEntry[]): BackupRestoreEntry[] {
  return entries.filter(entry => entry.result || entry.performed_on || entry.notes?.trim() || entry.attachments.length);
}

export function fr030EntrySummary(entry?: BackupRestoreEntry): string {
  if (!entry || !filledFr030Entries([entry]).length) return "Belum dicatat";
  const result = entry.result === "berhasil" ? "Berhasil" : entry.result === "gagal" ? "Gagal" : "";
  return entry.result && entry.performed_on ? result : result ? `${result} · Belum lengkap` : "Belum lengkap";
}

export function createEmptyFr030Form(year: number): Fr030FormState {
  return { tahun: year, nomor_dokumen: "FR-030/KOM.03.05/SANDIKAMI", nomor_revisi: "1.0", tanggal_terbit: "", pelaksana_pegawai_id: null, penanggung_jawab_pegawai_id: null, assets: [] };
}

export function createFr030Asset(): BackupRestoreAsset {
  return { client_key: crypto.randomUUID(), aset_ti_id: null, virtual_instance_id: null, kode_aset: "", nama_aset: "", entries: [] };
}

export function hydrateFr030Form(report: BackupRestoreReport): Fr030FormState {
  return {
    tahun: report.tahun, version: report.version,
    nomor_dokumen: report.nomor_dokumen ?? "", nomor_revisi: report.nomor_revisi ?? "", tanggal_terbit: report.tanggal_terbit ?? "",
    pelaksana_pegawai_id: report.pelaksana_pegawai_id, penanggung_jawab_pegawai_id: report.penanggung_jawab_pegawai_id,
    assets: structuredClone(report.assets ?? []),
  };
}

export function buildFr030Payload(state: Fr030FormState, finalize: boolean): SaveBackupRestorePayload {
  return {
    ...(state.version === undefined ? {} : { version: state.version }),
    ...(state.refresh_signatories?.length ? { refresh_signatories: state.refresh_signatories } : {}),
    tahun: state.tahun, nomor_dokumen: state.nomor_dokumen.trim(), nomor_revisi: state.nomor_revisi.trim(), tanggal_terbit: state.tanggal_terbit || null,
    pelaksana_pegawai_id: state.pelaksana_pegawai_id, penanggung_jawab_pegawai_id: state.penanggung_jawab_pegawai_id, finalize,
    assets: state.assets.map(asset => ({
      ...(asset.id ? { id: asset.id } : {}), client_key: asset.client_key,
      aset_ti_id: asset.aset_ti_id, virtual_instance_id: asset.virtual_instance_id,
      kode_aset: asset.kode_aset?.trim() || null, nama_aset: asset.nama_aset?.trim() || null,
      entries: filledFr030Entries(asset.entries).map(entry => ({
        ...(entry.id ? { id: entry.id } : {}), month: entry.month, operation: entry.operation,
        result: entry.result, performed_on: entry.performed_on || null, notes: entry.notes?.trim() || null,
      })),
    })),
  };
}
