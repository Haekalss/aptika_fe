import { Fr026MatrixTemplate } from "@/components/smki/capacity-planning/templates/Fr026MatrixTemplate";
import { capacityPeriod, type CapacitySearchParams } from "../period";

export default async function Page({ searchParams }: { searchParams?: CapacitySearchParams }) {
  return <Fr026MatrixTemplate category="server" {...(await capacityPeriod(searchParams))} />;
}
