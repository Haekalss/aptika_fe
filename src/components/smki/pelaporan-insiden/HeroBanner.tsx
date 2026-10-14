"use client";

import { useRouter } from "next/navigation";
import { Building2, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export interface Breadcrumb {
  label: string;
  href?: string;
}

/** Molecule: hero gradient emerald standar SMKI. */
export default function HeroBanner({
  title,
  subtitle,
  breadcrumb,
  docNo,
}: {
  title: string;
  subtitle: string;
  breadcrumb?: Breadcrumb[];
  docNo?: string;
}) {
  const router = useRouter();
  const { bidang } = useAuthStore();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
      <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
      <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-200 mb-3">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight size={14} />}
                  {b.href ? (
                    <span
                      className="cursor-pointer hover:text-white"
                      onClick={() => router.push(b.href!)}
                    >
                      {b.label}
                    </span>
                  ) : (
                    <span className="text-white font-bold">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {title}
          </h1>
          <p className="text-sm text-emerald-100 leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
            <Building2 size={16} className="text-emerald-300" />
            <span>
              Unit Kerja:{" "}
              <strong className="text-white">
                {bidang?.name || "Bidang Aplikasi Informatika"}
              </strong>
            </span>
          </div>
          {docNo ? (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <span className="text-emerald-200">No. Dokumen:</span>
              <strong className="text-white">{docNo}</strong>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <span>
                Format Export:{" "}
                <strong className="text-teal-100">Microsoft Word (.docx)</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
