import { Fr026ExportTemplate } from "@/components/smki/capacity-planning/templates/Fr026ExportTemplate";
import { capacityPeriod, type CapacitySearchParams } from "../period";

export default async function Page({ searchParams }: { searchParams?: CapacitySearchParams }) {
  return <Fr026ExportTemplate {...(await capacityPeriod(searchParams))} />;
}
