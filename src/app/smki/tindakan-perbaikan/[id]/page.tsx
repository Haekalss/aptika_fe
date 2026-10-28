import Fr009DetailTemplate from "@/components/smki/tindakan-perbaikan/templates/Fr009DetailTemplate";

export default async function DetailTindakanPerbaikanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Fr009DetailTemplate id={Number(id)} />;
}
