"use client";

import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ReviuCctvForm from "@/components/smki/reviu-cctv/ReviuCctvForm";

export default function EditReviuCctvPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <ReviuCctvForm mode="edit" id={id} />
    </ServiceRouteGuard>
  );
}
