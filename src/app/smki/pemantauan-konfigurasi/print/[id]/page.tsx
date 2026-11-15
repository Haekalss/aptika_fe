"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Printer, Loader2, ArrowLeft, FileDown, FileText } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { getDetail } from "@/services/smki/pemantauanKonfigurasiService";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";
import { formatTanggal, formatWaktu, periodeLabel, hasilLabel, KESESUAIAN_MAP } from "@/components/smki/pemantauan-konfigurasi/constants";
import TteSpecimen from "@/components/smki/TteSpecimen";
import { unduhPdf, unduhDocx } from "@/components/smki/pemantauan-konfigurasi/lib/export";

/** Cetak/Unduh FR-048 (UC-07). Belum Selesai => diberi tanda "BELUM FINAL". */
export default function PemantauanPrintPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <PrintSheet />
    </ServiceRouteGuard>
  );
}

function PrintSheet() {
  const params = useParams();
  const id = Number(params?.id);
  const [detail, setDetail] = useState<PemantauanDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    getDetail(id)
      .then(setDetail)
      .catch(() => setError("Pemantauan tidak ditemukan atau Anda tidak berhak mengaksesnya."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-16 flex items-center justify-center gap-2 text-slate-400 text-xs"><Loader2 size={16} className="animate-spin" /> Menyiapkan cetakan...</div>;
  }
  if (error || !detail) {
    return <div className="py-16 text-center text-xs text-rose-600">{error ?? "Gagal memuat cetakan."}</div>;
  }

  const printedItems = detail.objekList.flatMap((o) => o.items.map((item) => ({ item, objekNama: o.objekNama })));
  const belumFinal = detail.status !== "selesai";

  // Resolver spesimen: snapshot saat ttd, fallback akun live
  const pelaksanaSigner = (detail.ttdPelaksanaNama || detail.pelaksanaNama || "").trim() || undefined;
  const mengetahuiSigner = (detail.ttdAdminNama || detail.adminNama || "").trim() || undefined;

  const handleExport = async (kind: "pdf" | "docx") => {
    if (exporting) return;
    setExporting(kind);
    try {
      if (kind === "pdf") await unduhPdf(detail);
      else await unduhDocx(detail);
    } catch (err) {
      console.error(err);
      alert(`Gagal membuat ${kind.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="fr048-print">
      <style>{`
        @media print {
          @page { size: F4; margin: 14mm 15mm; }
          body * { visibility: hidden; }
          .fr048-sheet, .fr048-sheet * { visibility: visible !important; }
          .fr048-sheet { position: absolute; inset: 0; }
          .print-hidden-btn { display: none !important; }
        }
        .fr048-sheet { font-family: 'Times New Roman', Times, serif; color: #111; font-size: 12px; }
        .fr048-sheet table { border-collapse: collapse; width: 100%; }
        .fr048-sheet th, .fr048-sheet td { border: 1px solid #333; padding: 3px 7px; vertical-align: middle; }
        .fr048-sheet td.no-border, .fr048-sheet th.no-border { border: none; }
        .fr048-sheet th { background: #f2f2f2; }
        .fr048-kop-title { font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 20pt; line-height: 1.18; }
        .fr048-kop-doc td { font-family: 'Times New Roman', Times, serif; font-size: 9pt; padding: 2px 6px; }
        .fr048-ident td { font-family: 'Times New Roman', Times, serif; font-size: 11pt; padding: 3px 7px; }
        .fr048-list th { font-family: 'Times New Roman', Times, serif; font-size: 11pt; background:#f2f2f2; }
        .fr048-list td { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
        .fr048-pad { padding: 4px 8px; }
      `}</style>

      {/* Tombol aksi (tidak ikut tercetak) */}
      <div className="print-hidden-btn flex items-center justify-between gap-3 mb-4">
        <button type="button" onClick={() => window.history.back()} className="h-9 px-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          <ArrowLeft size={14} /> Kembali
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => handleExport("pdf")} disabled={exporting !== null} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50">
            {exporting === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Unduh PDF
          </button>
          <button type="button" onClick={() => handleExport("docx")} disabled={exporting !== null} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-50">
            {exporting === "docx" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Unduh DOCX
          </button>
          <button type="button" onClick={() => window.print()} className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold">
            <Printer size={14} /> Cetak
          </button>
        </div>
      </div>

      {/* Lembar cetak: struktur identik template resmi FR048 */}
      <div className="fr048-sheet bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-5xl mx-auto relative">

        {/* KOP dokumen (baris 1–3 template) */}
        <table className="fr048-kop" style={{ marginBottom: 6 }}>
          <tbody>
            <tr>
              <td rowSpan={3} style={{ width: "19%", textAlign: "center", padding: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-fr047.png" alt="Logo DISCOMTIA" style={{ width: 64, height: "auto", display: "inline-block" }} />
              </td>
              <td rowSpan={3} style={{ textAlign: "center", verticalAlign: "middle", padding: "6px 4px" }}>
                <span className="fr048-kop-title">FORMULIR<br />PEMANTAUAN<br />KONFIGURASI</span>
              </td>
              <td className="fr048-kop-doc" style={{ width: "32%" }}>No. Dokumen : <b>{detail.noFormulir || "-"}</b></td>
            </tr>
            <tr><td className="fr048-kop-doc">No. Revisi : <b>{detail.noRevisi || "-"}</b></td></tr>
            <tr><td className="fr048-kop-doc">Tanggal Berlaku : <b>{formatTanggal(detail.tanggalBerlaku)}</b></td></tr>
          </tbody>
        </table>

        {/* Identifikasi (nested label : value) */}
        <table className="fr048-ident" style={{ marginTop: 10 }}>
          <tbody>
            <tr>
              <td style={{ width: "24%", fontWeight: 700, textAlign: "center" }}>Tanggal Pemantauan</td>
              <td>: {formatTanggal(detail.tanggalPemantauan)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, textAlign: "center" }}>Periode</td>
              <td>: {detail.periode} ({periodeLabel(detail.periode)})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, textAlign: "center" }}>Jenis Konfigurasi</td>
              <td>: {detail.jenisKonfigurasiNama || "—"}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, textAlign: "center" }}>Nama Objek</td>
              <td>: {detail.objekList.map((o) => o.objekNama).join(", ") || "—"}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, textAlign: "center" }}>Pelaksana</td>
              <td>: {detail.pelaksanaNama}</td>
            </tr>
          </tbody>
        </table>

        {/* Daftar Konfigurasi: intro bullet persis template */}
        <div style={{ marginTop: 14, fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Daftar Konfigurasi </p>
          <p style={{ margin: 0 }}>* 1 Form tidak terbatas hanya untuk 1 perangkat, dapat disesuaikan menjadi beberapa sub-perangkat. Misalnya beberapa VM dalam hardware yang sama dapat ditetapkan dalam 1 form.</p>
          <p style={{ margin: 0 }}>* Kolom ‘Kesesuaian’ diisi dengan kesesuaian antara nilai konfigurasi eksisting dengan nilai konfigurasi yang sudah ditetapkan.</p>
        </div>

        {/* Tabel 5 kolom */}
        <table className="fr048-list" style={{ marginTop: 6 }}>
          <thead>
            <tr>
              <th style={{ width: "6%" }}>No</th>
              <th style={{ width: "34%" }}>Nama Konfigurasi</th>
              <th style={{ width: "26%" }}>Nilai</th>
              <th style={{ width: "14%" }}>Kesesuaian</th>
              <th style={{ width: "20%" }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {printedItems.map(({ item }, i) => {
              const key = `${item.id ?? i}`;
              const kes = item.kesesuaian ? KESESUAIAN_MAP[item.kesesuaian].label : "Belum";
              return (
                <tr key={key}>
                  <td style={{ textAlign: "center" }}>{i + 1}</td>
                  <td>{item.namaKonfigurasi}</td>
                  <td>{item.nilaiAktual}</td>
                  <td>{kes}</td>
                  <td>{item.keterangan || "—"}</td>
                </tr>
              );
            })}
            {printedItems.length === 0 && (
              <tr><td colSpan={5} style={{ height: 48 }} /></tr>
            )}
          </tbody>
        </table>

        <p style={{ marginTop: 6, fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt", fontWeight: 700 }}>
          Hasil Pemantauan : {hasilLabel(detail.hasil)} ({detail.jumlahSesuai} Sesuai, {detail.jumlahTidakSesuai} Tidak Sesuai).
        </p>

        {/* Catatan Tindak lanjut */}
        <table className="fr048-list" style={{ marginTop: 6 }}>
          <thead><tr><th style={{ textAlign: "left" }}>Catatan Tindak lanjut</th></tr></thead>
          <tbody>
            <tr><td style={{ minHeight: 56, whiteSpace: "pre-wrap" }}>{detail.catatanTindakLanjut || "—"}</td></tr>
          </tbody>
        </table>

        {/* Baris tanggal (sisi kanan) */}
        <p style={{ marginTop: 18, marginBottom: 2, textAlign: "right", fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt" }}>
          Bandung, {detail.tanggalTtdPelaksana ? formatTanggal(detail.tanggalTtdPelaksana) : "............................"}
        </p>

        {/* Blok TTD dua kolom — spesimen saja (tanpa nama di bawah), sesuai FR-021 */}
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 2 }}>
          <tbody>
            <tr>
              <td className="no-border" style={{ textAlign: "center", width: "46%" }}>Dibuat Oleh,</td>
              <td className="no-border" style={{ textAlign: "center", width: "54%" }}>Mengetahui,</td>
            </tr>
            <tr>
              <td className="no-border" style={{ height: 150, textAlign: "center", verticalAlign: "middle" }}>
                {detail.tanggalTtdPelaksana && pelaksanaSigner
                  ? <TteSpecimen nama={pelaksanaSigner} showQr={false} width={240} className="h-auto max-w-full inline-block" />
                  : <span style={{ fontSize: "10pt", color: "#666", fontStyle: "italic" }}>Belum ditandatangani</span>}
              </td>
              <td className="no-border" style={{ height: 150, textAlign: "center", verticalAlign: "middle" }}>
                {detail.tanggalTtdAdmin && mengetahuiSigner
                  ? <TteSpecimen nama={mengetahuiSigner} showQr={false} width={240} className="h-auto max-w-full inline-block" />
                  : <span style={{ fontSize: "10pt", color: "#666", fontStyle: "italic" }}>Belum ditandatangani</span>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer klasifikasi */}
        <p style={{ marginTop: 16, textAlign: "center", fontFamily: "'Times New Roman', Times, serif", fontSize: "8pt", color: "#333" }}>
          Klasifikasi: Internal
        </p>
        <p style={{ textAlign: "center", fontFamily: "'Times New Roman', Times, serif", fontSize: "7pt", color: "#555", margin: 0 }}>
          Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE) Badan Siber Sandi Negara
        </p>
        {belumFinal && (
          <p style={{ textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: "11pt", letterSpacing: 6, color: "#c00000", marginTop: 6 }}>
            BELUM FINAL
          </p>
        )}
        <p style={{ marginTop: 10, textAlign: "center", fontFamily: "'Times New Roman', Times, serif", fontSize: "7pt", color: "#666" }}>
          Dicetak dari APTIKA pada {formatWaktu(new Date().toISOString())} · Status: {detail.status === "selesai" ? "Final — disahkan Admin (Mengetahui)" : "BELUM FINAL"} · Siklus #{detail.siklus}
        </p>
      </div>
    </div>
  );
}
