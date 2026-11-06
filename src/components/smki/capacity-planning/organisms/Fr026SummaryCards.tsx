import type { Fr026Summary } from "@/services/smki/capacityPlanning.types";
import { Box, CalendarRange, ClipboardCheck, ServerCog } from "lucide-react";
import { Fr026StatCard } from "../molecules/Fr026StatCard";

export function Fr026SummaryCards({ summary, monthLabel, year }: { summary: Fr026Summary; monthLabel: string; year: number }) {
  const futureMonths = summary.monthly.filter((item) => item.month > summary.monthly.find((m) => m.is_active)!.month);
  const futureEmpty = futureMonths.every((item) => item.logged === 0);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Fr026StatCard
        label="Total aset"
        value={summary.total_assets}
        helper={`${summary.server_count} Server • ${summary.network_count} Network`}
        icon={<Box size={18} />}
      />
      <Fr026StatCard
        label={`Log ${monthLabel}`}
        value={`${summary.logs_this_month} / ${summary.total_assets}`}
        helper={`${summary.logs_this_month} aset memiliki log`}
        icon={<ClipboardCheck size={18} />}
      />
      <Fr026StatCard
        label={`Kelengkapan s.d. ${monthLabel}`}
        value={`${summary.completeness_pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`}
        helper={`${summary.logged_to_date} dari ${summary.expected_to_date} log yang diharapkan`}
        icon={<ServerCog size={18} />}
      />
      <Fr026StatCard
        label={`Log tahunan ${year}`}
        value={`${summary.annual_logs} / ${summary.annual_expected}`}
        helper={futureEmpty && futureMonths.length ? `${futureMonths[0].label}–${futureMonths[futureMonths.length - 1].label} belum diisi` : "Semua periode tahun berjalan"}
        icon={<CalendarRange size={18} />}
      />
    </div>
  );
}
