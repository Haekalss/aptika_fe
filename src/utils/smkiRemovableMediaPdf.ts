import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import type { Fr025Report } from "@/services/smki/removableMedia.types";

function dateLabel(value?: string | null): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function createFr025Pdf(report: Fr025Report, logo: string): jsPDF {
  if (!report.permissions.can_export) throw new Error("Anda tidak memiliki hak ekspor dokumen ini.");
  if (!Array.isArray(report.items)) throw new Error("Rincian dokumen belum dimuat. Muat ulang sebelum mengekspor PDF.");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "legal", compress: true, putOnlyUsedFonts: true });
  doc.setFont("helvetica", "normal");
  // shortcut: Built-in Helvetica supports WinAnsi only; add a Unicode-capable export if other scripts are required.
  const font = doc.getFont().metadata as { Unicode: { encoding: { WinAnsiEncoding: Record<number, number> } } };
  const checkText = (text: string) => {
    for (const character of text) {
      const code = character.codePointAt(0)!;
      if (code > 255 && !font.Unicode.encoding.WinAnsiEncoding[code]) throw new Error(`Karakter "${character}" belum didukung font PDF. Isi dokumen tetap tersimpan; PDF tidak dibuat agar teks tidak rusak.`);
    }
  };
  const items = report.items ?? [];
  for (const text of [report.unit_kerja_nama, report.tempat, report.kepala_unit_nama, report.pengurus_barang_nama, report.nomor_dokumen, report.nomor_revisi, ...items.flatMap((item) => [item.nama_barang, item.merek, item.pic_nama, item.keterangan])]) {
    if (text) checkText(text);
  }
  doc.setProperties({ title: "Formulir Daftar Removable Media", subject: report.reference, creator: "APTIKA Tools" });
  const left = 25.012;
  const width = doc.internal.pageSize.getWidth() - left - 25.559;
  const height = doc.internal.pageSize.getHeight();
  doc.setFontSize(8.5);
  const metadata = [["No. Dokumen", report.nomor_dokumen], ["No. Revisi", report.nomor_revisi], ["Tanggal Berlaku", dateLabel(report.tanggal_berlaku)]].map(([label, value]) => {
    const lines = doc.splitTextToSize(`: ${value}`, 56) as string[];
    return { label, lines, height: Math.max(8, lines.length * 3.6 + 3) };
  });
  const headerHeight = metadata.reduce((total, row) => total + row.height, 0);
  const unitY = 15 + headerHeight + 9;
  doc.setFontSize(10);
  const unitLines = doc.splitTextToSize(`Unit Kerja : ${report.unit_kerja_nama}`, width) as string[];
  const top = Math.max(56, unitY + unitLines.length * 4.3 + 4);
  const drawn = new Set<number>();
  const image = doc.getImageProperties(logo);
  const header = () => {
    const page = doc.getCurrentPageInfo().pageNumber;
    if (drawn.has(page)) return;
    drawn.add(page);
    const y = 15;
    const columns = [25, width - 115, 30, 60];
    const metaX = left + columns[0] + columns[1];
    const valueX = metaX + columns[2];
    doc.setDrawColor(0).setTextColor(0).setLineWidth(0.2);
    doc.rect(left, y, width, headerHeight);
    for (const x of [left + columns[0], metaX, valueX]) doc.line(x, y, x, y + headerHeight);
    const scale = Math.min(20 / image.width, 20 / image.height);
    const logoWidth = image.width * scale;
    const logoHeight = image.height * scale;
    doc.addImage(logo, "PNG", left + (columns[0] - logoWidth) / 2, y + (headerHeight - logoHeight) / 2, logoWidth, logoHeight);
    doc.setFont("helvetica", "bold").setFontSize(13);
    doc.text("FORMULIR DAFTAR REMOVABLE MEDIA", left + columns[0] + columns[1] / 2, y + headerHeight / 2 + 1, { align: "center" });
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    let rowY = y;
    metadata.forEach((row, index) => {
      if (index) doc.line(metaX, rowY, left + width, rowY);
      doc.text(row.label, metaX + 2, rowY + 5);
      doc.text(row.lines, valueX + 2, rowY + 5);
      rowY += row.height;
    });
    doc.setFontSize(10).text(unitLines, left, unitY);
  };
  const widths = [567, 2126, 1134, 992, 1560, 3456, 851, 1559, 992, 2552];
  const sum = widths.reduce((total, value) => total + value, 0);
  const body: RowInput[] = Array.from({ length: Math.max(6, items.length) }, (_, index) => {
    const item = items[index];
    return item ? [String(index + 1), item.nama_barang || "", item.merek || "", item.jumlah == null ? "" : String(item.jumlah), item.tahun_pengadaan == null ? "" : String(item.tahun_pengadaan), item.pic_nama || "", ...["baik", "kurang_baik", "rusak"].map((condition) => item.kondisi === condition ? "X" : ""), item.keterangan || ""] : Array(10).fill("");
  });
  autoTable(doc, {
    startY: top, margin: { left, right: 25.559, top, bottom: 20 }, tableWidth: width,
    theme: "grid", rowPageBreak: "avoid", showHead: "everyPage",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15, overflow: "linebreak", valign: "middle", minCellHeight: 10 },
    headStyles: { fillColor: [217, 217, 217], textColor: 0, fontStyle: "bold", halign: "center" },
    columnStyles: Object.fromEntries(widths.map((value, index) => [index, { cellWidth: value / sum * width, ...([0, 3, 4, 6, 7, 8].includes(index) ? { halign: "center" as const } : {}) }])),
    head: [[
      ...["No", "Nama Barang", "Merek", "Jumlah", "Tahun Pengadaan", "PIC Pemegang Inventaris"].map((content) => ({ content, rowSpan: 2 })),
      { content: "Keadaan Barang", colSpan: 3 }, { content: "Keterangan", rowSpan: 2 },
    ], ["Baik", "Kurang Baik", "Rusak"]], body, willDrawPage: header,
  });
  let signatureY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;
  doc.setFont("helvetica", "normal").setFontSize(10);
  const names = [report.kepala_unit_nama || "", report.pengurus_barang_nama || ""];
  const nameLines = names.map((name) => doc.splitTextToSize(name, width / 2 - 12) as string[]);
  const placeLines = doc.splitTextToSize(`${report.tempat || ""}${report.tempat && report.tanggal_dokumen ? ", " : ""}${dateLabel(report.tanggal_dokumen)}`, width / 2 - 12) as string[];
  const nameOffset = Math.max(28, placeLines.length * 4 + 22);
  const signatureHeight = nameOffset + Math.max(...nameLines.map((lines) => lines.length)) * 4 + 2;
  if (signatureY + signatureHeight > height - 20) { doc.addPage(); header(); signatureY = top + 4; }
  doc.setFont("helvetica", "normal").setFontSize(10);
  const centers = [left + width / 4, left + width * 3 / 4];
  doc.text("Mengetahui,", centers[0], signatureY, { align: "center" });
  doc.text("Kepala Unit Kerja,", centers[0], signatureY + 5, { align: "center" });
  doc.text(placeLines, centers[1], signatureY, { align: "center" });
  doc.text("Pengurus Barang,", centers[1], signatureY + Math.max(5, placeLines.length * 4 + 2), { align: "center" });
  nameLines.forEach((lines, index) => doc.text(lines, centers[index], signatureY + nameOffset, { align: "center" }));
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page).setFont("helvetica", "normal").setFontSize(8).setTextColor(70);
    doc.text(report.reference, left, height - 9);
    doc.text(report.status === "draft" ? "DRAFT - belum final" : "FINAL", left + width / 2, height - 9, { align: "center" });
    doc.text(`Halaman ${page} dari ${pages}`, left + width, height - 9, { align: "right" });
  }
  return doc;
}

export async function exportFr025Pdf(report: Fr025Report): Promise<void> {
  const response = await fetch("/logo-jabar.png");
  if (!response.ok) throw new Error("Logo PDF gagal dimuat. Muat ulang halaman lalu coba kembali.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  const doc = createFr025Pdf(report, `data:image/png;base64,${btoa(binary)}`);
  await doc.save(`FR-025_${report.id}.pdf`, { returnPromise: true });
}
