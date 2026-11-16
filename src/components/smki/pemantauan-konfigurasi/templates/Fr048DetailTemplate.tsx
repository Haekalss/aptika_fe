"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Info } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuthStore";
import {
  selesaikan,
  kembalikan,
  hapusDraft,
  getApiErrorMessage,
} from "@/services/smki/pemantauanKonfigurasiService";
import Fr048DetailHeader from "../organisms/Fr048DetailHeader";
import Fr048ReviewTable from "../organisms/Fr048ReviewTable";
import Fr048ResultPanel from "../molecules/Fr048ResultPanel";
import Fr048TteBlock from "../molecules/Fr048TteBlock";
import Fr048Timeline from "../organisms/Fr048Timeline";
import Fr048RevisionBanner from "../molecules/Fr048RevisionBanner";
import Fr048ConfirmDialog from "../atoms/Fr048ConfirmDialog";
import { formatTanggal, periodeLabel } from "../constants";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Mode baca detail pemantauan — untuk status diajukan / revisi (bukan pemilik) / selesai. */
export default function Fr048DetailTemplate({
  detail,
  onChanged,
}: {
  detail: PemantauanDetailDto;
  onChanged: () => void;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const actor = { id: user?.id ?? 0, name: user?.name ?? "" };
  const isAdmin = user?.role === "admin";
  const isAssignedAdmin = isAdmin && detail.adminId != null && detail.adminId === user?.id;
  const isOwner = user?.id != null && user.id === detail.pelaksanaId;

  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<"selesaikan" | "kembalikan" | "hapus" | null>(null);
  const [catatan, setCatatan] = useState("");

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      showToast.success(okMsg);
      setDialog(null);
      onChanged();
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal memproses aksi."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Fr048DetailHeader
        detail={detail}
        isAssignedAdmin={isAssignedAdmin}
        isOwner={isOwner}
        busy={busy}
        onSelesaikan={() => setDialog("selesaikan")}
        onKembalikan={() => { setCatatan(""); setDialog("kembalikan"); }}
        onHapus={() => setDialog("hapus")}
      />

      {detail.status === "revisi" && !isOwner && (
        <Fr048RevisionBanner adminNama={detail.adminNama} catatan={detail.catatanAdmin} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Kolom kiri: identitas + tabel kesesuaian */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 inline-flex items-center gap-1.5"><Info size={12} /> Identifikasi</h3>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <MetaItem label="No. Dokumen" value={detail.noFormulir || "—"} />
              <MetaItem label="No. Revisi" value={detail.noRevisi || "—"} />
              <MetaItem label="Tanggal Berlaku" value={formatTanggal(detail.tanggalBerlaku)} />
              <MetaItem label="Tanggal" value={formatTanggal(detail.tanggalPemantauan)} />
              <MetaItem label="Periode" value={periodeLabel(detail.periode)} />
              <MetaItem label="Jenis Konfigurasi" value={detail.jenisKonfigurasiNama} />
            </dl>
          </div>

          <Fr048ResultPanel hasil={detail.hasil} jumlahSesuai={detail.jumlahSesuai} jumlahTidakSesuai={detail.jumlahTidakSesuai} />
          <Fr048ReviewTable objekList={detail.objekList} />

          {detail.catatanTindakLanjut && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Catatan Tindak Lanjut (Pelaksana)</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{detail.catatanTindakLanjut}</p>
            </div>
          )}
          {detail.catatanAdmin && detail.status === "revisi" && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">Catatan Admin</h3>
              <p className="text-[11px] text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{detail.catatanAdmin}</p>
            </div>
          )}
        </div>

        {/* Kolom kanan: TTD + timeline */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fr048TteBlock label="Dibuat Oleh" nama={detail.ttdPelaksanaNama ?? detail.pelaksanaNama} signed={Boolean(detail.tanggalTtdPelaksana)} width={220} />
            <Fr048TteBlock label="Mengetahui" nama={detail.ttdAdminNama ?? detail.adminNama} signed={Boolean(detail.tanggalTtdAdmin)} width={220} />
          </div>
          <Fr048Timeline items={detail.riwayat} />
        </div>
      </div>

      {/* Dialog: Selesaikan */}
      <Fr048ConfirmDialog
        open={dialog === "selesaikan"}
        title="Selesaikan Pemantauan?"
        message="Anda menandatangani sebagai Admin (Mengetahui). Pemantauan akan terkunci permanen dan tidak dapat diubah atau dihapus."
        confirmLabel="Tandatangani & Selesaikan"
        variant="primary"
        loading={busy}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => selesaikan(detail.id, actor), "Pemantauan disetujui dan ditandatangani.")}
      />

      {/* Dialog: Kembalikan */}
      <Fr048ConfirmDialog
        open={dialog === "kembalikan"}
        title="Kembalikan untuk Revisi"
        message="Tuliskan catatan tinjauan untuk Pelaksana. Catatan wajib diisi."
        confirmLabel="Kembalikan"
        variant="warning"
        loading={busy}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => kembalikan(detail.id, { catatan: catatan.trim() }, actor), "Pemantauan dikembalikan untuk revisi.")}
      >
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={4}
          autoFocus
          placeholder="Catatan untuk Pelaksana..."
          aria-label="Catatan tinjauan"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </Fr048ConfirmDialog>

      {/* Dialog: Hapus draft */}
      <Fr048ConfirmDialog
        open={dialog === "hapus"}
        title="Hapus Draft"
        message="Draft pemantauan akan disembunyikan (soft delete)."
        confirmLabel="Hapus"
        variant="danger"
        loading={busy}
        onClose={() => setDialog(null)}
        onConfirm={() => run(async () => { await hapusDraft(detail.id); router.push("/smki/pemantauan-konfigurasi"); }, "Draft dihapus.")}
      />

      {busy && (
        <div className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold px-4 py-2 shadow-xl">
          <Loader2 size={13} className="animate-spin" /> Memproses...
        </div>
      )}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={value}>{value}</dd>
    </div>
  );
}
