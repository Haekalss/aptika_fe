"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, SearchCheck, Send, Undo2 } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuthStore";
import { ajukan, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import { useIdentifikasi } from "../hooks/useIdentifikasi";
import { useKonfigurasi } from "../hooks/useKonfigurasi";
import Fr048StepTabs, { type Fr048Step } from "../molecules/Fr048StepTabs";
import Fr048RevisionBanner from "../molecules/Fr048RevisionBanner";
import Fr048IdentitasDokumen from "../organisms/Fr048IdentitasDokumen";
import Fr048IdentifikasiForm from "../organisms/Fr048IdentifikasiForm";
import Fr048KonfigurasiEditor from "../organisms/Fr048KonfigurasiEditor";
import Fr048AjukanPanel from "../organisms/Fr048AjukanPanel";
import Fr048ReviewTable from "../organisms/Fr048ReviewTable";
import Fr048ResultPanel from "../molecules/Fr048ResultPanel";
import Fr048ConfirmDialog from "../atoms/Fr048ConfirmDialog";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";

/** Workspace pengisian pemantauan (draft/revisi) — 3 langkah: Identifikasi → Konfigurasi → Hasil. */
export default function Fr048WizardTemplate({
  detail,
  onSaved,
}: {
  detail: PemantauanDetailDto;
  onSaved: (d: PemantauanDetailDto) => void;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const actor = { id: user?.id ?? 0, name: user?.name ?? "" };
  const isRevisi = detail.status === "revisi";
  const [step, setStep] = useState<Fr048Step>(isRevisi ? "konfigurasi" : "identifikasi");

  const identifikasi = useIdentifikasi(detail, onSaved);
  const konfigurasi = useKonfigurasi(detail, onSaved);

  const [catatanTindakLanjut, setCatatanTindakLanjut] = useState(detail.catatanTindakLanjut);
  const [adminId, setAdminId] = useState<number | null>(detail.adminId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sinkronisasi prop detail → state lokal (adjust state during render)
  const [lastDetail, setLastDetail] = useState(detail);
  if (detail !== lastDetail) {
    setLastDetail(detail);
    setCatatanTindakLanjut(detail.catatanTindakLanjut);
    setAdminId(detail.adminId);
  }

  const identifikasiDone = detail.jenisKonfigurasiId > 0 && detail.objekList.length > 0 && detail.noFormulir.trim() !== "" && detail.noRevisi.trim() !== "" && Boolean(detail.tanggalBerlaku);
  const konfigurasiDone = konfigurasi.allFilled;

  const handleStep1Save = async () => {
    if (identifikasi.locked) { setStep("konfigurasi"); return; }
    const saved = await identifikasi.save();
    if (saved) setStep("konfigurasi");
  };

  const handlePeriksa = async () => {
    if (!konfigurasi.allFilled) {
      showToast.error("Seluruh baris wajib memiliki Nama Konfigurasi dan Nilai aktual sebelum pemeriksaan.");
      return;
    }
    const updated = await konfigurasi.periksa();
    if (updated) setStep("hasil");
  };

  const placeholderTidakSesuai = detail.objekList
    .flatMap((o) => o.items)
    .filter((i) => i.kesesuaian === "tidak_sesuai" && !i.keterangan.trim());

  const handleAjukan = async () => {
    if (!adminId) { showToast.error("Admin wajib dipilih."); return; }
    if (placeholderTidakSesuai.length > 0) {
      showToast.error(`Keterangan wajib diisi pada baris Tidak Sesuai: ${placeholderTidakSesuai.map((i) => i.namaKonfigurasi).join(", ")}.`);
      return;
    }
    if (detail.jumlahTidakSesuai > 0 && !catatanTindakLanjut.trim()) {
      showToast.error("Catatan Tindak Lanjut wajib diisi karena terdapat baris Tidak Sesuai.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await ajukan(
        detail.id,
        { adminId, catatanTindakLanjut: catatanTindakLanjut.trim() },
        actor
      );
      showToast.success(isRevisi ? "Pemantauan diajukan ulang dan menunggu peninjauan Admin." : "Pemantauan diajukan dan menunggu peninjauan Admin.");
      setConfirmOpen(false);
      onSaved(updated); // status → diajukan; halaman otomatis beralih ke mode detail
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal mengajukan pemantauan."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isRevisi && <Fr048RevisionBanner adminNama={detail.adminNama} catatan={detail.catatanAdmin} />}

      <Fr048StepTabs
        active={step}
        onChange={(s) => setStep(s)}
        completed={{ identifikasi: identifikasiDone, konfigurasi: konfigurasiDone, hasil: false }}
      />

      {/* ── Step 1 ── */}
      {step === "identifikasi" && (
        <>
          <Fr048IdentitasDokumen value={identifikasi.form} errors={identifikasi.errors} onChange={identifikasi.patch} locked={identifikasi.locked} />
          <Fr048IdentifikasiForm
            value={identifikasi.form}
            errors={identifikasi.errors}
            onChange={identifikasi.patch}
            pelaksanaNama={detail.pelaksanaNama}
            jenisOptions={identifikasi.jenisOptions}
            objekOptions={identifikasi.objekOptions}
            loadingObjek={identifikasi.loadingObjek}
            locked={identifikasi.locked}
          />
          <StickyFooter>
            <button type="button" onClick={() => router.push("/smki/pemantauan-konfigurasi")} className={btnSecondary}>
              <ArrowLeft size={14} /> Kembali
            </button>
            <button type="button" onClick={handleStep1Save} disabled={identifikasi.saving || identifikasi.locked} className={btnPrimary}>
              {identifikasi.saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {identifikasi.locked ? "Lihat Daftar Konfigurasi" : "Simpan & Lanjutkan"}
            </button>
          </StickyFooter>
        </>
      )}

      {/* ── Step 2 ── */}
      {step === "konfigurasi" && (
        <>
          <Fr048KonfigurasiEditor
            sections={konfigurasi.sections}
            readonly={false}
            onRowChange={konfigurasi.patchRow}
            onRowRemove={konfigurasi.removeRow}
            onAddRow={konfigurasi.addManualRow}
          />
          <StickyFooter>
            <button type="button" onClick={() => setStep("identifikasi")} disabled={isRevisi} className={`${btnSecondary} disabled:opacity-40`}>
              <Undo2 size={14} /> Identifikasi
            </button>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button type="button" onClick={() => konfigurasi.save()} disabled={konfigurasi.saving} className={btnSecondary}>
                {konfigurasi.saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Draf
              </button>
              <button type="button" onClick={handlePeriksa} disabled={konfigurasi.checking || !konfigurasi.allFilled} className={`${btnPrimary} disabled:opacity-40`} title={!konfigurasi.allFilled ? "Lengkapi semua baris terlebih dahulu" : undefined}>
                {konfigurasi.checking ? <Loader2 size={14} className="animate-spin" /> : <SearchCheck size={14} />} Periksa Kesesuaian
              </button>
            </div>
          </StickyFooter>
        </>
      )}

      {/* ── Step 3 ── */}
      {step === "hasil" && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 flex flex-col gap-4">
              <Fr048ResultPanel hasil={detail.hasil} jumlahSesuai={detail.jumlahSesuai} jumlahTidakSesuai={detail.jumlahTidakSesuai} />
              <Fr048ReviewTable objekList={detail.objekList} />
            </div>
            <div className="xl:col-span-1">
              <Fr048AjukanPanel
                hasil={detail.hasil}
                jumlahSesuai={detail.jumlahSesuai}
                jumlahTidakSesuai={detail.jumlahTidakSesuai}
                catatanTindakLanjut={catatanTindakLanjut}
                onCatatanChange={setCatatanTindakLanjut}
                adminId={adminId}
                onAdminChange={setAdminId}
                pelaksanaId={detail.pelaksanaId}
                pelaksanaNama={detail.ttdPelaksanaNama || detail.pelaksanaNama}
                adminNama={detail.ttdAdminNama || detail.adminNama}
                tanggalTtdPelaksana={detail.tanggalTtdPelaksana}
                tanggalTtdAdmin={detail.tanggalTtdAdmin}
              />
            </div>
          </div>
          <StickyFooter>
            <button type="button" onClick={() => setStep("konfigurasi")} className={btnSecondary}>
              <Undo2 size={14} /> Kembali ke Daftar Konfigurasi
            </button>
            <button type="button" onClick={() => setConfirmOpen(true)} className={btnPrimary}>
              <Send size={14} /> {isRevisi ? "Tandatangani & Ajukan Ulang" : "Tandatangani & Ajukan"}
            </button>
          </StickyFooter>
        </>
      )}

      {/* Konfirmasi pengajuan */}
      <Fr048ConfirmDialog
        open={confirmOpen}
        title={isRevisi ? "Ajukan Ulang Pemantauan?" : "Ajukan Pemantauan?"}
        message="Setelah diajukan, seluruh data terkunci dan menunggu peninjauan Admin yang dipilih. Tanda tangan dicatat sebagai nama pengguna dan waktu server. Pastikan hasil dan catatan sudah benar."
        confirmLabel={isRevisi ? "Ajukan Ulang" : "Ajukan"}
        variant="primary"
        loading={submitting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleAjukan}
      />
    </div>
  );
}

const btnPrimary =
  "h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold disabled:opacity-50 transition-colors";
const btnSecondary =
  "h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold transition-colors";

function StickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
      {children}
    </div>
  );
}
