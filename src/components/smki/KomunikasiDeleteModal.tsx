"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { KomunikasiItem } from "@/services/smki/komunikasiService";

interface KomunikasiDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  item: KomunikasiItem | null;
}

export default function KomunikasiDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  item,
}: KomunikasiDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(item.id);
      onClose();
    } catch {
      // Handled by parent toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1d36] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mt-0.5">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Hapus komunikasi ini?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pastikan catatan yang dipilih sudah benar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071733] border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                KOMUNIKASI {item.tipe.toUpperCase()} · NO. {item.id}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {item.judul}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item.pengirim} → {item.penerima} · Periode {item.periode || "2022"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>
              Catatan ini akan dihapus dari daftar komunikasi. Data yang sudah dihapus tidak dapat dikembalikan.
            </span>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Tindakan tidak dapat dibatalkan
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>{isDeleting ? "Menghapus..." : "Ya, Hapus"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
