import JSZip from "jszip";
import { api } from "@/services/api";
import type {
  Fr021Evaluasi,
  Fr021Master,
  Fr021Penilaian,
} from "@/services/smki/evaluasiPenyedia.types";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function box(on: boolean): string {
  return on ? "☒" : "☐";
}

/** Rincian huruf untuk tanda centang / kotak agar seragam dengan template (Arial 12pt). */
const TANDA_RPR =
  '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/>' +
  '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/* ───────────────────────── Pemindai XML ───────────────────────── */

interface Block {
  start: number;
  end: number;
  xml: string;
}

/** Posisi awal tag `<tag ...>` (memastikan bukan `<tagXxx`). */
function tagStart(xml: string, tag: string, from: number): number {
  let i = from;
  for (;;) {
    i = xml.indexOf(`<${tag}`, i);
    if (i < 0) return -1;
    const after = xml[i + tag.length + 1];
    if (after === ">" || after === "/" || after === " " || after === "\n" || after === "\r" || after === "\t") {
      return i;
    }
    i += 1;
  }
}

/** Semua elemen `<tag>` terluar (anak langsung), aman terhadap elemen bersarang. */
function findBlocks(xml: string, tag: string): Block[] {
  const blocks: Block[] = [];
  const closeTag = `</${tag}>`;
  let pos = 0;

  while (pos < xml.length) {
    const start = tagStart(xml, tag, pos);
    if (start < 0) break;
    const gt = xml.indexOf(">", start);
    if (gt < 0) break;
    if (xml[gt - 1] === "/") {
      pos = gt + 1;
      continue;
    }

    let depth = 1;
    let i = gt + 1;
    let end = -1;
    while (depth > 0) {
      const nextOpen = tagStart(xml, tag, i);
      const nextClose = xml.indexOf(closeTag, i);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        const g = xml.indexOf(">", nextOpen);
        if (g < 0) break;
        if (xml[g - 1] === "/") {
          i = g + 1;
          continue;
        }
        depth += 1;
        i = g + 1;
      } else {
        depth -= 1;
        if (depth === 0) end = nextClose + closeTag.length;
        i = nextClose + closeTag.length;
      }
    }

    if (end < 0) break;
    blocks.push({ start, end, xml: xml.slice(start, end) });
    pos = end;
  }

  return blocks;
}

/* ───────────────────────── Teks paragraf ───────────────────────── */

function paragraphText(xml: string): string {
  const parts: string[] = [];
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) parts.push(unescapeXml(match[1]));
  return parts.join("");
}

/** Ganti isi satu paragraf dengan satu run teks (pPr & rPr pertama dipertahankan). */
function setParagraphText(xml: string, text: string, rPrOverride?: string): string {
  const open = /^<w:p(?:\s[^>]*)?>/.exec(xml);
  if (!open) return xml;
  const pPr = /<w:pPr>[\s\S]*?<\/w:pPr>/.exec(xml);
  const rPr = /<w:r(?:\s[^>]*)?>\s*(<w:rPr>[\s\S]*?<\/w:rPr>)/.exec(xml);
  const rPrXml = rPrOverride ?? rPr?.[1] ?? "";
  const run = `<w:r>${rPrXml}${text ? `<w:t xml:space="preserve">${escapeXml(text)}</w:t>` : ""}</w:r>`;
  return `${open[0]}${pPr ? pPr[0] : ""}${run}</w:p>`;
}

