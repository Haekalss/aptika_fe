import { Fr026DashboardTemplate } from "@/components/smki/capacity-planning/templates/Fr026DashboardTemplate";
import { capacityPeriod, type CapacitySearchParams } from "./period";

export default async function Page({ searchParams }: { searchParams?: CapacitySearchParams }) {
  return <Fr026DashboardTemplate {...(await capacityPeriod(searchParams))} />;
}
