import { AsetSdm, getDaftarAsetSdmAll } from "@/services/smki/daftarAsetSDM";

export type AsetSdmExportFormat = "xlsx" | "pdf" | "docx";

export interface AsetSdmExportOptions {
  export_mode: "all" | "filtered";
  format: AsetSdmExportFormat;
  date_from?: string; // filter TMT Jabatan (YYYY-MM-DD)
  date_to?: string;
}

export interface AsetSdmExportFilters {
  search?: string;
  pangkat_golongan?: string;
  jabatan?: string;
  unit_kerja_id?: string;
}

/* ------------------------------------------------------------------ */
/* Data & layout bersama (mengikuti FR-029 Formulir Daftar Aset SDM)   */
/* ------------------------------------------------------------------ */

const today = () => new Date().toISOString().slice(0, 10);

/** Lebar kolom B..N pada template (satuan lebar kolom Excel). */
const COL_W = [4, 35, 24, 10.8, 22.1, 22.3, 13, 11.8, 9, 16.1, 7.1, 29.7, 10.7];
const COL_W_TOTAL = COL_W.reduce((a, b) => a + b, 0);

const NOTE_1 =
  "Diisi jika Koordinator maka Managerial, jika Tim Teknis diisi dengan pengelola asset, pengelola risiko, administrator sistem, pengelola apar, dll.";
const NOTE_2A = "Pelatihan yang bersifat managerial seperti TOGAF, COBIT, Lead Implementer ISO 27001, CAPM dll.";
const NOTE_2B = "Pelatihan yang bersifat Teknis seperti CCNA, CEH, ECIH, COMPTIA dll.";

const SINGLE_HEAD = ["No", "Nama", "NIP", "Pangkat/ Golongan", "Jabatan/ TMT", "Unit Kerja"];
const SUB_HEAD = ["Jabatan di SMKI", "Tanggung Jawab*", "Jenjang", "Jurusan", "Tahun Lulus", "Nama Pelatihan", "Tahun"];

function titleLines(bidangName?: string): string[] {
  let b = (bidangName || "").trim().toUpperCase();
  if (!b) b = "BIDANG...";
  else if (!b.startsWith("BIDANG")) b = `BIDANG ${b}`;
  return ["DAFTAR SUMBER DAYA MANUSIA", "DISKOMINFO PROVINSI JAWA BARAT", b];
}

interface Block {
  /** 11 kolom pertama (No .. Tahun Lulus), digabung vertikal sebanyak jumlah pelatihan. */
  cells: string[];
  pel: { nama: string; tahun: string }[];
}

function toBlocks(items: AsetSdm[]): Block[] {
  return items.map((i, idx) => ({
    cells: [
      String(idx + 1),
      i.nama || "",
      i.nip || "",
      i.pangkat_golongan || "",
      `${i.jabatan || ""}${i.tmt_jabatan_label ? `\nTMT ${i.tmt_jabatan_label}` : ""}`,
      i.unit_kerja && i.unit_kerja !== "-" ? i.unit_kerja : "",
      i.jabatan_smki || "",
      i.tanggung_jawab || "",
      i.jenjang || "",
      i.jurusan || "",
      i.tahun_lulus || "",
    ],
    pel:
      i.pelatihan.length > 0
        ? i.pelatihan.map((p) => ({ nama: p.nama, tahun: String(p.tahun) }))
        : [{ nama: "", tahun: "" }],
  }));
}

/* ------------------------------------------------------------------ */
/* Ambil data                                                           */
/* ------------------------------------------------------------------ */

