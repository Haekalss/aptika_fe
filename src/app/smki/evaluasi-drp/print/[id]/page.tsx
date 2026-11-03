"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchDrpEvaluasiDetail, downloadDrpEvaluasiDocx, formatTanggalIndo, formatWaktuPengujian,
  drpEvaluasiErrMsg, CHECKLIST_GROUPS, DrpEvaluasi,
} from "@/services/smki/drpEvaluasiService";

/** Baris minimum tiap tabel (sama dengan template .docx). */
const MIN_WAKTU = 2;
const MIN_PROSES = 8;
const MIN_TIM = 5;

// Format halaman, font, dan susunan mengikuti template asli "FR-039 Formulir Evaluasi Pengujian DRP.docx"
// (A4 potret, margin kiri/kanan 0,5 in, Arial; kop berulang di tiap halaman; 4 halaman: A, proses/team, B, lampiran).
const FONT = "Arial, 'Liberation Sans', Helvetica, sans-serif";
const line = "1px solid #000";
const navy = "#1f3864";
const grey = "#bfbfbf";

const td: React.CSSProperties = { border: line, padding: "2px 5px", verticalAlign: "top", fontSize: "10pt", whiteSpace: "pre-line" };
const th: React.CSSProperties = { border: line, padding: "1px 5px", background: grey, fontWeight: 700, textAlign: "center", fontSize: "11pt" };
const band: React.CSSProperties = { border: line, padding: "1px 5px", background: navy, color: "#fff", fontWeight: 700, textAlign: "center", fontSize: "11pt" };
const meta: React.CSSProperties = { border: line, padding: "2px 5px", fontSize: "9pt", verticalAlign: "middle" };

function Kop() {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: "0.25in" }}>
      <colgroup>
        <col style={{ width: "12.2%" }} /><col style={{ width: "42.1%" }} /><col style={{ width: "14.3%" }} />
        <col style={{ width: "2.9%" }} /><col style={{ width: "28.5%" }} />
      </colgroup>
      <tbody>
        <tr>
          <td rowSpan={3} style={{ ...meta, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-fr039.png" alt="Logo Diskominfo Jabar" style={{ width: "0.66in", height: "auto", margin: "0 auto" }} />
          </td>
          <td rowSpan={3} style={{ ...meta, textAlign: "center", fontSize: "14pt", fontWeight: 700 }}>
            FORMULIR LAPORAN EVALUASI DAN PENGUJIAN DRP
          </td>
          <td style={meta}>No. Dokumen</td><td style={{ ...meta, textAlign: "center" }}>:</td><td style={meta}>FR-039/KOM.03.05/SANDIKAMI</td>
        </tr>
        <tr><td style={meta}>No. Revisi</td><td style={{ ...meta, textAlign: "center" }}>:</td><td style={meta}>0.0</td></tr>
        <tr><td style={meta}>Tanggal. Berlaku</td><td style={{ ...meta, textAlign: "center" }}>:</td><td style={meta}>2022</td></tr>
      </tbody>
    </table>
  );
}

/** Satu halaman kertas (kop + isi); pindah halaman otomatis saat cetak. */
function Sheet({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className="fr039-sheet" style={{ pageBreakAfter: last ? "auto" : "always", breakAfter: last ? "auto" : "page" }}>
      <Kop />
      {children}
    </div>
  );
}

const Cols = ({ w }: { w: number[] }) => (
  <colgroup>{w.map((x, i) => (<col key={i} style={{ width: `${(x / 10460) * 100}%` }} />))}</colgroup>
);

