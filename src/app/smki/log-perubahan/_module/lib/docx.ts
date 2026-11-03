import type { ChangeLog } from "./model";

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
function effectiveDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value + "T00:00:00+07:00");
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date);
}
const paragraph = (text: string, bold = false, size = 20, align = "left") =>
  `<w:p><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/></w:rPr>${(text || "\u2014").split(/\r?\n/).map((line, i) => `${i ? "<w:br/>" : ""}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join("")}</w:r></w:p>`;
const cell = (content: string, width: number, span = 1) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""}<w:vAlign w:val="center"/></w:tcPr>${content}</w:tc>`;
const table = (rows: string, widths: number[]) => `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((sum, width) => sum + width, 0)}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(edge => `<w:${edge} w:val="single" w:sz="6" w:color="000000"/>`).join("")}</w:tblBorders><w:tblCellMar><w:top w:w="75" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="75" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>${rows}</w:tbl>`;
const relationships = (items: [string, string, string][]) => `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${rel}/${type}" Target="${target}"/>`).join("")}</Relationships>`;

export function createLogDocx(logs: ChangeLog[], logo?: Uint8Array): Uint8Array<ArrayBuffer> {
  if (!logs.length) throw new Error("Tidak ada log untuk diekspor.");
  const drawing = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="590000" cy="774000"/><wp:docPr id="1" name="Logo Diskominfo Jawa Barat"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="logo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="590000" cy="774000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  const headers = logs.map(log => {
  const metadata = table([
    ["No. Dokumen", log.documentNumber ?? ""],
    ["No. Revisi", log.documentRevision ?? ""],
    ["Tanggal Berlaku", effectiveDate(log.documentEffectiveDate)],
  ].map(([label, value]) => `<w:tr>${cell(paragraph(label, false, 17), 1500)}${cell(paragraph(value, false, 17), 1700)}</w:tr>`).join(""), [1500, 1700]);
  const header = table(`<w:tr>${cell(logo ? drawing : paragraph("DISKOMINFO\nJAWA BARAT", true, 16, "center"), 1600)}${cell(paragraph("FORMULIR LOG PERUBAHAN", true, 28, "center"), 10400)}${cell(metadata + '<w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>', 3200)}</w:tr>`, [1600, 10400, 3200]);
  return header;
  });
  const sectionProperties = (index: number) => `<w:sectPr><w:headerReference w:type="default" r:id="header${index + 1}"/><w:footerReference w:type="default" r:id="footer"/><w:type w:val="nextPage"/><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="1550" w:right="700" w:bottom="850" w:left="700" w:header="350" w:footer="350"/></w:sectPr>`;
  const columnWidths = [900, 1800, 1100, 1200, 1100, 1000, 1900, 1200, 1900, 1200, 1900];
  const columnNames = ["No. RFC", "Deskripsi Perubahan", "Diminta Oleh", "Tanggal Permintaan", "Jenis Perubahan", "Prioritas Perubahan", "Dampak ke Lingkungan Produksi", "PIC Perubahan", "Catatan Hasil Perubahan", "Tanggal Rilis ke Produksi", "Catatan Hasil Evaluasi Perubahan"];
  const body = logs.map((log, index) => {
    const values = [log.rfcNumber, log.title, log.requestedBy, effectiveDate(log.requestedAt), log.changeType, log.priority, log.productionImpact, log.executor, log.resultNotes, effectiveDate(log.releasedAt), log.evaluationNotes];
    const heading = `<w:tr><w:trPr><w:tblHeader/></w:trPr>${columnNames.map((name, i) => cell(paragraph(name, true, 17, "center"), columnWidths[i])).join("")}</w:tr>`;
    const record = `<w:tr>${values.map((value, i) => cell(paragraph(value ?? "", false, 16), columnWidths[i])).join("")}</w:tr>`;
    const signature = table(`<w:tr>${cell(paragraph("Dibuat Oleh:", true, 19), 7600)}${cell(paragraph("Disetujui Oleh:", true, 19), 7600)}</w:tr><w:tr>${cell(paragraph(log.preparedBy ?? "", false, 19), 7600)}${cell(paragraph(log.approvedBy ?? "", false, 19), 7600)}</w:tr>`, [7600, 7600]);
    const oldNotes: [string, string][] = [["Kondisi sebelum", log.before], ["Tindakan", log.action], ["Kondisi sesudah", log.after], ["Hasil pengujian", log.testing], ["Hasil pelaksanaan", log.outcome], ["Kendala", log.obstacles], ["Tindak lanjut", log.followUp], ["Catatan pemulihan", log.recovery], ["Lampiran", log.attachments.map(file => file.name).join(", ")]];
    const archive = oldNotes.filter(([, value]) => !!value).map(([label, value]) => paragraph(`${label}: ${value}`, false, 16)).join("");
    return `${index ? `<w:p><w:pPr>${sectionProperties(index - 1)}</w:pPr></w:p>` : ""}${log.status === "Draf" ? paragraph("DRAF — isian belum lengkap", true, 18, "center") : ""}${paragraph("", false, 10)}${table(heading + record, columnWidths)}${paragraph("", false, 10)}${paragraph(`Diterbitkan Pada : ${effectiveDate(log.issuedAt) || "—"}`, true, 20)}${signature}${archive ? paragraph("Catatan historis dari format sebelumnya", true, 18) + archive : ""}`;
  }).join("");
  return zip({
    "[Content_Types].xml": `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${[["document", "document.main"], ...logs.map((_, index) => [`header${index + 1}`, "header"]), ["footer1", "footer"], ["styles", "styles"]].map(([file, type]) => `<Override PartName="/word/${file}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`).join("")}</Types>`,
    "_rels/.rels": relationships([["document", "officeDocument", "word/document.xml"]]),
    "word/_rels/document.xml.rels": relationships([...logs.map((_, index): [string, string, string] => [`header${index + 1}`, "header", `header${index + 1}.xml`]), ["footer", "footer", "footer1.xml"], ["styles", "styles", "styles.xml"]]),
    ...(logo ? { ...Object.fromEntries(logs.map((_, index) => [`word/_rels/header${index + 1}.xml.rels`, relationships([["logo", "image", "media/logo.png"]])])), "word/media/logo.png": logo } : {}),
    "word/styles.xml": `${xml}<w:styles xmlns:w="${ns}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="20"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`,
    ...Object.fromEntries(headers.map((header, index) => [`word/header${index + 1}.xml`, `${xml}<w:hdr xmlns:w="${ns}" xmlns:r="${rel}">${header}<w:p/></w:hdr>`])),
    "word/footer1.xml": `${xml}<w:ftr xmlns:w="${ns}">${paragraph("FR-032 | Diskominfo Provinsi Jawa Barat", false, 16)}<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>Halaman </w:t></w:r><w:fldSimple w:instr="PAGE"/><w:r><w:t xml:space="preserve"> dari </w:t></w:r><w:fldSimple w:instr="NUMPAGES"/></w:p></w:ftr>`,
    "word/document.xml": `${xml}<w:document xmlns:w="${ns}" xmlns:r="${rel}"><w:body>${body}${sectionProperties(logs.length - 1)}</w:body></w:document>`,
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
