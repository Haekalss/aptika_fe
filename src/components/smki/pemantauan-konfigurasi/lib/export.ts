// Export resmi FR-048 (client-side): Unduh PDF & Unduh DOCX.
// Layout: identik dengan template resmi SANDIKAMI (FR048):
//   kop kotak-putih (logo | FORMULIR PEMANTAUAN KONFIGURASI | No Dok/Rev/Tgl Berlaku),
//   F4/Folio, identifikasi label : value, tabel Daftar Konfigurasi 5 kolom + baris
//   "Hasil Pemantauan", catatan, TTD dua kolom (hanya spesimen TTE, tanpa nama),
//   footer klasifikasi (+ BELUM FINAL jika status != selesai).
import type { CellInput } from "jspdf-autotable";
import JSZip from "jszip";
import { api } from "@/services/api";
import type { PemantauanDetailDto } from "@/services/smki/pemantauanKonfigurasiService.types";
import {
  periodeLabel,
  formatTanggal,
  hasilLabel,
  KESESUAIAN_MAP,
} from "../constants";

const fileSafe = (s: string) => s.replace(/[^A-Za-z0-9._-]+/g, "-");
const firstObjek = (p: PemantauanDetailDto) => p.objekList[0]?.objekNama ?? "Pemantauan";

const baseFilename = (p: PemantauanDetailDto) =>
  `FR-048_${fileSafe(firstObjek(p))}_${(p.tanggalPemantauan ?? "").slice(0, 10)}_${p.status.toUpperCase()}`;

const rowsOf = (p: PemantauanDetailDto) =>
  p.objekList.flatMap((o) => o.items.map((item) => ({ objekNama: o.objekNama, item })));

const itemsRows = (p: PemantauanDetailDto) =>
  rowsOf(p).map(({ item }, i) => ({
    no: i + 1,
    namaKonfigurasi: item.namaKonfigurasi,
    nilaiAktual: item.nilaiAktual,
    kesesuaianLabel: item.kesesuaian ? KESESUAIAN_MAP[item.kesesuaian].label : "Belum",
    keterangan: item.keterangan || "—",
  }));

const belumFinal = (p: PemantauanDetailDto) => p.status !== "selesai";

/** Nama penanda tangan untuk resolver spesimen: snapshot saat ttd, fallback akun live. */
const signerName = (snapshot?: string | null, live?: string | null) =>
  snapshot?.trim() || live?.trim() || null;

const pelaksanaSigner = (p: PemantauanDetailDto) =>
  signerName(p.ttdPelaksanaNama, p.pelaksanaNama);
const mengetahuiSigner = (p: PemantauanDetailDto) =>
  signerName(p.ttdAdminNama, p.adminNama);

// ─── Ambil gambar logo & spesimen TTE sebagai bytes ───────────
async function fetchBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchTteBytes(nama?: string | null): Promise<Uint8Array | null> {
  if (!nama) return null;
  try {
    const res = await api.get("/tte/resolve/image", {
      params: { nama, include_qr: 0 },
      responseType: "blob",
    });
    const blob = res.data as Blob;
    if (!blob || blob.size === 0) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

/* ═════════ DOCX — post-processing gambar (FR-021 style) ═════════ */

/** `<w:p>...</w:p>` terluar yang memuat marker — paragraf tidak bersarang, cukup regex. */
function replaceParagraphContaining(
  xml: string,
  marker: string,
  replacer: (paragraphXml: string) => string | null,
): string {
  const re = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;
  return xml.replace(re, (whole) => {
    if (!whole.includes(marker)) return whole;
    const next = replacer(whole);
    return next ?? ""; // null = hapus paragraf
  });
}

function drawingXml(rId: string, docPrId: number, cx: number, cy: number): string {
  return (
    `<w:drawing>` +
    `<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">` +
    `<wp:extent cx="${cx}" cy="${cy}"/>` +
    `<wp:effectExtent l="0" t="0" r="0" b="0"/>` +
    `<wp:docPr id="${docPrId}" name="tte.png"/>` +
    `<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/></wp:cNvGraphicFramePr>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
    `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:nvPicPr><pic:cNvPr id="${docPrId}" name="tte.png"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
    `</pic:pic>` +
    `</a:graphicData>` +
    `</a:graphic>` +
    `</wp:inline>` +
    `</w:drawing>`
  );
}

function imageParagraphXml(rId: string, docPrId: number, cx: number, cy: number): string {
  return (
    `<w:p><w:pPr><w:spacing w:after="60"/><w:jc w:val="center"/></w:pPr>` +
    `<w:r>${drawingXml(rId, docPrId, cx, cy)}</w:r></w:p>`
  );
}

function missingTteParagraphXml(): string {
  return (
    `<w:p><w:pPr><w:spacing w:after="60"/><w:jc w:val="center"/></w:pPr>` +
    `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/><w:i/><w:sz w:val="16"/><w:szCs w:val="16"/><w:color w:val="666666"/></w:rPr>` +
    `<w:t xml:space="preserve">(TTE tidak tersedia)</w:t></w:r></w:p>`
  );
}

function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
}

function nextRId(rels: string): string {
  const ids = [...rels.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1], 10));
  return `rId${ids.length ? Math.max(...ids) + 1 : 1}`;
}

