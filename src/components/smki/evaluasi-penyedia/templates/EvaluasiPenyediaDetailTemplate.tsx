"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import Button from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { exportEvaluasiPenyediaDocx } from "@/services/smki/exportEvaluasiPenyediaDocx";
import { FileDown, Loader2 } from "lucide-react";
import { useFr021Detail, useFr021Master } from "../hooks/useFr021Queries";

import EvaluasiStepper from "../molecules/EvaluasiStepper";
import IdentifikasiSection from "../organisms/IdentifikasiSection";
import PenilaianSection from "../organisms/PenilaianSection";
import HasilSection from "../organisms/HasilSection";
import PengajuanSection from "../organisms/PengajuanSection";
import RiwayatPanel from "../organisms/RiwayatPanel";
import type { Fr021FormState } from "../types";
import { recordToForm } from "../form";

export default function EvaluasiPenyediaDetailTemplate() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = Number(params?.id);

  const detailQuery = useFr021Detail(id);
  const masterQuery = useFr021Master();
  const record = detailQuery.data;

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

  const form: Fr021FormState = record && masterQuery.data
    ? recordToForm(record, masterQuery.data)
    : {
        penyedia_id: null,
        penyedia_nama: "",
        contact_person: "",
        email: "",
        no_kontrak: "",
        nomor_dokumen: "",
        nomor_revisi: "",
        tanggal_berlaku: "",
        sifat_pekerjaan: "pengadaan_baru",
        sifat_pekerjaan_lainnya: "",
        tanggal_evaluasi: "",
         tempat: "",
         penilaian: [],
         admin_id: null,
      };

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
                Evaluasi Penyedia — {record.penyedia?.nama_penyedia}
              </h1>
              <p className="text-xs text-slate-500">
                Status: {record.status} · Siklus {record.siklus}
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
                Kembali ke Daftar
              </Button>
            </div>
          </div>
          <EvaluasiStepper
            active="hasil"
            completed={{ identifikasi: true, penilaian: true, hasil: true, tinjauan: record.status === "selesai" }}
            locked
            onSelect={() => {}}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Identifikasi
          </h2>
          <IdentifikasiSection
            form={form}
            master={masterQuery.data!}
            errors={{}}
            onChange={() => {}}
            disabled
          />
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Penilaian
          </h2>
          <PenilaianSection
            form={form}
            master={masterQuery.data!}
            errors={{}}
            onChange={() => {}}
            disabled
            onHitung={() => {}}
            hitungBusy={false}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Hasil Evaluasi
          </h2>
          <HasilSection record={record} master={masterQuery.data!} />
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Pengesahan
          </h2>
          <PengajuanSection
            record={record}
            form={form}
            onChange={() => {}}
            onAjukan={() => {}}
            ajukanBusy={false}
            disabled
          />
        </section>

        <RiwayatPanel id={record.id} />
      </div>
    </ServiceRouteGuard>
  );
}
