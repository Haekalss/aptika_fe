"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Props {
  /** ID pegawai dari master data. */
  pegawaiId?: number | string | null;
  /** Nama unit/dinas yang dicetak di bawah jabatan. */
  unit?: string;
  /** Ukuran tampilan (px). Default mengikuti rasio gambar 962x370. */
  width?: number;
  className?: string;
}

/**
 * Menampilkan spesimen TTE yang di-generate backend dari data master pegawai.
 *
 * Gambar diambil lewat axios (membawa token) lalu diubah menjadi blob URL,
 * karena endpoint TTE berada di balik middleware auth dan tidak bisa
 * dimuat langsung oleh <img src>.
 */
export default function TteSpecimen({ pegawaiId, unit, width = 260, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!pegawaiId) {
      setSrc(null);
      return;
    }

    let revoked: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/tte/spesimen/${pegawaiId}`, {
          params: unit ? { unit } : undefined,
          responseType: "blob",
        });
        if (cancelled) return;
        const url = URL.createObjectURL(res.data as Blob);
        revoked = url;
        setSrc(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [pegawaiId, unit]);

  if (!pegawaiId || failed) return null;

  if (!src) {
    return (
      <div
        className={className}
        style={{
          width,
          height: Math.round((width * 370) / 962),
          border: "1px dashed #cbd5e1",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8pt",
          color: "#94a3b8",
        }}
      >
        Memuat spesimen TTE…
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Spesimen Tanda Tangan Elektronik"
      className={className}
      style={{ width, height: "auto", display: "block" }}
    />
  );
}
