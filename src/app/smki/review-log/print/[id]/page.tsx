"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
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
  const cell = "border border-black px-2 py-1.5 align-top";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
        <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={() => router.push(`/smki/review-log/detail/${item.id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Detail</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition">
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>

        {/* A4 Paper */}
        <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-[15mm] print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-5">
          {/* Kop */}
          <div className="border border-black">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-28 p-2 border-r border-black text-center align-middle">
                    <img
                      src="/logo-fr047.png"
                      alt="Logo Jabar"
                      className="w-16 h-auto mx-auto object-contain"
                      onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = "/logo.png"; }}
                    />
                  </td>
                  <td className="p-3 border-r border-black text-center align-middle">
                    <h2 className="text-base font-bold tracking-wide uppercase">FORMULIR REVIEW LOG</h2>
                  </td>
                  <td className="w-60 p-2 text-[9pt] align-middle">
                    <table className="w-full text-left">
                      <tbody>
                        <tr><td className="font-semibold py-0.5 w-24">No. Dokumen</td><td className="py-0.5">: FR-040/KOM.03.05/SANDIKAMI</td></tr>
                        <tr><td className="font-semibold py-0.5">No. Revisi</td><td className="py-0.5">: 1.0</td></tr>
                        <tr><td className="font-semibold py-0.5">Tanggal Berlaku</td><td className="py-0.5">: 07-Jul-2022</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Identitas */}
          <table className="text-[10.5pt]">
            <tbody>
              <tr><td className="pr-4 py-0.5 w-40">Tanggal Review</td><td className="py-0.5">: {formatTanggalIndo(item.tanggal_review)}</td></tr>
              <tr><td className="pr-4 py-0.5">Periode Review</td><td className="py-0.5">: {formatPeriode(item.periode_mulai, item.periode_selesai)}</td></tr>
              <tr><td className="pr-4 py-0.5">Obyek Review</td><td className="py-0.5">: {item.obyek_review}</td></tr>
              <tr><td className="pr-4 py-0.5">Pelaksana Review</td><td className="py-0.5">: {item.pelaksana_review}</td></tr>
            </tbody>
          </table>

          {/* Tabel Log */}
          <table className="w-full border-collapse border border-black text-[10pt]">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100">
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
                  <td className={`${cell} h-7`} /><td className={cell} /><td className={cell} /><td className={cell} /><td className={cell} />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tindak Lanjut */}
          <div className="border border-black p-2 min-h-[28mm] break-inside-avoid text-[10.5pt]">
            <p className="font-semibold">Tindak lanjut</p>
            <p className="whitespace-pre-line mt-1">{item.tindak_lanjut || ""}</p>
          </div>

          {/* Tanda tangan */}
          <div className="break-inside-avoid text-[10.5pt]">
            <p className="text-right">{item.ditandatangani_di || "Bandung"}, {item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "……………………"}</p>
            <div className="grid grid-cols-2 gap-8 mt-3 text-center">
              {[
                { judul: "Dibuat Oleh,", nama: item.dibuat_oleh_nama, nip: item.dibuat_oleh_nip },
                { judul: "Mengetahui,", nama: item.mengetahui_nama, nip: item.mengetahui_nip },
              ].map((s) => (
                <div key={s.judul}>
                  <p>{s.judul}</p>
                  <div className="h-20" />
                  <p className="font-semibold">({s.nama || "………………………………."})</p>
                  {s.nip && <p className="text-[9.5pt]">NIP. {s.nip}</p>}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[8.5pt] text-slate-500 pt-2">Klasifikasi: Internal</p>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
