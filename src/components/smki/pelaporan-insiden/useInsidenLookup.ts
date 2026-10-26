"use client";

import { useEffect, useState } from "react";
import { fetchInsidenLookup, type InsidenLookup } from "@/services/smki/pelaporanInsidenService";
import { KATEGORI_OPTIONS, STATUS_OPTIONS } from "./types";

const FALLBACK_DOC = {
  no_dokumen: "F16-SMKI",
  no_revisi: "1.0",
  tanggal_berlaku: "14 Februari 2022",
};

/** Shared hook: satu-satunya tempat fetch lookup FR-016 (dropdown + kop dokumen). */
export function useInsidenLookup() {
  const [lookup, setLookup] = useState<InsidenLookup>({
    kategori: KATEGORI_OPTIONS,
    jenis_sistem: [],
    jenis_layanan: [],
    status: STATUS_OPTIONS,
    ...FALLBACK_DOC,
  });

  useEffect(() => {
    let alive = true;
    fetchInsidenLookup()
      .then((l) => {
        if (!alive) return;
        setLookup({
          kategori: l.kategori.length ? l.kategori : KATEGORI_OPTIONS,
          jenis_sistem: l.jenis_sistem,
          jenis_layanan: l.jenis_layanan,
          status: l.status.length ? l.status : STATUS_OPTIONS,
          no_dokumen: l.no_dokumen,
          no_revisi: l.no_revisi,
          tanggal_berlaku: l.tanggal_berlaku,
        });
      })
      .catch(() => {
        // fallback konstanta lokal agar halaman tetap jalan saat backend down
      });
    return () => {
      alive = false;
    };
  }, []);

  return {
    lookup,
    kategoriOptions: lookup.kategori,
    statusOptions: lookup.status,
    docNo: `${lookup.no_dokumen} • Rev. ${lookup.no_revisi} • Berlaku ${lookup.tanggal_berlaku}`,
    docDefaults: {
      no_dokumen: lookup.no_dokumen,
      no_revisi: lookup.no_revisi,
      tanggal_berlaku: lookup.tanggal_berlaku,
    },
  };
}
