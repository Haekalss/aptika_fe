import type { Review } from "./model";
import { formatDate } from "./model";
import { api } from "@/services/api";

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
const table = (rows: string, widths: number[]) => `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((sum, width) => sum + width, 0)}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(edge => `<w:${edge} w:val="single" w:sz="4" w:color="000000"/>`).join("")}</w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>${rows}</w:tbl>`;
const relationships = (items: [string, string, string][]) => `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${rel}/${type}" Target="${target}"/>`).join("")}</Relationships>`;

const signerKey = (name: string, nip: string) => JSON.stringify([name.trim(), nip.trim()]);
function specimenDrawing(data: Uint8Array, id: string, drawingId: number): string {
  if (data.length < 24 || ![137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => data[index] === byte)) throw new Error("Format spesimen TTE bukan PNG.");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const width = view.getUint32(16), height = view.getUint32(20);
  if (!width || !height) throw new Error("Ukuran spesimen TTE tidak valid.");
  const scale = Math.min(2300000 / width, 1200000 / height);
  const cx = Math.round(width * scale), cy = Math.round(height * scale);
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${drawingId}" name="Spesimen TTE ${id}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${drawingId}" name="${id}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

export function createReviewDocx(logs: Review[], logo?: Uint8Array, specimens = new Map<string, Uint8Array>()): Uint8Array<ArrayBuffer> {
  if (!logs.length) throw new Error("Tidak ada review untuk diekspor.");
  const specimenFiles: Record<string, Uint8Array> = {};
  const specimenRelationships: [string, string, string][] = [];
  const drawing = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="590000" cy="774000"/><wp:docPr id="1" name="Logo Diskominfo Jawa Barat"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="logo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="590000" cy="774000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  const headers = logs.map(log => {
  const metadata = table([
    ["No. Dokumen", log.documentNumber ?? ""],
    ["No. Revisi", log.documentRevision ?? ""],
    ["Tanggal Berlaku", effectiveDate(log.documentEffectiveDate)],
  ].map(([label, value]) => `<w:tr>${cell(paragraph(label, false, 16), 1400)}${cell(paragraph(value, false, 16), 1540)}</w:tr>`).join(""), [1400, 1540]).replace('w:w="9640"', 'w:w="2940"');
  const header = table(`<w:tr>${cell(logo ? drawing : paragraph("DISKOMINFO\nJAWA BARAT", true, 16, "center"), 1300)}${cell(paragraph("FORMULIR REVIEW HAK AKSES", true, 28, "center"), 5400)}${cell(metadata + '<w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>', 2940)}</w:tr>`, [1300, 5400, 2940]);
  return header;
  });
  const sectionProperties = (index: number) => `<w:sectPr><w:headerReference w:type="default" r:id="header${index + 1}"/><w:footerReference w:type="default" r:id="footer"/><w:type w:val="nextPage"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2350" w:right="1133" w:bottom="1200" w:left="1133" w:header="567" w:footer="567"/></w:sectPr>`;
  const body = logs.map((review, index) => {
    const widths = [550, 3550, 2900, 2640];
    const identity = [
      ["Tanggal Review", formatDate(review.reviewDate)],
      ["Periode Review", `${formatDate(review.periodStart)} s.d. ${formatDate(review.periodEnd)}`],
      ["Obyek Review", review.objectName],
      ["Pelaksana Review", review.reviewer],
    ].map(([label, value]) => paragraph(`${label} : ${value || "—"}`)).join("");
    const headings = ["No", "User ID yang Ada di Log Sistem", "Tingkat Hak Akses", "Ket. Status User ID (Aktif/Tidak Aktif)"];
    const rows = Array.from({length: Math.max(8, review.accounts.length)}, (_, row) => {
      const account = review.accounts[row];
      return `<w:tr><w:trPr><w:trHeight w:val="300" w:hRule="atLeast"/></w:trPr>${[String(row + 1), account?.username ?? "", account?.currentAccess ?? "", account?.userStatus ?? ""].map((value, col) => cell(value ? paragraph(value, false, 20, col === 0 ? "center" : "left") : "<w:p/>", widths[col])).join("")}</w:tr>`;
    }).join("");
    const form = table(
      `<w:tr>${cell(identity, 9640, 4)}</w:tr>` +
      `<w:tr>${cell(paragraph("Daftar Pengguna yang Terdaftar dalam Sistem", false, 20, "center"), 9640, 4)}</w:tr>` +
      `<w:tr><w:trPr><w:tblHeader/></w:trPr>${headings.map((value, col) => cell(paragraph(value, false, 20, "center"), widths[col])).join("")}</w:tr>` +
      rows +
      `<w:tr><w:trPr><w:trHeight w:val="1900" w:hRule="atLeast"/></w:trPr>${cell(paragraph("Tindak lanjut") + paragraph(review.followUp), 9640, 4)}</w:tr>`,
      widths,
    );
    const signatures = table(
      `<w:tr>${cell("<w:p/>", 4820)}${cell(paragraph(`${review.location || "Bandung"}, ${formatDate(review.signedAt)}`, false, 20, "center"), 4820)}</w:tr>` +
      `<w:tr><w:trPr><w:cantSplit/></w:trPr>${[
        ["Dibuat Oleh,", review.preparedBy, review.preparedByNip ?? ""],
        ["Mengetahui,", review.acknowledgedBy, review.acknowledgedByNip ?? ""],
      ].map(([label, name, nip], signerIndex) => {
        const image = specimens.get(signerKey(name, nip));
        const id = `specimen${index * 2 + signerIndex + 1}`;
        let signature = '<w:p><w:pPr><w:spacing w:before="1000"/></w:pPr></w:p>';
        if (image) {
          signature = specimenDrawing(image, id, index * 2 + signerIndex + 2);
          specimenFiles[`word/media/${id}.png`] = image;
          specimenRelationships.push([id, "image", `media/${id}.png`]);
        }
        return cell(paragraph(label, false, 20, "center") + signature, 4820);
      }).join("")}</w:tr>`,
      [4820, 4820],
    );
    return `${index ? `<w:p><w:pPr>${sectionProperties(index - 1)}</w:pPr></w:p>` : ""}${review.status === "Draf" ? paragraph("DRAF — pemeriksaan belum lengkap", true, 20, "center") : ""}${form}<w:p><w:pPr><w:spacing w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>${signatures}`;
  }).join("");
  return zip({
    "[Content_Types].xml": `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${[["document", "document.main"], ...logs.map((_, index) => [`header${index + 1}`, "header"]), ["footer1", "footer"], ["styles", "styles"]].map(([file, type]) => `<Override PartName="/word/${file}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`).join("")}</Types>`,
    "_rels/.rels": relationships([["document", "officeDocument", "word/document.xml"]]),
    "word/_rels/document.xml.rels": relationships([...logs.map((_, index): [string, string, string] => [`header${index + 1}`, "header", `header${index + 1}.xml`]), ["footer", "footer", "footer1.xml"], ["styles", "styles", "styles.xml"], ...specimenRelationships]),
    ...specimenFiles,
    ...(logo ? { ...Object.fromEntries(logs.map((_, index) => [`word/_rels/header${index + 1}.xml.rels`, relationships([["logo", "image", "media/logo.png"]])])), "word/media/logo.png": logo } : {}),
    "word/styles.xml": `${xml}<w:styles xmlns:w="${ns}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="20"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`,
    ...Object.fromEntries(headers.map((header, index) => [`word/header${index + 1}.xml`, `${xml}<w:hdr xmlns:w="${ns}" xmlns:r="${rel}">${header}<w:p/></w:hdr>`])),
    "word/footer1.xml": `${xml}<w:ftr xmlns:w="${ns}">${paragraph("FR-034 | Diskominfo Provinsi Jawa Barat", false, 16)}<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t>Halaman </w:t></w:r><w:fldSimple w:instr="PAGE"/><w:r><w:t xml:space="preserve"> dari </w:t></w:r><w:fldSimple w:instr="NUMPAGES"/></w:p></w:ftr>`,
    "word/document.xml": `${xml}<w:document xmlns:w="${ns}" xmlns:r="${rel}"><w:body>${body}${sectionProperties(logs.length - 1)}</w:body></w:document>`,
  });
}
export async function downloadReviews(logs: Review[]): Promise<void> {
  const response = await fetch("/logo-diskominfo-jabar.png");
  if (!response.ok) throw new Error("Logo dokumen gagal dimuat. Silakan coba kembali.");
  const logo = new Uint8Array(await response.arrayBuffer());
  const signers = new Map<string, {name: string; nip: string}>();
  for (const review of logs) for (const [name, nip] of [[review.preparedBy, review.preparedByNip ?? ""], [review.acknowledgedBy, review.acknowledgedByNip ?? ""]]) {
    if (name.trim()) signers.set(signerKey(name, nip), {name, nip});
  }
  const specimens = new Map<string, Uint8Array>(await Promise.all([...signers].map(async ([key, signer]): Promise<[string, Uint8Array]> => {
    try {
      const image = await api.get<ArrayBuffer>("/tte/resolve/image", {params: {nama: signer.name, ...(signer.nip ? {nip: signer.nip} : {}), include_qr: 0}, responseType: "arraybuffer", timeout: 15000});
      return [key, new Uint8Array(image.data)];
    } catch {
      throw new Error(`Spesimen TTE ${signer.name} gagal dimuat. Periksa nama/NIP atau coba kembali.`);
    }
  })));
  const url = URL.createObjectURL(new Blob([createReviewDocx(logs, logo, specimens)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
  const link = document.createElement("a");
  link.href = url; link.download = `FR-034_${logs.length === 1 ? logs[0].number : "Review_Hak_Akses"}.docx`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
