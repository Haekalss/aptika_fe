import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { KomunikasiItem, HeaderInfoFR010 } from "@/services/smki/komunikasiService";

interface ExportFR010Options {
  header: HeaderInfoFR010;
  internalItems: KomunikasiItem[];
  eksternalItems: KomunikasiItem[];
  city?: string;
  signDate?: string;
}

// Jumlah baris minimal per seksi mengikuti template xlsx (5 baris bernomor 1-5)
const MIN_ROWS_PER_SECTION = 5;

function padRows<T>(items: T[], min: number): (T | null)[] {
  const out: (T | null)[] = [...items];
  while (out.length < min) out.push(null);
  return out;
}

/**
 * Memuat logo Jabar dari public dir sebagai data-URL (base64).
 * Urutan: /logo-jabar.png (lambang Provinsi Jawa Barat, sama seperti
 * yang dipakai dokumen SMKI backend) lalu /logo-diskominfo-jabar.png.
 * Mengembalikan null bila tidak berhasil (kotak logo dibiarkan kosong
 * seperti template xlsx).
 */
async function loadLogoDataUrl(): Promise<string | null> {
  const candidates = ["/logo-jabar.png", "/logo-diskominfo-jabar.png"];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      const dataUrl = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      if (dataUrl) return dataUrl;
    } catch {
      // coba kandidat berikutnya
    }
  }
  return null;
}

/* =====================================================================
 * EKSPOR PDF — disamakan dengan template Excel
 * resources/templates/FR-010 Komunikasi Internal Eksternal.xlsx :
 *  - Portrait A4 (sama seperti template)
 *  - Kop: [logo Jabar] | KOMUNIKASI SMKI | No. Dokumen / No. Revisi /
 *    Tanggal Berlaku
 *  - Baris "Periode : XXXX" (abu-abu)
 *  - Header kolom: No. | Judul Informasi | Klasifikasi | Pengirim |
 *    Penerima | Frekuensi | Metode (abu-abu)
 *  - Blok "Komunikasi Internal" + baris data 1..n
 *  - Blok "Komunikasi Eksternal" + baris data 1..n
 *  - TTD: "Bandung, ____" / "Disusun," / "Mengetahui," / "(....)"
 * ===================================================================== */