/* ═══════════════════════════════ DOCX (template-driven) ═══════════════════════════════ */
export async function unduhDocx(p: PemantauanDetailDto): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PizZip = (await import("pizzip")).default as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Docxtemplater = (await import("docxtemplater")).default as any;

  const res = await fetch("/templates/FR-048_Pemantauan_Manajemen_Konfigurasi.docx");
  if (!res.ok) throw new Error("Template dokumen tidak ditemukan.");
  const buf = await res.arrayBuffer();
  const zip = new PizZip(buf);

  const signedPelaksana = Boolean(p.tanggalTtdPelaksana);
  const signedMengetahui = Boolean(p.tanggalTtdAdmin);
  const [imgPelaksana, imgMengetahui] = await Promise.all([
    signedPelaksana ? fetchTteBytes(pelaksanaSigner(p)) : Promise.resolve(null),
    signedMengetahui ? fetchTteBytes(mengetahuiSigner(p)) : Promise.resolve(null),
  ]);

  const doc = new Docxtemplater(zip, { delimiters: { start: "{{", end: "}}" } });
  doc.render({
    noFormulir: p.noFormulir || "-",
    noRevisi: p.noRevisi || "-",
    tanggalBerlaku: formatTanggal(p.tanggalBerlaku),
    tanggalPemantauan: formatTanggal(p.tanggalPemantauan),
    periode: `${p.periode} (${periodeLabel(p.periode)})`,
    jenisKonfigurasiNama: p.jenisKonfigurasiNama,
    objekList: p.objekList.map((o) => o.objekNama).join(", ") || "-",
    pelaksanaNama: pelaksanaSigner(p) ?? "-",
    catatanTindakLanjut: p.catatanTindakLanjut || "—",
    tanggalTtdPelaksana: p.tanggalTtdPelaksana
      ? formatTanggal(p.tanggalTtdPelaksana)
      : "............................",
    tidakFinal: belumFinal(p),
    hasilLabel: hasilLabel(p.hasil),
    jumlahSesuai: p.jumlahSesuai,
    jumlahTidakSesuai: p.jumlahTidakSesuai,
    ttdPelaksanaSigned: signedPelaksana,
    ttdMengetahuiSigned: signedMengetahui,
    items: itemsRows(p),
  });

  // ── Post-process: sisipkan gambar TTE (pola FR-021) ──
  const outBytes: Uint8Array = doc.getZip().generate({ type: "uint8array", compression: "DEFLATE" });
  const jszip = await JSZip.loadAsync(outBytes);

  const docFile = jszip.file("word/document.xml");
  if (!docFile) throw new Error("Template dokumen tidak valid (document.xml hilang).");
  let xml = await docFile.async("string");

  const relsPath = "word/_rels/document.xml.rels";
  const relsFile = jszip.file(relsPath);
  let relsXml = relsFile ? await relsFile.async("string") : "<Relationships/>";

  const images: Array<{ marker: string; bytes: Uint8Array | null; signed: boolean; docPrId: number; mediaName: string }> = [
    { marker: "TTE_IMG_PELAKSANA", bytes: imgPelaksana, signed: signedPelaksana, docPrId: 10, mediaName: "tte_pelaksana.png" },
    { marker: "TTE_IMG_MENGETAHUI", bytes: imgMengetahui, signed: signedMengetahui, docPrId: 11, mediaName: "tte_mengetahui.png" },
  ];

  for (const img of images) {
    if (img.signed && img.bytes) {
      const dims = pngDimensions(img.bytes);
      const widthPx = 235;
      const heightPx = dims ? Math.max(1, Math.round((widthPx * dims.height) / dims.width)) : 106;
      const cx = widthPx * 9525;
      const cy = heightPx * 9525;

      const rId = nextRId(relsXml);
      relsXml = relsXml.replace(
        "</Relationships>",
        `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img.mediaName}"/></Relationships>`,
      );
      jszip.file(`word/media/${img.mediaName}`, img.bytes);

      xml = replaceParagraphContaining(xml, img.marker, () =>
        imageParagraphXml(rId, img.docPrId, cx, cy),
      );
    } else if (img.signed) {
      // TTE sudah "ditandatangani" tapi resolver gagal/tidak tersedia.
      xml = replaceParagraphContaining(xml, img.marker, () => missingTteParagraphXml());
    } else {
      // Belum ditandatangani: marker dihapus, paragraf {{^signed}} merender fallback.
      xml = replaceParagraphContaining(xml, img.marker, () => null);
    }
  }

  jszip.file("word/document.xml", xml);
  jszip.file(relsPath, relsXml);

  const blob = await jszip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseFilename(p)}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════ PDF (F4, mirror template) ═══════════════════════════════
