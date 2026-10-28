import Fr009FormTemplate from "@/components/smki/tindakan-perbaikan/templates/Fr009FormTemplate";

export default async function EditTindakanPerbaikanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Fr009FormTemplate id={Number(id)} />;
}
