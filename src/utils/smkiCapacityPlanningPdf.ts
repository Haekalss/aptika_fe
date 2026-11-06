import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import type { Fr026Asset, Fr026Category, Fr026Dashboard } from "@/services/smki/capacityPlanning.types";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const PARAMETERS: Record<Fr026Category, Array<{ label: string; value: (asset: Fr026Asset, month: number) => string }>> = {
  server: [
    { label: "Current · Storage (GB)", value: (asset, month) => number(cell(asset, month)?.current_storage_gb) },
    { label: "Current · Memory (%)", value: (asset, month) => number(cell(asset, month)?.current_memory_pct) },
    { label: "Current · CPU Usage (%)", value: (asset, month) => number(cell(asset, month)?.current_cpu_pct) },
    { label: "Projection · Storage (GB)", value: (asset, month) => number(cell(asset, month)?.projection_storage_gb) },
    { label: "Projection · Memory (%)", value: (asset, month) => number(cell(asset, month)?.projection_memory_pct) },
    { label: "Projection · CPU Usage (%)", value: (asset, month) => number(cell(asset, month)?.projection_cpu_pct) },
  ],
  network: [
    { label: "Bandwidth · Kapasitas (Mbps)", value: (asset, month) => number(cell(asset, month)?.bandwidth_capacity_mbps) },
    { label: "Bandwidth · Max Pemakaian (Mbps)", value: (asset, month) => number(cell(asset, month)?.bandwidth_max_usage_mbps) },
    { label: "Bandwidth · % Pemakaian", value: (asset, month) => percent(cell(asset, month)?.bandwidth_usage_pct) },
    { label: "Up Time · Perjanjian SLA (%)", value: (asset, month) => decimal(cell(asset, month)?.sla_agreement_pct) },
    { label: "Up Time · Capaian SLA (%)", value: (asset, month) => decimal(cell(asset, month)?.sla_achievement_pct) },
    { label: "Keterangan", value: (asset, month) => cell(asset, month)?.notes || "—" },
  ],
};

function cell(asset: Fr026Asset, month: number) {
  return asset.logs.find((log) => log.month === month);
}

