"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function PengelolaanAplikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Pengelolaan Aplikasi"
      subtitle="Pengawasan, standarisasi, dan audit keandalan sistem aplikasi"
    >
      {children}
    </IkiReportLayout>
  );
}
