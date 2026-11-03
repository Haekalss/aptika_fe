"use client";

import Button from "@/components/ui/Button";
import { useFr021AdminOptions } from "../hooks/useFr021Queries";
import TteBlock from "../molecules/TteBlock";
import type { Fr021Evaluasi } from "@/services/smki/evaluasiPenyedia.types";
import type { Fr021FormState } from "../types";

export default function PengajuanSection({
  record,
  form,
  onChange,
  onAjukan,
  ajukanBusy,
  disabled,
  onKembali,
  mode = "ajukan",
}: {
  record: Fr021Evaluasi | null | undefined;
  form: Fr021FormState;
  onChange: (changes: Partial<Fr021FormState>) => void;
  onAjukan: () => void;
  ajukanBusy?: boolean;
  disabled?: boolean;
  onKembali?: () => void;
  /** ajukan = pembuat mengajukan; lihat = read-only. */
  mode?: "ajukan" | "lihat";
}) {
  const adminsQuery = useFr021AdminOptions();
  const admins = adminsQuery.data ?? [];

  // Evaluator = perwakilan vendor dari Langkah 1 (otomatis, tanpa akun login).
  const vendorNama =
    form.penyedia_nama || record?.penyedia?.nama_penyedia || null;
  const vendorKontak =
    form.contact_person || record?.penyedia?.contact_person || null;
  const evaluatorSigned = Boolean(record?.tanggal_ttd_evaluator);
  const adminSigned = Boolean(record?.tanggal_ttd_admin);
  const locked = disabled || record?.status === "diajukan" || record?.status === "selesai";

  return (
    <div className="space-y-4">
      {/* Evaluator (perwakilan penyedia jasa) */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
          Evaluator (Perwakilan Penyedia Jasa)
        </label>
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-100">
          <p className="font-semibold">{vendorNama ?? "—"}</p>
          <p className="text-xs text-slate-500">
            {vendorKontak ?? "—"}
            {form.email || record?.penyedia?.email
              ? ` · ${form.email || record?.penyedia?.email}`
              : ""}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Otomatis dari penyedia jasa yang diisi pada Langkah 1.
        </p>
      </div>

      {/* TTE Evaluator */}
      <TteBlock
        label="Evaluator"
        status={evaluatorSigned ? "sudah" : "belum"}
        nama={record?.ttd_evaluator_nama ?? vendorKontak}
        nip={evaluatorSigned ? record?.ttd_evaluator_nip : null}
        tanggal={evaluatorSigned ? record?.tanggal_ttd_evaluator : null}
      />

      {/* Pilih Atasan */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
          Atasan (Mengetahui)
        </label>
        <select
          value={form.admin_id ?? ""}
          onChange={(event) =>
            onChange({ admin_id: event.target.value ? Number(event.target.value) : null })
          }
          disabled={locked}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:opacity-60"
        >
          <option value="">— Pilih Atasan —</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
              {admin.position ? ` — ${admin.position}` : ""}
            </option>
          ))}
        </select>
        {adminsQuery.isLoading && (
          <p className="mt-1 text-[11px] text-slate-400">Memuat daftar Atasan...</p>
        )}
        {adminsQuery.isError && (
          <p className="mt-1 text-[11px] text-red-500">
            Gagal memuat daftar Atasan. Coba muat ulang halaman.
          </p>
        )}
        {!adminsQuery.isLoading && !adminsQuery.isError && admins.length === 0 && (
          <p className="mt-1 text-[11px] text-amber-600">
            Tidak ada akun Admin yang tersedia. Pastikan ada akun Admin (role=admin, aktif)
            di sistem, lalu muat ulang.
          </p>
        )}
      </div>

      {/* TTE Mengetahui (pratinjau sebelum diajukan, status nyata sesudahnya) */}
      <TteBlock
        label="Mengetahui (Atasan)"
        status={adminSigned ? "sudah" : "belum"}
        nama={
          adminSigned
            ? record?.ttd_admin_nama
            : (admins.find((a) => a.id === form.admin_id)?.name ?? null)
        }
        nip={adminSigned ? record?.ttd_admin_nip : null}
        tanggal={adminSigned ? record?.tanggal_ttd_admin : null}
      />

      {!locked && mode === "ajukan" && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {onKembali && (
            <Button type="button" variant="outline" onClick={onKembali}>
              Kembali ke Penilaian
            </Button>
          )}
          <Button
            type="button"
            onClick={onAjukan}
            disabled={!form.admin_id || ajukanBusy}
          >
            {ajukanBusy ? "Mengajukan..." : "Ajukan ke Atasan"}
          </Button>
        </div>
      )}

      {!locked && mode === "lihat" && (
        <p className="text-xs text-slate-500">
          Anda hanya dapat melihat evaluasi ini.
        </p>
      )}
    </div>
  );
}
