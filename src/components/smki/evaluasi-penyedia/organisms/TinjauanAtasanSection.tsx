"use client";

import Button from "@/components/ui/Button";
import TteBlock from "../molecules/TteBlock";
import CatatanTinjauan from "../molecules/CatatanTinjauan";
import type { Fr021Evaluasi } from "@/services/smki/evaluasiPenyedia.types";

export default function TinjauanAtasanSection({
  record,
  catatan,
  onCatatanChange,
  onSetujui,
  onKembalikan,
  busy,
  canAct,
}: {
  record: Fr021Evaluasi | null | undefined;
  catatan: string;
  onCatatanChange: (value: string) => void;
  onSetujui: () => void;
  onKembalikan: () => void;
  busy?: boolean;
  canAct: boolean;
}) {
  const evaluatorSigned = Boolean(record?.tanggal_ttd_evaluator);
  const adminSigned = Boolean(record?.tanggal_ttd_admin);

  return (
    <div className="space-y-4">
      {/* Dua kartu TTE berdampingan (Evaluator & Mengetahui) */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-6">
        <TteBlock
          label="Evaluator"
          status={evaluatorSigned ? "sudah" : "belum"}
          nama={record?.ttd_evaluator_nama ?? null}
          nip={record?.ttd_evaluator_nip ?? null}
        />

        <TteBlock
          label="Mengetahui (Atasan)"
          status={adminSigned ? "sudah" : "belum"}
          nama={record?.ttd_admin_nama ?? null}
          nip={record?.ttd_admin_nip ?? null}
        />
      </div>

      {canAct && !adminSigned && (
        <CatatanTinjauan
          value={catatan}
          onChange={onCatatanChange}
          disabled={busy}
        />
      )}

      {canAct && !adminSigned && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onKembalikan}
            disabled={busy || !catatan.trim()}
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            {busy ? "Memproses..." : "Kembalikan untuk Revisi"}
          </Button>
          <Button type="button" onClick={onSetujui} disabled={busy}>
            {busy ? "Memproses..." : "Tandatangani & Selesaikan"}
          </Button>
        </div>
      )}

      {!canAct && (
        <p className="text-xs text-slate-500">
          Anda hanya dapat melihat evaluasi ini (bukan Atasan yang ditugaskan).
        </p>
      )}
    </div>
  );
}