/** Ganti teks di dalam satu blok `<w:t>` saja (mempertahankan format run lain). */
function replaceInTextBlocks(xml: string, search: string, replacement: string): string | null {
  let done = false;
  const re = /<w:t(\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  const out = xml.replace(re, (full, _attrs: string | undefined, text: string) => {
    if (done) return full;
    const raw = unescapeXml(text);
    if (!raw.includes(search)) return full;
    done = true;
    const openTag = full.slice(0, full.indexOf(">") + 1);
    const newOpen = /\bxml:space=/.test(openTag)
      ? openTag
      : openTag.replace("<w:t", '<w:t xml:space="preserve"');
    return `${newOpen}${escapeXml(raw.replace(search, replacement))}</w:t>`;
  });
  return done ? out : null;
}

/** Terapkan transformasi pada paragraf (termasuk paragraf di tabel bersarang). */
function transformParagraphs(
  xml: string,
  transform: (paragraphXml: string) => string | null,
  limit = 1,
): string {
  const paras = findBlocks(xml, "w:p");
  let out = xml;
  let delta = 0;
  let done = 0;

  for (const para of paras) {
    if (done >= limit) break;
    const next = transform(para.xml);
    if (next === null) continue;
    out = out.slice(0, para.start + delta) + next + out.slice(para.end + delta);
    delta += next.length - (para.end - para.start);
    done += 1;
  }

  return out;
}

/** Ganti teks pada paragraf pertama yang cocok dengan `pattern` (bisa lintas run). */
function replaceInParagraphsRegex(xml: string, pattern: RegExp, replacement: string, limit = 1): string {
  return transformParagraphs(
    xml,
    (para) => {
      const text = paragraphText(para);
      if (!pattern.test(text)) return null;
      pattern.lastIndex = 0;
      const next = text.replace(pattern, replacement);
      pattern.lastIndex = 0;
      return setParagraphText(para, next);
    },
    limit,
  );
}

/** Ganti teks pada paragraf pertama yang memuat `search` (bisa lintas run). */
function replaceInParagraphs(xml: string, search: string, replacement: string, limit = 1): string {
  return transformParagraphs(
    xml,
    (para) => {
      const text = paragraphText(para);
      if (!text.includes(search)) return null;
      return setParagraphText(para, text.replace(search, replacement));
    },
    limit,
  );
}

/** Set teks sel: paragraf pertama diisi, paragraf sisanya dibuang. */
function setCellText(xml: string, text: string, rPrOverride?: string): string {
  const paras = findBlocks(xml, "w:p");
  if (!paras.length) return xml;
  const head = xml.slice(0, paras[0].start);
  const tail = xml.slice(paras[paras.length - 1].end);
  return head + setParagraphText(paras[0].xml, text, rPrOverride) + tail;
}

/* ───────────────────────── Operasi baris / sel ───────────────────────── */

function mapCells(rowXml: string, fn: (index: number, cellXml: string) => string): string {
  const cells = findBlocks(rowXml, "w:tc");
  let out = rowXml;
  for (let i = cells.length - 1; i >= 0; i -= 1) {
    out = out.slice(0, cells[i].start) + fn(i, cells[i].xml) + out.slice(cells[i].end);
  }
  return out;
}

function mapRows(tableXml: string, fn: (index: number, rowXml: string) => string): string {
  const rows = findBlocks(tableXml, "w:tr");
  let out = tableXml;
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    out = out.slice(0, rows[i].start) + fn(i, rows[i].xml) + out.slice(rows[i].end);
  }
  return out;
}

function cellSpan(cellXml: string): number {
  const match = /<w:gridSpan\s+w:val="(\d+)"\s*\/>/.exec(cellXml);
  return match ? Number(match[1]) : 1;
}

/**
 * Gabungkan sel `from`..`to` pada satu baris menjadi satu sel (gridSpan).
 * Dipakai agar kolom isian identifikasi punya lebar yang cukup.
 */
function mergeCells(rowXml: string, from: number, to: number): string {
  const cells = findBlocks(rowXml, "w:tc");
  if (from < 0 || to >= cells.length || from >= to) return rowXml;

  const span = cells.slice(from, to + 1).reduce((acc, cell) => acc + cellSpan(cell.xml), 0);
  let first = cells[from].xml;
  if (/<w:gridSpan\s+w:val="\d+"\s*\/>/.test(first)) {
    first = first.replace(/<w:gridSpan\s+w:val="\d+"\s*\/>/, `<w:gridSpan w:val="${span}"/>`);
  } else if (first.includes("<w:tcPr>")) {
    first = first.replace("<w:tcPr>", `<w:tcPr><w:gridSpan w:val="${span}"/>`);
  } else {
    first = first.replace(/(<w:tc(?:\s[^>]*)?>)/, `$1<w:tcPr><w:gridSpan w:val="${span}"/></w:tcPr>`);
  }

  let out = rowXml;
  for (let i = to; i > from; i -= 1) {
    out = out.slice(0, cells[i].start) + out.slice(cells[i].end);
  }
  out = out.slice(0, cells[from].start) + first + out.slice(cells[from].end);
  return out;
}

function setCellTextAt(rowXml: string, index: number, text: string): string {
  return mapCells(rowXml, (i, cell) => (i === index ? setCellText(cell, text) : cell));
}