async function fetchItems(options: AsetSdmExportOptions, filters: AsetSdmExportFilters): Promise<AsetSdm[]> {
  const useFilter = options.export_mode === "filtered";

  const res = await getDaftarAsetSdmAll({
    search: useFilter ? filters.search || undefined : undefined,
    pangkat_golongan: useFilter ? filters.pangkat_golongan || undefined : undefined,
    jabatan: useFilter ? filters.jabatan || undefined : undefined,
    unit_kerja_id: useFilter ? filters.unit_kerja_id || undefined : undefined,
    per_page: -1,
  });

  let items = res.data;

  if (options.date_from || options.date_to) {
    items = items.filter((i) => {
      if (!i.tmt_jabatan) return false;
      if (options.date_from && i.tmt_jabatan < options.date_from) return false;
      if (options.date_to && i.tmt_jabatan > options.date_to) return false;
      return true;
    });
  }

  return items;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* EXCEL (.xlsx)                                                        */
/* ------------------------------------------------------------------ */

const estLines = (text: string, width: number) =>
  text
    .split("\n")
    .reduce((s, l) => s + Math.max(1, Math.ceil(l.length / Math.max(1, Math.floor((width - 1) * 0.82)))), 0);

export async function buildExcelBuffer(items: AsetSdm[], bidangName?: string): Promise<ArrayBuffer> {
  // @ts-ignore: bundel browser exceljs (tanpa dependensi Node)
  const mod: any = await import("exceljs/dist/exceljs.min.js");
  const ExcelJS = mod.default ?? mod;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Aset SDM Unit Kerja", {
    pageSetup: {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
  });

  const FONT = { name: "Tahoma", size: 12 };
  const thin = { style: "thin", color: { argb: "FF000000" } };
  const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
  const LINE = 15.6;

  // Lebar kolom A..O sesuai template
  ws.getColumn(1).width = 4.1;
  COL_W.forEach((w, i) => (ws.getColumn(i + 2).width = w));
  ws.getColumn(15).width = 10.6;

  // Judul (B2:N2) dan baris kosong (B3:N3)
  ws.getRow(1).height = LINE;
  ws.mergeCells("B2:N2");
  ws.getCell("B2").value = titleLines(bidangName).join("\n");
  ws.getCell("B2").font = { ...FONT, bold: true };
  ws.getCell("B2").alignment = { horizontal: "center", wrapText: true };
  ws.getRow(2).height = 46.5;
  ws.mergeCells("B3:N3");
  ws.getRow(3).height = LINE;
  ws.getRow(4).height = LINE;

  // Header dua tingkat (baris 5-6)
  const headFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00B0F0" } };
  for (let r = 5; r <= 6; r++) {
    for (let c = 2; c <= 14; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = headFill;
      cell.border = BORDER;
      cell.font = { ...FONT, bold: true, color: { argb: "FF000000" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }
  }
  SINGLE_HEAD.forEach((label, i) => {
    ws.mergeCells(5, 2 + i, 6, 2 + i);
    ws.getCell(5, 2 + i).value = label;
  });
  ws.mergeCells("H5:I5");
  ws.getCell("H5").value = "TIM SMKI";
  ws.mergeCells("J5:L5");
  ws.getCell("J5").value = "Pendidikan Terakhir";
  ws.mergeCells("M5:N5");
  ws.getCell("M5").value = "Pelatihan Yang Pernah Diikuti**";
  SUB_HEAD.forEach((label, i) => (ws.getCell(6, 8 + i).value = label));
  ws.getRow(5).height = LINE;
  ws.getRow(6).height = 45;

  // Baris data
  let r = 7;
  toBlocks(items).forEach((b) => {
    const n = b.pel.length;

    // tinggi yang dibutuhkan kolom yang digabung vertikal
    let need = LINE;
    b.cells.forEach((t, k) => {
      need = Math.max(need, estLines(t, COL_W[k]) * LINE);
    });
    const share = Math.ceil(need / n);

    for (let i = 0; i < n; i++) {
      const row = r + i;
      let h = Math.max(LINE, share);
      h = Math.max(h, estLines(b.pel[i].nama, COL_W[11]) * LINE);
      ws.getRow(row).height = h;

      for (let c = 2; c <= 14; c++) {
        const cell = ws.getCell(row, c);
        cell.font = FONT;
        cell.border = BORDER;
        cell.alignment = {
          horizontal: c === 2 || c === 13 || c === 14 || c === 12 ? "center" : "left",
          vertical: "top",
          wrapText: true,
        };
      }
      ws.getCell(row, 13).value = b.pel[i].nama;
      ws.getCell(row, 14).value = b.pel[i].tahun;
      ws.getCell(row, 13).alignment = { horizontal: "left", vertical: "top", wrapText: true };
    }

    b.cells.forEach((t, k) => {
      const cell = ws.getCell(r, 2 + k);
      cell.value = t;
      if (k === 2) cell.numFmt = "@"; // NIP tetap teks 18 digit
      if (n > 1) ws.mergeCells(r, 2 + k, r + n - 1, 2 + k);
    });

    r += n;
  });

  // Keterangan (3 baris kosong setelah tabel, seperti template)
  const kRow = r + 3;
  ws.getRow(kRow).height = 15.75;
  ws.getCell(kRow, 2).value = "Keterangan";
  ws.getCell(kRow, 2).font = FONT;
  ws.getCell(kRow, 2).alignment = { horizontal: "center", vertical: "middle" };

  const note = (row: number, mark: string, lines: string[], height: number) => {
    ws.getRow(row).height = height;
    ws.getCell(row, 2).value = mark;
    ws.getCell(row, 2).font = FONT;
    ws.getCell(row, 2).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    ws.mergeCells(row, 3, row, 14);
    ws.getCell(row, 3).value = lines.join("\n");
    ws.getCell(row, 3).font = FONT;
    ws.getCell(row, 3).alignment = { vertical: "middle", wrapText: true };
  };
  note(kRow + 1, "*)", [NOTE_1], 20);
  note(kRow + 2, "**)", [NOTE_2A, "", NOTE_2B], 63);

  return wb.xlsx.writeBuffer();
}

async function buildExcel(items: AsetSdm[], bidangName?: string) {
  const buf = await buildExcelBuffer(items, bidangName);
  downloadBlob(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `FR-029_Formulir_Daftar_Aset_SDM_${today()}.xlsx`
  );
}

/* ------------------------------------------------------------------ */
/* WORD (.docx)                                                         */
/* ------------------------------------------------------------------ */

export async function buildDocxBlob(items: AsetSdm[], bidangName?: string): Promise<Blob> {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
    WidthType, AlignmentType, VerticalAlign, ShadingType, BorderStyle, PageOrientation, TableLayoutType,
  } = await import("docx");

  const FONT = "Tahoma";
  const SZ = 14; // 7 pt, agar 13 kolom muat satu halaman landscape
  // Library docx menukar lebar/tinggi saat orientasi LANDSCAPE, jadi isi ukuran portrait.
  const PORTRAIT_W = 11906;
  const PORTRAIT_H = 16838;
  const MARGIN = 567;
  const USABLE = PORTRAIT_H - MARGIN * 2;
  const unit = USABLE / COL_W_TOTAL;
  const widths = COL_W.map((w) => Math.round(w * unit));

  const line = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  const borders = { top: line, bottom: line, left: line, right: line };
  const noLine = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: noLine, bottom: noLine, left: noLine, right: noLine };

  const paras = (text: string, opts: { bold?: boolean; align?: any; size?: number; color?: string } = {}) =>
    text.split("\n").map(
      (t) =>
        new Paragraph({
          alignment: opts.align ?? AlignmentType.LEFT,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: t, font: FONT, size: opts.size ?? SZ, bold: !!opts.bold, color: opts.color ?? "000000" })],
        })
    );

  const headCell = (text: string, w: number, extra: any = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders,
      shading: { type: ShadingType.CLEAR, fill: "00B0F0", color: "auto" },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 40, bottom: 40, left: 30, right: 30 },
      children: paras(text, { bold: true, align: AlignmentType.CENTER }),
      ...extra,
    });

  const dataCell = (text: string, w: number, center = false, extra: any = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders,
      verticalAlign: VerticalAlign.TOP,
      margins: { top: 40, bottom: 40, left: 30, right: 30 },
      children: paras(text, { align: center ? AlignmentType.CENTER : AlignmentType.LEFT }),
      ...extra,
    });

  const sum = (a: number, b: number) => widths.slice(a, b + 1).reduce((x, y) => x + y, 0);

  const head1 = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: [
      ...SINGLE_HEAD.map((t, i) => headCell(t, widths[i], { rowSpan: 2 })),
      headCell("TIM SMKI", sum(6, 7), { columnSpan: 2 }),
      headCell("Pendidikan Terakhir", sum(8, 10), { columnSpan: 3 }),
      headCell("Pelatihan Yang Pernah Diikuti**", sum(11, 12), { columnSpan: 2 }),
    ],
  });
  const head2 = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: SUB_HEAD.map((t, i) => headCell(t, widths[6 + i])),
  });

  const bodyRows: any[] = [];
  toBlocks(items).forEach((b) => {
    const n = b.pel.length;
    b.pel.forEach((p, i) => {
      const cells: any[] = [];
      if (i === 0) {
        b.cells.forEach((t, k) => {
          cells.push(dataCell(t, widths[k], k === 0 || k === 10 || k === 8, n > 1 ? { rowSpan: n } : {}));
        });
      }
      cells.push(dataCell(p.nama, widths[11]));
      cells.push(dataCell(p.tahun, widths[12], true));
      bodyRows.push(new TableRow({ cantSplit: true, children: cells }));
    });
  });

  const table = new Table({
    width: { size: USABLE, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: [head1, head2, ...bodyRows],
  });

  const noteTable = new Table({
    width: { size: USABLE, type: WidthType.DXA },
    columnWidths: [widths[0] + 400, USABLE - widths[0] - 400],
    layout: TableLayoutType.FIXED,
    borders: { ...noBorders, insideHorizontal: noLine, insideVertical: noLine },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: widths[0] + 400, type: WidthType.DXA }, borders: noBorders, children: paras("*)", { align: AlignmentType.CENTER }) }),
          new TableCell({ width: { size: USABLE - widths[0] - 400, type: WidthType.DXA }, borders: noBorders, children: paras(NOTE_1) }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ width: { size: widths[0] + 400, type: WidthType.DXA }, borders: noBorders, children: paras("**)", { align: AlignmentType.CENTER }) }),
          new TableCell({
            width: { size: USABLE - widths[0] - 400, type: WidthType.DXA },
            borders: noBorders,
            children: [...paras(NOTE_2A), ...paras(""), ...paras(NOTE_2B)],
          }),
        ],
      }),
    ],
  });

  const blank = () => new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "", font: FONT, size: SZ })] });

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: PORTRAIT_W, height: PORTRAIT_H, orientation: PageOrientation.LANDSCAPE },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children: [
          ...titleLines(bidangName).map(
            (t) =>
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: t, font: FONT, size: 24, bold: true })],
              })
          ),
          blank(),
          table,
          blank(),
          blank(),
          new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "Keterangan", font: FONT, size: SZ })] }),
          noteTable,
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

