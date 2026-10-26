"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function IntegrasiInteroperabilitasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Integrasi Interoperabilitas"
      subtitle="Pusat tata kelola integrasi data dan interkoneksi sistem"
    >
      {children}
    </IkiReportLayout>
  );
}
