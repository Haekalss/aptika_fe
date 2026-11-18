"use client";
import { useCallback, useMemo, useState } from "react";
import { saveKonfigurasi, periksaKesesuaian, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import { showToast } from "@/components/ui/Toast";
import { rowsFromDetail, hitungProgres } from "../form";
import type { KonfigurasiSectionState } from "../organisms/Fr048KonfigurasiEditor";
import type { KonfigurasiRowState } from "../types";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";

let clientKey = 0;
const newKey = () => `cli-${Date.now()}-${clientKey++}`;
const toPayload = (rows: KonfigurasiRowState[]) =>
  rows.map(({ key, ...rest }) => {
    void key;
    return rest;
  });

/** State & aksi Step 2 — Daftar Konfigurasi (UC-02, UC-03). */
export function useKonfigurasi(detail: PemantauanDetailDto | null, onSaved: (d: PemantauanDetailDto) => void) {
  const [rows, setRows] = useState<KonfigurasiRowState[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  // Sinkronisasi prop detail → state baris (adjust state during render)
  const [lastDetail, setLastDetail] = useState(detail);
  if (detail !== lastDetail) {
    setLastDetail(detail);
    if (detail) {
      setRows(rowsFromDetail(detail.objekList.map((o) => ({ objekId: o.objekId, items: o.items.map((i) => ({ ...i })) }))));
    }
  }

  const sections: KonfigurasiSectionState[] = useMemo(() => {
    if (!detail) return [];
    return detail.objekList.map((o) => ({
      objekId: o.objekId,
      objekNama: o.objekNama,
      rows: rows.filter((r) => r.objekId === o.objekId),
    }));
  }, [detail, rows]);

  const progress = hitungProgres(rows);
  const allFilled = progress.total > 0 && progress.terisi === progress.total;
  const manualMissing = rows.filter((r) => !r.isStandar && !r.kesesuaian).length;

  const patchRow = useCallback((key: string, patch: Partial<KonfigurasiRowState>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }, []);

  const removeRow = useCallback((key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key || r.isStandar));
  }, []);

  const addManualRow = useCallback((objekId: number) => {
    setRows((prev) => [
      ...prev,
      { key: newKey(), objekId, namaKonfigurasi: "", nilaiAktual: "", nilaiStandar: null, nilaiStandarId: null, kesesuaian: null, isStandar: false, keterangan: "" },
    ]);
  }, []);

  const save = useCallback(async (): Promise<PemantauanDetailDto | null> => {
    if (!detail) return null;
    setSaving(true);
    try {
      const updated = await saveKonfigurasi(detail.id, toPayload(rows));
      setRows(rowsFromDetail(updated.objekList.map((o) => ({ objekId: o.objekId, items: o.items.map((i) => ({ ...i })) }))));
      showToast.success("Daftar konfigurasi tersimpan.");
      onSaved(updated);
      return updated;
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menyimpan daftar konfigurasi."));
      return null;
    } finally {
      setSaving(false);
    }
  }, [detail, rows, onSaved]);

  const periksa = useCallback(async (): Promise<PemantauanDetailDto | null> => {
    if (!detail) return null;
    if (!allFilled) {
      showToast.error("Seluruh baris wajib memiliki Nama Konfigurasi dan Nilai aktual sebelum pemeriksaan.");
      return null;
    }
    setChecking(true);
    try {
      // simpan dulu supaya perhitungan BE memakai data terbaru
      const saved = await saveKonfigurasi(detail.id, toPayload(rows));
      const updated = await periksaKesesuaian(saved.id);
      setRows(rowsFromDetail(updated.objekList.map((o) => ({ objekId: o.objekId, items: o.items.map((i) => ({ ...i })) }))));
      showToast.success("Pemeriksaan kesesuaian selesai.");
      onSaved(updated);
      return updated;
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal memeriksa kesesuaian."));
      return null;
    } finally {
      setChecking(false);
    }
  }, [detail, rows, allFilled, onSaved]);

  return { sections, rows, patchRow, removeRow, addManualRow, progress, allFilled, manualMissing, save, periksa, saving, checking };
}