/* ───────────────────────── Gambar TTE ───────────────────────── */

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

/** Ganti paragraf placeholder tanda tangan dengan gambar TTE di dalam run (+ nama). */
function setParagraphImage(xml: string, contentXml: string, caption?: string | null): string {
  const open = /^<w:p(?:\s[^>]*)?>/.exec(xml);
  if (!open) return xml;
  const pPr = /<w:pPr>[\s\S]*?<\/w:pPr>/.exec(xml);
  const rPr = /<w:r(?:\s[^>]*)?>\s*(<w:rPr>[\s\S]*?<\/w:rPr>)/.exec(xml);
  const head = `${open[0]}${pPr ? pPr[0] : ""}`;
  const image = `${head}<w:r>${contentXml}</w:r></w:p>`;
  if (!caption) return image;
  const captionXml =
    `${head}<w:r>${rPr?.[1] ?? ""}<w:t xml:space="preserve">(${escapeXml(caption)})</w:t></w:r></w:p>`;
  return image + captionXml;
}

async function fetchTteImageBytes(nip?: string | null, nama?: string | null): Promise<Uint8Array | null> {
  if (!nip && !nama) return null;
  try {
    const res = await api.get("/tte/resolve/image", {
      params: { ...(nip ? { nip } : {}), ...(nama ? { nama } : {}) },
      responseType: "blob",
    });
    const buf = await (res.data as Blob).arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

/* ───────────────────────── Filler dokumen ───────────────────────── */

export async function fillFr021Template(
  record: Fr021Evaluasi,
  master?: Fr021Master,
): Promise<Blob> {
  const res = await fetch("/templates/fr021.docx");
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const file = zip.file("word/document.xml");
  if (!file) throw new Error("Template tidak valid");
  let xml = await file.async("string");

  const tables = findBlocks(xml, "w:tbl");
  if (!tables.length) throw new Error("Struktur template tidak dikenali");
  const table = tables[0];

  const tanggalEval = formatTanggal(record.tanggal_evaluasi);
  const tanggalTtdEval = formatTanggal(record.tanggal_ttd_evaluator);
  const rekomAktif = record.rekomendasi;

  /* ---- Data turunan ---- */
  const nomorDokumen =
    record.nomor_dokumen?.trim() || master?.template?.nomor_dokumen || "FR-021/KOM.03.05/SANDIKAMI";
  const nomorRevisi = record.nomor_revisi?.trim() || master?.template?.nomor_revisi || "1.1";
  const tanggalBerlaku = record.tanggal_berlaku?.trim() || master?.template?.tanggal_berlaku || "07 Juli 2022";

  const skala = master?.skala?.length
    ? master.skala
    : [
        { id: 1, label: "Baik", skor: 100 },
        { id: 2, label: "Sedang", skor: 60 },
        { id: 3, label: "Kurang", skor: 10 },
      ];
  // Kolom template: Baik (index 2), Sedang (3), Kurang (4) — urut skor menurun.
  const kolomSkor = [...skala].sort((a, b) => b.skor - a.skor);
  function kolomDariSkor(skor: number): number {
    const idx = kolomSkor.findIndex((item) => item.skor === skor);
    return idx >= 0 ? 2 + idx : skor >= 100 ? 2 : skor >= 60 ? 3 : 4;
  }

  const penilaian: Fr021Penilaian[] = [...(record.penilaian ?? [])].sort(
    (a, b) => (a.kriteria?.urutan ?? a.kriteria_id) - (b.kriteria?.urutan ?? b.kriteria_id),
  );

  const aktifKategori = (kategori: string): boolean => {
    const target = kategori.toLowerCase();
    const aktif = rekomAktif?.kategori?.toLowerCase() ?? "";
    if (target === "memuaskan") {
      return aktif.includes("memuaskan") && !aktif.includes("kurang") && !aktif.includes("cukup");
    }
    return aktif.includes(target);
  };

  /* ---- Isi tabel utama ---- */
  const newTable = mapRows(table.xml, (ri, row) => {
    // Kop: nomor dokumen / revisi / tanggal berlaku
    if (ri === 0) return setCellTextAt(row, 4, nomorDokumen);
    if (ri === 1) return setCellTextAt(row, 4, nomorRevisi);
    if (ri === 2) return setCellTextAt(row, 4, tanggalBerlaku);

    // Identifikasi penyedia / kontak (kolom isian digabung agar teks tidak terpotong)
    if (ri === 4) {
      let out = setCellTextAt(row, 2, record.penyedia?.nama_penyedia ?? "");
      out = setCellTextAt(out, 7, record.no_kontrak ?? "");
      out = mergeCells(out, 7, 8);
      out = mergeCells(out, 2, 4);
      return out;
    }
    if (ri === 5) {
      let out = setCellTextAt(row, 2, record.penyedia?.contact_person ?? "");
      out = setCellTextAt(out, 7, record.penyedia?.email ?? "");
      out = mergeCells(out, 7, 8);
      out = mergeCells(out, 2, 4);
      return out;
    }

    // Sifat pekerjaan
    if (ri === 6) {
      return mapCells(row, (ci, cell) => {
        if (ci === 0) {
          return transformParagraphs(
            cell,
            (para) => {
              const text = paragraphText(para);
              if (text.includes("Pengadaan Baru")) {
                return replaceInTextBlocks(
                  para,
                  "□",
                  box(record.sifat_pekerjaan === "pengadaan_baru"),
                );
              }
              if (text.includes("Maintenance")) {
                return replaceInTextBlocks(
                  para,
                  "□",
                  box(record.sifat_pekerjaan === "maintenance_perawatan"),
                );
              }
              return null;
            },
            2,
          );
        }
        if (ci === 1 && record.sifat_pekerjaan === "lainnya") {
          const lainnya = record.sifat_pekerjaan_lainnya?.trim() ?? "";
          return transformParagraphs(
            cell,
            (para) =>
              paragraphText(para).includes("Lainnya")
                ? setParagraphText(para, `☒ Lainnya : ${lainnya}`)
                : null,
          );
        }
        return cell;
      });
    }

    // Kriteria penilaian (tabel bersarang)
    if (ri === 7) {
      return mapCells(row, (ci, cell) => {
        if (ci !== 0) return cell;
        const nested = findBlocks(cell, "w:tbl");
        if (!nested.length) return cell;
        const target = nested[0];
        const filled = mapRows(target.xml, (nri, nrow) => {
          if (nri === 0) return nrow;
          if (nri >= 5) {
            return mapCells(nrow, (nci, ncell) =>
              nci === 1 ? setCellText(ncell, record.total_nilai != null ? String(record.total_nilai) : "") : ncell,
            );
          }
          const item = penilaian[nri - 1];
          if (!item) return nrow;
          const kolom = kolomDariSkor(item.skor);
          return mapCells(nrow, (nci, ncell) =>
            nci === kolom ? setCellText(ncell, "√", TANDA_RPR) : ncell,
          );
        });
        return cell.slice(0, target.start) + filled + cell.slice(target.end);
      });
    }

    // Tanggal evaluasi, catatan rekomendasi, dan tabel rekomendasi
    if (ri === 8) {
      return mapCells(row, (ci, cell) => {
        if (ci !== 0) return cell;

        let out = replaceInParagraphsRegex(
          cell,
          /…{3,}\.*/,
          `${tanggalEval ? tanggalEval + " " : "……………………………………...."}`,
        );

        // "Noted" — centang kategori yang aktif
        out = replaceInParagraphs(
          out,
          "□ Kurang memuaskan (0 - 280 Point)",
          `${box(aktifKategori("kurang memuaskan"))} Kurang memuaskan (0 - 280 Point)`,
        );
        out = replaceInParagraphs(
          out,
          "□ Cukup memuaskan (281 - 360 Point)",
          `${box(aktifKategori("cukup memuaskan"))} Cukup memuaskan (281 - 360 Point)`,
        );
        out = replaceInParagraphs(
          out,
          "□ Memuaskan (361 - 400 Point)",
          `${box(aktifKategori("memuaskan"))} Memuaskan (361 - 400 Point)`,
        );

        const nested = findBlocks(out, "w:tbl");
        if (!nested.length) return out;
        const target = nested[0];
        const filled = mapRows(target.xml, (nri, nrow) => {
          if (nri === 0) return nrow;
          const kategori = ["kurang memuaskan", "cukup memuaskan", "memuaskan"][nri - 1] ?? "";
          const rentang = master?.rekomendasi?.find(
            (item) => item.kategori.trim().toLowerCase() === kategori,
          );
          return mapCells(nrow, (nci, ncell) => {
            if (nci === 1 && rentang) {
              return setCellText(
                ncell,
                `${rentang.kategori} (${rentang.nilai_min} - ${rentang.nilai_max} Point)`,
              );
            }
            if (nci === 2) {
              return setCellText(ncell, box(aktifKategori(kategori)), TANDA_RPR);
            }
            return ncell;
          });
        });
        return out.slice(0, target.start) + filled + out.slice(target.end);
      });
    }

    // Tempat & tanggal pada blok tanda tangan evaluator
    if (ri === 9) {
      const tempat = record.tempat?.trim() || "Bandung";
      return mapCells(row, (ci, cell) =>
        ci === 0
          ? replaceInParagraphs(
              cell,
              "Bandung, …………………..",
              `${tempat}, ${tanggalTtdEval || "………………….."}`,
            )
          : cell,
      );
    }

    return row;
  });

  xml = xml.slice(0, table.start) + newTable + xml.slice(table.end);

  /* ---- TTE: evaluator & atasan ---- */
  const imgEval = await fetchTteImageBytes(record.ttd_evaluator_nip, record.ttd_evaluator_nama);
  const imgAdmin = await fetchTteImageBytes(record.ttd_admin_nip, record.ttd_admin_nama);

  let rIdEval: string | null = null;
  let rIdAdmin: string | null = null;
  const relsPath = "word/_rels/document.xml.rels";
  const relsFile = zip.file(relsPath);
  let relsXml = relsFile ? await relsFile.async("string") : "";

  function nextRId(rels: string): string {
    const ids = [...rels.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1], 10));
    const max = ids.length ? Math.max(...ids) : 0;
    return `rId${max + 1}`;
  }

  if (imgEval) {
    zip.file("word/media/tte_eval.png", imgEval);
    rIdEval = nextRId(relsXml);
    relsXml = relsXml.replace(
      "</Relationships>",
      `<Relationship Id="${rIdEval}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/tte_eval.png"/></Relationships>`,
    );
  }
  if (imgAdmin) {
    zip.file("word/media/tte_admin.png", imgAdmin);
    rIdAdmin = nextRId(relsXml);
    relsXml = relsXml.replace(
      "</Relationships>",
      `<Relationship Id="${rIdAdmin}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/tte_admin.png"/></Relationships>`,
    );
  }
  zip.file(relsPath, relsXml);

  const cx = 170 * 9525;
  const cy = 65 * 9525;
  const placeholder = "(………………………………..)";

  // Blok tanda tangan: Evaluator (kolom kiri) lalu Mengetahui (kolom kanan).
  const tablesAfter = findBlocks(xml, "w:tbl");
  if (tablesAfter.length) {
    const t2 = tablesAfter[0];
    const rows = findBlocks(t2.xml, "w:tr");
    const sigRowIndex = rows.length - 1;

    const newSig = mapRows(t2.xml, (ri, row) => {
      if (ri !== sigRowIndex) return row;
      return mapCells(row, (ci, cell) => {
        const isEvaluator = ci === 0;
        if (!isEvaluator && ci !== 2) return cell;

        return transformParagraphs(cell, (para) => {
          if (!paragraphText(para).includes(placeholder)) return null;
          if (isEvaluator) {
            if (rIdEval) {
              return setParagraphImage(
                para,
                drawingXml(rIdEval, 10, cx, cy),
                record.ttd_evaluator_nama,
              );
            }
            if (record.ttd_evaluator_nama) return setParagraphText(para, `(${record.ttd_evaluator_nama})`);
            return null;
          }
          if (rIdAdmin) {
            return setParagraphImage(
              para,
              drawingXml(rIdAdmin, 11, cx, cy),
              record.ttd_admin_nama,
            );
          }
          if (record.ttd_admin_nama) return setParagraphText(para, `(${record.ttd_admin_nama})`);
          return null;
        });
      });
    });

    xml = xml.slice(0, t2.start) + newSig + xml.slice(t2.end);
  }

  zip.file("word/document.xml", xml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function exportEvaluasiPenyediaDocx(
  record: Fr021Evaluasi,
  options: { filename?: string; master?: Fr021Master } = {},
): Promise<void> {
  const blob = await fillFr021Template(record, options.master);
  const safeName = (record.penyedia?.nama_penyedia ?? "").replace(/[^\w-]+/g, "_");
  const name = options.filename ?? `FR-021_Evaluasi_Penyedia_${record.id}${safeName ? "_" + safeName : ""}`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
