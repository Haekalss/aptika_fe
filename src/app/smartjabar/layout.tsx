"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function SmartJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Smart Jabar"
      subtitle="Dashboard monitoring platform Smart Jabar"
    >
      {children}
    </IkiReportLayout>
  );
}
