"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function RekayasaAplikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Rekayasa Aplikasi"
      subtitle="Layanan perancangan, pengembangan, dan rekayasa perangkat lunak"
    >
      {children}
    </IkiReportLayout>
  );
}
