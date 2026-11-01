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
}: {
  record: Fr021Evaluasi | null | undefined;
  form: Fr021FormState;
  onChange: (changes: Partial<Fr021FormState>) => void;
  onAjukan: () => void;
  ajukanBusy?: boolean;
  disabled?: boolean;
  onKembali?: () => void;
}) {
  const adminsQuery = useFr021AdminOptions();
  const admins = adminsQuery.data ?? [];

  const evaluatorSigned = Boolean(record?.tanggal_ttd_evaluator);
  const locked = disabled || record?.status === "diajukan" || record?.status === "selesai";

  return (
    <div className="space-y-4">
      {/* TTE Evaluator */}
      <TteBlock
        label="Evaluator"
        status={evaluatorSigned ? "sudah" : "belum"}
        nama={record?.ttd_evaluator_nama ?? null}
        nip={record?.ttd_evaluator_nip ?? null}
        tanggal={record?.tanggal_ttd_evaluator ?? null}
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
      </div>

      {/* TTE Mengetahui (pratinjau) */}
      <TteBlock
        label="Mengetahui (Atasan)"
        status="belum"
        nama={admins.find((a) => a.id === form.admin_id)?.name ?? null}
        tanggal={null}
      />

      {!locked && (
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
            {ajukanBusy ? "Mengajukan..." : "Tandatangani & Ajukan"}
          </Button>
        </div>
      )}
    </div>
  );
}
