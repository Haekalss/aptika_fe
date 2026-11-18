"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getJenisOptions,
  getObjekOptions,
  updateIdentifikasi,
  getApiErrorMessage,
} from "@/services/smki/pemantauanKonfigurasiService";
import { showToast } from "@/components/ui/Toast";
import { validateIdentifikasi, toIdentifikasiPayload, type IdentifikasiErrors } from "../form";
import type { IdentifikasiFormState } from "../types";
import type { OptionDto, PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";

const emptyForm = (): IdentifikasiFormState => ({
  noFormulir: "",
  noRevisi: "0.0",
  tanggalBerlaku: new Date().toISOString().slice(0, 10),
  tanggalPemantauan: new Date().toISOString().slice(0, 10),
  periode: 4,
  jenisKonfigurasiId: 0,
  objekIds: [],
});

/** State & aksi Step 1 — Identifikasi (UC-01). `locked=true` pada status Revisi (read-only). */
export function useIdentifikasi(detail: PemantauanDetailDto | null, onSaved: (d: PemantauanDetailDto) => void) {
  const locked = detail?.status === "revisi" || (detail ? detail.status !== "draft" : false);
  const [form, setForm] = useState<IdentifikasiFormState>(emptyForm);
  const [errors, setErrors] = useState<IdentifikasiErrors>({});
  const [jenisOptions, setJenisOptions] = useState<OptionDto[]>([]);
  // null = belum/objek sedang dimuat untuk jenis terpilih
  const [objekOptions, setObjekOptions] = useState<OptionDto[] | null>(null);
  const [saving, setSaving] = useState(false);

  // Sinkronisasi prop detail → state form (adjust state during render)
  const [lastDetail, setLastDetail] = useState(detail);
  if (detail !== lastDetail) {
    setLastDetail(detail);
    setErrors({});
    if (detail) {
      setForm({
        noFormulir: detail.noFormulir,
        noRevisi: detail.noRevisi,
        tanggalBerlaku: detail.tanggalBerlaku,
        tanggalPemantauan: detail.tanggalPemantauan,
        periode: detail.periode,
        jenisKonfigurasiId: detail.jenisKonfigurasiId || 0,
        objekIds: detail.objekList.map((o) => o.objekId),
      });
    }
  }

  // Opsi jenis
  useEffect(() => {
    getJenisOptions().then(setJenisOptions).catch(() => setJenisOptions([]));
  }, []);

  // Opsi objek mengikuti jenis terpilih; null = belum dimuat
  const [lastJenis, setLastJenis] = useState(form.jenisKonfigurasiId);
  if (form.jenisKonfigurasiId !== lastJenis) {
    setLastJenis(form.jenisKonfigurasiId);
    setObjekOptions(null);
  }

  useEffect(() => {
    let mounted = true;
    const p = form.jenisKonfigurasiId
      ? getObjekOptions(form.jenisKonfigurasiId)
      : Promise.resolve<OptionDto[]>([]);
    p.then((d) => mounted && setObjekOptions(d))
      .catch(() => mounted && setObjekOptions([]));
    return () => { mounted = false; };
  }, [form.jenisKonfigurasiId]);

  const patch = useCallback((p: Partial<IdentifikasiFormState>) => {
    setForm((prev) => ({ ...prev, ...p }));
    setErrors({});
  }, []);

  const save = useCallback(async (): Promise<PemantauanDetailDto | null> => {
    if (!detail) return null;
    const errs = validateIdentifikasi(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast.error("Periksa kembali isian Identifikasi.");
      return null;
    }
    setSaving(true);
    try {
      const updated = await updateIdentifikasi(detail.id, toIdentifikasiPayload(form));
      showToast.success("Identifikasi tersimpan.");
      onSaved(updated);
      return updated;
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menyimpan identifikasi."));
      return null;
    } finally {
      setSaving(false);
    }
  }, [detail, form, onSaved]);

  const loadingObjek = form.jenisKonfigurasiId !== 0 && objekOptions === null;

  return { form, errors, patch, save, saving, locked, jenisOptions, objekOptions: objekOptions ?? [], loadingObjek };
}
