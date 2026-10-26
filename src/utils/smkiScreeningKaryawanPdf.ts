import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ScreeningKaryawanItem } from "@/services/api";

const BULAN_INDO = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = BULAN_INDO[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Gagal memuat logo untuk PDF:", e);
    return null;
  }
}

/**
 * Menghasilkan Dokumen PDF Resmi Berita Acara Screening Karyawan Outsourcing
 * Format FR-012/KOM.03.05/SANDIKAMI
 * Didesain presisi, rapi, dan pas 1 halaman A4 tanpa terpotong (overflow-safe).
 */
export async function exportScreeningKaryawanToPdf(item: ScreeningKaryawanItem): Promise<void> {
  const noDokumen = "FR-012/KOM.03.05/SANDIKAMI/";
  const noRevisi = "1.1";
  const tglBerlaku = "20 Januari 2022";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2; // 180 mm
  let currentY = 12;

  // Helper menggambar tanda centang (checkmark vector) presisi
  const drawCheckmark = (cx: number, cy: number, size = 2.2, color = [16, 149, 74]) => {
    doc.saveGraphicsState();
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.45);
    doc.line(cx - size, cy, cx - size * 0.3, cy + size * 0.7);
    doc.line(cx - size * 0.3, cy + size * 0.7, cx + size * 0.9, cy - size * 0.8);
    doc.restoreGraphicsState();
  };

  // Helper menggambar tanda strip (-)
  const drawDash = (cx: number, cy: number, length = 2.2) => {
    doc.saveGraphicsState();
    doc.setDrawColor(140, 140, 140);
    doc.setLineWidth(0.35);
    doc.line(cx - length, cy, cx + length, cy);
    doc.restoreGraphicsState();
  };

  // ============================================================
  // 1. HEADER RESMI (3 KOLOM KONTROL DOKUMEN FR-012)
  // ============================================================
  const headerHeight = 24;
  const col1Width = 30; // Logo Pemprov Jabar
  const col3Width = 76; // Metadata Kontrol Dokumen (lebar cukup agar nomor tidak mentok)
  const col2Width = contentWidth - col1Width - col3Width; // Judul Berita Acara (74mm)

  // Outer Border Header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, headerHeight);

  // Garis Pemisah Kolom 1 (Logo | Judul)
  doc.line(marginX + col1Width, currentY, marginX + col1Width, currentY + headerHeight);

  // Garis Pemisah Kolom 2 (Judul | Metadata)
  doc.line(marginX + col1Width + col2Width, currentY, marginX + col1Width + col2Width, currentY + headerHeight);

  // Garis Horizontal di Kolom 3 (3 Baris Metadata Kontrol)
  const rowHeight = headerHeight / 3; // 8 mm per baris
  doc.line(
    marginX + col1Width + col2Width,
    currentY + rowHeight,
    marginX + contentWidth,
    currentY + rowHeight
  );
  doc.line(
    marginX + col1Width + col2Width,
    currentY + rowHeight * 2,
    marginX + contentWidth,
    currentY + rowHeight * 2
  );

  // Garis Vertikal Pemisah Label dan Nilai di Kolom 3
  const metaLabelWidth = 26; // 26 mm untuk Label, 50 mm untuk Nilai
  doc.line(
    marginX + col1Width + col2Width + metaLabelWidth,
    currentY,
    marginX + col1Width + col2Width + metaLabelWidth,
    currentY + headerHeight
  );

  // Logo Diskominfo / Pemprov Jabar (Kolom 1)
  const logoBase64 =
    (await getBase64ImageFromUrl("/logo-jabar.png")) ||
    (await getBase64ImageFromUrl("/logo-diskominfo-jabar.png"));
  if (logoBase64) {
    try {
      const logoW = 15;
      const logoH = 18;
      const logoX = marginX + (col1Width - logoW) / 2;
      const logoY = currentY + (headerHeight - logoH) / 2;
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn("Gagal menyematkan logo ke PDF:", e);
    }
  }

  // Judul Dokumen (Kolom 2)
  const titleCenterX = marginX + col1Width + col2Width / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text("BERITA ACARA", titleCenterX, currentY + 8, { align: "center" });

  doc.setFontSize(8.5);
  doc.text(
    "SCREENING KARYAWAN\nOUTSOURCING",
    titleCenterX,
    currentY + 14,
    { align: "center", lineHeightFactor: 1.25 }
  );

  // Metadata Dokumen (Kolom 3)
  const metaX = marginX + col1Width + col2Width;
  doc.setFontSize(7.5);

  // Baris 1: No. Dokumen
  doc.setFont("helvetica", "normal");
  doc.text("No. Dokumen", metaX + 2.5, currentY + 5.3);
  doc.setFont("helvetica", "bold");
  doc.text(noDokumen, metaX + metaLabelWidth + 2.5, currentY + 5.3);

  // Baris 2: No. Revisi
  doc.setFont("helvetica", "normal");
  doc.text("No. Revisi", metaX + 2.5, currentY + rowHeight + 5.3);
  doc.setFont("helvetica", "bold");
  doc.text(noRevisi, metaX + metaLabelWidth + 2.5, currentY + rowHeight + 5.3);

  // Baris 3: Tanggal Berlaku
  doc.setFont("helvetica", "normal");
  doc.text("Tanggal Berlaku", metaX + 2.5, currentY + rowHeight * 2 + 5.3);
  doc.setFont("helvetica", "bold");
  doc.text(tglBerlaku, metaX + metaLabelWidth + 2.5, currentY + rowHeight * 2 + 5.3);

  currentY += headerHeight + 5;

  // ============================================================
  // 2. DATA KARYAWAN OUTSOURCING
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DATA KARYAWAN OUTSOURCING", marginX, currentY);
  currentY += 1.5;

  const infoTableY = currentY;
  const infoRowH = 4.6;
  const labelW = 40;
  const colonW = 3.5;

  const infoRows = [
    { label: "Periode Tahun", val: String(item.tahun || "-") },
    { label: "Nama Karyawan", val: item.nama_karyawan || "-" },
    { label: "Jabatan", val: item.jabatan?.nama_jabatan || "-" },
    { label: "Penempatan di Bidang", val: item.bidang?.nama_bidang || "-" },
    { label: "Tanggal Screening", val: formatTanggalIndo(item.tanggal_screening) },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  infoRows.forEach((row, i) => {
    const yPos = infoTableY + 3.8 + i * infoRowH;
    doc.text(row.label, marginX, yPos);
    doc.text(":", marginX + labelW, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(row.val, marginX + labelW + colonW, yPos);
    doc.setFont("helvetica", "normal");
  });

  currentY += infoRows.length * infoRowH + 4.5;

  // ============================================================
  // 3. TABEL CHECKLIST 5 ITEM SCREENING
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("HASIL PEMERIKSAAN DOKUMEN SCREENING", marginX, currentY);
  currentY += 2;

  const defaultItems = [
    "Data Identitas (KTP, NPWP, KK)",
    "Tingkat Pendidikan (Ijazah & Sertifikat)",
    "Pemberi Referensi",
    "Pengalaman Kerja Sebelumnya",
    "Catatan lain yang diperlukan",
  ];

  const tableData = defaultItems.map((title, idx) => {
    const found = item.details?.find((d) => d.id_item === idx + 1);
    const isAda = found ? found.status === "Ada" : false;
    const isTidak = found ? found.status === "Tidak" : false;
    return [
      idx + 1,
      title,
      isAda ? "ada" : "-",
      isTidak ? "tidak" : "-",
      found?.keterangan && found.keterangan !== "-" ? found.keterangan : "-",
      isAda,   // metadata index 5
      isTidak, // metadata index 6
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [
      [
        { content: "No", styles: { halign: "center", valign: "middle" } },
        { content: "Item Pemeriksaan", styles: { halign: "center", valign: "middle" } },
        { content: "Ada", styles: { halign: "center", valign: "middle" } },
        { content: "Tidak", styles: { halign: "center", valign: "middle" } },
        { content: "Keterangan", styles: { halign: "center", valign: "middle" } },
      ],
    ],
    body: tableData.map((r) => [r[0], r[1], "", "", r[4]]), // Biarkan sel 2 & 3 kosong untuk digambar vector checkmark
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
      valign: "middle",
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: [242, 242, 242],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      halign: "center",
      minCellHeight: 6.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 72 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 62 },
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const cx = data.cell.x + data.cell.width / 2;
        const cy = data.cell.y + data.cell.height / 2;
        const rowMeta = tableData[data.row.index];

        if (data.column.index === 2) {
          // Kolom Ada
          if (rowMeta && rowMeta[5]) {
            drawCheckmark(cx, cy, 2.2, [16, 149, 74]);
          } else {
            drawDash(cx, cy, 2);
          }
        } else if (data.column.index === 3) {
          // Kolom Tidak
          if (rowMeta && rowMeta[6]) {
            drawCheckmark(cx, cy, 2.2, [220, 38, 38]);
          } else {
            drawDash(cx, cy, 2);
          }
        }
      }
    },
  });

  // @ts-expect-error - autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 4.5;

  // ============================================================
  // 4. KESIMPULAN AKHIR PEMERIKSAAN
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("KESIMPULAN AKHIR", marginX, currentY);
  currentY += 2.2;

  const conclusionBoxHeight = 14;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(marginX, currentY, contentWidth, conclusionBoxHeight);

  const isPerlu = item.kesimpulan === "Perlu melengkapi administrasi";
  const isLengkap = item.kesimpulan === "Administrasi Lengkap";

  // Checkbox 1: Perlu melengkapi administrasi
  const box1X = marginX + 5;
  const box1Y = currentY + 2.5;
  doc.rect(box1X, box1Y, 3.5, 3.5);
  if (isPerlu) {
    drawCheckmark(box1X + 1.75, box1Y + 1.75, 1.8, [16, 149, 74]);
  }
  doc.setFont("helvetica", isPerlu ? "bold" : "normal");
  doc.setFontSize(8.5);
  doc.text("Perlu melengkapi administrasi", marginX + 11, currentY + 5.2);

  // Checkbox 2: Administrasi Lengkap
  const box2X = marginX + 5;
  const box2Y = currentY + 7.8;
  doc.rect(box2X, box2Y, 3.5, 3.5);
  if (isLengkap) {
    drawCheckmark(box2X + 1.75, box2Y + 1.75, 1.8, [16, 149, 74]);
  }
  doc.setFont("helvetica", isLengkap ? "bold" : "normal");
  doc.text("Administrasi Lengkap", marginX + 11, currentY + 10.5);

  currentY += conclusionBoxHeight + 4.5;

  // ============================================================
  // 5. CATATAN TAMBAHAN
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CATATAN TAMBAHAN", marginX, currentY);
  currentY += 2.2;

  const notesHeight = 13;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(marginX, currentY, contentWidth, notesHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const noteText = item.catatan?.trim() || "Karyawan memenuhi semua kriteria dokumen yang dipersyaratkan. Referensi telah diverifikasi secara internal.";
  doc.text(noteText, marginX + 3.5, currentY + 4.8, {
    maxWidth: contentWidth - 7,
  });

  currentY += notesHeight + 6;

  // ============================================================
  // 6. BLOK TANDA TANGAN (BOTTOM RIGHT)
  // ============================================================
  const sigW = 65;
  const sigX = marginX + contentWidth - sigW;
  const sigCenterX = sigX + sigW / 2;
  const tglScreeningFormatted = formatTanggalIndo(item.tanggal_screening);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Bandung, ${tglScreeningFormatted}`, sigCenterX, currentY, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.text("Petugas Verifikator Screening", sigCenterX, currentY + 4.5, { align: "center" });

  currentY += 4.5 + 16;
  doc.setFont("helvetica", "bold");
  doc.text("( .................................................. )", sigCenterX, currentY, {
    align: "center",
  });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Pemerintah Provinsi Jawa Barat", sigCenterX, currentY + 4, { align: "center" });

  // Save PDF dengan nama dokumen yang terstruktur
  const cleanName = (item.nama_karyawan || "Karyawan").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Berita_Acara_Screening_${cleanName}_${item.tahun || 2026}.pdf`;
  doc.save(filename);
}
