import type { ChangeLog } from "./model";
import { formatTime } from "./model";

// A DOCX is an Open XML ZIP package. Stored entries avoid adding a compression dependency.
function zip(entries: Record<string, string | Uint8Array>): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const [path, text] of Object.entries(entries)) {
    const name = encoder.encode(path), data = typeof text === "string" ? encoder.encode(text) : text;
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = new Uint8Array(30 + name.length), header = new DataView(local.buffer);
    header.setUint32(0, 0x04034b50, true); header.setUint16(4, 20, true);
    header.setUint32(14, crc, true); header.setUint32(18, data.length, true);
    header.setUint32(22, data.length, true); header.setUint16(26, name.length, true); local.set(name, 30);
    const directory = new Uint8Array(46 + name.length), view = new DataView(directory.buffer);
    view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true);
    view.setUint32(16, crc, true); view.setUint32(20, data.length, true); view.setUint32(24, data.length, true);
    view.setUint16(28, name.length, true); view.setUint32(42, offset, true); directory.set(name, 46);
    parts.push(local, data); central.push(directory); offset += local.length + data.length;
  }
  const directorySize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22), view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, central.length, true); view.setUint16(10, central.length, true);
  view.setUint32(12, directorySize, true); view.setUint32(16, offset, true);
  const result = new Uint8Array(offset + directorySize + end.length);
  let cursor = 0;
  for (const part of [...parts, ...central, end]) { result.set(part, cursor); cursor += part.length; }
  return result;
}
function escapeXml(text: string): string {
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}
const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
export const FR032_DOCUMENT_METADATA = {
  number: "FR-032/KOM.03.05/SANDIKAMI",
  revision: "1.0",
  effectiveDate: "15 Oktober 2026",
} as const;
const paragraph = (text: string, bold = false, size = 20, align = "left") =>
  `<w:p><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/></w:rPr>${(text || "\u2014").split(/\r?\n/).map((line, i) => `${i ? "<w:br/>" : ""}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join("")}</w:r></w:p>`;
const cell = (content: string, width: number, span = 1) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""}<w:vAlign w:val="center"/></w:tcPr>${content}</w:tc>`;
const table = (rows: string, widths: number[]) => `<w:tbl><w:tblPr><w:tblW w:w="9640" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(edge => `<w:${edge} w:val="single" w:sz="4" w:color="000000"/>`).join("")}</w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>${rows}</w:tbl>`;
const section = (title: string, rows: [string, string][]) => table(
  `<w:tr><w:trPr><w:tblHeader/></w:trPr>${cell(paragraph(title, true), 9640, 2)}</w:tr>` +
  rows.map(([label, value]) => `<w:tr>${cell(paragraph(label), 2600)}${cell(paragraph(value), 7040)}</w:tr>`).join(""), [2600, 7040]) + '<w:p><w:pPr><w:spacing w:after="0" w:line="100" w:lineRule="exact"/></w:pPr></w:p>';
