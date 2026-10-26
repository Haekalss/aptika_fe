"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Lightbox from "@/components/ui/Lightbox";
import BuktiThumb from "./BuktiThumb";
import { ACCEPTED_EXT, MAX_FILE_MB } from "./types";

export interface UploadBoxProps {
  label?: string;
  description?: string;
  accept?: string;
  maxMB?: number;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  onError?: (msg: string) => void;
}

const inputCls =
  "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";

/**
 * Molecule: upload box dengan <input type=file> asli + thumbnail preview instan.
 * Preview lokal via object URL (tanpa backend), di-revoke saat file dihapus/unmount.
 * JANGAN pindahkan pembuatan object URL keluar useMemo: setiap render ulang harus
 * memakai URL yang sama selama array `files` tidak berganti identitas.
 */
export default function UploadBox({
  label = "Evidence/Dokumentasi screenshot *",
  description = "Screenshot atau dokumen pendukung insiden (.png, .jpg, .pdf, .docx — Maks. 5MB)",
  accept = ACCEPTED_EXT.join(","),
  maxMB = MAX_FILE_MB,
  multiple = true,
  files,
  onChange,
  onError,
}: UploadBoxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const fail = (msg: string) => {
    setLocalError(msg);
    onError?.(msg);
  };

  const validateAndAdd = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const exts = accept.split(",").map((s) => s.trim().toLowerCase());
    for (const f of arr) {
      const dot = f.name.lastIndexOf(".");
      const ext = dot >= 0 ? f.name.slice(dot).toLowerCase() : "";
      if (!exts.includes(ext)) {
        fail(`Format ${f.name} tidak didukung. Gunakan: ${accept}`);
        return;
      }
      if (f.size > maxMB * 1024 * 1024) {
        fail(`File ${f.name} melebihi ${maxMB}MB.`);
        return;
      }
    }
    setLocalError("");
    onChange(multiple ? [...files, ...arr] : arr);
  };

  const removeAt = (i: number) => {
    URL.revokeObjectURL(previews[i]?.url);
    onChange(files.filter((_, idx) => idx !== i));
    setPreviewIdx(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files);
        }}
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
        }`}
      >
        <Upload size={24} className="text-slate-400 mb-2" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Tarik dokumen ke sini atau pilih berkas
        </p>
        <p className="text-[10px] text-slate-500 mb-4">{description}</p>
        <span className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm">
          Pilih Berkas
        </span>
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) validateAndAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {localError && (
        <p className="text-[11px] font-semibold text-rose-500">{localError}</p>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {previews.map((p, i) => (
            <div
              key={`${p.file.name}-${i}`}
              className="border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BuktiThumb nama={p.file.name} src={p.url} size="sm" onPreview={() => setPreviewIdx(i)} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.file.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {(p.file.size / 1024).toFixed(0)} KB • Siap diunggah • klik gambar untuk pratinjau
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                title="Hapus file"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {previewIdx != null && previews[previewIdx] && (
        <Lightbox
          images={previews.map((p) => ({ src: p.url, nama: p.file.name }))}
          index={previewIdx}
          onClose={() => setPreviewIdx(null)}
          onIndex={(i) => setPreviewIdx(i)}
        />
      )}
      <input type="hidden" readOnly value={files.map((f) => f.name).join(",")} className={inputCls} hidden />
    </div>
  );
}
