"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchReviuCctvDetail, downloadReviuCctvDocx, formatTanggalIndo, formatPeriode,
  formatTanggalRingkas, reviuCctvErrMsg, ReviuCctv,
} from "@/services/smki/reviuCctvService";
import { getTtePegawai, TtePegawai } from "@/services/tteService";
import TteSpecimen from "@/components/smki/TteSpecimen";

/** Jumlah baris minimum pada tabel (sama dengan template .docx: 3 baris). */
const MIN_ROWS = 3;

// Format halaman, font, dan ukuran mengikuti template asli "FR-038 Formulir Review CCTV.docx"
// (13 x 8,5 in landscape, margin 1 in, Arial; judul 14 pt; isian 11 pt; meta kop 8-9 pt).
const FONT = "Arial, 'Liberation Sans', Helvetica, sans-serif";
const line = "1px solid #000";
const thick = "1.5px solid #000";

export default function PrintReviuCctvPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<ReviuCctv | null>(null);
  const [loading, setLoading] = useState(true);
  const [pegawaiList, setPegawaiList] = useState<TtePegawai[]>([]);

  useEffect(() => {
    getTtePegawai()
      .then(setPegawaiList)
      .catch(() => setPegawaiList([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchReviuCctvDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(reviuCctvErrMsg(err, "Gagal memuat formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDocx = async () => {
    try {
      await downloadReviuCctvDocx(id);
      toast.success("Dokumen FR-038 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-038.");
    }
  };

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-038...</p>
      </div>
    );
  }

  const rows = item.items || [];
  const total = Math.max(MIN_ROWS, rows.length);

  // Cocokkan pengelola dengan master pegawai (berdasarkan NIP, fallback nama)
  const penandatangan = pegawaiList.find(
    (p) =>
      (item.pengelola_nip && p.nip === item.pengelola_nip) ||
      (item.pengelola_nama &&
        p.nama.trim().toLowerCase() === item.pengelola_nama.trim().toLowerCase())
  );
  const cell: React.CSSProperties = { border: thick, borderLeft: line, borderRight: line, padding: "5px 5px", verticalAlign: "middle", fontSize: "11pt" };
  const cellC: React.CSSProperties = { ...cell, textAlign: "center" };
  const meta: React.CSSProperties = { border: line, padding: "2px 5px", verticalAlign: "middle" };
  const identitas: [string, string][] = [
    ["Tanggal Review", formatTanggalIndo(item.tanggal_reviu)],
    ["Periode Review", item.periode_mulai || item.periode_selesai ? formatPeriode(item.periode_mulai, item.periode_selesai) : ""],
    ["Obyek Review", item.obyek_reviu],
    ["Pelaksana Review", item.pelaksana_reviu],
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0 print:min-h-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[13in] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/reviu-cctv")}
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

      {/* Kertas 13 x 8,5 in landscape, margin 1 in */}
      <div
        className="fr038-paper max-w-[13in] mx-auto bg-white shadow-lg text-black"
        style={{ fontFamily: FONT, padding: "1in", minHeight: "8.5in", lineHeight: 1.15 }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", border: line, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "6.06%" }} />
            <col style={{ width: "15.7%" }} />
            <col style={{ width: "1.5%" }} />
            <col style={{ width: "27.36%" }} />
            <col style={{ width: "27.08%" }} />
            <col style={{ width: "8.74%" }} />
            <col style={{ width: "0.87%" }} />
            <col style={{ width: "0.87%" }} />
            <col style={{ width: "11.82%" }} />
          </colgroup>
          <tbody>
            {/* Kop */}
            <tr>
              <td colSpan={3} rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", padding: 2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-fr038.png" alt="Logo Diskominfo Jabar" style={{ width: "0.66in", height: "auto", margin: "0 auto" }} />
              </td>
              <td colSpan={2} rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", fontSize: "14pt", fontWeight: 700, padding: "0 10px" }}>
                FORMULIR REVIEW <i>MONITORING</i> DAN PEMELIHARAAN CCTV
              </td>
              <td style={{ ...meta, fontSize: "8pt", whiteSpace: "nowrap" }}>No. Dokumen</td>
              <td colSpan={2} style={{ ...meta, fontSize: "9pt", textAlign: "center" }}>:</td>
              <td style={{ ...meta, fontSize: "9pt" }}>FR-038/KOM.03.05/ SANDIKAMI</td>
            </tr>
            <tr>
              <td style={{ ...meta, fontSize: "8pt", whiteSpace: "nowrap" }}>No. Revisi</td>
              <td colSpan={2} style={{ ...meta, fontSize: "9pt", textAlign: "center" }}>:</td>
              <td style={{ ...meta, fontSize: "9pt" }}>0.0</td>
            </tr>
            <tr>
              <td style={{ ...meta, fontSize: "8pt", whiteSpace: "nowrap" }}>Tanggal Berlaku</td>
              <td colSpan={2} style={{ ...meta, fontSize: "9pt", textAlign: "center" }}>:</td>
              <td style={{ ...meta, fontSize: "9pt" }}>07 Juli 2022</td>
            </tr>

            {/* Identitas reviu */}
            {identitas.map(([label, value]) => (
              <tr key={label}>
                <td colSpan={2} style={{ border: thick, borderRight: "none", padding: "5px 5px", fontSize: "11pt", verticalAlign: "middle" }}>{label}</td>
                <td style={{ border: thick, borderLeft: "none", borderRight: "none", padding: "5px 0", fontSize: "11pt", textAlign: "center" }}>:</td>
                <td colSpan={6} style={{ border: thick, borderLeft: "none", padding: "5px 5px", fontSize: "11pt", verticalAlign: "middle" }}>{value}</td>
              </tr>
            ))}

            {/* Judul kolom */}
            <tr>
              <td style={cellC}>No</td>
              <td colSpan={3} style={cellC}>Uraian Review</td>
              <td style={cellC}>Tindak Lanjut</td>
              <td colSpan={2} style={cellC}>Target Selesai</td>
              <td colSpan={2} style={cellC}>Keterangan</td>
            </tr>
            {Array.from({ length: total }).map((_, i) => {
              const r = rows[i];
              return (
                <tr key={r?.id ?? `b${i}`} style={{ pageBreakInside: "avoid" }}>
                  <td style={cellC}>{i + 1}</td>
                  <td colSpan={3} style={{ ...cell, whiteSpace: "pre-line" }}>{r?.uraian_reviu ?? ""}</td>
                  <td style={{ ...cell, whiteSpace: "pre-line" }}>{r?.tindak_lanjut ?? ""}</td>
                  <td colSpan={2} style={cellC}>{r ? formatTanggalRingkas(r.target_selesai) : ""}</td>
                  <td colSpan={2} style={cell}>{r?.keterangan ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tanda tangan pengelola CCTV */}
        <div style={{ marginTop: "0.4in", fontSize: "10pt", pageBreakInside: "avoid", breakInside: "avoid" }}>
          <div style={{ paddingLeft: "0.4in" }}>Pengelola CCTV,</div>
          {penandatangan ? (
            <div style={{ paddingLeft: "0.4in", margin: "6px 0 4px" }}>
              <TteSpecimen pegawaiId={penandatangan.id} width={300} />
            </div>
          ) : (
            <div style={{ height: "1.1in" }} />
          )}
          <div>
            ({item.pengelola_nama || "……………………………….."})
            {item.pengelola_nip ? <div>NIP. {item.pengelola_nip}</div> : null}
          </div>
        </div>
      </div>

      {/* Print-specific style: ukuran halaman = template (13 x 8,5 in landscape, margin 1 in) */}
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
          .fr038-paper {
            box-shadow: none !important;
            padding: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          @page {
            size: 13in 8.5in;
            margin: 1in;
          }
        }
      `}</style>
    </div>
  );
}
