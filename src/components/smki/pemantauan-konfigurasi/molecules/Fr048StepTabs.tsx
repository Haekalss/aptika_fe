"use client";

import StepTabs, { type StepItem } from "@/components/ui/StepTabs";

const STEPS: StepItem[] = [
  { id: "identifikasi", label: "1. Identifikasi", hint: "Identitas dokumen & identifikasi pemantauan" },
  { id: "konfigurasi", label: "2. Daftar Konfigurasi", hint: "Isi nilai aktual & kesesuaian" },
  { id: "hasil", label: "3. Hasil & Pengajuan", hint: "Ringkasan, tanda tangan, ajukan" },
];

export type Fr048Step = "identifikasi" | "konfigurasi" | "hasil";

export default function Fr048StepTabs({
  active,
  onChange,
  completed,
}: {
  active: Fr048Step;
  onChange: (s: Fr048Step) => void;
  completed: Record<Fr048Step, boolean>;
}) {
  return <StepTabs steps={STEPS} active={active} onChange={(id) => onChange(id as Fr048Step)} completed={completed} />;
}
