"use client";

import AdministrasiSuratLayout from "@/app/administrasisurat/layout";

export default function SuratSubModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdministrasiSuratLayout>{children}</AdministrasiSuratLayout>;
}
