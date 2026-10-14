"use client";

import { useMemo, useState } from "react";
import { FileDown, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import type { InsidenReport } from "./types";

/** Molecule: popup pilih laporan yang akan di-export ke DOCX. */
export default function InsidenExportPickModal({
  isOpen,
  onClose,
  items,
  onPick,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: InsidenReport[];
  onPick: (id: number) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (i) =>
        i.pelapor.toLowerCase().includes(s) ||
        i.nama_sistem.toLowerCase().includes(s) ||
        i.kategori_insiden.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Laporan untuk Diekspor"
      size="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Batal
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pelapor, sistem, atau kategori..."
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Menampilkan data halaman aktif di tabel. Gunakan pencarian/filter di halaman daftar untuk menemukan laporan lain.
        </p>
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            Tidak ada laporan yang cocok. Ubah kata kunci atau filter halaman daftar.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {item.nama_sistem} <span className="font-medium text-slate-400">• {item.pelapor}</span>
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={item.kategori_insiden} uppercase />
                    <StatusBadge status={item.status} />
                    <span className="text-[10px] text-slate-400 font-medium">{item.tanggal_laporan}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPick(item.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 font-bold text-xs shrink-0 transition-all"
                >
                  <FileDown size={13} />
                  Pilih
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
