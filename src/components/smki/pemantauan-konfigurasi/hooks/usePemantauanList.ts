"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getList,
  getSummary,
  getJenisOptions,
  hapusDraft,
  getApiErrorMessage,
} from "@/services/smki/pemantauanKonfigurasiService";
import { showToast } from "@/components/ui/Toast";
import type {
  OptionDto,
  PemantauanListItemDto,
  PemantauanStatus,
  PemantauanSummaryDto,
} from "@/services/smki/pemantauanKonfigurasiService.types";
import type { Fr048FilterValue } from "../molecules/Fr048FilterBar";

/** Daftar pemantauan: filter + paginasi server-side + debounce search + ringkasan. */
export function usePemantauanList() {
  const [summary, setSummary] = useState<PemantauanSummaryDto | null>(null);
  const [rows, setRows] = useState<PemantauanListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filter, setFilterState] = useState<Fr048FilterValue>({ q: "", periode: "", jenisId: "", status: "" });
  const [debouncedQ, setDebouncedQ] = useState("");
  const [jenisOptions, setJenisOptions] = useState<OptionDto[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilter = useCallback((v: Fr048FilterValue) => {
    setFilterState(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(v.q), 300);
    setPage(1);
  }, []);

  const fetchListData = useCallback(async () => {
    const [list, sum] = await Promise.all([
      getList({ q: debouncedQ || undefined, periode: filter.periode === "" ? undefined : filter.periode, jenisId: filter.jenisId === "" ? undefined : filter.jenisId, status: filter.status || undefined, page, perPage }),
      getSummary(),
    ]);
    return { list, sum };
  }, [debouncedQ, filter.periode, filter.jenisId, filter.status, page, perPage]);

  const load = useCallback(async () => {
    try {
      const { list, sum } = await fetchListData();
      setRows(list.data);
      setTotalPages(list.meta.totalPages);
      setTotal(list.meta.total);
      setSummary(sum);
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal memuat daftar pemantauan."));
    } finally {
      setLoading(false);
    }
  }, [fetchListData]);

  useEffect(() => {
    let cancelled = false;
    fetchListData()
      .then(({ list, sum }) => {
        if (cancelled) return;
        setRows(list.data);
        setTotalPages(list.meta.totalPages);
        setTotal(list.meta.total);
        setSummary(sum);
      })
      .catch((err) => {
        if (cancelled) return;
        showToast.error(getApiErrorMessage(err, "Gagal memuat daftar pemantauan."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchListData]);

  useEffect(() => {
    getJenisOptions().then(setJenisOptions).catch(() => setJenisOptions([]));
  }, []);

  const removeDraft = useCallback(async (id: number) => {
    try {
      await hapusDraft(id);
      showToast.success("Draft dihapus.");
      await load();
      return true;
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal menghapus draft."));
      return false;
    }
  }, [load]);

  const setStatusFilter = useCallback((status: PemantauanStatus | "") => setFilter({ ...filter, status }), [filter, setFilter]);

  return {
    summary, rows, page, totalPages, total, loading,
    filter, setFilter, setStatusFilter, setPage,
    jenisOptions, refresh: load, removeDraft,
  };
}
