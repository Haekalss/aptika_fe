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
  if (isImageFile(nama, src)) {
    const cls = size === "sm" ? "w-12 h-12" : "w-16 h-16";
    return (
      <button
        type="button"
        onClick={onPreview}
        title={`Lihat ${nama ?? "lampiran"}`}
        className="shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500/50 transition-all"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={nama ?? "Lampiran"} className={`${cls} object-cover`} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onPreview}
      title={nama ?? "Lampiran"}
      className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 hover:ring-2 hover:ring-blue-500/50 transition-all"
    >
      <FileText size={16} />
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
