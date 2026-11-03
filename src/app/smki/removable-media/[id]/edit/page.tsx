import { notFound } from "next/navigation";
import { Fr025FormTemplate } from "@/components/smki/removable-media/templates/Fr025FormTemplate";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) < 1 || !Number.isSafeInteger(Number(id))) notFound();
  return <Fr025FormTemplate id={Number(id)} />;
}
