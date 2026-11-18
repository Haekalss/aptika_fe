import { notFound } from "next/navigation";
import { Fr030FormTemplate } from "@/components/smki/backup-restore/templates/Fr030FormTemplate";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <Fr030FormTemplate id={Number(id)} />;
}