function number(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function decimal(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function percent(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function dateLabel(value?: string | null): string {
  if (!value) return "Belum diisi";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function createFr026Pdf(data: Fr026Dashboard, categories: Fr026Category[], logo: string | null): jsPDF {
  if (!categories.length) throw new Error("Pilih minimal satu kategori laporan.");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "legal", compress: true, putOnlyUsedFonts: true });
  doc.setFont("helvetica", "normal");

  const checks: Array<string | null | undefined> = [
    data.meta.documents.server.code,
    data.meta.documents.network.code,
    ...data.assets.flatMap((asset) => [asset.asset_name, asset.ip_address, ...asset.logs.map((log) => log.notes)]),
  ];
  for (const text of checks) {
    if (!text) continue;
    for (const character of text) {
      if (character.codePointAt(0)! > 255) {
        throw new Error(`Karakter "${character}" belum didukung font PDF. Data tetap tersimpan; PDF tidak dibuat agar teks tidak rusak.`);
      }
    }
  }

  doc.setProperties({
    title: "Formulir Capacity Planning",
    subject: `FR-026 ${data.meta.year}`,
    creator: "APTIKA Tools",
  });

  const left = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - left - 15;
  const headerHeight = 31;

  categories.forEach((category, index) => {
    if (index > 0) doc.addPage();
    const meta = data.meta.documents[category];
    const assets = data.assets.filter((asset) => asset.category === category);

    // ── Kop dokumen ─────────────────────────────────────────────
    const y = 12;
    const logoWidth = 25;
    const metaWidth = 78;
    const metaX = left + width - metaWidth;
    doc.setDrawColor(0).setLineWidth(0.25);
    doc.rect(left, y, width, headerHeight);
    doc.line(left + logoWidth, y, left + logoWidth, y + headerHeight);
    doc.line(metaX, y, metaX, y + headerHeight);
    for (let row = 1; row < 4; row += 1) {
      doc.line(metaX, y + (headerHeight / 4) * row, left + width, y + (headerHeight / 4) * row);
    }
    doc.line(metaX + 26, y, metaX + 26, y + headerHeight);

    if (logo) {
      try {
        const image = doc.getImageProperties(logo);
        const scale = Math.min(18 / image.width, 20 / image.height);
        doc.addImage(logo, "PNG", left + (logoWidth - image.width * scale) / 2, y + (headerHeight - image.height * scale) / 2, image.width * scale, image.height * scale);
      } catch {
        // Keep the logo box empty when the asset cannot be embedded.
      }
    }

    doc.setTextColor(0).setFont("helvetica", "bold").setFontSize(15);
    doc.text("FORMULIR CAPACITY PLANNING", left + logoWidth + (metaX - left - logoWidth) / 2, y + headerHeight / 2 - 1, { align: "center" });
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`${category === "server" ? "SERVER" : "NETWORK"} • TAHUN ${data.meta.year}`, left + logoWidth + (metaX - left - logoWidth) / 2, y + headerHeight / 2 + 6, { align: "center" });

    const metadata: Array<[string, string]> = [
      ["No. Dokumen", meta.code],
      ["No. Revisi", meta.revision],
      ["Tanggal", dateLabel(meta.tanggal)],
      ["Last Update", dateLabel(meta.last_update)],
    ];
    doc.setFontSize(7.5);
    metadata.forEach(([label, value], row) => {
      const rowY = y + (headerHeight / 4) * row + 4.8;
      doc.setFont("helvetica", "normal").setTextColor(70).text(label, metaX + 1.8, rowY);
      doc.setFont("helvetica", "bold").setTextColor(0).text(doc.splitTextToSize(value, metaWidth - 29), metaX + 27.5, rowY);
    });

    // ── Matriks tahunan ─────────────────────────────────────────
    const body: RowInput[] = [];
    assets.forEach((asset, assetIndex) => {
      body.push([{
        content: `No. ${String(assetIndex + 1).padStart(2, "0")}   ${asset.asset_name}   IP: ${asset.ip_address || "—"}`,
        colSpan: 13,
        styles: { fillColor: [241, 245, 249], fontStyle: "bold", textColor: [15, 23, 42], fontSize: 8.5 },
      }]);
      PARAMETERS[category].forEach((parameter) => {
        body.push([
          parameter.label,
          ...Array.from({ length: 12 }, (_, month) => parameter.value(asset, month + 1)),
        ]);
      });
    });
    if (!assets.length) body.push([{ content: `Belum ada aset ${category === "server" ? "Server" : "Network"} pada tahun ${data.meta.year}.`, colSpan: 13 }]);

    autoTable(doc, {
      startY: y + headerHeight + 5,
      margin: { left, right: 15, top: y + headerHeight + 5, bottom: 16 },
      tableWidth: width,
      theme: "grid",
      rowPageBreak: "avoid",
      showHead: "everyPage",
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 1.6,
        textColor: 30,
        lineColor: [160, 174, 192],
        lineWidth: 0.1,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: "bold", halign: "center", fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 52, halign: "left" },
        ...Object.fromEntries(Array.from({ length: 12 }, (_, month) => [month + 1, { halign: "center" as const }])),
      },
      head: [[
        { content: "Kelompok / parameter", styles: { halign: "left" } },
        ...SHORT_MONTHS.map((label, monthIndex) => ({
          content: label,
          styles: monthIndex + 1 === data.meta.month
            ? { fillColor: [4, 120, 87] as [number, number, number], textColor: [255, 255, 255] as [number, number, number] }
            : {},
        })),
      ]],
      body,
      didParseCell: (hook) => {
        if (hook.section === "body" && hook.column.index > 0 && hook.column.index === data.meta.month && hook.row.raw && Array.isArray(hook.row.raw) && hook.row.raw.length > 1) {
          hook.cell.styles.fillColor = [236, 253, 245];
          hook.cell.styles.textColor = [6, 78, 59];
          hook.cell.styles.fontStyle = "bold";
        }
      },
    });
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page).setFont("helvetica", "normal").setFontSize(7.5).setTextColor(90);
    doc.text(`FR-026 Capacity Planning • Tahun ${data.meta.year}`, left, pageHeight - 7);
    doc.text(`Halaman ${page} dari ${pages}`, pageWidth - 15, pageHeight - 7, { align: "right" });
  }

  return doc;
}

async function loadLogoDataUrl(): Promise<string | null> {
  for (const url of ["/logo-jabar.png", "/logo-diskominfo-jabar.png"]) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 32768) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
      }
      return `data:image/png;base64,${btoa(binary)}`;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

export async function exportFr026Pdf(data: Fr026Dashboard, categories: Fr026Category[]): Promise<void> {
  const logo = await loadLogoDataUrl();
  const doc = createFr026Pdf(data, categories, logo);
  const suffix = categories.length === 2 ? "Semua" : categories[0] === "server" ? "Server" : "Network";
  await doc.save(`FR-026_Capacity_Planning_${suffix}_${data.meta.year}.pdf`, { returnPromise: true });
}
