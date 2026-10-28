"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

export function isImageFile(name?: string | null, url?: string | null): boolean {
  const s = `${name ?? ""} ${url ?? ""}`.toLowerCase();
  return [".png", ".jpg", ".jpeg"].some((e) => s.includes(e));
}

/** Unduh paksa via blob agar beda origin (FE :3000 vs BE :8000) tetap terunduh, bukan dibuka di tab. */
export async function downloadBuktiFile(src: string, nama?: string | null): Promise<void> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Gagal mengunduh (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama && nama.trim() !== "" ? nama : "lampiran";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Molecule: thumbnail gambar (klik = preview) atau chip file. */
export default function BuktiThumb({
  nama,
  src,
  size = "md",
  onPreview,
}: {
  nama?: string | null;
  src: string;
  size?: "sm" | "md";
  onPreview?: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  if (isImageFile(nama, src) && !imgError) {
    const cls = size === "sm" ? "w-12 h-12" : "w-16 h-16";
    return (
      <button
        type="button"
        onClick={onPreview}
        title={`Lihat ${nama ?? "lampiran"}`}
        className="shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500/50 transition-all"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={nama ?? "Lampiran"}
          onError={() => setImgError(true)}
          className={`${cls} object-cover`}
        />
      </button>
    );
  }

  // Fallback: file gambar yang gagal dimuat (mis. file hilang dari storage).
  const isImage = isImageFile(nama, src);
  return (
    <button
      type="button"
      onClick={onPreview}
      title={
        isImage
          ? "Preview tidak tersedia — file mungkin tidak ada di server"
          : nama ?? "Lampiran"
      }
      className={`rounded-lg flex flex-col items-center justify-center gap-0.5 border shrink-0 transition-all ${
        isImage
          ? "w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          : "w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:ring-2 hover:ring-blue-500/50"
      }`}
    >
      <FileText size={isImage ? 16 : 16} />
      {isImage && (
        <span className="text-[8px] font-bold leading-none">no preview</span>
      )}
    </button>
  );
}

export function BuktiDownloadLink({ id, tipe, label = "Unduh" }: { id: number | string; tipe: "pelapor" | "pemilik"; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { downloadBukti } = await import("@/services/smki/pelaporanInsidenService");
          await downloadBukti(id, tipe);
        } catch {
          // biarkan diam: toast ditangani parent bila perlu
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-60 transition-colors shrink-0"
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
      {busy ? "Mengunduh..." : label}
    </button>
  );
}
