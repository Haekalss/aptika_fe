"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  AsetSdmInput,
  JENJANG_OPTIONS,
  PelatihanItem,
  createAsetSdm,
  getAsetSdm,
  getUnitKerjaOptions,
  updateAsetSdm,
} from "@/services/smki/daftarAsetSDM";

const LIST_PATH = "/smki/daftar-aset-sdm";
const MIN_YEAR = 1950;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

const inputCls = (invalid: boolean) =>
  `w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
    invalid ? "border-rose-400 dark:border-rose-600" : "border-slate-200 dark:border-slate-700"
  }`;

/** State form: semua nilai berupa string agar mudah dikontrol oleh input. */
type FormValues = {
  nama: string;
  nip: string;
  pangkat_golongan: string;
  jabatan: string;
  tmt_jabatan: string;
  unit_kerja_id: string;
  jabatan_smki: string;
  tanggung_jawab: string;
  jenjang: string;
  jurusan: string;
  tahun_lulus: string;
  pelatihan: PelatihanItem[];
};

type UnitOption = { id: number; nama: string };

const EMPTY: FormValues = {
  nama: "",
  nip: "",
  pangkat_golongan: "",
  jabatan: "",
  tmt_jabatan: "",
  unit_kerja_id: "",
  jabatan_smki: "",
  tanggung_jawab: "",
  jenjang: "",
  jurusan: "",
  tahun_lulus: "",
  pelatihan: [
    { nama: "", tahun: "" },
    { nama: "", tahun: "" },
  ],
};

// Urutan field untuk fokus ke error pertama
const FIELD_ORDER = [
  "nama",
  "nip",
  "pangkat_golongan",
  "jabatan",
  "tmt_jabatan",
  "unit_kerja_id",
  "jabatan_smki",
  "tanggung_jawab",
  "jenjang",
  "jurusan",
  "tahun_lulus",
];

type Errors = Record<string, string>;

function validate(v: FormValues): Errors {
  const e: Errors = {};
  const year = new Date().getFullYear();
  const req = (key: keyof FormValues, msg: string) => {
    if (!String(v[key]).trim()) e[key] = msg;
  };

  req("nama", "Nama wajib diisi.");
  req("pangkat_golongan", "Pangkat / golongan wajib diisi.");
  req("jabatan", "Jabatan wajib diisi.");
  req("unit_kerja_id", "Pilih unit kerja.");
  req("jabatan_smki", "Jabatan di SMKI wajib diisi.");
  req("tanggung_jawab", "Tanggung jawab wajib diisi.");
  req("jenjang", "Pilih jenjang pendidikan.");
  req("jurusan", "Jurusan wajib diisi.");

  if (!v.nip.trim()) e.nip = "NIP wajib diisi.";
  else if (!/^\d{18}$/.test(v.nip.trim())) e.nip = "NIP harus 18 digit angka.";

  if (!v.tahun_lulus.trim()) e.tahun_lulus = "Tahun lulus wajib diisi.";
  else if (!/^\d{4}$/.test(v.tahun_lulus) || +v.tahun_lulus < MIN_YEAR || +v.tahun_lulus > year)
    e.tahun_lulus = `Masukkan tahun antara ${MIN_YEAR} dan ${year}.`;

  v.pelatihan.forEach((p, i) => {
    const hasNama = p.nama.trim() !== "";
    const hasTahun = p.tahun.trim() !== "";
    if (!hasNama && !hasTahun) return;
    if (!hasNama) e[`pelatihan_nama_${i}`] = "Nama pelatihan wajib diisi.";
    if (!hasTahun || !/^\d{4}$/.test(p.tahun.trim()) || +p.tahun < MIN_YEAR || +p.tahun > year)
      e[`pelatihan_tahun_${i}`] = `Tahun ${MIN_YEAR}–${year}.`;
  });
  return e;
}

function focusFirstError(errs: Errors) {
  const keys = [
    ...FIELD_ORDER,
    ...Object.keys(errs).filter((k) => k.startsWith("pelatihan_")).sort(),
  ];
  const first = keys.find((k) => errs[k]);
  if (first) document.getElementById(first)?.focus();
}

