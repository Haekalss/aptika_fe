import jsPDF from "jspdf";
import autoTable, { type CellHookData, type RowInput, type UserOptions } from "jspdf-autotable";
import type { Fr009ActionType, Fr009Lookup, Fr009Record, Fr009SourceCode } from "@/services/smki/tindakanPerbaikan.types";

interface PdfAssets {
  logo: string;
}

const MARGIN = 25.4;
const START_Y = 46;
const FONT = "helvetica";
const sourceRows: Fr009SourceCode[][] = [
  ["audit_internal", "laporan_insiden"],
  ["audit_eksternal", "usulan_saran"],
  ["pengukuran_pemantauan", "lainnya"],
];

function dateLabel(value?: string | null): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

export function fr009PdfFilename(report: Fr009Record): string {
  return `FR-009_${(report.nomor_laporan || String(report.id)).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
}

export function createFr009Pdf(report: Fr009Record, lookup: Fr009Lookup, assets: PdfAssets): jsPDF {
  if (!report.permissions.can_export) throw new Error("Anda tidak memiliki hak ekspor laporan ini.");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter", putOnlyUsedFonts: true, compress: true });
  doc.setFont(FONT, "normal");
  // shortcut: Built-in Helvetica is WinAnsi only; use DOCX when other scripts are needed.
  const font = doc.getFont().metadata as { Unicode: { encoding: { WinAnsiEncoding: Record<number, number> } } };
  const checkText = (text: string) => {
    for (const character of text) {
      const code = character.codePointAt(0)!;
      if (code > 255 && !font.Unicode.encoding.WinAnsiEncoding[code]) {
        throw new Error(`Karakter "${character}" belum didukung font PDF. Gunakan ekspor DOCX agar isi tetap utuh.`);
      }
    }
  };
  Object.values(lookup.template).forEach(checkText);
  doc.setProperties({ title: "Form Tindakan Perbaikan dan Pencegahan", subject: report.nomor_laporan || "FR-009", creator: "APTIKA Tools" });
  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const height = doc.internal.pageSize.getHeight();
  const headerPages = new Set<number>();
  const logo = doc.getImageProperties(assets.logo);

  const header = () => {
    const page = doc.getCurrentPageInfo().pageNumber;
    if (headerPages.has(page)) return;
    headerPages.add(page);
    const y = 12.7;
    const headerHeight = 27;
    // Column proportions follow the original DOCX header grid.
    const columns = [1860, 3525, 1800, 2985].map((value) => value / 10170 * width);
    const titleX = MARGIN + columns[0];
    const metaX = titleX + columns[1];
    const valueX = metaX + columns[2];
    doc.setDrawColor(0).setTextColor(0).setLineWidth(0.25);
    doc.rect(MARGIN, y, width, headerHeight);
    for (const x of [titleX, metaX, valueX]) doc.line(x, y, x, y + headerHeight);
    for (let row = 1; row < 3; row++) doc.line(metaX, y + row * 9, MARGIN + width, y + row * 9);
    const logoScale = Math.min((columns[0] - 4) / logo.width, 22 / logo.height);
    const logoHeight = logo.height * logoScale;
    const logoWidth = logo.width * logoScale;
    doc.addImage(assets.logo, "PNG", MARGIN + (columns[0] - logoWidth) / 2, y + (headerHeight - logoHeight) / 2, logoWidth, logoHeight);
    doc.setFont(FONT, "bold").setFontSize(12);
    const title = doc.splitTextToSize("FORM TINDAKAN PERBAIKAN DAN PENCEGAHAN", columns[1] - 4) as string[];
    doc.text(title, titleX + columns[1] / 2, y + (headerHeight - title.length * 4.8) / 2 + 3.8, { align: "center", lineHeightFactor: 1.14 });
    doc.setFont(FONT, "normal").setFontSize(8);
    const metadata = [["No. Dokumen", lookup.template.code], ["No. Revisi", lookup.template.revision], ["Tanggal Berlaku", dateLabel(lookup.template.effective_date)]];
    metadata.forEach(([label, value], row) => {
      doc.text(doc.splitTextToSize(label, columns[2] - 3), metaX + 1.5, y + row * 9 + 3.5);
      doc.text(doc.splitTextToSize(`: ${value}`, columns[3] - 3), valueX + 1.5, y + row * 9 + 3.5);
    });
  };

  let cursor = START_Y;
  const table = (options: UserOptions) => {
    // Do not silently corrupt characters unsupported by the built-in font.
    for (const row of [...(options.head ?? []), ...(options.body ?? [])]) {
      for (const cell of Array.isArray(row) ? row : Object.values(row)) {
        const content = cell && typeof cell === "object" && "content" in cell ? cell.content : cell;
        if (typeof content === "string") checkText(content);
        else if (Array.isArray(content)) content.forEach(checkText);
      }
    }
    autoTable(doc, {
      startY: cursor, tableWidth: width, theme: "grid", rowPageBreak: "avoid",
      margin: { top: START_Y, bottom: MARGIN, left: MARGIN, right: MARGIN },
      styles: { font: FONT, fontSize: 9, cellPadding: 1.6, textColor: 0, lineColor: 0, lineWidth: options.theme === "plain" ? 0 : 0.15, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: 255, textColor: 0, fontStyle: "bold", valign: "middle" },
      willDrawPage: header,
      ...options,
    });
    cursor = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  };

  table({
    theme: "plain",
    body: [
      ["No", report.nomor_laporan || ""], ["Divisi/Area", report.area || ""],
      ["Tanggal", dateLabel(report.tanggal_laporan)], ["Diajukan kepada", report.diajukan_kepada_nama || ""],
      ["Dilaporkan oleh", report.dilaporkan_oleh_nama || ""],
    ].map(([label, value]) => [label, `: ${value}`]),
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: width - 35 } },
  });
  cursor += 2;

  table({
    theme: "plain",
    rowPageBreak: "auto",
    body: [[{ content: "Sumber Ketidaksesuaian", colSpan: 4, styles: { fontStyle: "bold" } }], ...sourceRows.map((codes) => codes.flatMap((code) => {
      const label = lookup.sources.find((source) => source.code === code)?.label || code;
      return ["", code === "lainnya" ? `${label}: ${report.sumber_codes.includes(code) ? report.sumber_lainnya || "" : ""}` : label];
    }))],
    columnStyles: { 0: { cellWidth: 6 }, 1: { cellWidth: width / 2 - 6 }, 2: { cellWidth: 6 }, 3: { cellWidth: width / 2 - 6 } },
    didDrawCell: ({ cell, row, column }: CellHookData) => {
      if (row.index < 1 || ![0, 2].includes(column.index)) return;
      const code = sourceRows[row.index - 1][column.index / 2];
      const x = cell.x + 1.3;
      const y = cell.y + 1.6;
      doc.setLineWidth(0.2).rect(x, y, 3.2, 3.2);
      if (report.sumber_codes.includes(code)) {
        doc.setFont(FONT, "normal").setFontSize(8);
        doc.text("X", x + 1.6, y + 2.6, { align: "center" });
      }
    },
  });
  cursor += 2;

  table({ rowPageBreak: "auto", body: [[`Deskripsi Masalah/Potensial Masalah:\n${report.deskripsi || ""}`], [`Status Temuan: ${report.status_temuan || ""}`], [`Akar Masalah:\n${report.akar_masalah || ""}`]] });

  for (const jenis of ["koreksi", "tindakan_korektif"] as Fr009ActionType[]) {
    const items = report.items.filter((item) => item.jenis === jenis).sort((a, b) => a.urutan - b.urutan);
    const body: RowInput[] = items.length ? items.map((item, index) => [String(index + 1), item.uraian || "", item.pic_nama || "", dateLabel(item.batas_waktu)]) : [["", "", "", ""]];
    // Ratios come from the four merged action cells in the DOCX table.
    const columns = [945, 5024, 868, 2190].map((value) => value / 9027 * width);
    table({
      head: [["No", jenis === "koreksi" ? "Koreksi (perbaikan seketika)" : "Tindakan Korektif (supaya ketidaksesuaian tidak terjadi kembali)", "PIC", "Batas Waktu"]],
      body, showHead: "everyPage",
      columnStyles: Object.fromEntries(columns.map((cellWidth, index) => [index, { cellWidth, ...(index === 0 ? { halign: "center" as const } : {}) }])),
      bodyStyles: { minCellHeight: 10 },
    });
  }

  table({
    body: [["Verifikasi:", "", `Tanggal: ${dateLabel(report.tanggal_verifikasi)}`]],
    columnStyles: { 0: { cellWidth: width * 2555 / 9027 }, 1: { cellWidth: width * 3414 / 9027 }, 2: { cellWidth: width * 3058 / 9027 } },
    bodyStyles: { minCellHeight: 7 },
    didDrawCell: ({ cell, column }: CellHookData) => {
      if (column.index !== 1) return;
      doc.setFont(FONT, "normal").setFontSize(9);
      const x = cell.x + 1.6;
      const y = cell.y + 4.6;
      doc.text("( Close / Open )*", x, y);
      const unselected = report.verifikasi === "Close" ? "Open" : report.verifikasi === "Open" ? "Close" : null;
      if (unselected) {
        const start = x + doc.getTextWidth(unselected === "Close" ? "( " : "( Close / ");
        doc.setLineWidth(0.2).line(start, y - 1, start + doc.getTextWidth(unselected), y - 1);
      }
    },
  });
  table({ rowPageBreak: "auto", body: [[`Catatan:\n${report.catatan_verifikasi || ""}`]] });
  const audit = report.sumber_codes.some((source) => ["audit_internal", "audit_eksternal"].includes(source));
  table({
    body: [[`Diverifikasi Oleh:\nAuditor\n\n\n${audit ? report.auditor_nama || "" : ""}`, `Diverifikasi Oleh:\nAtasan Terkait\n\n\n${report.atasan_nama || ""}`]],
    columnStyles: { 0: { cellWidth: width * 3539 / 9027 }, 1: { cellWidth: width * 5488 / 9027 } },
    bodyStyles: { minCellHeight: 25 },
  });
  cursor += 2;
  table({ theme: "plain", styles: { font: FONT, fontSize: 8, cellPadding: 0.8, textColor: 0 }, body: [["Catatan: Kolom auditor hanya perlu diisi untuk kegiatan audit"], ["*Pilih salah satu/coret yang tidak perlu"]] });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont(FONT, "normal").setFontSize(8).setTextColor(0);
    doc.text(`Klasifikasi : ${lookup.template.classification}`, MARGIN, height - 12.7);
    doc.text(`Page ${page} of ${pages}`, MARGIN + width, height - 12.7, { align: "right" });
  }
  return doc;
}

async function loadAsset(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Aset PDF gagal dimuat. Muat ulang halaman lalu coba lagi.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(binary);
}

export async function exportFr009ToPdf(report: Fr009Record, lookup: Fr009Lookup): Promise<void> {
  const logo = await loadAsset("/logo-jabar.png");
  const doc = createFr009Pdf(report, lookup, { logo: `data:image/png;base64,${logo}` });
  await doc.save(fr009PdfFilename(report), { returnPromise: true });
}
