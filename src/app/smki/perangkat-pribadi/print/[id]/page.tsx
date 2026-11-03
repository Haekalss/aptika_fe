"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchPerangkatPribadiDetail, downloadPerangkatPribadiDocx, formatTanggalIndo, perangkatErrMsg, PerangkatPribadi,
} from "@/services/smki/perangkatPribadiService";
import TteSpecimen from "@/components/smki/TteSpecimen";

/** Jumlah baris minimum tabel perangkat (sama dengan template .docx: 5 baris). */
const MIN_ROWS = 5;

// Format halaman, font, dan ukuran mengikuti template asli "FR-045 Formulir BYOD.docx"
// (Letter landscape, margin 1 in, Calibri 12 pt; kop 18 pt di header setiap halaman).
const FONT = "Calibri, Carlito, 'Segoe UI', Arial, sans-serif";
const line = "1px solid #000";

export default function PrintPerangkatPribadiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<PerangkatPribadi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchPerangkatPribadiDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(perangkatErrMsg(err, "Gagal memuat formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDocx = async () => {
    try {
      await downloadPerangkatPribadiDocx(id);
      toast.success("Dokumen FR-045 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-045.");
    }
  };

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-045...</p>
      </div>
    );
  }

  const rows = item.perangkat || [];
  const blanks = Math.max(0, MIN_ROWS - rows.length);
  const cell: React.CSSProperties = { border: line, padding: "0 4px", verticalAlign: "top" };
  const unit = item.unit_kerja;
  const kepala = /^Kepala (.+)$/.exec(item.jabatan || "");
  const meta: [string, string, string, string][] = [
    ["No. Dokumen", "FR-045/KOM.03/05/ SANDIKAMI", "8pt", "0.45in"],
    ["No. Revisi", "0.0", "9pt", "0.37in"],
    ["Tanggal Berlaku", "13 Juli 2023", "9pt", "0.52in"],
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0 print:min-h-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[11in] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/perangkat-pribadi")}
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

      {/* Kertas Letter landscape (11 x 8,5 in), margin 1 in */}
      <div
        className="fr045-paper max-w-[11in] mx-auto bg-white shadow-lg text-black"
        style={{ fontFamily: FONT, fontSize: "12pt", lineHeight: 1.15, padding: "0.7in 1in 1in 0.4in", minHeight: "8.5in" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {/* Kop: header setiap halaman (template: header1.xml) */}
          <thead style={{ display: "table-header-group" }}>
            <tr>
              <td style={{ padding: "0 0 0.28in" }}>
                <table style={{ width: "7.78in", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "42%" }} />
                    <col style={{ width: "17.7%" }} />
                    <col style={{ width: "3.8%" }} />
                    <col style={{ width: "21.5%" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", padding: 4 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo-fr045.png" alt="Logo Jabar" style={{ width: "0.95in", height: "auto", margin: "0 auto" }} />
                      </td>
                      <td rowSpan={3} style={{ border: line, textAlign: "center", verticalAlign: "middle", fontSize: "18pt", fontWeight: 700, lineHeight: 1.2 }}>
                        FORMULIR
                        <br />
                        <i>Bring Your Own Device (BYOD)</i>
                      </td>
                      <td style={{ border: line, fontSize: "10pt", padding: "0 6px", height: meta[0][3], verticalAlign: "middle" }}>{meta[0][0]}</td>
                      <td style={{ border: line, fontSize: "10pt", textAlign: "center" }}>:</td>
                      <td style={{ border: line, fontSize: meta[0][2], padding: "0 6px" }}>{meta[0][1]}</td>
                    </tr>
                    {meta.slice(1).map(([l, v, fs, h]) => (
                      <tr key={l}>
                        <td style={{ border: line, fontSize: "10pt", padding: "0 6px", height: h, verticalAlign: "middle" }}>{l}</td>
                        <td style={{ border: line, fontSize: "10pt", textAlign: "center" }}>:</td>
                        <td style={{ border: line, fontSize: fs, padding: "0 6px", verticalAlign: "middle" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "0 0 0 0.6in" }}>
                <p style={{ textAlign: "justify", margin: 0 }}>Yang bertanda tangan di bawah ini:</p>

                {/* Identitas */}
                <table style={{ width: "6.1in", marginTop: "0.12in", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "1.15in" }} />
                    <col />
                  </colgroup>
                  <tbody>
                    {[
                      ["Nama", item.nama],
                      ["NIP", item.nip],
                    ].map(([l, v]) => (
                      <tr key={l as string}>
                        <td style={cell}>{l}</td>
                        <td style={cell}>{v || ""}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={cell}>Jabatan</td>
                      <td style={cell}>
                        {kepala ? (
                          <>
                            Kepala <b>{kepala[1]}</b>
                          </>
                        ) : (
                          item.jabatan
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={cell}>Unit Kerja</td>
                      <td style={cell}>{unit || ""}</td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ textAlign: "justify", margin: "0.2in 0 0.06in" }}>
                  Menyatakan bahwa penggunaan perangkat pribadi di <b>{unit}</b> adalah sebagai berikut:
                </p>

                {/* Tabel perangkat */}
                <table style={{ width: "9.19in", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "4.1%" }} />
                    <col style={{ width: "22.7%" }} />
                    <col style={{ width: "20.5%" }} />
                    <col style={{ width: "13.3%" }} />
                    <col style={{ width: "17.9%" }} />
                    <col style={{ width: "21.5%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {["No", "Nama", "NIP", "Jenis perangkat TI", "Merek/ tipe", "Nomor Seri"].map((h) => (
                        <th key={h} style={{ ...cell, textAlign: "center", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p, i) => (
                      <tr key={p.id ?? i} style={{ height: "0.31in", pageBreakInside: "avoid" }}>
                        <td style={cell}>{i + 1}</td>
                        <td style={cell}>{p.nama}</td>
                        <td style={cell}>{p.nip}</td>
                        <td style={cell}>{p.jenis_perangkat}</td>
                        <td style={cell}>{p.merek_tipe}</td>
                        <td style={cell}>{p.nomor_seri}</td>
                      </tr>
                    ))}
                    {Array.from({ length: blanks }).map((_, i) => (
                      <tr key={`b${i}`} style={{ height: "0.31in" }}>
                        <td style={cell}>{rows.length + i + 1}</td>
                        <td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} />
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: "0.27in" }}>
                  <p style={{ margin: 0 }}>Jenis Perangkat TI dapat diisi dengan:</p>
                  <p style={{ margin: 0 }}>*Laptop/PC/Tab</p>
                </div>

                <p style={{ textAlign: "justify", margin: "0.55in 0 0" }}>
                  Jika dikemudian hari ditemukan pelanggaran berkaitan dengan penggunaan perangkat pribadi tersebut, maka akan dikenakan sanksi sesuai ketentuan yang berlaku.
                </p>

                {/* Tempat/tanggal + spesimen TTE Kepala Unit Kerja */}
                <div style={{ marginLeft: "5.5in", width: "2.65in", marginTop: "0.25in", textAlign: "center", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <p style={{ margin: 0 }}>
                    {item.ditandatangani_di || "Bandung"},{" "}
                    {item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "Tanggal Bulan Tahun"}
                  </p>
                  {item.nip || item.nama ? (
                    <div style={{ marginTop: "0.15in", display: "flex", justifyContent: "center" }}>
                      <TteSpecimen nip={item.nip} nama={item.nama} width={300} />
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "0.25in",
                        height: "0.975in",
                        border: "1.5px dashed #4472c4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 0.3in",
                      }}
                    >
                      Spesimen TTE Kepala Unit Kerja
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer (template: footer1.xml) - di layar; saat cetak memakai footer halaman */}
        <div className="print:hidden" style={{ marginLeft: "0.6in", width: "6.27in", display: "flex", justifyContent: "space-between", fontSize: "10pt", marginTop: "0.4in" }}>
          <span>
            <i>Klasifikasi : </i>
            <b><i>INTERNAL</i></b>
          </span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* Print-specific style: ukuran halaman = template (Letter landscape, margin 1 in) */}
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
          .fr045-paper {
            box-shadow: none !important;
            padding: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          @page {
            size: 11in 8.5in;
            margin: 0.7in 1in 1in 0.4in;
            @bottom-left {
              content: "Klasifikasi : INTERNAL";
              font-family: ${FONT};
              font-size: 10pt;
              font-style: italic;
              font-weight: 700;
              padding-left: 0.6in;
              vertical-align: top;
              padding-top: 0.3in;
              white-space: nowrap;
            }
            @bottom-right {
              content: "Page " counter(page) " of " counter(pages);
              font-family: ${FONT};
              font-size: 10pt;
              padding-right: 2.7in;
              vertical-align: top;
              padding-top: 0.3in;
            }
          }
        }
      `}</style>
    </div>
  );
}
