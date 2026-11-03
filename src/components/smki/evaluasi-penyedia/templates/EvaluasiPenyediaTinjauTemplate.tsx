"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { exportEvaluasiPenyediaDocx } from "@/services/smki/exportEvaluasiPenyediaDocx";
import { FileDown, Loader2 } from "lucide-react";
import { readFr021Error } from "@/services/smki/evaluasiPenyediaService";
import { useFr021Detail, useFr021Master, useFr021Mutations } from "../hooks/useFr021Queries";
import { useAuthStore } from "@/store/useAuthStore";

import EvaluasiStepper from "../molecules/EvaluasiStepper";
import HasilSection from "../organisms/HasilSection";
import TinjauanAtasanSection from "../organisms/TinjauanAtasanSection";
import RiwayatPanel from "../organisms/RiwayatPanel";


export default function EvaluasiPenyediaTinjauTemplate() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = Number(params?.id);
  const { user } = useAuthStore();

  const detailQuery = useFr021Detail(id);
  const masterQuery = useFr021Master();
  const mutations = useFr021Mutations();
  const record = detailQuery.data;

  const [catatan, setCatatan] = useState("");
  const [exporting, setExporting] = useState(false);
  async function handleExport() {
    if (!record || !masterQuery.data) return;
    setExporting(true);
    try {
      await exportEvaluasiPenyediaDocx(record, { master: masterQuery.data });
      showToast.success("Dokumen DOCX berhasil diunduh.");
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Gagal mengekspor dokumen.");
    } finally {
      setExporting(false);
    }
  }

  const canAct =
    user?.role === "admin" && !!record && record.admin_id === user?.id;

  async function handleSetujui() {
    if (!id) return;
    try {
      await mutations.setujui.mutateAsync({ id, version: record?.version });
      showToast.success("Evaluasi disetujui dan ditandatangani.");
      router.push("/smki/evaluasi-penyedia");
    } catch (error) {
      const parsed = await readFr021Error(error);
      showToast.error(parsed.message);
    }
  }

  async function handleKembalikan() {
    if (!id) return;
    try {
      await mutations.kembalikan.mutateAsync({
        id,
        payload: { catatan, version: record?.version },
      });
      showToast.success("Evaluasi dikembalikan untuk revisi.");
      router.push("/smki/evaluasi-penyedia");
    } catch (error) {
      const parsed = await readFr021Error(error);
      showToast.error(parsed.message);
    }
  }

  if (detailQuery.isLoading || masterQuery.isLoading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <p className="py-12 text-center text-sm text-slate-500">
          Memuat evaluasi...
        </p>
      </ServiceRouteGuard>
    );
  }

  if (!record) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <p className="py-12 text-center text-sm text-rose-600">
          Evaluasi tidak ditemukan atau bukan milik Anda.
        </p>
      </ServiceRouteGuard>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Tinjauan Evaluasi — {record.penyedia?.nama_penyedia}
              </h1>
              <p className="text-xs text-slate-500">
                Evaluator (Perwakilan Vendor):{" "}
                {record.ttd_evaluator_nama ??
                  record.penyedia?.contact_person ??
                  record.penyedia?.nama_penyedia ??
                  "—"}{" "}
                · Siklus {record.siklus}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={exporting || !record?.total_nilai}
                title={!record?.total_nilai ? "Hitung nilai terlebih dahulu" : undefined}
              >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                <span className="ml-1">Unduh DOCX</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/smki/evaluasi-penyedia")}
              >
                Kembali
              </Button>
            </div>
          </div>
          <EvaluasiStepper
            active="tinjauan"
            completed={{ identifikasi: true, penilaian: true, hasil: true, tinjauan: false }}
            locked
            onSelect={() => {}}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Hasil Evaluasi
          </h2>
          {masterQuery.data && (
            <HasilSection record={record} master={masterQuery.data} />
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Pengesahan
          </h2>
          <TinjauanAtasanSection
            record={record}
            catatan={catatan}
            onCatatanChange={setCatatan}
            onSetujui={handleSetujui}
            onKembalikan={handleKembalikan}
            busy={mutations.setujui.isPending || mutations.kembalikan.isPending}
            canAct={canAct}
          />
        </section>

        <RiwayatPanel id={record.id} />
      </div>
    </ServiceRouteGuard>
  );
}
