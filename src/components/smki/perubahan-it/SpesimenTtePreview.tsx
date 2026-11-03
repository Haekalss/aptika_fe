"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, PenLine } from "lucide-react";
import { getSpesimenBlob } from "@/services/smki/perubahanIt";

/** Pratinjau spesimen TTE milik user terpilih. */
export default function SpesimenTtePreview({
  userId,
  fallbackTeks,
}: {
  userId?: string | number | null;
  fallbackTeks: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ada" | "kosong" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    setUrl(null);

    if (!userId) {
      setState("idle");
      return;
    }

    setState("loading");
    getSpesimenBlob(userId)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setState("kosong");
          return;
        }
        objectUrl = window.URL.createObjectURL(blob);
        setUrl(objectUrl);
        setState("ada");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [userId]);

  const base = "flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-[11px] px-2 text-center";

  if (state === "loading") {
    return (
      <div className={`${base} border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400`} role="status">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Memuat spesimen TTE...
      </div>
    );
  }

  if (state === "ada" && url) {
    return (
      <div className={`${base} border-emerald-300 bg-white dark:border-emerald-800 dark:bg-slate-900`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Spesimen TTE" className="max-h-16 max-w-full object-contain" />
        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={12} aria-hidden="true" /> Spesimen TTE
        </span>
      </div>
    );
  }

  if (state === "kosong" || state === "error") {
    return (
      <div className={`${base} border-amber-300 bg-amber-50/60 text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300`}>
        <PenLine size={16} aria-hidden="true" />
        {state === "kosong" ? "Pengguna ini belum mengunggah spesimen TTE." : "Spesimen TTE gagal dimuat."}
      </div>
    );
  }

  return (
    <div className={`${base} border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400`}>
      <PenLine size={16} aria-hidden="true" />
      {fallbackTeks}
    </div>
  );
}