function Field({
  id,
  label,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5 text-emerald-700 dark:text-emerald-400">
        {icon}
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AsetSdmForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = mode === "edit" ? params?.id : undefined;

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [kodeAset, setKodeAset] = useState<string | null>(null);

  // Muat opsi unit kerja (create & edit) + data yang diedit (edit)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [unitOptions, found] = await Promise.all([
          getUnitKerjaOptions(),
          mode === "edit" && id ? getAsetSdm(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setUnits(unitOptions);

        if (found) {
          setKodeAset(found.kode_aset ?? null);
          setValues({
            nama: found.nama ?? "",
            nip: found.nip ?? "",
            pangkat_golongan: found.pangkat_golongan ?? "",
            jabatan: found.jabatan ?? "",
            tmt_jabatan: found.tmt_jabatan ?? "",
            unit_kerja_id: found.unit_kerja_id != null ? String(found.unit_kerja_id) : "",
            jabatan_smki: found.jabatan_smki ?? "",
            tanggung_jawab: found.tanggung_jawab ?? "",
            jenjang: found.jenjang ?? "",
            jurusan: found.jurusan ?? "",
            tahun_lulus: found.tahun_lulus ?? "",
            pelatihan:
              found.pelatihan.length > 0
                ? found.pelatihan.map((p) => ({ nama: p.nama, tahun: String(p.tahun) }))
                : [{ nama: "", tahun: "" }],
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(
          err?.response?.status === 404
            ? "Data aset SDM tidak ditemukan atau sudah dihapus."
            : err?.response?.data?.message || err?.message || "Gagal memuat data aset SDM."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const setPelatihan = (idx: number, patch: Partial<PelatihanItem>) => {
    setValues((v) => ({
      ...v,
      pelatihan: v.pelatihan.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
    setErrors((e) => ({ ...e, [`pelatihan_nama_${idx}`]: "", [`pelatihan_tahun_${idx}`]: "" }));
  };

  const addPelatihan = () =>
    setValues((v) => ({ ...v, pelatihan: [...v.pelatihan, { nama: "", tahun: "" }] }));

  const removePelatihan = (idx: number) => {
    setValues((v) => ({
      ...v,
      pelatihan:
        v.pelatihan.length === 1
          ? [{ nama: "", tahun: "" }]
          : v.pelatihan.filter((_, i) => i !== idx),
    }));
    // Indeks baris bergeser, jadi error pelatihan lama dibersihkan
    setErrors((e) => {
      const next: Errors = {};
      Object.entries(e).forEach(([k, msg]) => {
        if (!k.startsWith("pelatihan_")) next[k] = msg;
      });
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Periksa kembali isian yang ditandai.");
      focusFirstError(found);
      return;
    }

    // Simpan indeks asli baris pelatihan agar error 422 dari server bisa dipetakan balik
    const keptRows = values.pelatihan
      .map((p, originalIndex) => ({ p, originalIndex }))
      .filter(({ p }) => p.nama.trim() && p.tahun.trim());

    const payload: AsetSdmInput = {
      nama: values.nama.trim(),
      nip: values.nip.trim(),
      pangkat_golongan: values.pangkat_golongan.trim(),
      jabatan: values.jabatan.trim(),
      tmt_jabatan: values.tmt_jabatan || null,
      unit_kerja_id: Number(values.unit_kerja_id),
      jabatan_smki: values.jabatan_smki.trim(),
      tanggung_jawab: values.tanggung_jawab.trim(),
      jenjang: values.jenjang,
      jurusan: values.jurusan.trim(),
      tahun_lulus: Number(values.tahun_lulus),
      pelatihan: keptRows.map(({ p }) => ({ nama: p.nama.trim(), tahun: Number(p.tahun) })),
    };

    setSaving(true);
    try {
      if (mode === "edit" && id) await updateAsetSdm(id, payload);
      else await createAsetSdm(payload);

      toast.success(mode === "edit" ? "Perubahan aset SDM tersimpan." : "Aset SDM berhasil ditambahkan.");
      router.push(LIST_PATH);
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;

      if (err?.response?.status === 422 && serverErrors) {
        const mapped: Errors = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          const m = key.match(/^pelatihan\.(\d+)\.(nama|tahun)$/);
          if (m) {
            const original = keptRows[Number(m[1])]?.originalIndex ?? Number(m[1]);
            mapped[`pelatihan_${m[2]}_${original}`] = msgs[0];
          } else {
            mapped[key] = msgs[0];
          }
        });
        setErrors(mapped);
        toast.error("Periksa kembali isian yang ditandai.");
        // Tunggu render selesai supaya elemen target sudah ada
        requestAnimationFrame(() => focusFirstError(mapped));
      } else {
        toast.error(err?.response?.data?.message || err?.message || "Gagal menyimpan data aset SDM.");
      }
      setSaving(false);
    }
  };

  const bind = (key: keyof FormValues) => ({
    id: key as string,
    "aria-invalid": errors[key as string] ? (true as const) : undefined,
    "aria-describedby": errors[key as string] ? `${key}-err` : undefined,
  });

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-5 pb-12">
        <div>
          <Link
            href={LIST_PATH}
            className={`inline-flex items-center gap-1 rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 ${focus}`}
          >
            <ChevronLeft size={13} aria-hidden="true" /> Manajemen Daftar Aset SDM
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mode === "edit" ? "Ubah Data Aset SDM" : "Formulir Daftar Aset SDM"}
            </h1>
            {mode === "edit" && kodeAset && !loading && !loadError && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {kodeAset}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {mode === "edit"
              ? "Perbarui informasi kepegawaian, tim, pendidikan, dan pelatihan."
              : "Lengkapi informasi kepegawaian, tim, pendidikan, dan pelatihan."}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-16" role="status">
            <Loader2 size={24} className="animate-spin text-emerald-600" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Memuat data aset SDM...</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-16 text-center" role="alert">
            <AlertCircle size={30} className="text-amber-600" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{loadError}</p>
            <Link href={LIST_PATH} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline ${focus}`}>
              Kembali ke daftar
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Section icon={<User size={18} aria-hidden="true" />} title="Informasi Kepegawaian">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field id="nama" label="Nama" error={errors.nama}>
                  <input {...bind("nama")} maxLength={255} value={values.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Masukkan nama lengkap" className={inputCls(!!errors.nama)} />
                </Field>
                <Field id="nip" label="NIP" error={errors.nip}>
                  <input {...bind("nip")} inputMode="numeric" maxLength={18} value={values.nip} onChange={(e) => set("nip", e.target.value.replace(/\D/g, ""))} placeholder="Masukkan 18 digit NIP" className={inputCls(!!errors.nip)} />
                </Field>
                <Field id="pangkat_golongan" label="Pangkat / Golongan" error={errors.pangkat_golongan}>
                  <input {...bind("pangkat_golongan")} maxLength={255} value={values.pangkat_golongan} onChange={(e) => set("pangkat_golongan", e.target.value)} placeholder="Contoh: Penata / III c" className={inputCls(!!errors.pangkat_golongan)} />
                </Field>
                <Field id="jabatan" label="Jabatan" error={errors.jabatan}>
                  <input {...bind("jabatan")} maxLength={255} value={values.jabatan} onChange={(e) => set("jabatan", e.target.value)} placeholder="Masukkan nama jabatan" className={inputCls(!!errors.jabatan)} />
                </Field>
                <Field id="tmt_jabatan" label="TMT Jabatan (opsional)" error={errors.tmt_jabatan}>
                  <input {...bind("tmt_jabatan")} type="date" value={values.tmt_jabatan} onChange={(e) => set("tmt_jabatan", e.target.value)} className={inputCls(!!errors.tmt_jabatan)} />
                </Field>
                <Field id="unit_kerja_id" label="Unit Kerja" error={errors.unit_kerja_id}>
                  <select {...bind("unit_kerja_id")} value={values.unit_kerja_id} onChange={(e) => set("unit_kerja_id", e.target.value)} className={inputCls(!!errors.unit_kerja_id)}>
                    <option value="">Pilih unit kerja</option>
                    {units.map((u) => (
                      <option key={u.id} value={String(u.id)}>{u.nama}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            <Section icon={<ShieldCheck size={18} aria-hidden="true" />} title="Informasi Tim SMKI">
              <div className="flex flex-col gap-4">
                <Field id="jabatan_smki" label="Jabatan di SMKI" error={errors.jabatan_smki}>
                  <input {...bind("jabatan_smki")} maxLength={255} value={values.jabatan_smki} onChange={(e) => set("jabatan_smki", e.target.value)} placeholder="Masukkan jabatan di SMKI" className={inputCls(!!errors.jabatan_smki)} />
                </Field>
                <Field id="tanggung_jawab" label="Tanggung Jawab" error={errors.tanggung_jawab}>
                  <textarea {...bind("tanggung_jawab")} rows={4} value={values.tanggung_jawab} onChange={(e) => set("tanggung_jawab", e.target.value)} placeholder="Uraikan tanggung jawab dalam pengelolaan keamanan informasi" className={`${inputCls(!!errors.tanggung_jawab)} resize-y`} />
                </Field>
              </div>
            </Section>

            <Section icon={<GraduationCap size={18} aria-hidden="true" />} title="Pendidikan Terakhir">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field id="jenjang" label="Jenjang" error={errors.jenjang}>
                  <select {...bind("jenjang")} value={values.jenjang} onChange={(e) => set("jenjang", e.target.value)} className={inputCls(!!errors.jenjang)}>
                    <option value="">Pilih jenjang pendidikan</option>
                    {JENJANG_OPTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </Field>
                <Field id="jurusan" label="Jurusan" error={errors.jurusan}>
                  <input {...bind("jurusan")} maxLength={255} value={values.jurusan} onChange={(e) => set("jurusan", e.target.value)} placeholder="Masukkan jurusan" className={inputCls(!!errors.jurusan)} />
                </Field>
                <Field id="tahun_lulus" label="Tahun Lulus" error={errors.tahun_lulus}>
                  <input {...bind("tahun_lulus")} inputMode="numeric" maxLength={4} value={values.tahun_lulus} onChange={(e) => set("tahun_lulus", e.target.value.replace(/\D/g, ""))} placeholder="Masukkan tahun lulus" className={inputCls(!!errors.tahun_lulus)} />
                </Field>
              </div>
            </Section>

            <Section icon={<ClipboardList size={18} aria-hidden="true" />} title="Pelatihan yang Pernah Diikuti">
              <div className="flex flex-col gap-4">
                {values.pelatihan.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
                    <Field id={`pelatihan_nama_${i}`} label="Nama Pelatihan" error={errors[`pelatihan_nama_${i}`]} className="col-span-2 sm:col-span-1">
                      <input
                        id={`pelatihan_nama_${i}`}
                        maxLength={255}
                        aria-invalid={errors[`pelatihan_nama_${i}`] ? true : undefined}
                        aria-describedby={errors[`pelatihan_nama_${i}`] ? `pelatihan_nama_${i}-err` : undefined}
                        value={p.nama}
                        onChange={(e) => setPelatihan(i, { nama: e.target.value })}
                        placeholder="Masukkan nama pelatihan"
                        className={inputCls(!!errors[`pelatihan_nama_${i}`])}
                      />
                    </Field>
                    <Field id={`pelatihan_tahun_${i}`} label="Tahun" error={errors[`pelatihan_tahun_${i}`]}>
                      <input
                        id={`pelatihan_tahun_${i}`}
                        inputMode="numeric"
                        maxLength={4}
                        aria-invalid={errors[`pelatihan_tahun_${i}`] ? true : undefined}
                        aria-describedby={errors[`pelatihan_tahun_${i}`] ? `pelatihan_tahun_${i}-err` : undefined}
                        value={p.tahun}
                        onChange={(e) => setPelatihan(i, { tahun: e.target.value.replace(/\D/g, "") })}
                        placeholder="Tahun"
                        className={inputCls(!!errors[`pelatihan_tahun_${i}`])}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removePelatihan(i)}
                      aria-label={`Hapus pelatihan baris ${i + 1}`}
                      className={`flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 ${focus}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={addPelatihan}
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 ${focus}`}
                  >
                    <Plus size={14} aria-hidden="true" /> Tambah Pelatihan
                  </button>
                </div>
              </div>
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push(LIST_PATH)}
                  disabled={saving}
                  className={`flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 sm:flex-none ${focus}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 sm:flex-none ${focus}`}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
                  {mode === "edit" ? "Simpan Perubahan" : "Simpan Data SDM"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ServiceRouteGuard>
  );
}