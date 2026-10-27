"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  FileText,
  Info,
  Loader2,
  Paperclip,
  PenLine,
  Save,
  Send,
  Trash2,
  Undo2,
  UploadCloud,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  JENIS_OPTIONS,
  LAMPIRAN_ACCEPT,
  LAMPIRAN_MAKS_BERKAS,
  LAMPIRAN_MAKS_KB,
  RISIKO_OPTIONS,
  extractFieldErrors,
  extractMessage,
  formatTanggal,
  formatUkuran,
  getPerubahanIt,
  getPerubahanItLookup,
  simpanPerubahanIt,
  type Lampiran,
  type PerubahanIt,
  type PerubahanItInput,
  type PerubahanItLookup,
} from "@/services/smki/perubahanIt";
import PerubahanItAksiModal from "./PerubahanItAksiModal";

const LIST_PATH = "/smki/perubahan-it";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

const inputCls = (invalid: boolean, readOnly = false) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
    readOnly ? "bg-slate-50 dark:bg-slate-800/60" : "bg-white dark:bg-slate-800/40"
  } ${invalid ? "border-rose-400 dark:border-rose-600" : "border-slate-200 dark:border-slate-700"}`;

type Errors = Record<string, string>;

const EMPTY: PerubahanItInput = {
  judul: "",
  unit_kerja_id: "",
  perangkat_daerah: "",
  nomor_surat_kontak: "",
  jenis_perubahan: "",
  perubahan_diharapkan: "",
  latar_belakang: "",
  rincian_perubahan: "",
  tingkat_risiko: "",
  keterangan_risiko: "",
  solusi_diharapkan: "",
  risiko_perubahan: "",
  alternatif_perubahan: "",
  estimasi_biaya: "",
  tanggal_perubahan: "",
  jam_mulai: "",
  jam_selesai: "",
  diterima_oleh_id: "",
  disetujui_oleh_id: "",
  dilaksanakan_oleh_id: "",
};

/** Urutan field untuk fokus ke error pertama. */
const FIELD_ORDER = [
  "unit_kerja_id",
  "perangkat_daerah",
  "nomor_surat_kontak",
  "judul",
  "jenis_perubahan",
  "perubahan_diharapkan",
  "latar_belakang",
  "rincian_perubahan",
  "tingkat_risiko",
  "keterangan_risiko",
  "solusi_diharapkan",
  "risiko_perubahan",
  "alternatif_perubahan",
  "estimasi_biaya",
  "tanggal_perubahan",
  "jam_mulai",
  "jam_selesai",
  "diterima_oleh_id",
  "disetujui_oleh_id",
  "dilaksanakan_oleh_id",
  "lampiran",
];

/** Isian inti yang wajib saat diajukan (samakan dengan aturanFormulir() di controller). */
const WAJIB_SAAT_AJUKAN: { key: keyof PerubahanItInput; msg: string }[] = [
  { key: "unit_kerja_id", msg: "Pilih unit kerja." },
  { key: "perangkat_daerah", msg: "Pilih perangkat daerah." },
  { key: "judul", msg: "Judul perubahan wajib diisi." },
  { key: "jenis_perubahan", msg: "Pilih jenis perubahan." },
  { key: "perubahan_diharapkan", msg: "Perubahan yang diharapkan wajib diisi." },
  { key: "latar_belakang", msg: "Latar belakang perubahan wajib diisi." },
  { key: "rincian_perubahan", msg: "Rincian perubahan wajib diisi." },
  { key: "tingkat_risiko", msg: "Pilih kriteria risiko." },
];

function validate(v: PerubahanItInput): Errors {
  const e: Errors = {};
  WAJIB_SAAT_AJUKAN.forEach(({ key, msg }) => {
    if (!String(v[key] ?? "").trim()) e[key] = msg;
  });
  return e;
}

function focusFirstError(errs: Errors) {
  const first = FIELD_ORDER.find((k) => errs[k]);
  if (first) document.getElementById(first)?.focus();
}

const rupiah = (digits: string) =>
  digits ? `Rp ${new Intl.NumberFormat("id-ID").format(Number(digits))}` : "";

const pad2 = (n: number) => String(n).padStart(2, "0");
const tanggalLokal = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const jamLokal = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Default waktu perubahan: hari ini, jam mulai sekarang, jam selesai +1 jam (maks 23:59). Memakai waktu lokal, bukan UTC. */
const waktuDefault = () => {
  const now = new Date();
  const akhir = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    tanggal: tanggalLokal(now),
    mulai: jamLokal(now),
    selesai: akhir.getDate() === now.getDate() ? jamLokal(akhir) : "23:59",
  };
};

function Field({
  id,
  label,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function Section({
  no,
  title,
  subtitle,
  children,
}: {
  no: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-extrabold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          {no}
        </span>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function RadioCards<T extends string>({
  name,
  legend,
  options,
  value,
  error,
  cols,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; desc?: string }[];
  value: string;
  error?: string;
  cols: string;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">{legend}</legend>
      <div className={`grid grid-cols-1 gap-3 ${cols}`}>
        {options.map((o, i) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600 ${
              value === o.value
                ? "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
                : error
                ? "border-rose-300 dark:border-rose-700"
                : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
            }`}
          >
            <input
              id={i === 0 ? name : undefined}
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              aria-invalid={error ? true : undefined}
              className="h-4 w-4 flex-shrink-0 text-emerald-700 focus:outline-none"
            />
            <span>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{o.label}</span>
              {o.desc && <span className="block text-[11px] text-slate-500 dark:text-slate-400">{o.desc}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-err`} className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ReadonlyBox({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800/60 ${
        muted ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Kartu satu tahap pengesahan (bagian 05).
 * Nama berupa dropdown pengguna (tidak disabled); tanggal dan tanda tangan hanya-baca karena diisi alur kerja.
 * Bila namaOptions tidak diberikan (tahap 1), nama tampil sebagai kotak hanya-baca.
 */
function TahapCard({
  no,
  judul,
  peran,
  nama,
  tanggal,
  ttdSelesai,
  ttdTeks,
  namaId,
  namaValue,
  namaOptions,
  namaPlaceholder,
  onNamaChange,
  error,
}: {
  no: number;
  judul: string;
  peran: string;
  nama?: string | null;
  tanggal: string | null;
  ttdSelesai: boolean;
  ttdTeks: string;
  namaId?: string;
  namaValue?: string;
  namaOptions?: { value: string; label: string }[];
  namaPlaceholder?: string;
  onNamaChange?: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
        {no}. {judul}
      </p>
      <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">{peran}</p>

      {namaOptions && namaId ? (
        <div>
          <label htmlFor={namaId} className="mb-1 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
            Nama
          </label>
          <div className="relative">
            <select
              id={namaId}
              value={namaValue ?? ""}
              onChange={(e) => onNamaChange?.(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${namaId}-err` : undefined}
              className={`${inputCls(!!error)} appearance-none pr-9`}
            >
              <option value="">{namaPlaceholder ?? "Pilih nama"}</option>
              {namaOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          </div>
          {error && (
            <p id={`${namaId}-err`} className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">Nama</p>
          <ReadonlyBox muted={!nama}>{nama || "Belum ditentukan"}</ReadonlyBox>
        </>
      )}

      <p className="mb-1 mt-3 text-[11px] font-bold text-slate-700 dark:text-slate-200">Tanggal</p>
      <ReadonlyBox muted={!tanggal}>
        <span className="flex items-center justify-between gap-2">
          {tanggal ? formatTanggal(tanggal) : "Belum tersedia"}
          <CalendarDays size={13} className="text-slate-400" aria-hidden="true" />
        </span>
      </ReadonlyBox>

      <p className="mb-1 mt-3 text-[11px] font-bold text-slate-700 dark:text-slate-200">Tanda tangan</p>
      <div
        className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-[11px] ${
          ttdSelesai
            ? "border-emerald-300 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
            : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
        }`}
      >
        {ttdSelesai ? <CheckCircle2 size={16} aria-hidden="true" /> : <PenLine size={16} aria-hidden="true" />}
        {ttdTeks}
      </div>
    </div>
  );
}

export default function PerubahanItForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const id = mode === "edit" ? params?.id : undefined;
  const auth = useAuthStore() as unknown as {
    bidang?: { name?: string } | null;
    user?: { name?: string } | null;
  };

  const [values, setValues] = useState<PerubahanItInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<null | "draft" | "ajukan">(null);
  const [item, setItem] = useState<PerubahanIt | null>(null);
  const [lookup, setLookup] = useState<PerubahanItLookup>({ unit_kerja: [], perangkat_daerah: [], pengguna: [] });

  const [lampiranLama, setLampiranLama] = useState<Lampiran[]>([]);
  const [hapusIds, setHapusIds] = useState<number[]>([]);
  const [berkasBaru, setBerkasBaru] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [konfirmasiAjukan, setKonfirmasiAjukan] = useState(false);

  const pemohonNama = item?.pemohon || auth.user?.name || "-";

    // Kunci scroll dokumen agar tidak muncul ruang kosong di bawah halaman.
  // Konten formulir menjadi area scroll tersendiri dengan tinggi sesuai viewport.
  const unlockRef = useRef<(() => void) | null>(null);

  const rootRef = useCallback((node: HTMLDivElement | null) => {
    if (unlockRef.current) {
      unlockRef.current();
      unlockRef.current = null;
    }

    if (!node) return;

    // 1. Kunci scroll dokumen dan elemen induk yang dapat di-scroll.
    const saved: {
      el: HTMLElement;
      overflowY: string;
      scrollTop: number;
    }[] = [];

    const lock = (el: HTMLElement) => {
      saved.push({
        el,
        overflowY: el.style.overflowY,
        scrollTop: el.scrollTop,
      });

      el.scrollTop = 0;
      el.style.overflowY = "hidden";
    };

    lock(document.documentElement);
    lock(document.body);

    let el: HTMLElement | null = node.parentElement;

    while (el && el !== document.body) {
      const overflowY = window.getComputedStyle(el).overflowY;

      if (overflowY === "auto" || overflowY === "scroll") {
        lock(el);
      }

      el = el.parentElement;
    }

    window.scrollTo(0, 0);

    // 2. Jadikan halaman formulir sebagai area scroll tersendiri.
    node.style.overflowY = "auto";
    node.style.overscrollBehavior = "contain";

    const fit = () => {
      const top = node.getBoundingClientRect().top;

      node.style.maxHeight = `${Math.max(
        240,
        window.innerHeight - top - 16
      )}px`;
    };

    fit();

    const t1 = window.setTimeout(fit, 150);
    const t2 = window.setTimeout(fit, 600);

    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);

    unlockRef.current = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);

      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);

      node.style.maxHeight = "";
      node.style.overflowY = "";
      node.style.overscrollBehavior = "";

      saved.forEach(({ el, overflowY, scrollTop }) => {
        el.style.overflowY = overflowY;
        el.scrollTop = scrollTop;
      });
    };
  }, []);

  // Muat opsi dropdown (master unit kerja + pengguna) + data yang diedit
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [opsi, data] = await Promise.all([
          getPerubahanItLookup("all"),
          mode === "edit" && id ? getPerubahanIt(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setLookup(opsi);

        if (data) {
          if (!data.izin.can_edit) {
            setLoadError(
              "Formulir ini tidak dapat diubah. Hanya formulir berstatus Draft atau Dikembalikan yang bisa diubah."
            );
            return;
          }

          const w = waktuDefault();

          setItem(data);
          setLampiranLama(data.lampiran);
          setValues({
            judul: data.judul ?? "",
            unit_kerja_id: data.unit_kerja_id ? String(data.unit_kerja_id) : "",
            perangkat_daerah: data.perangkat_daerah ?? "",
            nomor_surat_kontak: data.nomor_surat_kontak ?? "",
            jenis_perubahan: data.jenis_perubahan ?? "",
            perubahan_diharapkan: data.perubahan_diharapkan ?? "",
            latar_belakang: data.latar_belakang ?? "",
            rincian_perubahan: data.rincian_perubahan ?? "",
            tingkat_risiko: data.tingkat_risiko ?? "",
            keterangan_risiko: data.keterangan_risiko ?? "",
            solusi_diharapkan: data.solusi_diharapkan ?? "",
            risiko_perubahan: data.risiko_perubahan ?? "",
            alternatif_perubahan: data.alternatif_perubahan ?? "",
            estimasi_biaya: data.estimasi_biaya ? String(Math.round(data.estimasi_biaya)) : "",
            tanggal_perubahan: data.tanggal_perubahan || w.tanggal,
            jam_mulai: data.jam_mulai || w.mulai,
            jam_selesai: data.jam_selesai || w.selesai,
            diterima_oleh_id: data.diterima_oleh_id ? String(data.diterima_oleh_id) : "",
            disetujui_oleh_id: data.disetujui_oleh_id ? String(data.disetujui_oleh_id) : "",
            dilaksanakan_oleh_id: data.dilaksanakan_oleh_id ? String(data.dilaksanakan_oleh_id) : "",
          });
        } else {
          // Formulir baru: perangkat daerah terpilih otomatis bila hanya ada satu pilihan; tanggal & jam default sekarang
          const w = waktuDefault();
          setValues((prev) => ({
            ...prev,
            perangkat_daerah: opsi.perangkat_daerah.length === 1 ? opsi.perangkat_daerah[0] : prev.perangkat_daerah,
            tanggal_perubahan: prev.tanggal_perubahan || w.tanggal,
            jam_mulai: prev.jam_mulai || w.mulai,
            jam_selesai: prev.jam_selesai || w.selesai,
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(
            err?.response?.status === 404
              ? "Data perubahan TI tidak ditemukan."
              : extractMessage(err, "Gagal memuat data formulir.")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  const set = <K extends keyof PerubahanItInput>(key: K, value: PerubahanItInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const lampiranAktif = useMemo(
    () => lampiranLama.filter((l) => !hapusIds.includes(l.id)),
    [lampiranLama, hapusIds]
  );
  const totalLampiran = lampiranAktif.length + berkasBaru.length;

  const opsiPengguna = useMemo(
    () => lookup.pengguna.map((u) => ({ value: String(u.id), label: u.nama })),
    [lookup.pengguna]
  );

  const tambahBerkas = (picked: File[]) => {
    if (picked.length === 0) return;

    const allowed = LAMPIRAN_ACCEPT.split(",");
    const extOk = (f: File) => allowed.some((ext) => f.name.toLowerCase().endsWith(ext));

    const salahTipe = picked.filter((f) => !extOk(f));
    const tooBig = picked.filter((f) => extOk(f) && f.size > LAMPIRAN_MAKS_KB * 1024);
    const ok = picked.filter((f) => extOk(f) && f.size <= LAMPIRAN_MAKS_KB * 1024);
    const ruang = Math.max(0, LAMPIRAN_MAKS_BERKAS - totalLampiran);
    const diterima = ok.slice(0, ruang);

    let pesan = "";
    if (salahTipe.length > 0) {
      pesan = `${salahTipe.map((f) => f.name).join(", ")} bukan format yang didukung (PDF, DOCX, XLSX, JPG, PNG).`;
    } else if (tooBig.length > 0) {
      pesan = `${tooBig.map((f) => f.name).join(", ")} melebihi ${LAMPIRAN_MAKS_KB / 1024} MB.`;
    } else if (ok.length > ruang) {
      pesan = `Lampiran maksimal ${LAMPIRAN_MAKS_BERKAS} berkas.`;
    }

    setBerkasBaru((prev) => [...prev, ...diterima]);
    setErrors((prev) => ({ ...prev, lampiran: pesan }));
  };

  const simpan = async (aksiSimpan: "draft" | "ajukan") => {
    if (saving) return;

    if (aksiSimpan === "ajukan") {
      const errs = validate(values);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setKonfirmasiAjukan(false);
        toast.error("Lengkapi isian wajib sebelum mengajukan.");
        requestAnimationFrame(() => focusFirstError(errs));
        return;
      }
    }

    setSaving(aksiSimpan);
    try {
      const { message } = await simpanPerubahanIt(
        values,
        { aksiSimpan, lampiranBaru: berkasBaru, hapusLampiranIds: hapusIds },
        id
      );
      toast.success(message || "Berhasil disimpan.");
      router.push(LIST_PATH);
    } catch (err: any) {
      const mapped = extractFieldErrors(err);
      setKonfirmasiAjukan(false);
      if (err?.response?.status === 422 && Object.keys(mapped).length > 0) {
        setErrors(mapped);
        toast.error("Periksa kembali isian yang ditandai.");
        requestAnimationFrame(() => focusFirstError(mapped));
      } else {
        toast.error(extractMessage(err, "Gagal menyimpan permintaan perubahan TI."));
      }
      setSaving(null);
    }
  };

  const bind = (key: keyof PerubahanItInput) => ({
    id: key as string,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `${key}-err` : undefined,
  });

  const text = (key: keyof PerubahanItInput, placeholder: string, max = 255) => (
    <input
      {...bind(key)}
      maxLength={max}
      value={values[key]}
      onChange={(e) => set(key, e.target.value as never)}
      placeholder={placeholder}
      className={inputCls(!!errors[key])}
    />
  );

  const area = (key: keyof PerubahanItInput, placeholder: string, rows = 3) => (
    <textarea
      {...bind(key)}
      rows={rows}
      maxLength={5000}
      value={values[key]}
      onChange={(e) => set(key, e.target.value as never)}
      placeholder={placeholder}
      className={`${inputCls(!!errors[key])} resize-y`}
    />
  );

  const select = (key: keyof PerubahanItInput, placeholder: string, options: { value: string; label: string }[]) => (
    <div className="relative">
      <select
        {...bind(key)}
        value={values[key]}
        onChange={(e) => set(key, e.target.value as never)}
        className={`${inputCls(!!errors[key])} appearance-none pr-9`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
    </div>
  );

  const busy = saving !== null;
  const dikembalikan = item?.status === "dikembalikan";

  return (
    <ServiceRouteGuard requiredService="SMKI">
       <div
        ref={rootRef}
        className="flex flex-col gap-5 overflow-hidden pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div>
          <Link
            href={LIST_PATH}
            className={`inline-flex items-center gap-1 rounded-md text-[11px] font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300 ${focus}`}
          >
            <ChevronLeft size={13} aria-hidden="true" /> Manajemen Permintaan Perubahan TI
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {mode === "edit" ? "Ubah Permintaan Perubahan TI" : "Formulir Permintaan Perubahan TI"}
            </h1>
            {mode === "edit" && item && !loading && !loadError && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {item.no_rfc}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            Lengkapi informasi perubahan, risiko, dan rencana pelaksanaan sebelum diajukan.
          </p>
        </div>

        {loading ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/90"
            role="status"
          >
            <Loader2 size={24} className="animate-spin text-emerald-600" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Memuat formulir...</span>
          </div>
        ) : loadError ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900/90"
            role="alert"
          >
            <AlertCircle size={30} className="text-amber-600" aria-hidden="true" />
            <p className="max-w-md text-sm font-bold text-slate-800 dark:text-slate-100">{loadError}</p>
            <Link href={LIST_PATH} className={`mt-1 rounded-md text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 ${focus}`}>
              Kembali ke daftar
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              simpan("draft");
            }}
            noValidate
            className="flex flex-col gap-5"
          >
            {dikembalikan && item?.catatan_pengembalian && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <Undo2 size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-extrabold">Dikembalikan oleh Koordinator Agen</p>
                  <p className="mt-1 whitespace-pre-wrap">{item.catatan_pengembalian}</p>
                </div>
              </div>
            )}

            {/* 01 */}
            <Section no="01" title="Informasi Pemohon" subtitle="Identitas dan kontak pemohon untuk administrasi permintaan perubahan.">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">Pemohon</p>
                  <ReadonlyBox>
                    <span className="flex items-center justify-between gap-2">
                      {pemohonNama}
                      <User size={14} className="text-slate-400" aria-hidden="true" />
                    </span>
                  </ReadonlyBox>
                </div>
                <Field id="unit_kerja_id" label="Unit Kerja" error={errors.unit_kerja_id}>
                  {select(
                    "unit_kerja_id",
                    "Pilih unit kerja",
                    lookup.unit_kerja.map((u) => ({ value: String(u.id), label: u.nama }))
                  )}
                </Field>
                <Field id="perangkat_daerah" label="Perangkat Daerah" error={errors.perangkat_daerah}>
                  {select(
                    "perangkat_daerah",
                    "Pilih perangkat daerah",
                    lookup.perangkat_daerah.map((p) => ({ value: p, label: p }))
                  )}
                </Field>
                <Field
                  id="nomor_surat_kontak"
                  label="Nomor Surat / Contact Person"
                  hint="Cantumkan nomor surat atau kontak yang dapat dihubungi untuk koordinasi."
                  error={errors.nomor_surat_kontak}
                  className="md:col-span-2"
                >
                  {text("nomor_surat_kontak", "Contoh: Nama · email@instansi.go.id")}
                </Field>
              </div>
            </Section>

            {/* 02 */}
            <Section no="02" title="Informasi Perubahan" subtitle="Jelaskan jenis, tujuan, dan rincian teknis perubahan yang diajukan.">
              <div className="grid grid-cols-1 gap-4">
                <Field id="judul" label="Judul Perubahan" error={errors.judul}>
                  {text("judul", "Contoh: Peningkatan kapasitas server aplikasi")}
                </Field>
                <RadioCards
                  name="jenis_perubahan"
                  legend="Jenis Perubahan"
                  options={JENIS_OPTIONS}
                  value={values.jenis_perubahan}
                  error={errors.jenis_perubahan}
                  cols="md:grid-cols-3"
                  onChange={(v) => set("jenis_perubahan", v)}
                />
                <Field id="perubahan_diharapkan" label="Perubahan yang Diharapkan" error={errors.perubahan_diharapkan}>
                  {area("perubahan_diharapkan", "Jelaskan perubahan yang diharapkan")}
                </Field>
                <Field id="latar_belakang" label="Latar Belakang Perubahan" error={errors.latar_belakang}>
                  {area("latar_belakang", "Jelaskan alasan perubahan diperlukan")}
                </Field>
                <Field id="rincian_perubahan" label="Rincian atas Perubahan yang Diajukan" error={errors.rincian_perubahan}>
                  {area("rincian_perubahan", "Uraikan rincian perubahan")}
                </Field>
              </div>
            </Section>

            {/* 03 */}
            <Section
              no="03"
              title="Risiko Jika Perubahan Tidak Dilakukan"
              subtitle="Nilai dampak terhadap layanan apabila perubahan tidak dilaksanakan."
            >
              <div className="grid grid-cols-1 gap-4">
                <RadioCards
                  name="tingkat_risiko"
                  legend="Kriteria Risiko"
                  options={RISIKO_OPTIONS}
                  value={values.tingkat_risiko}
                  error={errors.tingkat_risiko}
                  cols="sm:grid-cols-2 lg:grid-cols-5"
                  onChange={(v) => set("tingkat_risiko", v)}
                />
                <Field id="keterangan_risiko" label="Keterangan Risiko" error={errors.keterangan_risiko}>
                  {area("keterangan_risiko", "Keterangan tambahan terkait risiko")}
                </Field>
              </div>
            </Section>

            {/* 04 */}
            <Section
              no="04"
              title="Rencana Perubahan"
              subtitle="Uraikan solusi, mitigasi risiko, kebutuhan biaya, jadwal, dan dokumen pendukung."
            >
              <div className="grid grid-cols-1 gap-4">
                <Field id="solusi_diharapkan" label="Solusi yang Diharapkan" error={errors.solusi_diharapkan}>
                  {area("solusi_diharapkan", "Solusi yang diharapkan")}
                </Field>
                <Field id="risiko_perubahan" label="Risiko Perubahan" error={errors.risiko_perubahan}>
                  {area("risiko_perubahan", "Risiko yang mungkin timbul akibat perubahan")}
                </Field>
                <Field id="alternatif_perubahan" label="Alternatif Perubahan" error={errors.alternatif_perubahan}>
                  {area("alternatif_perubahan", "Alternatif lain selain perubahan yang diajukan")}
                </Field>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  <Field
                    id="estimasi_biaya"
                    label="Biaya Perubahan"
                    hint="Estimasi total biaya pelaksanaan dalam rupiah."
                    error={errors.estimasi_biaya}
                  >
                    <input
                      {...bind("estimasi_biaya")}
                      inputMode="numeric"
                      maxLength={22}
                      value={rupiah(values.estimasi_biaya)}
                      onChange={(e) => set("estimasi_biaya", e.target.value.replace(/\D/g, "").slice(0, 13))}
                      placeholder="Rp 0"
                      className={inputCls(!!errors.estimasi_biaya)}
                    />
                  </Field>

                  <div>
                    <Field
                      id="tanggal_perubahan"
                      label="Waktu Perubahan"
                      hint="Tanggal dan rentang waktu pelaksanaan perubahan."
                      error={errors.tanggal_perubahan || errors.jam_mulai || errors.jam_selesai}
                    >
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
                        <input
                          {...bind("tanggal_perubahan")}
                          type="date"
                          value={values.tanggal_perubahan}
                          onChange={(e) => set("tanggal_perubahan", e.target.value)}
                          className={inputCls(!!errors.tanggal_perubahan)}
                        />
                        <input
                          {...bind("jam_mulai")}
                          aria-label="Jam mulai"
                          type="time"
                          value={values.jam_mulai}
                          onChange={(e) => set("jam_mulai", e.target.value)}
                          className={inputCls(!!errors.jam_mulai)}
                        />
                        <input
                          {...bind("jam_selesai")}
                          aria-label="Jam selesai"
                          type="time"
                          value={values.jam_selesai}
                          onChange={(e) => set("jam_selesai", e.target.value)}
                          className={inputCls(!!errors.jam_selesai)}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Lampiran */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="lampiran" className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Lampiran
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{totalLampiran} berkas terlampir</span>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      tambahBerkas(Array.from(e.dataTransfer.files));
                    }}
                    className={`flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed px-4 py-3.5 sm:flex-row sm:items-center ${
                      dragOver
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                        : errors.lampiran
                        ? "border-rose-400 dark:border-rose-600"
                        : "border-slate-300 bg-slate-50/60 dark:border-slate-600 dark:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <UploadCloud size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Seret berkas ke sini atau pilih dari perangkat Anda
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          PDF, DOCX, XLSX, JPG, atau PNG · Maksimal {LAMPIRAN_MAKS_KB / 1024} MB per berkas · Maks.{" "}
                          {LAMPIRAN_MAKS_BERKAS} berkas
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={totalLampiran >= LAMPIRAN_MAKS_BERKAS}
                      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${focus}`}
                    >
                      <Paperclip size={13} aria-hidden="true" /> Pilih Berkas
                    </button>
                    <input
                      ref={fileRef}
                      id="lampiran"
                      type="file"
                      multiple
                      accept={LAMPIRAN_ACCEPT}
                      className="sr-only"
                      tabIndex={-1}
                      aria-invalid={errors.lampiran ? true : undefined}
                      aria-describedby={errors.lampiran ? "lampiran-err" : undefined}
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        e.target.value = ""; // izinkan memilih berkas yang sama lagi
                        tambahBerkas(picked);
                      }}
                    />
                  </div>
                  {errors.lampiran && (
                    <p id="lampiran-err" role="alert" className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {errors.lampiran}
                    </p>
                  )}

                  {(lampiranAktif.length > 0 || berkasBaru.length > 0) && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {lampiranAktif.map((l) => (
                        <li
                          key={`lama-${l.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <FileText size={15} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{l.nama_asli}</span>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                                {formatUkuran(l.ukuran)} · Berhasil diunggah
                              </span>
                            </span>
                          </span>
                          <span className="flex flex-shrink-0 items-center gap-1">
                            <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
                            <button
                              type="button"
                              onClick={() => setHapusIds((prev) => [...prev, l.id])}
                              aria-label={`Hapus lampiran ${l.nama_asli}`}
                              className={`rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 ${focus}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </span>
                        </li>
                      ))}
                      {berkasBaru.map((f, i) => (
                        <li
                          key={`baru-${i}-${f.name}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 px-3.5 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/20"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300">
                              <FileText size={15} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{f.name}</span>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                                {formatUkuran(f.size)} · Diunggah saat disimpan
                              </span>
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setBerkasBaru((prev) => prev.filter((_, idx) => idx !== i))}
                            aria-label={`Batalkan lampiran ${f.name}`}
                            className={`rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 ${focus}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hapusIds.length > 0 && (
                    <p className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      {hapusIds.length} lampiran akan dihapus saat disimpan.{" "}
                      <button type="button" onClick={() => setHapusIds([])} className={`rounded-md font-bold underline ${focus}`}>
                        Batalkan
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* 05 */}
            <Section
              no="05"
              title="Penerimaan, Persetujuan, dan Pelaksanaan"
              subtitle="Pengesahan dilakukan berurutan oleh pemohon, koordinator, penanggung jawab, dan agen."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TahapCard
                  no={1}
                  judul="Dibuat Oleh"
                  peran="Pemohon"
                  nama={pemohonNama === "-" ? null : pemohonNama}
                  tanggal={item?.tanggal ?? new Date().toISOString().slice(0, 10)}
                  ttdSelesai={!!item?.tanggal_diajukan}
                  ttdTeks={item?.tanggal_diajukan ? "Telah diajukan" : "Menunggu pengajuan"}
                />
                <TahapCard
                  no={2}
                  judul="Diterima Oleh"
                  peran="Koordinator Agen"
                  nama={item?.diterima_oleh_nama ?? null}
                  tanggal={item?.diterima_pada ?? null}
                  ttdSelesai={!!item?.diterima_pada}
                  ttdTeks={item?.diterima_pada ? "Telah diterima" : "Menunggu tahap sebelumnya"}
                  namaId="diterima_oleh_id"
                  namaValue={values.diterima_oleh_id}
                  namaOptions={opsiPengguna}
                  namaPlaceholder="Pilih koordinator agen"
                  onNamaChange={(v) => set("diterima_oleh_id", v)}
                  error={errors.diterima_oleh_id}
                />
                <TahapCard
                  no={3}
                  judul="Disetujui Oleh"
                  peran="Penanggung Jawab Perangkat"
                  nama={item?.disetujui_oleh_nama ?? null}
                  tanggal={item?.disetujui_pada ?? null}
                  ttdSelesai={!!item?.disetujui_pada}
                  ttdTeks={item?.disetujui_pada ? "Telah disetujui" : "Menunggu tahap sebelumnya"}
                  namaId="disetujui_oleh_id"
                  namaValue={values.disetujui_oleh_id}
                  namaOptions={opsiPengguna}
                  namaPlaceholder="Pilih penanggung jawab"
                  onNamaChange={(v) => set("disetujui_oleh_id", v)}
                  error={errors.disetujui_oleh_id}
                />
                <TahapCard
                  no={4}
                  judul="Dilaksanakan Oleh"
                  peran="Agen"
                  nama={item?.dilaksanakan_oleh_nama ?? null}
                  tanggal={item?.dilaksanakan_pada ?? null}
                  ttdSelesai={!!item?.dilaksanakan_pada}
                  ttdTeks={item?.dilaksanakan_pada ? "Telah dilaksanakan" : "Menunggu tahap sebelumnya"}
                  namaId="dilaksanakan_oleh_id"
                  namaValue={values.dilaksanakan_oleh_id}
                  namaOptions={opsiPengguna}
                  namaPlaceholder="Pilih agen"
                  onNamaChange={(v) => set("dilaksanakan_oleh_id", v)}
                  error={errors.dilaksanakan_oleh_id}
                />
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-[11px] text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                <Info size={14} className="mt-px flex-shrink-0" aria-hidden="true" />
                Nama, tanggal, dan tanda tangan penerima, penyetuju, serta pelaksana dilengkapi pada masing-masing tahap
                setelah permintaan diajukan.
              </p>
            </Section>

            {/* Bilah aksi */}
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">Siap mengajukan permintaan?</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Periksa kembali data atau simpan sebagai draf untuk dilanjutkan nanti.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                <Link
                  href={LIST_PATH}
                  aria-disabled={busy}
                  className={`inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${focus}`}
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={busy}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focus}`}
                >
                  {saving === "draft" ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                  {saving === "draft" ? "Menyimpan..." : mode === "edit" && !dikembalikan ? "Simpan Perubahan" : "Simpan Draf"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const errs = validate(values);
                    if (Object.keys(errs).length > 0) {
                      setErrors(errs);
                      toast.error("Lengkapi isian wajib sebelum mengajukan.");
                      requestAnimationFrame(() => focusFirstError(errs));
                      return;
                    }
                    setKonfirmasiAjukan(true);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 ${focus}`}
                >
                  <Send size={14} aria-hidden="true" />
                  {dikembalikan ? "Ajukan Ulang" : "Ajukan Permintaan"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <PerubahanItAksiModal
        open={konfirmasiAjukan}
        aksi="ajukan"
        noRfc={item?.no_rfc ?? "Permintaan baru"}
        submitting={saving === "ajukan"}
        onCancel={() => setKonfirmasiAjukan(false)}
        onSubmit={() => simpan("ajukan")}
      />
    </ServiceRouteGuard>
  );
}