export async function exportKomunikasiToPdf({
  header,
  internalItems,
  eksternalItems,
  city = "Bandung",
  signDate = "__________________",
}: ExportFR010Options): Promise<void> {
  // Portrait A4 persis template xlsx (182 mm lebar konten)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 14;
  const contentW = pageWidth - margin * 2; // 182

  // ---- Kop FR-010 (meniru A1:H3 template) ----
  // Kolom kiri (logo Jabar, A1:B3) | tengah (judul, C1:E3) | kanan (meta, F1:H3)
  const leftW = 30;
  const rightW = 72;
  const centerW = contentW - leftW - rightW;
  const kopH = 28;
  const kopY = margin;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  // kotak luar
  doc.rect(margin, kopY, contentW, kopH);
  // garis vertikal pemisah
  doc.line(margin + leftW, kopY, margin + leftW, kopY + kopH);
  doc.line(
    margin + leftW + centerW,
    kopY,
    margin + leftW + centerW,
    kopY + kopH
  );
  // garis horizontal pemisah 3 baris meta kanan
  const metaX = margin + leftW + centerW;
  const metaRowH = kopH / 3;
  doc.line(metaX, kopY + metaRowH, metaX + rightW, kopY + metaRowH);
  doc.line(metaX, kopY + metaRowH * 2, metaX + rightW, kopY + metaRowH * 2);

  // Logo Jabar di kotak kiri (A1:B3 template), proporsi gambar dijaga
  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    try {
      const natSize = await new Promise<{ w: number; h: number }>(
        (resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
          img.onerror = () => resolve({ w: 1, h: 1 });
          img.src = logoDataUrl;
        }
      );
      const maxW = leftW - 6;
      const maxH = kopH - 4;
      const scale = Math.min(maxW / natSize.w, maxH / natSize.h);
      const imgW = natSize.w * scale;
      const imgH = natSize.h * scale;
      doc.addImage(
        logoDataUrl,
        "PNG",
        margin + (leftW - imgW) / 2,
        kopY + (kopH - imgH) / 2,
        imgW,
        imgH
      );
    } catch {
      // biarkan kotak logo kosong seperti template bila gagal
    }
  }

  // Judul tengah persis template: "KOMUNIKASI SMKI"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "KOMUNIKASI SMKI",
    margin + leftW + centerW / 2,
    kopY + kopH / 2 + 2,
    { align: "center" }
  );

  // Meta kanan persis template (label : nilai)
  const labelX = metaX + 2.5;
  const colonX = metaX + 29;
  const valueX = metaX + 33;
  const valueMaxW = rightW - 35;
  const fitValue = (text: string) => {
    let size = 8.5;
    doc.setFontSize(size);
    while (doc.getTextWidth(text) > valueMaxW && size > 6) {
      size -= 0.5;
      doc.setFontSize(size);
    }
  };
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("No. Dokumen", labelX, kopY + 6);
  doc.text(":", colonX, kopY + 6);
  fitValue(String(header.no_dokumen || ""));
  doc.text(String(header.no_dokumen || ""), valueX, kopY + 6);

  doc.setFontSize(8.5);
  doc.text("No. Revisi", labelX, kopY + metaRowH + 6);
  doc.text(":", colonX, kopY + metaRowH + 6);
  fitValue(String(header.no_revisi || ""));
  doc.text(String(header.no_revisi || ""), valueX, kopY + metaRowH + 6);

  doc.setFontSize(8.5);
  doc.text("Tanggal Berlaku", labelX, kopY + metaRowH * 2 + 6);
  doc.text(":", colonX, kopY + metaRowH * 2 + 6);
  fitValue(String(header.tanggal_berlaku || ""));
  doc.text(String(header.tanggal_berlaku || ""), valueX, kopY + metaRowH * 2 + 6);

  // ---- Baris Periode (A5 template, abu-abu D0CECE) ----
  let curY = kopY + kopH + 3;
  const periodeH = 8;
  doc.setFillColor(208, 206, 206);
  doc.rect(margin, curY, contentW, periodeH, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Periode : ${header.periode || ""}`, margin + 3, curY + 5.5);

  curY += periodeH + 3;

  const head = [
    "No.",
    "Judul Informasi",
    "Klasifikasi",
    "Pengirim",
    "Penerima",
    "Frekuensi",
    "Metode",
  ];

  const greyFill: [number, number, number] = [208, 206, 206];

  // Proporsi lebar kolom mengikuti lebar kolom template
  // A=5.44 B=24.55 C=13.44 D=21.66 E=20.66 F=25.66 G+H=30.77 (total ~142.2)
  const totalUnits = 5.44 + 24.55 + 13.44 + 21.66 + 20.66 + 25.66 + 30.77;
  const colW = (u: number) => (u / totalUnits) * contentW;

  const columnStyles: Record<number, object> = {
    0: { cellWidth: colW(5.44), halign: "center", valign: "middle" },
    1: { cellWidth: colW(24.55), halign: "left", valign: "middle" },
    2: { cellWidth: colW(13.44), halign: "center", valign: "middle" },
    3: { cellWidth: colW(21.66), halign: "left", valign: "middle" },
    4: { cellWidth: colW(20.66), halign: "left", valign: "middle" },
    5: { cellWidth: colW(25.66), halign: "left", valign: "middle" },
    6: { cellWidth: colW(30.77), halign: "left", valign: "middle" },
  };

  const tableBaseStyle = {
    theme: "grid" as const,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: greyFill,
      textColor: [0, 0, 0] as [number, number, number],
      fontStyle: "bold" as const,
      fontSize: 8,
      halign: "center" as const,
      valign: "middle" as const,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [0, 0, 0] as [number, number, number],
      cellPadding: 1.8,
      valign: "middle" as const,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    styles: {
      font: "helvetica" as const,
      overflow: "linebreak" as const,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
  };

  function sectionTitle(text: string, y: number): number {
    // Baris judul seksi full-width seperti A7 / A15 template (bold, border)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentW, 7, "FD");
    doc.text(text, margin + 3, y + 5);
    return y + 7;
  }

  // ---- Seksi Internal ----
  curY = sectionTitle("Komunikasi Internal", curY);
  const paddedInternal = padRows(internalItems, MIN_ROWS_PER_SECTION);
  const internalRows = paddedInternal.map((item, idx) =>
    item
      ? [
          idx + 1,
          item.judul || "",
          item.klasifikasi || "",
          item.pengirim || "",
          item.penerima || "",
          item.frekuensi || "",
          item.metode || "",
        ]
      : [idx + 1, "", "", "", "", "", ""]
  );

  autoTable(doc, {
    ...tableBaseStyle,
    startY: curY,
    head: [head],
    body: internalRows,
    columnStyles,
  });

  // ---- Seksi Eksternal ----
  let nextY = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY;
  // jeda antar seksi seperti baris kosong 13-14 pada template
  nextY += 4;
  nextY = sectionTitle("Komunikasi Eksternal", nextY);

  const paddedEksternal = padRows(eksternalItems, MIN_ROWS_PER_SECTION);
  const eksternalRows = paddedEksternal.map((item, idx) =>
    item
      ? [
          idx + 1,
          item.judul || "",
          item.klasifikasi || "",
          item.pengirim || "",
          item.penerima || "",
          item.frekuensi || "",
          item.metode || "",
        ]
      : [idx + 1, "", "", "", "", "", ""]
  );

  autoTable(doc, {
    ...tableBaseStyle,
    startY: nextY,
    head: [head],
    body: eksternalRows,
    columnStyles,
  });

  // ---- Blok tanda tangan persis template ----
  // Template: B23 "Bandung, " | B25 "Disusun," | F25 "Mengetahui," |
  //           B31 "(.....)" | F31 "(.....)"
  let sigY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // Portrait A4 (297 mm): pindah halaman bila blok TTD tidak muat
  if (sigY + 35 > pageHeight - margin) {
    doc.addPage();
    sigY = margin + 12;
  }

  const leftSigX = margin + contentW * 0.1;
  const rightSigX = margin + contentW * 0.58;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // "Bandung, {tanggal}" di atas kolom kiri (seperti B23 template)
  doc.text(`${city}, ${signDate}`, leftSigX, sigY);
  sigY += 7;
  doc.text("Disusun,", leftSigX, sigY);
  doc.text("Mengetahui,", rightSigX, sigY);

  sigY += 22;
  doc.text("(.......................................)", leftSigX - 12, sigY);
  doc.text("(..................................)", rightSigX - 6, sigY);

  const filename = `FR-010_Komunikasi_${header.periode || "2022"}.pdf`;
  doc.save(filename);
}

/* =====================================================================
 * EKSPOR EXCEL (.xlsx) — replika 1:1 template
 * resources/templates/FR-010 Komunikasi Internal Eksternal.xlsx
 * ===================================================================== */
const TEMPLATE_COL_WIDTHS = [5.44, 24.55, 13.44, 21.66, 20.66, 25.66, 1.89, 28.89];
const GREY_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD0CECE" },
};
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  left: { style: "thin", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: "FF000000" } },
  top: { style: "thin", color: { argb: "FF000000" } },
  bottom: { style: "thin", color: { argb: "FF000000" } },
};
const ARIAL_10: Partial<ExcelJS.Font> = { name: "Arial", size: 10 };
const ARIAL_11: Partial<ExcelJS.Font> = { name: "Arial", size: 11 };
const ARIAL_11_BOLD: Partial<ExcelJS.Font> = {
  name: "Arial",
  size: 11,
  bold: true,
};

function styleKopCell(cell: ExcelJS.Cell) {
  cell.font = ARIAL_10;
  cell.alignment = { horizontal: "left", vertical: "middle" };
  cell.border = THIN_BORDER as ExcelJS.Borders;
}

export async function exportKomunikasiToExcel({
  header,
  internalItems,
  eksternalItems,
  city = "Bandung",
  signDate = "",
}: ExportFR010Options): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SMKI APTIKA";
  const ws = wb.addWorksheet("Lembar1", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: false,
    },
  });
  ws.pageSetup.margins = {
    left: 0.7,
    right: 0.7,
    top: 0.75,
    bottom: 0.75,
    header: 0.0,
    footer: 0.0,
  };

  // Lebar kolom persis template
  const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  colLetters.forEach((letter, i) => {
    ws.getColumn(letter).width = TEMPLATE_COL_WIDTHS[i];
  });

  // Tinggi baris kop persis template
  ws.getRow(1).height = 26.25;
  ws.getRow(2).height = 24.75;
  ws.getRow(3).height = 26.25;

  // ---- Kop A1:H3 ----
  ws.mergeCells("A1:B3"); // kotak logo (A1:B3 template)
  const logoCell = ws.getCell("A1");
  logoCell.border = THIN_BORDER as ExcelJS.Borders;
  logoCell.alignment = { horizontal: "center", vertical: "middle" };

  // Sisipkan logo Jabar ke kotak A1:B3 (seperti kop dokumen resmi).
  // Jangkar oneCell + ukuran proporsional agar logo tidak gepeng.
  try {
    const logoDataUrl = await loadLogoDataUrl();
    if (logoDataUrl) {
      const natSize = await new Promise<{ w: number; h: number }>(
        (resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
          img.onerror = () => resolve({ w: 1, h: 1 });
          img.src = logoDataUrl;
        }
      );
      const scale = Math.min(100 / natSize.w, 100 / natSize.h);
      const base64 = logoDataUrl.split(",")[1] ?? logoDataUrl;
      const imageId = wb.addImage({ base64, extension: "png" });
      ws.addImage(imageId, {
        tl: { col: 1, row: 0 },
        ext: {
          width: Math.round(natSize.w * scale),
          height: Math.round(natSize.h * scale),
        },
        editAs: "oneCell",
      });
    }
  } catch {
    // biarkan kotak logo kosong seperti template bila gagal
  }

  ws.mergeCells("C1:E3");
  const titleCell = ws.getCell("C1");
  titleCell.value = "KOMUNIKASI SMKI";
  titleCell.font = { name: "Arial", size: 20, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.border = THIN_BORDER as ExcelJS.Borders;
  // border untuk seluruh area merge kop
  for (let r = 1; r <= 3; r++) {
    for (const c of ["A", "B", "C", "D", "E"]) {
      const cell = ws.getCell(`${c}${r}`);
      cell.border = THIN_BORDER as ExcelJS.Borders;
    }
  }

  // Meta kanan F1:H3
  const meta: Array<[string, string, string]> = [
    ["F1", "No. Dokumen", String(header.no_dokumen ?? "FR-010/KOM.03.05/SANDIKAMI")],
    ["F2", "No. Revisi", String(header.no_revisi ?? "1.1")],
    ["F3", "Tanggal Berlaku", String(header.tanggal_berlaku ?? "07 Juli 2022")],
  ];
  for (const [labelAddr, label, value] of meta) {
    const row = labelAddr.slice(1);
    const labelCell = ws.getCell(labelAddr);
    labelCell.value = label;
    styleKopCell(labelCell);

    const colonCell = ws.getCell(`G${row}`);
    colonCell.value = ":";
    styleKopCell(colonCell);

    const valueCell = ws.getCell(`H${row}`);
    valueCell.value = value;
    styleKopCell(valueCell);
  }

  // ---- Baris 4: spacer kosong (A4:H4 merged seperti template) ----
  ws.mergeCells("A4:H4");
  ws.getRow(4).height = 14.25;

  // ---- Baris 5: Periode (merged, abu-abu, bold, border) ----
  ws.mergeCells("A5:H5");
  const periodeCell = ws.getCell("A5");
  periodeCell.value = `Periode : ${header.periode ?? ""}`;
  periodeCell.font = ARIAL_11_BOLD;
  periodeCell.fill = GREY_FILL;
  periodeCell.alignment = { horizontal: "left", vertical: "middle" };
  periodeCell.border = THIN_BORDER as ExcelJS.Borders;
  ws.getRow(5).height = 14.25;
  // pastikan border mengelilingi seluruh baris merge
  for (const c of colLetters) {
    const cell = ws.getCell(`${c}5`);
    cell.fill = GREY_FILL;
    cell.border = THIN_BORDER as ExcelJS.Borders;
  }

  // ---- Baris 6: header kolom (abu-abu, bold, centered, border) ----
  // G6:H6 merged untuk "Metode" seperti template
  const headers = [
    "No.",
    "Judul Informasi",
    "Klasifikasi",
    "Pengirim",
    "Penerima",
    "Frekuensi",
    "Metode",
  ];
  const headerAddrs = ["A6", "B6", "C6", "D6", "E6", "F6", "G6"];
  ws.mergeCells("G6:H6");
  headerAddrs.forEach((addr, i) => {
    const cell = ws.getCell(addr);
    cell.value = headers[i];
    cell.font = ARIAL_11_BOLD;
    cell.fill = GREY_FILL;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER as ExcelJS.Borders;
  });
  ws.getCell("H6").fill = GREY_FILL;
  ws.getCell("H6").border = THIN_BORDER as ExcelJS.Borders;
  ws.getRow(6).height = 14.25;

  let row = 7;

  function sectionRow(title: string, withBorder: boolean) {
    ws.mergeCells(`A${row}:H${row}`);
    const cell = ws.getCell(`A${row}`);
    cell.value = title;
    cell.font = ARIAL_11_BOLD;
    cell.alignment = { horizontal: "left", vertical: "middle" };
    if (withBorder) cell.border = THIN_BORDER as ExcelJS.Borders;
    // template: baris seksi internal ber-border, eksternal tanpa border
    ws.getRow(row).height = 14.25;
    row += 1;
  }

  function dataRows(items: KomunikasiItem[]) {
    const padded = padRows(items, MIN_ROWS_PER_SECTION);
    padded.forEach((item, idx) => {
      ws.mergeCells(`G${row}:H${row}`);
      const noCell = ws.getCell(`A${row}`);
      noCell.value = idx + 1;
      noCell.font = ARIAL_11;
      noCell.alignment = { horizontal: "center", vertical: "middle" };
      noCell.border = THIN_BORDER as ExcelJS.Borders;

      const values = item
        ? [item.judul, item.klasifikasi, item.pengirim, item.penerima, item.frekuensi]
        : ["", "", "", "", ""];
      const addrs = ["B", "C", "D", "E", "F"];
      let longest = 0;
      addrs.forEach((col, i) => {
        const cell = ws.getCell(`${col}${row}`);
        cell.value = values[i] ?? "";
        cell.font = ARIAL_11;
        cell.alignment = {
          horizontal: i === 1 ? "center" : "left",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = THIN_BORDER as ExcelJS.Borders;
        longest = Math.max(longest, String(values[i] ?? "").length);
      });

      const metodeCell = ws.getCell(`G${row}`);
      metodeCell.value = item?.metode ?? "";
      metodeCell.font = ARIAL_11;
      metodeCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      metodeCell.border = THIN_BORDER as ExcelJS.Borders;
      ws.getCell(`H${row}`).border = THIN_BORDER as ExcelJS.Borders;
      longest = Math.max(longest, String(item?.metode ?? "").length);

      // Tinggi baris adaptif agar teks wrap tetap terbaca (template 30-80)
      ws.getRow(row).height = Math.max(30, 15 + Math.ceil(longest / 28) * 15);
      row += 1;
    });
  }

  function spacerRows(n: number) {
    for (let i = 0; i < n; i++) {
      ws.mergeCells(`G${row}:H${row}`);
      ws.getRow(row).height = 14.25;
      row += 1;
    }
  }

  // Blok Internal (dengan border, seperti A7 template)
  sectionRow("Komunikasi Internal", true);
  dataRows(internalItems);

  // 2 baris spacer (baris 13-14 template, tanpa border)
  spacerRows(2);

  // Blok Eksternal (tanpa border, seperti A15 template)
  sectionRow("Komunikasi Eksternal", false);
  dataRows(eksternalItems);

  // 2 baris spacer (baris 21-22 template)
  spacerRows(2);

  // ---- Blok tanda tangan (tanpa border, posisi persis template) ----
  const bandungRow = row;
  ws.getCell(`B${bandungRow}`).value = `${city}, ${signDate}`;
  ws.getCell(`B${bandungRow}`).font = ARIAL_11;
  ws.getRow(bandungRow).height = 14.25;
  row += 2; // baris kosong 24 template

  ws.getCell(`B${row}`).value = "Disusun,";
  ws.getCell(`B${row}`).font = ARIAL_11;
  ws.getCell(`B${row}`).alignment = { horizontal: "center" };
  ws.getCell(`F${row}`).value = "Mengetahui,";
  ws.getCell(`F${row}`).font = ARIAL_11;
  ws.getRow(row).height = 14.25;
  row += 6; // ruang tanda tangan (baris 26-30 template)

  ws.getCell(`B${row}`).value = "(.......................................)";
  ws.getCell(`B${row}`).font = ARIAL_11;
  ws.getCell(`F${row}`).value = "(..................................)";
  ws.getCell(`F${row}`).font = ARIAL_11;
  ws.getRow(row).height = 14.25;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FR-010_Komunikasi_${header.periode || "2022"}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * @deprecated Gunakan exportKomunikasiToExcel agar hasil .xlsx sama
 * dengan template FR-010. Fungsi ini dipertahankan supaya kode lama
 * yang memanggil exportKomunikasiToCsv tidak rusak.
 */
export function exportKomunikasiToCsv(options: ExportFR010Options) {
  void exportKomunikasiToExcel(options);
}
