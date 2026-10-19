"use client";

import React, { useEffect, useRef } from "react";
import {
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import type { AsetSdm } from "@/services/smki/daftarAsetSDM";

interface Props {
  open: boolean;
  item: AsetSdm | null;
  onClose: () => void;
}

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 break-words">
        {value || "-"}
      </dd>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5 text-emerald-700 dark:text-emerald-400">
        {icon}
        <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export default function AsetSdmDetailModal({ open, item, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!focusables || focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-sdm-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="detail-sdm-title"
                className="text-base font-extrabold text-slate-800 dark:text-white"
              >
                Detail Aset SDM
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className={`rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${focus}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
                <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Section icon={<User size={16} aria-hidden="true" />} title="Informasi Kepegawaian">
            <dl className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
              <Row label="Nama" value={item.nama} />
              <Row label="NIP" value={item.nip} />
              <Row label="Pangkat / Golongan" value={item.pangkat_golongan} />
              <Row label="Jabatan" value={item.jabatan} />
              <Row label="TMT Jabatan" value={item.tmt_jabatan_label} />
              <Row label="Unit Kerja" value={item.unit_kerja} />
            </dl>
          </Section>

          <Section icon={<ShieldCheck size={16} aria-hidden="true" />} title="Informasi Tim SMKI">
            <dl className="flex flex-col gap-3">
              <Row label="Jabatan di SMKI" value={item.jabatan_smki} />
              <Row
                label="Tanggung Jawab"
                value={<span className="whitespace-pre-line font-medium leading-relaxed">{item.tanggung_jawab}</span>}
              />
            </dl>
          </Section>

          <Section icon={<GraduationCap size={16} aria-hidden="true" />} title="Pendidikan Terakhir">
            <dl className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-3">
              <Row label="Jenjang" value={item.jenjang} />
              <Row label="Jurusan" value={item.jurusan} />
              <Row label="Tahun Lulus" value={item.tahun_lulus} />
            </dl>
          </Section>

          <Section icon={<ClipboardList size={16} aria-hidden="true" />} title="Pelatihan yang Pernah Diikuti">
            {item.pelatihan.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">Belum ada pelatihan tercatat.</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {item.pelatihan.map((p, i) => (
                  <li
                    key={p.id ?? i}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/60"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {i + 1}. {p.nama}
                    </span>
                    <span className="flex-shrink-0 font-bold text-slate-600 dark:text-slate-400">{p.tahun}</span>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-3.5 dark:border-slate-800">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={`rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${focus}`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}