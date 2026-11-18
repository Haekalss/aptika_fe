import { notFound } from "next/navigation";
import { Fr030DetailTemplate } from "@/components/smki/backup-restore/templates/Fr030DetailTemplate";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <Fr030DetailTemplate id={Number(id)} />;
}
