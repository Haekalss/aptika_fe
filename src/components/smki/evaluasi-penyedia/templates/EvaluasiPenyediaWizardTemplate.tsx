"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { exportEvaluasiPenyediaDocx } from "@/services/smki/exportEvaluasiPenyediaDocx";
import { FileDown, Loader2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useFr021Master, useFr021Detail, useFr021Mutations } from "../hooks/useFr021Queries";
import { useFr021Form } from "../hooks/useFr021Form";
import { readFr021Error } from "@/services/smki/evaluasiPenyediaService";
import { toIdentifikasiPayload, toPenilaianPayload } from "../form";
import { isPenilaianComplete } from "../form";
import { FR021_STEPS, FR021_STEP_INDEX } from "../constants";
import type { Fr021Step } from "../constants";
import EvaluasiStepper from "../molecules/EvaluasiStepper";
import IdentifikasiSection from "../organisms/IdentifikasiSection";
import PenilaianSection from "../organisms/PenilaianSection";
import RevisiBanner from "../organisms/RevisiBanner";
import RiwayatPanel from "../organisms/RiwayatPanel";
import HasilSection from "../organisms/HasilSection";
import PengajuanSection from "../organisms/PengajuanSection";

export default function EvaluasiPenyediaWizardTemplate() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const id = params?.id ? Number(params.id) : undefined;

  const masterQuery = useFr021Master();
  const detailQuery = useFr021Detail(id);
  const mutations = useFr021Mutations();
  const { form, errors, dirty, identity, onChange, setErrors, markSaved, loadRecord, reset } =
    useFr021Form(masterQuery.data);

  const [step, setStep] = useState<Fr021Step>(
    (searchParams.get("langkah") as Fr021Step) || "identifikasi"
  );
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  async function handleExport() {
    if (!identity.id || !detailQuery.data || !masterQuery.data) return;
    setExporting(true);
    try {
      await exportEvaluasiPenyediaDocx(detailQuery.data, { master: masterQuery.data });
      showToast.success("Dokumen DOCX berhasil diunduh.");
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Gagal mengekspor dokumen.");
    } finally {
      setExporting(false);
    }
  }
  useEffect(() => {
    const q = searchParams.get("langkah") as Fr021Step | null;
    if (q && FR021_STEPS.some((s) => s.id === q)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(q);
    }
  }, [searchParams]);

  const status = identity.status ?? detailQuery.data?.status;
  const isLocked = status === "diajukan" || status === "selesai";
  const isRevisi = status === "revisi";

  // Muat data saat detail tersedia.
  useEffect(() => {
    if (detailQuery.data) loadRecord(detailQuery.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailQuery.data?.id]);

  // Inisialisasi penilaian saat master pertama kali tersedia (mode baru).
  useEffect(() => {
    if (masterQuery.data && !id && form.penilaian.length === 0) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterQuery.data]);

  // Hak ubah mengikuti backend: hanya pembuat (created_by) yang boleh menyimpan.
  const canUpdate = detailQuery.data
    ? Boolean(detailQuery.data.permissions.can_update)
    : true;

  function goTo(next: Fr021Step) {
    // Autosave penilaian saat berpindah langkah (FR-2.7), bila lengkap.
    // Dilewati bila bukan pemilik, atau request sebelumnya masih berjalan,
    // agar version tidak basi dan tidak memicu 403/409 yang tak perlu.
    if (
      step === "penilaian" &&
      identity.id &&
      masterQuery.data &&
      canUpdate &&
      !mutations.savePenilaian.isPending &&
      isPenilaianComplete(form, masterQuery.data.kriteria)
    ) {
      mutations.savePenilaian.mutate(
        {
          id: identity.id,
          payload: { penilaian: toPenilaianPayload(form), version: identity.version },
        },
        { onSuccess: (saved) => markSaved(saved) }
      );
    }
    setStep(next);
    const targetId = identity.id ?? id;
    const url = targetId
      ? `/smki/evaluasi-penyedia/${targetId}?langkah=${next}`
      : `/smki/evaluasi-penyedia/baru?langkah=${next}`;
    router.replace(url, { scroll: false });
  }

  async function handleHitung() {
    if (!identity.id || !masterQuery.data) return;
    try {
      // Pakai version hasil save untuk hitung; version lama pasti ditolak
      // backend (409) karena save menaikkan version.
      const afterSave = await mutations.savePenilaian.mutateAsync({
        id: identity.id,
        payload: { penilaian: toPenilaianPayload(form), version: identity.version },
      });
      markSaved(afterSave);
      const saved = await mutations.hitung.mutateAsync({
        id: identity.id,
        version: afterSave.version,
      });
      markSaved(saved);
      showToast.success("Nilai berhasil dihitung.");
      goTo("hasil");
    } catch (error) {
      const parsed = await readFr021Error(error);
      setErrors(parsed.errors);
      showToast.error(parsed.message);
    }
  }

  // Mode section pengajuan: pembuat mengajukan; penonton hanya membaca.
  const recordCanAjukan = detailQuery.data
    ? Boolean(detailQuery.data.permissions.can_ajukan)
    : true;
  const pengajuanMode: "ajukan" | "lihat" =
    !canUpdate && !recordCanAjukan ? "lihat" : "ajukan";

  async function handleAjukan() {
    if (!identity.id) return;
    try {
      const saved = await mutations.ajukan.mutateAsync({
        id: identity.id,
        payload: {
          admin_id: form.admin_id as number,
          version: identity.version,
        },
      });
      markSaved(saved);
      showToast.success("Evaluasi berhasil diajukan. Menunggu persetujuan Atasan.");
    } catch (error) {
      const parsed = await readFr021Error(error);
      setErrors(parsed.errors);
      showToast.error(parsed.message);
    }
  }

  const completed: Record<string, boolean> = {
    identifikasi: Boolean(form.no_kontrak && form.penyedia_nama),
    penilaian: false,
    hasil: false,
    tinjauan: false,
  };

  async function handleSaveIdentifikasi() {
    const identifikasiPayload = toIdentifikasiPayload(form);
    try {
      if (identity.id) {
        const saved = await mutations.updateIdentifikasi.mutateAsync({
          id: identity.id,
          payload: identifikasiPayload,
        });
        markSaved(saved);
        showToast.success("Identifikasi disimpan.");
        goTo("penilaian");
      } else {
        const saved = await mutations.create.mutateAsync(identifikasiPayload);
        markSaved(saved);
        showToast.success("Identifikasi disimpan. Lanjut ke penilaian.");
        router.replace(`/smki/evaluasi-penyedia/${saved.id}?langkah=penilaian`);
        setStep("penilaian");
      }
    } catch (error) {
      const parsed = await readFr021Error(error);
      setErrors(parsed.errors);
      showToast.error(parsed.message);
    }
  }

  const busy =
    mutations.create.isPending ||
    mutations.updateIdentifikasi.isPending;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-8">
        <RevisiBanner record={detailQuery.data} />
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {id ? "Evaluasi Penyedia" : "Tambah Evaluasi Penyedia"}
              </h1>
              <p className="text-xs text-slate-500">
                Langkah {FR021_STEP_INDEX[step] + 1} dari {FR021_STEPS.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {identity.id && detailQuery.data?.total_nilai && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                  <span className="ml-1">Unduh DOCX</span>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (dirty) setShowLeaveConfirm(true);
                  else router.push("/smki/evaluasi-penyedia");
                }}
              >
                Batal
              </Button>
            </div>
          </div>
          <EvaluasiStepper
            active={step}
            completed={completed}
            locked={isLocked}
            onSelect={(next) => goTo(next as Fr021Step)}
          />
        </div>

        {masterQuery.isLoading && (
          <p className="py-6 text-center text-sm text-slate-500">
            Memuat data master...
          </p>
        )}

        {masterQuery.data && step === "identifikasi" && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">
              Identifikasi Evaluasi
            </h2>
            {isRevisi && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Mode revisi: identifikasi terkunci, hanya penilaian yang dapat diubah.
              </div>
            )}
            <IdentifikasiSection
              form={form}
              master={masterQuery.data}
              errors={errors}
              onChange={onChange}
              disabled={isLocked || isRevisi || !canUpdate}
            />
            {!isLocked && !isRevisi && canUpdate && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleSaveIdentifikasi}
                  disabled={busy}
                >
                  {busy ? "Menyimpan..." : "Simpan & Lanjutkan"}
                </Button>
              </div>
            )}
          </section>
        )}

        {step === "penilaian" && masterQuery.data && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">
              Penilaian Kriteria
            </h2>
            {isRevisi && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Mode revisi: identifikasi terkunci, hanya penilaian yang dapat diubah.
              </div>
            )}
            <PenilaianSection
              form={form}
              master={masterQuery.data}
              errors={errors}
              onChange={onChange}
              disabled={isLocked || !canUpdate}
              onHitung={handleHitung}
              hitungBusy={
                mutations.savePenilaian.isPending || mutations.hitung.isPending
              }
            />
          </section>
        )}
        {step === "penilaian" && !masterQuery.data && (
          <p className="py-6 text-center text-sm text-slate-500">
            Memuat data master...
          </p>
        )}
        {step === "hasil" && masterQuery.data && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Hasil Evaluasi
              </h2>
              <HasilSection
                record={detailQuery.data ?? null}
                master={masterQuery.data}
              />
            </section>
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Pengajuan
              </h2>
              <PengajuanSection
                record={detailQuery.data ?? null}
                form={form}
                onChange={onChange}
                onAjukan={handleAjukan}
                ajukanBusy={mutations.ajukan.isPending}
                disabled={isLocked}
                onKembali={() => goTo("penilaian")}
                mode={pengajuanMode}
              />
            </section>
          </div>
        )}
        {step === "hasil" && !masterQuery.data && (
          <p className="py-6 text-center text-sm text-slate-500">
            Memuat data master...
          </p>
        )}
        {step === "tinjauan" && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Step 4 (Tinjauan Atasan) ditangani pada halaman tinjauan Atasan.
            </p>
          </section>
        )}

        {identity.id && <RiwayatPanel id={identity.id} />}
      </div>
      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          router.push("/smki/evaluasi-penyedia");
        }}
        title="Tinggalkan perubahan?"
        message="Perubahan yang belum disimpan akan hilang."
      />
    </ServiceRouteGuard>
  );
}