const relationships = (items: [string, string, string][]) => `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${rel}/${type}" Target="${target}"/>`).join("")}</Relationships>`;

export function createLogDocx(logs: ChangeLog[], logo?: Uint8Array): Uint8Array<ArrayBuffer> {
  if (!logs.length) throw new Error("Tidak ada log untuk diekspor.");
  const drawing = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="590000" cy="774000"/><wp:docPr id="1" name="Logo Diskominfo Jawa Barat"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="logo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="590000" cy="774000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  const metadata = table([
    ["No. Dokumen", FR032_DOCUMENT_METADATA.number],
    ["No. Revisi", FR032_DOCUMENT_METADATA.revision],
    ["Tanggal Berlaku", FR032_DOCUMENT_METADATA.effectiveDate],
  ].map(([label, value]) => `<w:tr>${cell(paragraph(label, false, 16), 1400)}${cell(paragraph(value, false, 16), 1540)}</w:tr>`).join(""), [1400, 1540]).replace('w:w="9640"', 'w:w="2940"');
  const header = table(`<w:tr>${cell(logo ? drawing : paragraph("DISKOMINFO\nJAWA BARAT", true, 16, "center"), 1300)}${cell(paragraph("FORMULIR LOG PERUBAHAN", true, 28, "center"), 5400)}${cell(metadata + '<w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>', 2940)}</w:tr>`, [1300, 5400, 2940]);
  const body = logs.map((log, index) => `${index ? '<w:p><w:pPr><w:pageBreakBefore/><w:spacing w:after="0"/></w:pPr></w:p>' : ""}${log.status === "Draf" ? paragraph("DRAF \u2014 belum difinalisasi", true, 20, "center") : ""}${section("A. IDENTITAS PERUBAHAN", [
    ["Nomor log", log.number], ["Status dokumen", log.status], ["Judul perubahan", log.title], ["Sistem / aset", log.system], ["Unit kerja", log.unit], ["Pencatat", log.references?.recorderName ?? "Belum tercatat pada data lama"], ["Pelaksana", log.executor],
    ["Waktu mulai (WIB)", formatTime(log.startedAt)], ["Waktu selesai (WIB)", formatTime(log.endedAt)],
  ])}${section("B. RINCIAN PELAKSANAAN", [["Kondisi sebelum", log.before], ["Tindakan perubahan", log.action], ["Kondisi sesudah", log.after], ["Hasil pengujian", log.testing]])}${section("C. HASIL DAN TINDAK LANJUT", [
    ["Hasil pelaksanaan", log.outcome], ["Kendala", log.obstacles], ["Perlu tindak lanjut", log.needsFollowUp ? "Ya" : "Tidak"], ["Tindak lanjut", log.followUp], ["Catatan pemulihan", log.recovery],
  ])}${section("D. LAMPIRAN DAN PENCATATAN", [
    ["Lampiran (daftar nama)", log.attachments.map((file, i) => `${i + 1}. ${file.name}`).join("\n")], ["Dibuat", formatTime(log.createdAt)], ["Diperbarui", formatTime(log.updatedAt)], ["Finalisasi", formatTime(log.finalizedAt)],
  ])}`).join("");
  return zip({
    "[Content_Types].xml": `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${[["document", "document.main"], ["header1", "header"], ["footer1", "footer"], ["styles", "styles"]].map(([file, type]) => `<Override PartName="/word/${file}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`).join("")}</Types>`,
    "_rels/.rels": relationships([["document", "officeDocument", "word/document.xml"]]),
    "word/_rels/document.xml.rels": relationships([["header", "header", "header1.xml"], ["footer", "footer", "footer1.xml"], ["styles", "styles", "styles.xml"]]),
    ...(logo ? { "word/_rels/header1.xml.rels": relationships([["logo", "image", "media/logo.png"]]), "word/media/logo.png": logo } : {}),
    "word/styles.xml": `${xml}<w:styles xmlns:w="${ns}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="20"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`,
    "word/header1.xml": `${xml}<w:hdr xmlns:w="${ns}" xmlns:r="${rel}">${header}<w:p/></w:hdr>`,
    "word/footer1.xml": `${xml}<w:ftr xmlns:w="${ns}">${paragraph("FR-032 | Diskominfo Provinsi Jawa Barat", false, 16)}<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>Halaman </w:t></w:r><w:fldSimple w:instr="PAGE"/><w:r><w:t xml:space="preserve"> dari </w:t></w:r><w:fldSimple w:instr="NUMPAGES"/></w:p></w:ftr>`,
    "word/document.xml": `${xml}<w:document xmlns:w="${ns}" xmlns:r="${rel}"><w:body>${body}<w:sectPr><w:headerReference w:type="default" r:id="header"/><w:footerReference w:type="default" r:id="footer"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2350" w:right="1133" w:bottom="1200" w:left="1133" w:header="567" w:footer="567"/></w:sectPr></w:body></w:document>`,
  });
}
export async function downloadLogs(logs: ChangeLog[]): Promise<void> {
  const response = await fetch("/logo-diskominfo-jabar.png");
  if (!response.ok) throw new Error("Logo dokumen gagal dimuat. Silakan coba kembali.");
  const logo = new Uint8Array(await response.arrayBuffer());
  const url = URL.createObjectURL(new Blob([createLogDocx(logs, logo)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
  const link = document.createElement("a");
  link.href = url; link.download = `FR-032_${logs.length === 1 ? logs[0].number : "Log_Perubahan"}.docx`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
