"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function SadaJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Sada Jabar"
      subtitle="Satu Data Jawa Barat - Layanan metadata & statistik sektoral"
    >
      {children}
    </IkiReportLayout>
  );
}
