"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import { downloadBuktiFile } from "@/components/smki/pelaporan-insiden/BuktiThumb";

export interface LightboxImage {
  src: string;
  nama?: string;
  onDownload?: () => Promise<void>;
}

/** Atom global: lightbox gambar + unduh + prev/next + Esc. */
export default function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const current = images[index];

  const prev = useCallback(() => {
    onIndex((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndex]);

  const next = useCallback(() => {
    onIndex((index + 1) % images.length);
  }, [index, images.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) prev();
      if (e.key === "ArrowRight" && images.length > 1) next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next, images.length]);

  const [busy, setBusy] = useState(false);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {current.nama ?? "Lampiran"}
            {images.length > 1 && (
              <span className="ml-2 font-medium text-slate-400">
                {index + 1} / {images.length}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (current.onDownload) {
                    await current.onDownload();
                  } else {
                    await downloadBuktiFile(current.src, current.nama);
                  }
                } catch {
                  if (!current.onDownload) window.open(current.src, "_blank", "noopener");
                } finally {
                  setBusy(false);
                }
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors"
              title="Unduh gambar"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Tutup (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[40vh] max-h-[75vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.nama ?? "Lampiran"}
            className="max-w-full max-h-[75vh] object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow hover:scale-105 transition-transform"
                title="Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow hover:scale-105 transition-transform"
                title="Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export { Lightbox };
