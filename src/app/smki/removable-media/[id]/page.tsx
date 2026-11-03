import { notFound } from "next/navigation";
import { Fr025DetailTemplate } from "@/components/smki/removable-media/templates/Fr025DetailTemplate";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) notFound();
  return <Fr025DetailTemplate id={Number(id)} />;
}