export async function unduhPdf(p: PemantauanDetailDto): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const logo = await fetchBytes("/logo-fr047.png");
  const [ttdPelaksana, ttdMengetahui] = await Promise.all([
    p.tanggalTtdPelaksana ? fetchTteBytes(pelaksanaSigner(p)) : Promise.resolve(null),
    p.tanggalTtdAdmin ? fetchTteBytes(mengetahuiSigner(p)) : Promise.resolve(null),
  ]);

  const logoDataUrl = logo
    ? `data:image/png;base64,${btoa(String.fromCharCode(...logo))}`
    : null;
  const ttdPelaksanaUrl = ttdPelaksana
    ? `data:image/png;base64,${btoa(String.fromCharCode(...ttdPelaksana))}`
    : null;
  const ttdMengetahuiUrl = ttdMengetahui
    ? `data:image/png;base64,${btoa(String.fromCharCode(...ttdMengetahui))}`
    : null;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 330], // F4 / Folio
    compress: true,
  });
  const belum = belumFinal(p);
  const pageW = 210;
  const margin = 14;

  const lastAutoTableY = () =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  const drawFooter = (pageNo: number) => {
    // Halaman 1: Klasifikasi: RAHASIA (sesuai template). Halaman >1: Klasifikasi: Internal + BSrE.
    if (pageNo === 1) {
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text("Klasifikasi: RAHASIA", pageW / 2, 322, { align: "center" });
    } else {
      doc.setFontSize(6.5);
      doc.setTextColor(90);
      doc.text("Klasifikasi: Internal", pageW / 2, 320, { align: "center" });
      doc.text(
        "Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh BSrE BSSN",
        pageW / 2,
        325,
        { align: "center" },
      );
    }
    if (belum) {
      doc.setFontSize(9);
      doc.setTextColor(192, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("BELUM FINAL", pageW / 2, 314, { align: "center" });
      doc.setTextColor(90);
      doc.setFont("helvetica", "normal");
    }
    doc.setFontSize(6.5);
    doc.setTextColor(120);
    doc.text(
      `Dicetak dari APTIKA · Siklus #${p.siklus} · Status: ${p.status === "selesai" ? "Final" : "BELUM FINAL"}`,
      pageW / 2,
      328.5,
      { align: "center" },
    );
  };

  const drawHeaderContinuation = () => {
    doc.setFontSize(6.5);
    doc.setTextColor(80);
    doc.text("PROSEDUR PENGENDALIAN AKSES TI   |   No: PR-14/SMKI   |   Rev: 2.0", pageW / 2, 8, {
      align: "center",
    });
  };

  const drawTable = (
    startY: number,
    head: CellInput[][],
    body: CellInput[][],
    opts: object = {},
  ) => {
    autoTable(doc, {
      startY,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { lineWidth: 0.25, lineColor: [0, 0, 0], fontSize: 8, cellPadding: 2 },
      ...(opts as object),
      head: head.length ? head : undefined,
      body,
    });
  };

  // ── KOP (logo | judul | kontrol dokumen) ──
  autoTable(doc, {
    startY: 12,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { lineWidth: 0.25, lineColor: [0, 0, 0], cellPadding: 2, valign: "middle", halign: "center", font: "helvetica", minCellHeight: 24 },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 112 }, 2: { cellWidth: 42 } },
    body: [
      [
        { content: "" },
        { content: "FORMULIR PEMANTAUAN\nKONFIGURASI", styles: { fontStyle: "bold", fontSize: 15 } },
        {
          content: `No. Dokumen : ${p.noFormulir || "-"}\nNo. Revisi  : ${p.noRevisi || "-"}\nTanggal Berlaku : ${formatTanggal(p.tanggalBerlaku)}`,
          styles: { halign: "left", fontSize: 6.8, valign: "middle" },
        },
      ],
    ],
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0 && logo && logoDataUrl) {
        // Fit-contain: logo resmi Jabar (rasio tinggi) tidak boleh keluar dari sel KOP
        const dims = pngDimensions(logo);
        const aspect = dims ? dims.height / dims.width : 257 / 196;
        let w = 19; // mm
        let h = w * aspect;
        const maxH = data.cell.height - 1.5;
        if (h > maxH) {
          h = maxH;
          w = h / aspect;
        }
        doc.addImage(
          logoDataUrl,
          "PNG",
          data.cell.x + (data.cell.width - w) / 2,
          data.cell.y + (data.cell.height - h) / 2,
          w,
          h,
        );
      }
    },
  });

  // ── Identifikasi (label : value, persis template) ──
  drawTable(
    lastAutoTableY() + 6,
    [],
    [
      [{ content: "Tanggal Pemantauan", styles: { fontStyle: "bold", halign: "center", cellWidth: 52 } }, { content: ": " + formatTanggal(p.tanggalPemantauan), colSpan: 3 }],
      [{ content: "Periode", styles: { fontStyle: "bold", halign: "center" } }, { content: `: ${p.periode} (${periodeLabel(p.periode)})`, colSpan: 3 }],
      [{ content: "Jenis Konfigurasi", styles: { fontStyle: "bold", halign: "center" } }, { content: ": " + (p.jenisKonfigurasiNama || "—"), colSpan: 3 }],
      [{ content: "Nama Objek", styles: { fontStyle: "bold", halign: "center" } }, { content: ": " + (p.objekList.map((o) => o.objekNama).join(", ") || "—"), colSpan: 3 }],
      [{ content: "Pelaksana", styles: { fontStyle: "bold", halign: "center" } }, { content: ": " + (pelaksanaSigner(p) ?? "-"), colSpan: 3 }],
    ] as CellInput[][],
    { styles: { fontSize: 9 } },
  );

  // ── Daftar Konfigurasi (intro + tabel 5 kolom + Hasil Pemantauan) ──
  const rows = itemsRows(p).map(({ no, namaKonfigurasi, nilaiAktual, kesesuaianLabel, keterangan }) => [
    String(no),
    namaKonfigurasi,
    nilaiAktual,
    kesesuaianLabel,
    keterangan,
  ]);

  // Intro persis template (dua baris bullet, tanpa isian)
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Daftar Konfigurasi ", margin, lastAutoTableY() + 7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "* 1 Form tidak terbatas hanya untuk 1 perangkat, dapat disesuaikan menjadi beberapa sub-perangkat.",
    margin,
    lastAutoTableY() + 11.5,
  );
  doc.text(
    "* Kolom ‘Kesesuaian’ diisi dengan kesesuaian antara nilai konfigurasi eksisting dengan nilai konfigurasi yang sudah ditetapkan.",
    margin,
    lastAutoTableY() + 16,
  );

  drawTable(
    lastAutoTableY() + 19,
    [["No", "Nama Konfigurasi", "Nilai", "Kesesuaian", "Keterangan"]],
    [
      ...rows,
      ...(rows.length === 0
        ? [["", "", "", "", ""] as unknown as CellInput[]]
        : []),
    ],
    {
      headStyles: { fillColor: [240, 240, 240], fontStyle: "bold", textColor: [0, 0, 0] },
      columnStyles: { 0: { cellWidth: 12, halign: "center" }, 4: { cellWidth: 48 } },
    },
  );

  // Kursor y tunggal agar teks/tabel berikutnya tidak bertumpuk
  const cursorY = lastAutoTableY();

  // Hasil Pemantauan (di luar tabel, persis template)
  const hasilY = cursorY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(
    `Hasil Pemantauan : ${hasilLabel(p.hasil)} (${p.jumlahSesuai} Sesuai, ${p.jumlahTidakSesuai} Tidak Sesuai).`,
    margin,
    hasilY,
  );

  // ── Catatan Tindak lanjut (bold, tanpa banner — persis template) ──
  const catatanLabelY = hasilY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text("Catatan Tindak lanjut", margin, catatanLabelY);
  drawTable(
    catatanLabelY + 3,
    [],
    [[{ content: p.catatanTindakLanjut || "—" }]],
    { styles: { fontSize: 8, minCellHeight: 16 } },
  );

  // ── TTD: "Bandung, tanggal" di sisi kanan, lalu Dibuat Oleh / Mengetahui ──
  const ttdStartY = lastAutoTableY() + 13;
  const leftX = margin;
  const rightX = pageW / 2;
  const cellW = pageW / 2 - margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(
    p.tanggalTtdPelaksana
      ? `Bandung, ${formatTanggal(p.tanggalTtdPelaksana)}`
      : "Bandung, ............................",
    rightX + cellW,
    ttdStartY,
    { align: "right" },
  );

  // Spesimen TTE (tanpa nama di bawah, sesuai template & contoh dokumen FR-021)
  const labelY = ttdStartY + 10;
  doc.setFont("helvetica", "normal");
  doc.text("Dibuat Oleh,", leftX + cellW / 2, labelY, { align: "center" });
  doc.text("Mengetahui,", rightX + cellW / 2, labelY, { align: "center" });

  const imgY = labelY + 4;
  const imgW = 56;
  const imgH = 56 * (348 / 861); // rasio kotak spesimen (861x348)
  if (ttdPelaksanaUrl) {
    doc.addImage(ttdPelaksanaUrl, "PNG", leftX + (cellW - imgW) / 2, imgY, imgW, imgH);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      "Belum ditandatangani",
      leftX + cellW / 2,
      imgY + imgH / 2,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
  }
  if (ttdMengetahuiUrl) {
    doc.addImage(ttdMengetahuiUrl, "PNG", rightX + (cellW - imgW) / 2, imgY, imgW, imgH);
  } else if (p.tanggalTtdAdmin) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(102, 102, 102);
    doc.text("(TTE tidak tersedia)", rightX + cellW / 2, imgY + imgH / 2, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      "Belum ditandatangani",
      rightX + cellW / 2,
      imgY + imgH / 2,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
  }

  // ── Header halaman lanjutan & footer semua halaman ──
  const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) drawHeaderContinuation();
    drawFooter(i);
  }

  doc.save(`${baseFilename(p)}.pdf`);
}
