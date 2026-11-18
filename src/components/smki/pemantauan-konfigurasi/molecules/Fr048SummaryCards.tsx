"use client";

import { ClipboardList, FileEdit, Send, RotateCcw, CheckCircle2 } from "lucide-react";
import Fr048StatCard from "../atoms/Fr048StatCard";
import type { PemantauanStatus, PemantauanSummaryDto } from "@/services/smki/pemantauanKonfigurasiService.types";

export default function Fr048SummaryCards({
  summary,
  active,
  onSelect,
}: {
  summary: PemantauanSummaryDto | null;
  active: PemantauanStatus | "";
  onSelect: (status: PemantauanStatus | "") => void;
}) {
  const cards: { key: PemantauanStatus | ""; label: string; value: number | string; icon: typeof ClipboardList }[] = [
    { key: "", label: "Total", value: summary?.total ?? "–", icon: ClipboardList },
    { key: "draft", label: "Draft", value: summary?.draft ?? "–", icon: FileEdit },
    { key: "diajukan", label: "Menunggu", value: summary?.diajukan ?? "–", icon: Send },
    { key: "revisi", label: "Perlu Revisi", value: summary?.revisi ?? "–", icon: RotateCcw },
    { key: "selesai", label: "Selesai", value: summary?.selesai ?? "–", icon: CheckCircle2 },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Fr048StatCard
          key={c.key || "all"}
          icon={c.icon}
          label={c.label}
          value={c.value}
          active={active === c.key}
          onClick={() => onSelect(active === c.key ? "" : c.key)}
        />
      ))}
    </div>
  );
}
