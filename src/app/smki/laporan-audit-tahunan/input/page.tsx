"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  FileText,
  Users,
  Target,
  ListChecks,
  CalendarDays,
  UserCheck,
  Loader2
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getLaporanAuditTahunanById,
  saveLaporanAuditTahunan,
  getLaporanAuditTahunanLookup,
  LaporanAuditTahunanData
} from "@/services/api";
import { FormLaporanTahunanState } from "@/components/smki/laporan-audit-tahunan/types";
import { FormStepper, StepItem } from "@/components/smki/laporan-audit-tahunan/organisms/FormStepper";
import { Step1Informasi } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step1Informasi";
import { Step2TimAuditor } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step2TimAuditor";
import { Step3ObjekAudit } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step3ObjekAudit";
import { Step4Klausul } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step4Klausul";
import { Step5Jadwal } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step5Jadwal";
import { Step6Pengesah } from "@/components/smki/laporan-audit-tahunan/organisms/steps/Step6Pengesah";

const STEPS: StepItem[] = [
  { id: 1, title: "Informasi audit", icon: FileText },
  { id: 2, title: "Tim auditor", icon: Users },
  { id: 3, title: "Objek audit", icon: Target },
  { id: 4, title: "Klausul", icon: ListChecks },
  { id: 5, title: "Jadwal audit", icon: CalendarDays },
  { id: 6, title: "Penyusun & pengesah", icon: UserCheck },
];

const MONTHS = [
  { idx: 1, name: "Jan" },
  { idx: 2, name: "Feb" },
  { idx: 3, name: "Mar" },
  { idx: 4, name: "Apr" },
  { idx: 5, name: "Mei" },
  { idx: 6, name: "Jun" },
  { idx: 7, name: "Jul" },
  { idx: 8, name: "Agt" },
  { idx: 9, name: "Sep" },
  { idx: 10, name: "Okt" },
  { idx: 11, name: "Nov" },
  { idx: 12, name: "Des" },
];

function FormulirTahunanInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { user, isAdminAptika, initialized } = useAuthStore();
  const isAdmin = user?.role === "admin" || isAdminAptika;

  // Proteksi: semua user boleh menambah formulir baru; edit hanya untuk admin
  useEffect(() => {
    if (initialized && !isAdmin && editId) {
      alert("Akses ditolak: Pengubahan formulir program tahunan audit hanya diperuntukkan bagi Administrator.");
      router.replace("/smki/laporan-audit-tahunan");
    }
  }, [initialized, isAdmin, editId, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Master Lookup data
  const [masterAuditors, setMasterAuditors] = useState<any[]>([]);
  const [masterBidang, setMasterBidang] = useState<any[]>([]);
  const [klausulOptions, setKlausulOptions] = useState<string[]>([
    "Klausul 4 (Konteks Organisasi)",
    "Klausul 5 (Kepemimpinan)",
    "Klausul 6 (Perencanaan)",
    "Klausul 7 (Dukungan)",
    "Klausul 8 (Operasional)",
    "Klausul 9 (Evaluasi Kinerja)",
    "Klausul 10 (Peningkatan)",
    "Annex A.5 (Pengendalian Organisasi)",
    "Annex A.6 (Pengendalian Orang)",
    "Annex A.7 (Pengendalian Fisik)",
    "Annex A.8 (Pengendalian Teknologi)",
  ]);

  // Form State
  const [formData, setFormData] = useState<FormLaporanTahunanState>({
    id: undefined,
    tahun_smki: new Date().getFullYear().toString(),
    no_dokumen: `FR-008/SMKI/${new Date().getFullYear()}/001`,
    no_revisi: "1.0",
    tanggal_berlaku: new Date().toISOString().split("T")[0],
    kriteria_audit: "ISO/IEC 27001:2022 dan kebijakan SMKI Diskominfo Jawa Barat",
    tujuan:
      "Menilai kesesuaian dan efektivitas penerapan SMKI serta mengidentifikasi peluang perbaikan berkelanjutan pada layanan Bidang Aplikasi Informatika.",
    status: "Draft",
    lead_auditor: "",
    unit_lead: "Tim Audit Internal SMKI",
    auditors: [],
    objek_audit: [],
    disusun_oleh: "",
    jabatan_penyusun: "Pengelola SMKI",
    disahkan_oleh: "",
    jabatan_pengesah: "Kepala Bidang Aplikasi Informatika",
  });

  const updateFormData = useCallback((updated: Partial<FormLaporanTahunanState>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  }, []);

  // Fetch Master Data Lookup
  useEffect(() => {
    const fetchLookup = async () => {
      try {
        const res = await getLaporanAuditTahunanLookup();
        if (res?.data) {
          if (res.data.auditors?.length) setMasterAuditors(res.data.auditors);
          if (res.data.bidang_auditee?.length) setMasterBidang(res.data.bidang_auditee);
          if (res.data.standard_clauses?.length) setKlausulOptions(res.data.standard_clauses);
        }
      } catch (err) {
        console.error("Gagal memuat master lookup:", err);
      }
    };
    fetchLookup();
  }, []);

  // Load existing data if edit mode
  useEffect(() => {
    if (editId) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          const res = await getLaporanAuditTahunanById(editId);
          if (res?.data) {
            const d = res.data;
            const timList = d.tim_auditor || d.timAuditor || [];
            const lead = timList.find((t: any) => t.peran === "Lead Auditor");
            const otherAuditors = timList
              .filter((t: any) => t.peran !== "Lead Auditor")
              .map((t: any, idx: number) => ({
                id: t.id || idx + 1,
                nama: t.nama_auditor,
                unit: t.unit_kerja,
                peran: t.peran,
              }));

            const objekList = d.objek_audit || d.objekAudit || [];
            const parsedObjek = objekList.map((oa: any) => ({
              kode: oa.kode_objek,
              nama: oa.objek_audit,
              lingkup: oa.ruang_lingkup,
              unit: oa.unit_kerja,
              klausul: (oa.klausul || []).map((k: any) => k.klausul_annex || k),
              jadwal: (oa.jadwal || []).map((j: any) => (typeof j === "number" ? j : j.bulan)),
            }));

            setFormData({
              id: d.id,
              tahun_smki: d.tahun_smki?.toString() || new Date().getFullYear().toString(),
              no_dokumen: d.no_dokumen || "",
              no_revisi: d.no_revisi || "1.0",
              tanggal_berlaku: d.tanggal_berlaku || "",
              kriteria_audit: d.kriteria_audit || "",
              tujuan: d.tujuan || "",
              status: d.status || "Draft",
              lead_auditor: lead ? lead.nama_auditor : "",
              unit_lead: lead ? lead.unit_kerja : "Tim Audit Internal SMKI",
              auditors: otherAuditors,
              objek_audit: parsedObjek,
              disusun_oleh: d.disusun_oleh || "",
              jabatan_penyusun: d.jabatan_penyusun || "",
              disahkan_oleh: d.disahkan_oleh || "",
              jabatan_pengesah: d.jabatan_pengesah || "",
            });
          }
        } catch (err) {
          console.error("Gagal memuat detail data:", err);
          alert("Gagal memuat formulir audit tahunan.");
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [editId]);

  // Payload Builder
  const buildPayload = (overrideStatus?: string): LaporanAuditTahunanData => {
    const timAuditor = [];
    if (formData.lead_auditor.trim()) {
      timAuditor.push({
        nama_auditor: formData.lead_auditor.trim(),
        unit_kerja: formData.unit_lead.trim() || "-",
        peran: "Lead Auditor",
      });
    }
    for (const aud of formData.auditors) {
      if (aud.nama.trim()) {
        timAuditor.push({
          nama_auditor: aud.nama.trim(),
          unit_kerja: aud.unit.trim() || "-",
          peran: aud.peran || "Auditor",
        });
      }
    }

    const objekAudit = formData.objek_audit.map((oa) => ({
      kode_objek: oa.kode,
      objek_audit: oa.nama,
      ruang_lingkup: oa.lingkup,
      unit_kerja: oa.unit,
      klausul: oa.klausul.map((k) => ({
        klausul_annex: k,
        uraian_klausul: k,
      })),
      jadwal: oa.jadwal.map((m) => ({
        bulan: m,
      })),
    }));

    return {
      id: formData.id,
      tahun_smki: parseInt(formData.tahun_smki, 10) || new Date().getFullYear(),
      no_dokumen: formData.no_dokumen,
      no_revisi: formData.no_revisi,
      tanggal_berlaku: formData.tanggal_berlaku,
      kriteria_audit: formData.kriteria_audit,
      tujuan: formData.tujuan,
      disusun_oleh: formData.disusun_oleh,
      jabatan_penyusun: formData.jabatan_penyusun,
      disahkan_oleh: formData.disahkan_oleh,
      jabatan_pengesah: formData.jabatan_pengesah,
      status: overrideStatus || formData.status || "Draft",
      tim_auditor: timAuditor,
      objek_audit: objekAudit,
    };
  };

  const handleSaveData = async (overrideStatus?: string) => {
    try {
      setIsSaving(true);
      const payload = buildPayload(overrideStatus);
      const res = await saveLaporanAuditTahunan(payload);
      if (res?.data) {
        setFormData((prev) => ({ ...prev, id: res.data.id }));
        alert(
          overrideStatus === "Selesai"
            ? "Formulir tahunan audit internal berhasil disimpan dan disahkan!"
            : "Draft formulir berhasil disimpan!"
        );
        router.push("/smki/laporan-audit-tahunan");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      const msg = err?.response?.data?.message || err?.message || "Terjadi kesalahan saat menyimpan formulir";
      alert("Gagal: " + msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((c) => c + 1);
    } else {
      handleSaveData("Selesai");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
  };

  if (isLoading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Memuat data formulir...</p>
        </div>
      </ServiceRouteGuard>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
              SMKI / FORMULIR TAHUNAN AUDIT INTERNAL
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {formData.id ? "Edit Formulir Tahunan" : "Tambah Formulir Tahunan"}
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {formData.status || "Draft"}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Lengkapi rencana audit internal tahunan sesuai formulir SMKI FR-008.
            </p>
          </div>
          <button
            onClick={() => handleSaveData("Draft")}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Menyimpan..." : "Simpan draft"}</span>
          </button>
        </div>

        {/* Stepper Component */}
        <FormStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(id) => setCurrentStep(id)}
          tahun={formData.tahun_smki}
          noDokumen={formData.no_dokumen}
        />

        {/* Dynamic Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {currentStep === 1 && (
            <Step1Informasi formData={formData} onChange={updateFormData} />
          )}

          {currentStep === 2 && (
            <Step2TimAuditor
              formData={formData}
              onChange={updateFormData}
              masterAuditors={masterAuditors}
            />
          )}

          {currentStep === 3 && (
            <Step3ObjekAudit
              formData={formData}
              onChange={updateFormData}
              masterBidang={masterBidang}
            />
          )}

          {currentStep === 4 && (
            <Step4Klausul
              formData={formData}
              onChange={updateFormData}
              klausulOptions={klausulOptions}
            />
          )}

          {currentStep === 5 && (
            <Step5Jadwal
              formData={formData}
              onChange={updateFormData}
              months={MONTHS}
            />
          )}

          {currentStep === 6 && (
            <Step6Pengesah formData={formData} onChange={updateFormData} />
          )}

          {/* Footer Navigation */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handlePrev}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/smki/laporan-audit-tahunan")}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 font-semibold text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke daftar</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Berikutnya:{" "}
                <span className="font-semibold text-slate-600">
                  {STEPS[currentStep]?.title || "Selesai"}
                </span>
              </span>
              <button
                onClick={handleNext}
                disabled={isSaving}
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{currentStep === 6 ? "Simpan formulir" : "Lanjut"}</span>
                )}
                {currentStep < 6 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}

export default function FormulirTahunanInputPage() {
  return (
    <Suspense
      fallback={
        <ServiceRouteGuard requiredService="SMKI">
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat formulir...</p>
          </div>
        </ServiceRouteGuard>
      }
    >
      <FormulirTahunanInputContent />
    </Suspense>
  );
}
