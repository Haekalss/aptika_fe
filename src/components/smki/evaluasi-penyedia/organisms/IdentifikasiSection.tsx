"use client";

import Input from "@/components/ui/Input";
import PenyediaAutocomplete from "../molecules/PenyediaAutocomplete";
import SifatPekerjaanField from "../molecules/SifatPekerjaanField";
import type { Fr021SectionProps } from "../types";

export default function IdentifikasiSection({
  form,
  errors,
  onChange,
  disabled,
}: Fr021SectionProps) {
  return (
    <div className="space-y-4">
      <PenyediaAutocomplete
        form={form}
        errors={errors}
        onChange={onChange}
        disabled={disabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Contact Person"
          placeholder="Nama contact person penyedia"
          value={form.contact_person}
          onChange={(event) => onChange({ contact_person: event.target.value })}
          error={errors.contact_person?.[0]}
          disabled={disabled}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="email@penyedia.co.id"
          value={form.email}
          onChange={(event) => onChange({ email: event.target.value })}
          error={errors.email?.[0]}
          disabled={disabled}
          required
        />
      </div>

      <Input
        label="No. Kontrak"
        placeholder="Contoh: KTR/2026/001"
        value={form.no_kontrak}
        onChange={(event) => onChange({ no_kontrak: event.target.value })}
        error={errors.no_kontrak?.[0]}
        disabled={disabled}
        required
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="No. Dokumen"
          placeholder="FR-021/KOM.03.05/SANDIKAMI"
          value={form.nomor_dokumen}
          onChange={(event) => onChange({ nomor_dokumen: event.target.value })}
          error={errors.nomor_dokumen?.[0]}
          disabled={disabled}
        />
        <Input
          label="No. Revisi"
          placeholder="1.1"
          value={form.nomor_revisi}
          onChange={(event) => onChange({ nomor_revisi: event.target.value })}
          error={errors.nomor_revisi?.[0]}
          disabled={disabled}
        />
        <Input
          label="Tanggal Berlaku"
          placeholder="07 Juli 2022"
          value={form.tanggal_berlaku}
          onChange={(event) => onChange({ tanggal_berlaku: event.target.value })}
          error={errors.tanggal_berlaku?.[0]}
          disabled={disabled}
        />
      </div>

      <SifatPekerjaanField
        form={form}
        errors={errors}
        onChange={onChange}
        disabled={disabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Tanggal Evaluasi"
          type="date"
          value={form.tanggal_evaluasi}
          onChange={(event) =>
            onChange({ tanggal_evaluasi: event.target.value })
          }
          error={errors.tanggal_evaluasi?.[0]}
          disabled={disabled}
          required
        />
        <Input
          label="Tempat"
          placeholder="Contoh: Bandung"
          value={form.tempat}
          onChange={(event) => onChange({ tempat: event.target.value })}
          error={errors.tempat?.[0]}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
