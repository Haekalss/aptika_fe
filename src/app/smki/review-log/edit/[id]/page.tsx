"use client";

import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ReviewLogForm from "@/components/smki/review-log/ReviewLogForm";

export default function EditReviewLogPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <ReviewLogForm mode="edit" id={id} />
    </ServiceRouteGuard>
  );
}
