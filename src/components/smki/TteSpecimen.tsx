"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Props {
  /** ID pegawai dari master data (cara lama). */
  pegawaiId?: number | string | null;
  /** NIP penanda tangan — dipakai resolver master spesimen. */
  nip?: string | null;
  /** Nama penanda tangan — fallback bila NIP kosong. */
  nama?: string | null;
  /** Nama unit/dinas yang dicetak di bawah jabatan. */
  unit?: string;
  /** Ukuran tampilan (px). Default mengikuti rasio gambar 962x370. */
  width?: number;
  className?: string;
}

/**
 * Menampilkan spesimen TTE pada dokumen.
 *
 * Sumber gambar ditentukan backend lewat /tte/resolve:
 *   1. Master Spesimen TTE (menu Data Master → Spesimen TTE), dicocokkan via NIP/nama
 *   2. Fallback ke master pegawai
 *
 * Gambar diambil lewat axios (membawa token) lalu diubah menjadi blob URL,
 * karena endpoint TTE berada di balik middleware auth.
 */
export default function TteSpecimen({ pegawaiId, nip, nama, unit, width = 300, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const useResolver = Boolean(nip || nama);

  useEffect(() => {
    if (!useResolver && !pegawaiId) {
      setSrc(null);
      return;
    }

    let revoked: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        const res = useResolver
          ? await api.get("/tte/resolve/image", {
              params: { ...(nip ? { nip } : {}), ...(nama ? { nama } : {}) },
              responseType: "blob",
            })
          : await api.get(`/tte/spesimen/${pegawaiId}`, {
              params: unit ? { unit } : undefined,
              responseType: "blob",
            });

        if (cancelled) return;
        const url = URL.createObjectURL(res.data as Blob);
        revoked = url;
        setSrc(url);
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [pegawaiId, nip, nama, unit, useResolver]);

  if ((!useResolver && !pegawaiId) || failed) return null;

  if (!src) {
    return (
      <div
        className={className}
        style={{
          width,
          height: Math.round((width * 381) / 945),
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
