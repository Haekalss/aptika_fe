"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchReviewLogDetail, formatTanggalIndo, formatPeriode, formatWaktu, reviewLogErrMsg, ReviewLog,
} from "@/services/smki/reviewLogService";

const MIN_ROWS = 8;

export default function PrintReviewLogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<ReviewLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchReviewLogDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(reviewLogErrMsg(err, "Gagal memuat formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-040...</p>
      </div>
    );
  }

  const rows = item.items || [];
  const blanks = Math.max(0, MIN_ROWS - rows.length);
  const cell = "border border-black px-2 py-1 align-top";
  const sign = [
    { judul: "Dibuat Oleh,", nama: item.dibuat_oleh_nama, nip: item.dibuat_oleh_nip },
    { judul: "Mengetahui,", nama: item.mengetahui_nama, nip: item.mengetahui_nip },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/review-log")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Daftar</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Print / PDF)</span>
        </button>
      </div>

      {/* A4 Paper */}
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-0 print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-5">
        {/* Kop Surat */}
        <div className="border border-black">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-28 p-2 border-r border-black text-center align-middle">
                  <img
                    src="/logo-fr047.png"
                    alt="Logo Jabar"
                    className="w-16 h-auto mx-auto object-contain"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = "/logo.png";
                    }}
                  />
                </td>
                <td className="p-3 border-r border-black text-center align-middle">
                  <h2 className="text-base font-bold tracking-wide uppercase text-slate-900">
                    FORMULIR REVIEW LOG
                  </h2>
                </td>
                <td className="w-56 p-2 text-[9pt] align-middle">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-0.5 w-24">No.Dokumen</td>
                        <td className="py-0.5">: FR-040/KOM.03.05/SANDIKAMI</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">No.Revisi</td>
                        <td className="py-0.5">: 1.0</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Tanggal Berlaku</td>
                        <td className="py-0.5">: 07 Juli 2022</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Identitas Review */}
        <div className="space-y-1.5">
          <table className="w-full border border-black border-collapse text-[10pt]">
            <tbody>
              {[
                ["Tanggal Review", formatTanggalIndo(item.tanggal_review)],
                ["Periode Review", formatPeriode(item.periode_mulai, item.periode_selesai)],
                ["Obyek Review", item.obyek_review],
                ["Pelaksana Review", item.pelaksana_review],
              ].map(([label, value], i) => (
                <tr key={i} className={i > 0 ? "border-t border-black" : ""}>
                  <td className="w-56 py-1 px-2 font-semibold border-r border-black bg-slate-50 print:bg-transparent">
                    {label}
                  </td>
                  <td className="py-1 px-2">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Log */}
        <table className="w-full border border-black border-collapse text-[10pt]">
          <thead>
            <tr className="bg-slate-50 print:bg-transparent">
              <th className={`${cell} w-10 text-center`}>No</th>
              <th className={`${cell} text-left`}>User</th>
              <th className={`${cell} text-left`}>IP</th>
              <th className={`${cell} text-left`}>Tanggal</th>
              <th className={`${cell} text-left`}>Waktu</th>
              <th className={`${cell} text-left`}>Durasi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id ?? i} className="break-inside-avoid">
                <td className={`${cell} text-center`}>{i + 1}</td>
                <td className={cell}>{r.user_log}</td>
                <td className={cell}>{r.ip_address}</td>
                <td className={cell}>{formatTanggalIndo(r.tanggal)}</td>
                <td className={cell}>{formatWaktu(r.waktu)}</td>
                <td className={cell}>{r.durasi}</td>
              </tr>
            ))}
            {Array.from({ length: blanks }).map((_, i) => (
              <tr key={`b${i}`}>
                <td className={`${cell} text-center`}>{rows.length + i + 1}</td>
                <td className={`${cell} h-7`} />
                <td className={cell} />
                <td className={cell} />
                <td className={cell} />
                <td className={cell} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tindak Lanjut */}
        <div className="space-y-1.5 text-[10pt] break-inside-avoid">
          <table className="w-full border border-black border-collapse">
            <tbody>
              <tr>
                <td className="py-1 px-2 font-semibold bg-slate-50 print:bg-transparent border-b border-black">Tindak lanjut</td>
              </tr>
              <tr>
                <td className="py-1 px-2 h-24 align-top whitespace-pre-line">{item.tindak_lanjut || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="pt-6 text-[10pt] break-inside-avoid">
          <p className="text-right pb-3">
            {item.ditandatangani_di || "Bandung"}, {item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "……………………"}
          </p>
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr className="align-top">
                {sign.map((s) => (
                  <td key={s.judul} className="w-1/2 py-1">{s.judul}</td>
                ))}
              </tr>
              <tr>
                <td className="h-20" />
                <td />
              </tr>
              <tr className="align-bottom">
                {sign.map((s) => (
                  <td key={s.judul} className="py-1">
                    ({s.nama || "............................"})
                    {s.nip && <div className="text-[9pt]">NIP. {s.nip}</div>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-300 text-[8pt] text-slate-500 flex items-center justify-between">
          <span>Klasifikasi : INTERNAL</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>

      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt;
          }
          aside,
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
