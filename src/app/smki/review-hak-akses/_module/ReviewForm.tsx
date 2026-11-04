"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Plus, Save, Trash2, FileEdit } from "lucide-react";
import toast from "react-hot-toast";
import { blankReview, blankAccount, userStatuses, validateReview, type ReviewInput, type Review, type Errors, type ReviewAccount } from "./model";
import { useMasters, type MasterOption } from "./useMasters";
import { ReviewSaveError } from "./useReviews";
import ReviewSignatories from "./ReviewSignatories";
import { Section, control, primary, secondary, panel } from "./ui";

interface Props { review: Review | null; bidangId: number; bidangName: string; userName: string; onBack: () => void; onSave: (input: ReviewInput, complete: boolean) => Promise<void> }
function Field({ id, label, required, error, children }: {id: string; label: string; required?: boolean; error?: string; children: ReactNode}) {
  return <div><label htmlFor={id} className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">{label}{required && <><span className="text-red-500" aria-hidden="true"> *</span><span className="sr-only"> wajib sebelum Simpan</span></>}</label>{children}{error && <p id={`${id}-error`} role="alert" className="text-red-600 text-[11px] mt-1">{error}</p>}</div>;
}
export default function ReviewForm({review, bidangId, bidangName, onBack, onSave}: Props) {
  const [input, setInput] = useState<ReviewInput>(() => review ? structuredClone(review) : blankReview(bidangId, bidangName));
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const masters = useMasters();
  const update = <K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) => {setInput(previous => ({...previous, [key]: value})); setErrors(previous => ({...previous, [key]: ""})); setDirty(true);};
  const updateAccount = (index: number, key: keyof ReviewAccount, value: string) => {
    update("accounts", input.accounts.map((account, i) => i === index ? {...account, [key]: value} : account));
    setErrors(previous => ({...previous, [`accounts.${index}.${key}`]: ""}));
  };
  const field = (key: Exclude<keyof ReviewInput, "accounts" | "bidangId">, label: string, required = false, type = "text") => <Field id={`review-${key}`} label={label} required={required} error={errors[key]}><input id={`review-${key}`} type={type} maxLength={255} value={String(input[key])} onChange={event => update(key, event.target.value)} className={control} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `review-${key}-error` : undefined}/></Field>;
  const select = (id: string, value: string, items: MasterOption[], onChange: (value: string) => void, oldName: string, error?: string) => <select id={id} value={value} onChange={event => onChange(event.target.value)} className={control} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
    <option value="">Pilih dari master data</option>{value && !items.some(item => item.id === value) && <option value={value}>{oldName || "Referensi lama tidak tersedia"}</option>}{items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
  </select>;
  const save = async (complete: boolean) => {
    if (saving) return;
    const next = {...input, title: input.objectName ? `Review Hak Akses ${input.objectName}` : "Review Hak Akses"};
    const nextErrors = validateReview(next, complete);
    if (complete) {
      if (!masters.data?.systems.some(item => item.id === next.objectId)) nextErrors.objectId = "Pilih obyek review yang tersedia pada master sistem.";

      if (!masters.data?.employees.some(item => item.id === next.reviewerId)) nextErrors.reviewerId = "Pilih pelaksana yang tersedia pada master pegawai.";
      for (const key of ["preparedById", "acknowledgedById"] as const) {
        if (!masters.data?.employees.some(item => item.id === next[key])) nextErrors[key] = "Pilih penanda tangan yang tersedia pada master pegawai.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error(complete ? "Lengkapi bagian yang ditandai sebelum Simpan." : "Periksa isian yang ditandai sebelum menyimpan draf.");
      requestAnimationFrame(() => {document.getElementById(`review-${Object.keys(nextErrors)[0]}`)?.focus();});
      return;
    }
    setSaving(true);
    try {await onSave(next, complete);}
    catch (error) {
      if (error instanceof ReviewSaveError) setErrors(error.fields);
      toast.error(error instanceof Error ? error.message : "Review gagal disimpan.");
    } finally {setSaving(false);}
  };
  const back = () => {if (!dirty || window.confirm("Perubahan belum disimpan. Tinggalkan formulir?")) onBack();};
  const submit = (event: FormEvent) => {event.preventDefault(); save(true);};
  return <div className="space-y-5 pb-8">
    <button onClick={back} className="inline-flex gap-2 items-center text-xs font-semibold text-slate-500 hover:text-emerald-600"><ArrowLeft size={15}/> Manajemen Review Hak Akses</button>
    <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{review ? "Edit Review Hak Akses" : "Formulir Review Hak Akses"}</h1><p className="text-xs text-slate-400 mt-2">Catat pengguna yang terdaftar dalam sistem, tingkat hak akses, status akun, dan tindak lanjut review.</p></div>
    <p className="text-[11px] text-slate-500"><span className="text-red-500 font-bold">*</span> Wajib untuk Simpan. Simpan Draf dapat digunakan saat formulir belum lengkap.</p>
    {masters.loading && <p role="status" className="text-xs text-slate-500">Memuat master sistem dan pegawai...</p>}
    {masters.error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-4 text-xs"><p>{masters.error}</p><button type="button" className={`${secondary} mt-3`} onClick={masters.retry}>Coba Lagi</button></div>}
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={saving}>
      <fieldset disabled={saving} className="space-y-5 min-w-0">
      {Object.keys(errors).length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">Ada {Object.keys(errors).length} isian yang perlu diperbaiki. Periksa pesan di bawah setiap field.</div>}
      <Section number="01" title="Detail Dokumen" description="Informasi ini akan digunakan pada kop dokumen Word."><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{field("documentNumber", "No. Dokumen", true)}{field("documentRevision", "No. Revisi", true)}{field("documentEffectiveDate", "Tanggal Berlaku", true, "date")}</div></Section>
      <Section number="02" title="Identitas Review" description="Tanggal, periode, obyek, dan pelaksana review hak akses."><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("reviewDate", "Tanggal Review", true, "date")}
        <Field id="review-objectId" label="Obyek Review" required error={errors.objectId}>{select("review-objectId", input.objectId, masters.data?.systems ?? [], value => {update("objectId", value); update("objectName", masters.data?.systems.find(item => item.id === value)?.name ?? "");}, input.objectName, errors.objectId)}</Field>
        {field("periodStart", "Awal Periode Review", true, "date")}{field("periodEnd", "Akhir Periode Review", true, "date")}
        <Field id="review-reviewerId" label="Pelaksana Review" required error={errors.reviewerId}>{select("review-reviewerId", input.reviewerId, masters.data?.employees ?? [], value => {update("reviewerId", value); update("reviewer", masters.data?.employees.find(item => item.id === value)?.name ?? "");}, input.reviewer, errors.reviewerId)}</Field>
      </div></Section>
      <Section number="03" title="Daftar Pengguna yang Terdaftar dalam Sistem" description="Isi User ID sesuai log sistem pada obyek review yang dipilih.">
        {errors.accounts && <p role="alert" className="text-xs text-red-600 mb-3">{errors.accounts}</p>}
        <div id="review-accounts" tabIndex={-1} className="space-y-4">{input.accounts.map((account, index) => {
          const error = (key: keyof ReviewAccount) => errors[`accounts.${index}.${key}`];
          const id = (key: keyof ReviewAccount) => `review-accounts.${index}.${key}`;
          return <fieldset key={account.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"><legend className="px-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">Pengguna {index + 1}</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field id={id("username")} label="User ID yang Ada di Log Sistem" required error={error("username")}><input id={id("username")} value={account.username} maxLength={255} onChange={event => updateAccount(index, "username", event.target.value)} className={control} aria-invalid={!!error("username")} aria-describedby={error("username") ? `${id("username")}-error` : undefined}/></Field>
              <Field id={id("currentAccess")} label="Tingkat Hak Akses" required error={error("currentAccess")}><input id={id("currentAccess")} value={account.currentAccess} maxLength={255} placeholder="Contoh: Administrator / Operator / Read Only" onChange={event => updateAccount(index, "currentAccess", event.target.value)} className={control} aria-invalid={!!error("currentAccess")} aria-describedby={error("currentAccess") ? `${id("currentAccess")}-error` : undefined}/></Field>
              <Field id={id("userStatus")} label="Ket. Status User ID" required error={error("userStatus")}><select id={id("userStatus")} value={account.userStatus} onChange={event => updateAccount(index, "userStatus", event.target.value)} className={control} aria-invalid={!!error("userStatus")} aria-describedby={error("userStatus") ? `${id("userStatus")}-error` : undefined}><option value="">Pilih status</option>{userStatuses.map(value => <option key={value}>{value}</option>)}</select></Field>
            </div>
            <div className="flex justify-end mt-3"><button type="button" className="text-xs text-red-600 inline-flex gap-1.5 items-center" aria-label={`Hapus pengguna ${index + 1}`} onClick={() => {if (window.confirm("Hapus baris pengguna ini?")) {update("accounts", input.accounts.filter(item => item.id !== account.id)); setErrors({});}}}><Trash2 size={14}/> Hapus Baris</button></div>
          </fieldset>;
        })}</div>
        <button type="button" onClick={() => update("accounts", [...input.accounts, blankAccount()])} className={`${secondary} mt-4`}><Plus size={15}/> Tambah Pengguna</button>
      </Section>
      <Section number="04" title="Tindak Lanjut" description="Catat tindak lanjut untuk keseluruhan hasil review."><Field id="review-followUp" label="Tindak Lanjut"><textarea id="review-followUp" value={input.followUp} onChange={event => update("followUp", event.target.value)} maxLength={5000} rows={4} className={control} placeholder="Tuliskan tindak lanjut, atau keterangan tidak ada tindak lanjut."/></Field></Section>
      <Section number="05" title="Penanda Tangan" description="Pilih pembuat dan pihak yang mengetahui untuk kotak spesimen TTE pada dokumen."><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("location", "Tempat", true)}{field("signedAt", "Tanggal Dokumen", true, "date")}
      </div><ReviewSignatories input={input} employees={masters.data?.employees ?? []} errors={errors} onChange={values => {
        setInput(previous => ({...previous, ...values}));
        setErrors(previous => {const next = {...previous}; for (const key of Object.keys(values)) delete next[key]; return next;});
        setDirty(true);
      }}/></Section>
      <div className={`${panel} p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}><div><p className="text-xs font-bold">Simpan hasil review?</p><p className="text-[10px] text-slate-400 mt-1">Review tersimpan tetap dapat diedit atau dihapus.</p></div><div className="flex gap-2 flex-wrap"><button type="button" onClick={back} className={secondary}>Batal</button><button type="button" onClick={() => save(false)} className={secondary}><FileEdit size={15}/> Simpan Draf</button><button type="submit" className={primary}><Save size={15}/> Simpan</button></div></div>
      </fieldset>
    </form>
  </div>;
}
