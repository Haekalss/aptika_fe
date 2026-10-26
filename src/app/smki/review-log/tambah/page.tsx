"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ReviewLogForm from "@/components/smki/review-log/ReviewLogForm";

export default function TambahReviewLogPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <ReviewLogForm mode="create" />
    </ServiceRouteGuard>
  );
}
