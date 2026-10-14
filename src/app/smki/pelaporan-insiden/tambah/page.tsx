"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import BagianIForm from "@/components/smki/pelaporan-insiden/BagianIForm";
import type { BagianIData } from "@/components/smki/pelaporan-insiden/types";
import { useInsidenLookup } from "@/components/smki/pelaporan-insiden/useInsidenLookup";
import {
  buildBagianIFormData,
  createInsiden,
} from "@/services/smki/pelaporanInsidenService";

function firstErrorMessage(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
  const errors = e?.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors)[0]?.[0];
    if (first) return first;
  }
  return e?.response?.data?.message ?? "Gagal menyimpan laporan insiden.";
}

export default function TambahLaporanPage() {
  const router = useRouter();
  const back = () => router.push("/smki/pelaporan-insiden");
  const { docNo } = useInsidenLookup();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: BagianIData) => {
    if (!data.kategori || !data.nama || !data.namaSistem) {
      toast.error("Kategori, nama pelapor, dan nama sistem wajib diisi.");
      return;
    }
    if (data.files.length === 0) {
      toast.error("Lampirkan minimal 1 bukti pendukung.");
      return;
    }
    setSubmitting(true);
    try {
      await createInsiden(buildBagianIFormData(data));
      toast.success("Laporan insiden berhasil disimpan.");
      back();
    } catch (err) {
      toast.error(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Tambah Laporan Insiden"
          subtitle="FORMULIR PELAPORAN INSIDEN KEAMANAN INFORMASI (FR-016) - Lengkapi Bagian I untuk melaporkan kejadian keamanan informasi."
          breadcrumb={[
            { label: "Daftar Laporan", href: "/smki/pelaporan-insiden" },
            { label: "Tambah Laporan" },
          ]}
          docNo={docNo}
        />
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              Bagian I — Identitas Pelapor & Bukti Insiden
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Oleh Pelapor. Tanda * menunjukkan isian wajib untuk pengiriman awal.
            </p>
          </div>
          <div className={submitting ? "pointer-events-none opacity-70" : ""}>
            <BagianIForm onSubmit={handleSubmit} onCancel={back} submitting={submitting} />
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
