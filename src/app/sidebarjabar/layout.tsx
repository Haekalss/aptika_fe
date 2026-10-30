"use client";

import IkiReportLayout from "@/components/layout/IkiReportLayout";

export default function SidebarJabarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IkiReportLayout
      title="Sidebar Jabar"
      subtitle="Kelola konfigurasi widget & menu Sidebar Jawa Barat"
    >
      {children}
    </IkiReportLayout>
  );
}
