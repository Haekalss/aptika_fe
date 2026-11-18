"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, FileEdit, FileSignature, Plus, Save, Trash2 } from "lucide-react";
import {
  blankMatrix,
  blankRole,
  validateMatrix,
  type Errors,
  type MatrixInput,
  type MatrixRecord,
  type RoleRow,
} from "./model";
import { MatrixSaveError } from "./useMatrices";
import type { MasterOption, Masters } from "./useMasters";
import { Section, control, panel, primary, secondary } from "./ui";

interface Props {
  matrix: MatrixRecord | null;
  bidangName: string;
  masters: Masters | null;
  masterLoading: boolean;
  masterError: string;
  masterRetry: () => void;
  onBack: () => void;
  onSave: (input: MatrixInput, complete: boolean) => Promise<void>;
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5"
      >
        {label}
        {required && (
          <>
            <span className="text-red-500" aria-hidden="true"> *</span>
            <span className="sr-only"> wajib sebelum Simpan</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-600 text-[11px] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default function MatrixForm({
  matrix,
  bidangName,
  masters,
  masterLoading,
  masterError,
  masterRetry,
  onBack,
  onSave,
}: Props) {
  const [input, setInput] = useState<MatrixInput>(() =>
    matrix ? structuredClone(matrix) : blankMatrix(bidangName),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof MatrixInput>(key: K, value: MatrixInput[K]) => {
    setInput((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setDirty(true);
  };

  const updateRole = (index: number, key: keyof RoleRow, value: string) => {
    update(
      "roles",
      input.roles.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
    setErrors((previous) => ({ ...previous, [`roles.${index}.${key}`]: "" }));
  };

  const choose = (
    key: "preparedById" | "approvedById",
    option: MasterOption | undefined,
  ) => {
    const prefix = key === "preparedById" ? "preparedBy" : "approvedBy";
    setInput((previous) => ({
      ...previous,
      [key]: option?.id ?? "",
      [prefix]: option?.name ?? "",
      [`${prefix}Nip`]: option?.nip ?? "",
    }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setDirty(true);
  };

  const field = (
    key: Exclude<keyof MatrixInput, "roles">,
    label: string,
    required = false,
    type = "text",
  ) => (
    <Field id={`matrix-${key}`} label={label} required={required} error={errors[key]}>
      <input
        id={`matrix-${key}`}
        type={type}
        value={String(input[key])}
        onChange={(event) => update(key, event.target.value)}
        className={control}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `matrix-${key}-error` : undefined}
      />
    </Field>
  );

  const signerSelect = (
    id: string,
    value: string,
    currentName: string,
    error?: string,
    onPick?: (option: MasterOption | undefined) => void,
  ) => (
    <select
      id={id}
      value={value}
      onChange={(event) => onPick?.(masters?.employees.find((item) => item.id === event.target.value))}
      className={control}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <option value="">— Pilih dari Master Pegawai —</option>
      {value && !masters?.employees.some((item) => item.id === value) && (
        <option value={value}>{currentName || "Referensi lama tidak tersedia"}</option>
      )}
      {masters?.employees.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}{item.nip ? ` · ${item.nip}` : ""}
        </option>
      ))}
    </select>
  );

  const save = async (complete: boolean) => {
    if (saving) return;
    const nextErrors = validateMatrix(input, complete);
    if (complete) {
      if (masters?.units.length && !masters.units.some((item) => item.name === input.unit)) {
        nextErrors.unit = "Pilih unit kerja yang tersedia pada master data.";
      }
      if (!masters?.employees.some((item) => item.id === input.preparedById)) {
        nextErrors.preparedById = "Pilih pembuat dari master pegawai.";
      }
      if (!masters?.employees.some((item) => item.id === input.approvedById)) {
        nextErrors.approvedById = "Pilih pihak yang mengetahui dari master pegawai.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => {
        document.getElementById(`matrix-${first}`)?.focus();
        document.getElementById(`matrix-${first}`)?.scrollIntoView({ block: "center" });
      });
      return;
    }
    setSaving(true);
    try {
      await onSave(input, complete);
    } catch (error) {
      if (error instanceof MatrixSaveError) setErrors(error.fields);
    } finally {
      setSaving(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save(true);
  };

  const back = () => {
    if (!dirty || window.confirm("Perubahan belum disimpan. Tinggalkan formulir?")) onBack();
  };

  return (
    <div className="space-y-5 pb-8">
      <button
        onClick={back}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-violet-600"
      >
        <ArrowLeft size={15} /> Manajemen User Access Matrix
      </button>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {matrix ? "Ubah User Access Matrix" : "User Access Matrix"}
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          FR-033 · Lengkapi detail dokumen, unit kerja, role, akses sistem, dan penanda tangan.
        </p>
        <p className="text-[11px] text-slate-500 mt-2">
          <span className="text-red-500 font-bold">*</span> Wajib untuk Simpan. Simpan Draf dapat
          digunakan saat formulir belum lengkap.
        </p>
      </div>

      {masterLoading && (
        <p role="status" className="text-xs text-slate-500">
          Memuat master unit kerja dan pegawai...
        </p>
      )}
      {masterError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-4 text-xs">
          <p>{masterError}</p>
          <button type="button" className={`${secondary} mt-3`} onClick={masterRetry}>
            Coba Lagi
          </button>
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-5" aria-busy={saving}>
        <fieldset disabled={saving} className="space-y-5 min-w-0">
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              Ada {Object.keys(errors).length} isian yang perlu diperbaiki. Periksa pesan di bawah setiap field.
            </div>
          )}

          <Section number="01" title="Detail Dokumen" description="Informasi kop pada dokumen Word.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {field("documentNumber", "No. Dokumen", true)}
              {field("revision", "No. Revisi", true)}
              {field("effectiveDate", "Tanggal Berlaku", true, "date")}
            </div>
          </Section>

          <Section number="02" title="Unit Kerja" description="Unit kerja yang menggunakan daftar role ini.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="matrix-unit" label="Unit Kerja" required error={errors.unit}>
                <select
                  id="matrix-unit"
                  value={input.unit}
                  onChange={(event) => update("unit", event.target.value)}
                  className={control}
                  aria-invalid={!!errors.unit}
                >
                  <option value="">Pilih dari master data</option>
                  {input.unit && !masters?.units.some((item) => item.name === input.unit) && (
                    <option value={input.unit}>{input.unit}</option>
                  )}
                  {masters?.units.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section
            number="03"
            title="Daftar Role dan Hak Akses"
            description="Cantumkan role dan akses pada sistem di unit kerja."
          >
            {errors.roles && (
              <p role="alert" className="text-xs text-red-600 mb-3">{errors.roles}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white">
                    <th className="w-[30%] border border-slate-300 px-4 py-2.5 text-center font-extrabold dark:border-slate-600">Role</th>
                    <th className="border border-slate-300 px-4 py-2.5 text-center font-extrabold dark:border-slate-600">Akses pada sistem</th>
                    <th className="w-12 border border-slate-300 dark:border-slate-600" aria-label="Aksi" />
                  </tr>
                </thead>
                <tbody>
                  {input.roles.map((row, index) => {
                    const roleError = errors[`roles.${index}.role`];
                    const accessError = errors[`roles.${index}.access`];
                    return (
                      <tr key={row.id}>
                        <td className="border border-slate-300 p-2 dark:border-slate-600">
                          <input
                            aria-label={`Nama role ${index + 1}`}
                            placeholder="Nama role"
                            value={row.role}
                            onChange={(event) => updateRole(index, "role", event.target.value)}
                            className={`${control} bg-white text-center dark:bg-slate-900`}
                            aria-invalid={!!roleError}
                          />
                          {roleError && <p className="text-red-600 text-[10px] mt-1">{roleError}</p>}
                        </td>
                        <td className="border border-slate-300 p-2 dark:border-slate-600">
                          <textarea
                            aria-label={`Hak akses untuk ${row.role || `role ${index + 1}`}`}
                            placeholder="Jelaskan akses pada sistem..."
                            value={row.access}
                            onChange={(event) => updateRole(index, "access", event.target.value)}
                            className={`${control} min-h-16 bg-white dark:bg-slate-900`}
                            aria-invalid={!!accessError}
                          />
                          {accessError && <p className="text-red-600 text-[10px] mt-1">{accessError}</p>}
                        </td>
                        <td className="border border-slate-300 p-1 text-center dark:border-slate-600">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Hapus role ${index + 1}`}
                            onClick={() => {
                              update("roles", input.roles.filter((item) => item.id !== row.id));
                              setErrors({});
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className={`${secondary} mt-4`}
              onClick={() => update("roles", [...input.roles, blankRole()])}
            >
              <Plus size={15} /> Tambah Role
            </button>
          </Section>

          <Section number="04" title="Catatan" description="Catatan ini akan dicetak pada formulir FR-033.">
            <textarea
              aria-label="Catatan formulir"
              value={input.note}
              onChange={(event) => update("note", event.target.value)}
              className={`${control} min-h-20`}
            />
          </Section>

          <Section
            number="05"
            title="Penanda Tangan"
            description="Pilih penulis dan pihak yang mengetahui untuk kotak spesimen TTE pada dokumen."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("city", "Tempat", true)}
              {field("documentDate", "Tanggal Dokumen", true, "date")}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <FileSignature size={16} />
                </span>
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Penanda Tangan &amp; Spesimen TTE
                </h3>
              </div>
              <p className="max-w-md text-[10px] text-slate-400 sm:text-right">
                Pilih dari master pegawai. Identitas penanda tangan akan tercantum di dalam kotak spesimen TTE pada dokumen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field id="matrix-preparedById" label="1. Dibuat Oleh" required error={errors.preparedById}>
                {signerSelect(
                  "matrix-preparedById",
                  input.preparedById,
                  input.preparedBy,
                  errors.preparedById,
                  (option) => choose("preparedById", option),
                )}
                {input.preparedByNip && (
                  <p className="mt-1 text-[10px] text-slate-400">NIP: {input.preparedByNip}</p>
                )}
              </Field>
              <Field id="matrix-approvedById" label="2. Mengetahui" required error={errors.approvedById}>
                {signerSelect(
                  "matrix-approvedById",
                  input.approvedById,
                  input.approvedBy,
                  errors.approvedById,
                  (option) => choose("approvedById", option),
                )}
                {input.approvedByNip && (
                  <p className="mt-1 text-[10px] text-slate-400">NIP: {input.approvedByNip}</p>
                )}
              </Field>
            </div>
          </Section>

          <div className={`${panel} p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center`}>
            <div>
              <p className="text-xs font-bold">Simpan hasil formulir?</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Draf dapat dilengkapi dan diedit sebelum disimpan final.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={back} className={secondary}>Batal</button>
              <button type="button" onClick={() => void save(false)} className={secondary}>
                <FileEdit size={15} /> Simpan Draf
              </button>
              <button type="submit" className={primary}><Save size={15} /> Simpan</button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