export default function PrintDrpEvaluasiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<DrpEvaluasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchDrpEvaluasiDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(drpEvaluasiErrMsg(err, "Gagal memuat formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDocx = async () => {
    try {
      await downloadDrpEvaluasiDocx(id);
      toast.success("Dokumen FR-039 (.docx) berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh dokumen FR-039.");
    }
  };

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-039...</p>
      </div>
    );
  }

  const waktu = item.waktu || [];
  const proses = item.proses || [];
  const tim = item.tim || [];
  const nWaktu = Math.max(MIN_WAKTU, waktu.length);
  const nProses = Math.max(MIN_PROSES, proses.length);
  const nTim = Math.max(MIN_TIM, tim.length);

  const info: [string, string][] = [
    ["Tanggal dan Waktu Pengujian", formatWaktuPengujian(item.tanggal_pengujian, item.waktu_mulai, item.waktu_selesai)],
    ["Tujuan Pengujian", item.tujuan],
    ["Cakupan Pengujian", item.cakupan],
    ["Tipe Pengujian", item.tipe_pengujian],
    ["Asumsi Bencana", item.asumsi_bencana || ""],
    ["Asumsi Ketersediaan Sumber Daya", item.asumsi_sumber_daya || ""],
  ];
  const sign = [
    { judul: "Dibuat Oleh:", nama: item.dibuat_oleh_nama, tgl: item.dibuat_oleh_tanggal },
    { judul: "Diperiksa Oleh:", nama: item.diperiksa_oleh_nama, tgl: item.diperiksa_oleh_tanggal },
    { judul: "Disetujui Oleh:", nama: item.disetujui_oleh_nama, tgl: item.disetujui_oleh_tanggal },
  ];
  const wW = [2800, 1900, 2000, 3760];
  const wP = [1900, 2700, 2200, 2400, 1260];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0 print:min-h-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[8.27in] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/evaluasi-drp")}
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

      {/* Kertas A4 potret, margin kiri/kanan 0,5 in, atas/bawah 1 in */}
      <div
        className="fr039-paper max-w-[8.27in] mx-auto bg-white shadow-lg text-black"
        style={{ fontFamily: FONT, padding: "1in 0.5in", minHeight: "11.69in", lineHeight: 1.15 }}
      >
        {/* Halaman 1: A. Evaluasi Pengujian DRP + Persyaratan Waktu */}
        <Sheet>
          <h2 style={{ fontSize: "14pt", fontWeight: 700, margin: "0 0 4px 0" }}>A. Evaluasi Pengujian DRP</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <Cols w={wW} />
            <tbody>
              <tr><td colSpan={4} style={band}>Pengujian DRP</td></tr>
              {info.map(([label, value]) => (
                <tr key={label}>
                  <td colSpan={4} style={{ ...td, fontSize: "11pt", minHeight: "0.45in" }}>
                    <div style={{ fontWeight: 700 }}>{label}:</div>
                    <div style={{ minHeight: "0.3in" }}>{value}</div>
                  </td>
                </tr>
              ))}
              <tr><td colSpan={4} style={band}>Evaluasi – Persyaratan Waktu</td></tr>
              <tr>{["Sistem TI", "RTO Ideal", "Pencapaian RTO", "Kendala"].map((h) => (<td key={h} style={th}>{h}</td>))}</tr>
              {Array.from({ length: nWaktu }).map((_, i) => {
                const r = waktu[i];
                return (
                  <tr key={i} style={{ pageBreakInside: "avoid" }}>
                    <td style={td}>{r?.sistem_ti ?? ""}</td><td style={td}>{r?.rto_ideal ?? ""}</td>
                    <td style={td}>{r?.pencapaian_rto ?? ""}</td><td style={td}>{r?.kendala ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Sheet>

        {/* Halaman 2: Proses DRP + Team */}
        <Sheet>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <Cols w={wP} />
            <tbody>
              <tr><td colSpan={5} style={band}>Evaluasi – Proses DRP</td></tr>
              <tr>{["Proses", "Aktivitas", "Hasil Evaluasi", "Rekomendasi", "PIC"].map((h) => (<td key={h} style={th}>{h}</td>))}</tr>
              {Array.from({ length: nProses }).map((_, i) => {
                const r = proses[i];
                return (
                  <tr key={i} style={{ pageBreakInside: "avoid", height: "0.2in" }}>
                    <td style={td}>{r?.proses ?? ""}</td><td style={td}>{r?.aktivitas ?? ""}</td>
                    <td style={td}>{r?.hasil_evaluasi ?? ""}</td><td style={td}>{r?.rekomendasi ?? ""}</td><td style={td}>{r?.pic ?? ""}</td>
                  </tr>
                );
              })}
              <tr><td colSpan={5} style={band}>Evaluasi – Team</td></tr>
              <tr>
                <td style={th}>Peran</td><td style={th}>Tanggung Jawab</td><td style={th}>Evaluasi</td>
                <td colSpan={2} style={th}>Rekomendasi</td>
              </tr>
              {Array.from({ length: nTim }).map((_, i) => {
                const r = tim[i];
                return (
                  <tr key={i} style={{ pageBreakInside: "avoid", height: "0.2in" }}>
                    <td style={td}>{r?.peran ?? ""}</td><td style={td}>{r?.tanggung_jawab ?? ""}</td>
                    <td style={td}>{r?.evaluasi ?? ""}</td><td colSpan={2} style={td}>{r?.rekomendasi ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Sheet>

        {/* Halaman 3: B. Check List Pengujian BCP + tanda tangan (dicetak seperti template asli, tanpa centang) */}
        <Sheet>
          <h2 style={{ fontSize: "12pt", fontWeight: 700, margin: "0 0 4px 0" }}>B. <i>Check List</i> Pengujian BCP</h2>
          <p style={{ fontSize: "9pt", margin: "0 0 4px 0", textAlign: "justify" }}>
            Tujuan: Mengevaluasi efektivitas, kejelasan, kemungkinan dapat dieksekusi, serta kelengkapan BCP/DRP untuk melanjutkan fungsi bisnis penting ketika terjadi bencana.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup><col style={{ width: "17.5%" }} /><col style={{ width: "82.5%" }} /></colgroup>
            <tbody>
              <tr>
                <td style={{ ...band, background: "#1f3864", fontSize: "9pt" }}>KATEGORI</td>
                <td style={{ ...band, fontSize: "9pt" }}>KRITERIA</td>
              </tr>
              {CHECKLIST_GROUPS.map((g) => (
                <tr key={g.kategori}>
                  <td style={{ ...td, textAlign: "center", verticalAlign: "middle", fontSize: "9pt" }}>
                    {g.kategori} (<i>{g.kategoriEn}</i>)
                  </td>
                  <td style={{ ...td, fontSize: "9pt" }}>
                    {g.items.map((it) => (
                      <div key={it.key} style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                        <span>●</span>
                        <span>{it.teks}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: "0.5in", pageBreakInside: "avoid" }}>
            <tbody>
              <tr>{sign.map((s) => (<td key={s.judul} style={{ ...band, background: "#44546a", fontSize: "10pt" }}>{s.judul}</td>))}</tr>
              <tr>{sign.map((s) => (<td key={s.judul} style={{ ...td, fontSize: "10pt" }}>Tanggal: {s.tgl ? formatTanggalIndo(s.tgl) : ""}</td>))}</tr>
              <tr>
                {sign.map((s) => (
                  <td key={s.judul} style={{ ...td, height: "1.65in", verticalAlign: "bottom", textAlign: "center", fontSize: "11pt" }}>
                    {s.nama ? `(${s.nama})` : ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Sheet>

        {/* Halaman 4: Lampiran */}
        <Sheet last>
          <div style={{ fontSize: "11pt", fontWeight: 700, marginBottom: 6 }}>Lampiran Laporan Pengujian DRP</div>
          <div style={{ fontSize: "11pt", whiteSpace: "pre-line", minHeight: "0.3in" }}>{item.lampiran || ""}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: "0.3in" }}>
            <tbody>
              {[0, 1].map((r) => (
                <tr key={r}>{[0, 1].map((c) => (<td key={c} style={{ border: line, height: "2.2in" }} />))}</tr>
              ))}
            </tbody>
          </table>
        </Sheet>
      </div>

      {/* Print-specific style: ukuran halaman = template (A4 potret) */}
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
          .fr039-paper {
            box-shadow: none !important;
            padding: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 1in 0.5in;
          }
        }
      `}</style>
    </div>
  );
}
