"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchReviewLogDetail, downloadReviewLogDocx, formatTanggalIndo, formatPeriode,
  formatTanggalRingkas, formatWaktu, reviewLogErrMsg, ReviewLog,
} from "@/services/smki/reviewLogService";

/** Jumlah baris log minimum pada tabel (sama dengan template .docx: 8 baris). */
const MIN_ROWS = 8;

// Format halaman, font, dan ukuran mengikuti template asli "FR-040 Formulir Review Log.docx"
// (Legal 8,5x14 in, margin 0,5 in, Arial; kop 18 pt; isian 10-11 pt; meta kop 8 pt).
const FONT = "Arial, 'Liberation Sans', Helvetica, sans-serif";
const line = "1px solid #000";

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

  const handleDocx = async () => {
    try {
      await downloadReviewLogDocx(id);
      toast.success("Dokumen FR-040 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-040.");
    }
  };

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
  const cell: React.CSSProperties = { border: line, padding: "1px 5px", verticalAlign: "top", fontSize: "10pt" };
  const cellC: React.CSSProperties = { ...cell, textAlign: "center" };
  const tanggalTtd = item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "……………………";
  const sign = [
    { judul: "Dibuat Oleh,", nama: item.dibuat_oleh_nama, nip: item.dibuat_oleh_nip },
    { judul: "Mengetahui,", nama: item.mengetahui_nama, nip: item.mengetahui_nip },
  ];
  const identitas: [string, string][] = [
    ["Tanggal Review", formatTanggalIndo(item.tanggal_review)],
    ["Periode Review", item.periode_mulai || item.periode_selesai ? formatPeriode(item.periode_mulai, item.periode_selesai) : ""],
    ["Obyek Review", item.obyek_review],
    ["Pelaksana Review", item.pelaksana_review],
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0 print:min-h-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[8.5in] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/review-log")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Daftar</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDocx}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Unduh Word (.docx)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Kertas Legal (8,5 x 14 in), margin 0,5 in */}
      <div
        className="fr040-paper max-w-[8.5in] mx-auto bg-white shadow-lg text-black"
        style={{ fontFamily: FONT, padding: "0.5in", minHeight: "14in", lineHeight: 1.15 }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", border: line, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "10.3%" }} />
            <col style={{ width: "53.4%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "1.4%" }} />
            <col style={{ width: "22.9%" }} />
          </colgroup>
          <tbody>
            {/* Kop */}
            <tr style={{ height: "0.31in" }}>
              <td rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", padding: 2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-fr040.png" alt="Logo Diskominfo Jabar" style={{ width: "0.68in", height: "auto", margin: "0 auto" }} />
              </td>
              <td rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", fontSize: "18pt", fontWeight: 700 }}>
                FORMULIR REVIEW LOG
              </td>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>No. Dokumen</td>
              <td style={{ border: line, fontSize: "8pt", textAlign: "center" }}>:</td>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>FR-040/KOM.03.05/SANDIKAMI</td>
            </tr>
            <tr style={{ height: "0.31in" }}>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>No. Revisi</td>
              <td style={{ border: line, fontSize: "8pt", textAlign: "center" }}>:</td>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>1.0</td>
            </tr>
            <tr style={{ height: "0.31in" }}>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>Tanggal Berlaku</td>
              <td style={{ border: line, fontSize: "8pt", textAlign: "center" }}>:</td>
              <td style={{ border: line, fontSize: "8pt", padding: "0 3px", whiteSpace: "nowrap", height: "0.31in" }}>07-Jul-2022</td>
            </tr>

            {/* Identitas review */}
            <tr>
              <td colSpan={5} style={{ border: line, borderBottom: "none", padding: "0 0 0 0.5in", height: "0.82in", verticalAlign: "top", fontSize: "11pt" }}>
                {identitas.map(([label, value]) => (
                  <div key={label}>
                    {label} : {value}
                  </div>
                ))}
              </td>
            </tr>

            {/* Tabel log */}
            <tr>
              <td colSpan={5} style={{ border: line, borderTop: "none", height: "2.04in", verticalAlign: "top", padding: "0.62in 0 0.2in 0.87in" }}>
                <table style={{ width: "5.7in", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "7.1%" }} />
                    <col style={{ width: "20.5%" }} />
                    <col style={{ width: "22.4%" }} />
                    <col style={{ width: "22.4%" }} />
                    <col style={{ width: "13.8%" }} />
                    <col style={{ width: "13.8%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ height: "0.41in" }}>
                      {["No", "User", "IP", "Tanggal", "Waktu", "Durasi"].map((h) => (
                        <th key={h} style={{ ...cellC, fontWeight: 400, verticalAlign: "middle" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.id ?? i} style={{ pageBreakInside: "avoid" }}>
                        <td style={cellC}>{i + 1}</td>
                        <td style={cell}>{r.user_log}</td>
                        <td style={cell}>{r.ip_address}</td>
                        <td style={cell}>{formatTanggalRingkas(r.tanggal)}</td>
                        <td style={cell}>{formatWaktu(r.waktu)}</td>
                        <td style={cell}>{r.durasi}</td>
                      </tr>
                    ))}
                    {Array.from({ length: blanks }).map((_, i) => (
                      <tr key={`b${i}`} style={{ height: "0.17in" }}>
                        <td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Tindak lanjut */}
            <tr>
              <td colSpan={5} style={{ border: line, padding: "0.2in 0 0.2in 1.05in", verticalAlign: "top" }}>
                <div style={{ fontSize: "10pt" }}>Tindak lanjut</div>
                <div style={{ width: "5.77in", minHeight: "1.1in", border: line, padding: "4px 6px", fontSize: "10pt", whiteSpace: "pre-line" }}>
                  {item.tindak_lanjut || ""}
                </div>
              </td>
            </tr>

            {/* Tempat, tanggal & tanda tangan */}
            <tr>
              <td colSpan={5} style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "47.5%" }} />
                    <col style={{ width: "52.5%" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ border: line, height: "0.23in" }} />
                      <td style={{ border: line, textAlign: "center", fontSize: "10pt" }}>
                        {item.ditandatangani_di || "Bandung"}, {tanggalTtd}
                      </td>
                    </tr>
                    <tr>
                      {sign.map((s) => (
                        <td key={s.judul} style={{ border: line, textAlign: "center", verticalAlign: "top", fontSize: "10pt", padding: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "1.55in", padding: "2px 0 4px" }}>
                            <span>{s.judul}</span>
                            <span>
                              ({s.nama || "……………………………….."})
                              {s.nip ? <div style={{ fontSize: "9pt" }}>NIP. {s.nip}</div> : null}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Print-specific style: ukuran halaman = template (Legal portrait, margin 0,5 in) */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          aside,
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          .fr040-paper {
            box-shadow: none !important;
            padding: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          @page {
            size: 8.5in 14in;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}
