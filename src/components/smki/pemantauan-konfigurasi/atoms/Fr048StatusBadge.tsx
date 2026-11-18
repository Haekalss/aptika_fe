"use client";

import { STATUS_MAP } from "../constants";
import type { PemantauanStatus } from "@/services/smki/pemantauanKonfigurasiService.types";

export default function Fr048StatusBadge({ status }: { status: PemantauanStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md border tracking-wide ${s.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
      {s.label}
    </span>
  );
}