async function buildDocx(items: AsetSdm[], bidangName?: string) {
  const blob = await buildDocxBlob(items, bidangName);
  downloadBlob(blob, `FR-029_Formulir_Daftar_Aset_SDM_${today()}.docx`);
}

/* ------------------------------------------------------------------ */
/* PDF                                                                  */
/* ------------------------------------------------------------------ */

export async function buildPdfDoc(items: AsetSdm[], bidangName?: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 8;
  const usable = pageW - M * 2;
  const mm = COL_W.map((w) => (w / COL_W_TOTAL) * usable);

  // Judul 3 baris, rata tengah
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const t = titleLines(bidangName);
  t.forEach((line, i) => doc.text(line, pageW / 2, 12 + i * 5.5, { align: "center" }));

  const hs = { halign: "center", valign: "middle", fontStyle: "bold" } as const;
  const head = [
    [
      ...SINGLE_HEAD.map((c) => ({ content: c, rowSpan: 2, styles: hs })),
      { content: "TIM SMKI", colSpan: 2, styles: hs },
      { content: "Pendidikan Terakhir", colSpan: 3, styles: hs },
      { content: "Pelatihan Yang Pernah Diikuti**", colSpan: 2, styles: hs },
    ],
    SUB_HEAD.map((c) => ({ content: c, styles: hs })),
  ];

  const body: any[][] = [];
  toBlocks(items).forEach((b) => {
    const n = b.pel.length;
    b.pel.forEach((p, i) => {
      const row: any[] = [];
      if (i === 0) {
        b.cells.forEach((c, k) => {
          row.push({
            content: c,
            rowSpan: n,
            styles: { halign: k === 0 || k === 8 || k === 10 ? "center" : "left", valign: "top" },
          });
        });
      }
      row.push({ content: p.nama, styles: { halign: "left", valign: "top" } });
      row.push({ content: p.tahun, styles: { halign: "center", valign: "top" } });
      body.push(row);
    });
  });

  const columnStyles: Record<number, any> = {};
  mm.forEach((w, i) => (columnStyles[i] = { cellWidth: w }));

  autoTable(doc, {
    startY: 30,
    head: head as any,
    body,
    theme: "grid",
    margin: { left: M, right: M, top: 10, bottom: 10 },
    tableWidth: usable,
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 1.2,
      textColor: 0,
      lineColor: 0,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: { fillColor: [0, 176, 240], textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles,
  });

  // Keterangan
  let y = ((doc as any).lastAutoTable?.finalY ?? 30) + 10;
  const noteH = 30;
  if (y + noteH > pageH - 8) {
    doc.addPage();
    y = 14;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Keterangan", M, y);
  y += 5;
  doc.text("*)", M + 4, y, { align: "center" });
  const nx = M + 10;
  const nw = usable - 10;
  const l1 = doc.splitTextToSize(NOTE_1, nw) as string[];
  doc.text(l1, nx, y);
  y += l1.length * 3.6 + 2;
  doc.text("**)", M + 4, y, { align: "center" });
  const l2 = doc.splitTextToSize(NOTE_2A, nw) as string[];
  doc.text(l2, nx, y);
  y += l2.length * 3.6 + 3.6;
  const l3 = doc.splitTextToSize(NOTE_2B, nw) as string[];
  doc.text(l3, nx, y);

  return doc;
}

async function buildPdf(items: AsetSdm[], bidangName?: string) {
  const doc = await buildPdfDoc(items, bidangName);
  doc.save(`FR-029_Formulir_Daftar_Aset_SDM_${today()}.pdf`);
}

/* ------------------------------------------------------------------ */

/** Mengembalikan jumlah baris yang diekspor. */
export async function exportAsetSdm(
  options: AsetSdmExportOptions,
  filters: AsetSdmExportFilters,
  bidangName?: string
): Promise<number> {
  const items = await fetchItems(options, filters);

  if (items.length === 0) {
    throw new Error("Tidak ada data aset SDM yang cocok untuk diekspor.");
  }

  if (options.format === "pdf") await buildPdf(items, bidangName);
  else if (options.format === "docx") await buildDocx(items, bidangName);
  else await buildExcel(items, bidangName);

  return items.length;
}