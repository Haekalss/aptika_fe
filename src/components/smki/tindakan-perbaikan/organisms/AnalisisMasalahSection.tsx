"use client";

import Input from "@/components/ui/Input";
import FormField from "@/components/ui/FormField";
import SumberMasalahField from "../molecules/SumberMasalahField";
import { selectClass } from "../molecules/PersonField";
import FormSection from "./FormSection";
import type { Fr009SectionProps } from "../types";

export default function AnalisisMasalahSection(props: Fr009SectionProps) {
  const { form, errors, onChange } = props;
  return <FormSection number={2} title="Masalah & Akar Masalah">
    <div className="space-y-5">
      <SumberMasalahField {...props} />
      <Input label="Deskripsi Masalah / Potensial Masalah" textarea rows={4} value={form.deskripsi} onChange={(event) => onChange({ deskripsi: event.target.value })} error={errors.deskripsi?.[0]} className="rounded-xl" />
      <FormField label="Status temuan" hint="Template FR-009 hanya mencantumkan Minor. Ini bukan status verifikasi." error={errors.status_temuan?.[0]}><select aria-label="Status temuan" value={form.status_temuan ?? ""} onChange={(event) => onChange({ status_temuan: event.target.value === "Minor" ? "Minor" : null })} className={selectClass}><option value="">Belum dipilih</option><option value="Minor">Minor</option></select></FormField>
      <Input label="Akar Masalah" textarea rows={4} value={form.akar_masalah} onChange={(event) => onChange({ akar_masalah: event.target.value })} error={errors.akar_masalah?.[0]} className="rounded-xl" />
    </div>
  </FormSection>;
}
