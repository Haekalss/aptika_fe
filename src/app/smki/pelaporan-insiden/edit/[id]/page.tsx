"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FileDown, Loader2 } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import StepTabs from "@/components/ui/StepTabs";
import HeroBanner from "@/components/smki/pelaporan-insiden/HeroBanner";
import { BagianISummary } from "@/components/smki/pelaporan-insiden/BagianIIForm";
import type { BagianIIData } from "@/components/smki/pelaporan-insiden/types";
import {
  IdentitasSection,
  KejadianSection,
  LampiranStatusSection,
} from "@/components/smki/pelaporan-insiden/BagianIISections";
import {
  buildBagianIIFormData,
  downloadInsidenDocx,
  fetchInsidenDetail,
  updateInsiden,
  type InsidenDocxParams,
  type InsidenRow,
} from "@/services/smki/pelaporanInsidenService";
import InsidenExportModal from "@/components/smki/pelaporan-insiden/InsidenExportModal";
import { useInsidenLookup } from "@/components/smki/pelaporan-insiden/useInsidenLookup";
import { useAuthStore } from "@/store/useAuthStore";

const TABS = [
  { id: "ringkasan", label: "Ringkasan", hint: "Bagian I • read-only" },
  { id: "identitas", label: "Identitas", hint: "Instansi & PIC" },
  { id: "kejadian", label: "Kejadian", hint: "Dampak & tindakan" },
  { id: "lampiran", label: "Lampiran", hint: "Bukti & status" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function joinPair(a?: string | null, b?: string | null): string {
  const left = (a ?? "").trim();
  const right = (b ?? "").trim();
  if (left && right) return `${left} / ${right}`;
  return left || right || "Belum dilengkapi";
}

function rowToSummary(row: InsidenRow) {
  return {
    pelapor: `${row.nama_pelapor}${row.jabatan_pelapor ? ` / ${row.jabatan_pelapor}` : ""}`,
    kategori: `${row.kategori_insiden} / ${row.jenis_layanan}`,
    sistem: `${row.nama_sistem}${row.jenis_sistem ? ` / ${row.jenis_sistem}` : ""}`,
    waktu: new Date(row.waktu_kejadian).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    instansi: joinPair(row.instansi_pelapor, row.nip_pelapor),
    kontak: joinPair(row.no_hp_pelapor, row.email_pelapor),
    urlIp: joinPair(row.url, row.ip_address),
    osWeb: joinPair(row.os, row.web_server),
    buktiNama: row.bukti_pelapor_nama ?? "Belum ada lampiran",
    buktiUkuran: row.bukti_pelapor_url ? "Lampiran Pelapor" : "Belum ada lampiran",
    buktiUrl: row.bukti_pelapor_url ?? null,
  };
}

function rowToInitial(row: InsidenRow): BagianIIData {
  return {
    namaInstansi: row.nama_instansi_pemilik ?? "",
    telpFax: row.telp_fax_instansi ?? "",
    emailInstansi: row.email_instansi ?? "",
    alamat: row.alamat_instansi ?? "",
    namaPic: row.nama_pic ?? "",
    jabatanPic: row.jabatan_pic ?? "",
    nipPic: row.nip_pic ?? "",
    noHpPic: row.no_hp_pic ?? "",
    emailPic: row.email_pic ?? "",
    lokasi: row.lokasi_insiden ?? "",
    deskripsi: row.deskripsi_kejadian ?? "",
    isp: row.isp ?? "",
    downtime: row.is_downtime ? "Ya" : "Tidak",
    durasi: row.durasi_downtime ?? "",
    tindakan: row.tindakan_awal ?? "",
    status: row.status_laporan ?? "Menunggu Pemilik Sistem",
    files: [],
  };
}

export default function EditLaporanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const back = () => router.push("/smki/pelaporan-insiden");
  const { user, isAdminAptika } = useAuthStore();
  const isAdmin = user?.role === "admin" || isAdminAptika;
  const canEditStatus = isAdmin;

  const { docNo, docDefaults } = useInsidenLookup();
  const [row, setRow] = useState<InsidenRow | null>(null);
  const [form, setForm] = useState<BagianIIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pemilikRemoved, setPemilikRemoved] = useState(false);
  const [tab, setTab] = useState<TabId>(() => {
    const q = searchParams.get("tab") as TabId | null;
    return q && TABS.some((t) => t.id === q) ? q : "ringkasan";
  });
  const [tabError, setTabError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const goTab = (t: TabId) => {
    setTab(t);
    setTabError("");
    router.replace(`/smki/pelaporan-insiden/edit/${id}?tab=${t}`, { scroll: false });
  };

  useEffect(() => {
    fetchInsidenDetail(id)
      .then((res) => {
        setRow(res.data);
        setForm(rowToInitial(res.data));
      })
      .catch(() => {
        toast.error("Gagal memuat detail laporan insiden.");
        back();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField =
    (k: keyof BagianIIData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  const completed = useMemo(() => {
    if (!form) return {};
    return {
      identitas: form.namaInstansi.trim() !== "" && form.namaPic.trim() !== "",
      kejadian: form.deskripsi.trim() !== "",
      lampiran: true,
      ringkasan: true,
    } as Record<string, boolean>;
  }, [form]);

  const validateTab = (t: TabId): boolean => {
    if (!form) return false;
    if (t === "identitas") {
      if (!form.namaInstansi.trim() || !form.namaPic.trim()) {
        setTabError("Nama instansi dan nama PIC wajib diisi sebelum lanjut.");
        return false;
      }
    }
    if (t === "kejadian") {
      if (!form.deskripsi.trim()) {
        setTabError("Deskripsi kejadian wajib diisi sebelum lanjut.");
        return false;
      }
    }
    setTabError("");
    return true;
  };

  const order: TabId[] = ["ringkasan", "identitas", "kejadian", "lampiran"];
  const idx = order.indexOf(tab);
  const goNext = () => {
    if (!validateTab(tab)) return;
    if (idx < order.length - 1) goTab(order[idx + 1]);
  };
  const goPrev = () => {
    if (idx > 0) goTab(order[idx - 1]);
  };

  const handleDoExport = async (params: InsidenDocxParams) => {
    setExporting(true);
    try {
      await downloadInsidenDocx(id, params);
      toast.success("Dokumen FR-016 (.docx) berhasil diunduh.");
      setExportOpen(false);
    } catch {
      toast.error("Gagal mengunduh dokumen FR-016.");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    if (!validateTab("identitas") || !validateTab("kejadian")) {
      toast.error("Lengkapi identitas dan deskripsi kejadian dulu.");
      return;
    }
    setSubmitting(true);
    try {
      await updateInsiden(
        id,
        buildBagianIIFormData(form, {
          hapusBuktiPemilik: pemilikRemoved,
          includeStatus: canEditStatus,
        })
      );
      toast.success("Laporan insiden berhasil diperbarui.");
      back();
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      toast.error(
        e?.response?.status === 404
          ? "Laporan tidak ditemukan atau bukan milik Anda."
          : e?.response?.data?.message ?? "Gagal memperbarui laporan insiden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <HeroBanner
          title="Edit & Lengkapi Laporan Insiden"
          subtitle="FORMULIR PELAPORAN INSIDEN KEAMANAN INFORMASI (FR-016) — Lengkapi per langkah agar tidak terlalu panjang."
          breadcrumb={[
            { label: "Daftar Laporan", href: "/smki/pelaporan-insiden" },
            { label: "Lengkapi Laporan" },
          ]}
          docNo={docNo}
        />
        {loading || !row || !form ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-xs text-slate-400">
            <Loader2 size={22} className="animate-spin mx-auto mb-2" />
            Memuat detail laporan insiden...
          </div>
        ) : (
          <>
            <StepTabs
              steps={TABS.map((t) => ({ ...t }))}
              active={tab}
              onChange={(v) => goTab(v as TabId)}
              completed={completed}
            />
            {tabError && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                {tabError}
              </div>
            )}
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                {tab === "ringkasan" && <BagianISummary data={rowToSummary(row)} id={row.id} />}
                {tab === "identitas" && <IdentitasSection form={form} set={setField} />}
                {tab === "kejadian" && (
                  <KejadianSection form={form} set={setField} setForm={setForm as React.Dispatch<React.SetStateAction<BagianIIData>>} />
                )}
                {tab === "lampiran" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExportOpen(true)}
                      className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs shadow-sm transition-all"
                    >
                      <FileDown size={15} />
                      <span>Unduh Dokumen FR-016 (.docx)</span>
                    </button>
                    <LampiranStatusSection
                    form={form}
                    setForm={setForm as React.Dispatch<React.SetStateAction<BagianIIData>>}
                    existingPemilik={
                      row.bukti_pemilik_url
                        ? { nama: row.bukti_pemilik_nama ?? "lampiran", url: row.bukti_pemilik_url }
                        : null
                    }
                    pemilikRemoved={pemilikRemoved}
                    pemilikId={row.id}
                    onRemovePemilik={() => setPemilikRemoved(true)}
                    onRestorePemilik={() => setPemilikRemoved(false)}
                    canEditStatus={canEditStatus}
                  />
                  </>
                )}
              </div>
              <div
                className={`flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 sticky bottom-0 ${
                  submitting ? "pointer-events-none opacity-70" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={back}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                >
                  Batal
                </button>
                <div className="flex items-center gap-2">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={goPrev}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white text-slate-700 dark:text-slate-200 transition-all"
                    >
                      Kembali
                    </button>
                  )}
                  {idx < order.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
                    >
                      Lanjut
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white shadow transition-all"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {submitting ? "Menyimpan..." : "Perbarui Laporan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <InsidenExportModal
              key={exportOpen ? `open-${id}` : "closed"}
              isOpen={exportOpen}
              onClose={() => { if (!exporting) setExportOpen(false); }}
              onExport={handleDoExport}
              exporting={exporting}
              defaults={docDefaults}
            />
          </>
        )}
      </div>
    </ServiceRouteGuard>
  );
}
