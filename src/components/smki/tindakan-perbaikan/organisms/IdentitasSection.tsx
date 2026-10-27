"use client";

import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import PersonField, { selectClass } from "../molecules/PersonField";
import FormSection from "./FormSection";
import type { Fr009SectionProps } from "../types";

export default function IdentitasSection({ form, lookup, errors, onChange }: Fr009SectionProps) {
  return <FormSection number={1} title="Identitas Laporan" hint="Nomor laporan berbeda dari kode template FR-009. Draft boleh belum lengkap.">
    <div className="grid gap-5 md:grid-cols-2">
      <Input label="Nomor laporan" value={form.nomor_laporan || ""} onChange={(event) => onChange({ nomor_laporan: event.target.value })} error={errors.nomor_laporan?.[0]} className="rounded-xl" />
      <Input label="Tanggal laporan" type="date" value={form.tanggal_laporan || ""} onChange={(event) => onChange({ tanggal_laporan: event.target.value || null })} error={errors.tanggal_laporan?.[0]} className="rounded-xl" />
      <FormField label="Unit kerja" error={errors.id_unit_kerja?.[0]}><select aria-label="Unit kerja" value={form.id_unit_kerja ?? ""} onChange={(event) => { const unit = lookup.units.find((value) => value.id_unit_kerja === Number(event.target.value)); onChange({ id_unit_kerja: unit?.id_unit_kerja ?? null, ...(unit ? { area: unit.nama_unit_kerja } : {}) }); }} className={selectClass}><option value="">Area manual / belum dipilih</option>{lookup.units.map((unit) => <option key={unit.id_unit_kerja} value={unit.id_unit_kerja}>{unit.nama_unit_kerja}</option>)}</select></FormField>
      <Input label="Divisi / Area" value={form.area} onChange={(event) => onChange({ area: event.target.value, id_unit_kerja: null })} error={errors.area?.[0]} helperText="Mengubah nama area beralih ke mode manual dan melepas pilihan master unit kerja." className="rounded-xl" />
      <PersonField label="Diajukan kepada" id={form.diajukan_kepada_id} name={form.diajukan_kepada_nama} options={lookup.users} onChange={(diajukan_kepada_id, diajukan_kepada_nama) => onChange({ diajukan_kepada_id, diajukan_kepada_nama })} error={errors.diajukan_kepada_id?.[0] || errors.diajukan_kepada_nama?.[0]} />
      <PersonField label="Dilaporkan oleh" id={form.dilaporkan_oleh_id} name={form.dilaporkan_oleh_nama} options={lookup.users} onChange={(dilaporkan_oleh_id, dilaporkan_oleh_nama) => onChange({ dilaporkan_oleh_id, dilaporkan_oleh_nama })} error={errors.dilaporkan_oleh_id?.[0] || errors.dilaporkan_oleh_nama?.[0]} />
    </div>
  </FormSection>;
}
