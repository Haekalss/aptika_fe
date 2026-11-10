import ExcelJS from "exceljs";
import type { Fr026Asset, Fr026Category, Fr026Dashboard } from "@/services/smki/capacityPlanning.types";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const LAST_COLUMN = "M";

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  left: { style: "thin", color: { argb: "FFCBD5E1" } },
  right: { style: "thin", color: { argb: "FFCBD5E1" } },
  top: { style: "thin", color: { argb: "FFCBD5E1" } },
  bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
};

const GREEN_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
const ACTIVE_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };

function cell(asset: Fr026Asset, month: number) {
  return asset.logs.find((log) => log.month === month);
}

function dateLabel(value?: string | null): string {
  if (!value) return "Belum diisi";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function metricRows(category: Fr026Category): Array<{ label: string; value: (asset: Fr026Asset, month: number) => number | string }> {
  if (category === "server") {
    return [
      { label: "Current · Storage (GB)", value: (asset, month) => cell(asset, month)?.current_storage_gb ?? "—" },
      { label: "Current · Memory (%)", value: (asset, month) => cell(asset, month)?.current_memory_pct ?? "—" },
      { label: "Current · CPU Usage (%)", value: (asset, month) => cell(asset, month)?.current_cpu_pct ?? "—" },
      { label: "Projection · Storage (GB)", value: (asset, month) => cell(asset, month)?.projection_storage_gb ?? "—" },
      { label: "Projection · Memory (%)", value: (asset, month) => cell(asset, month)?.projection_memory_pct ?? "—" },
      { label: "Projection · CPU Usage (%)", value: (asset, month) => cell(asset, month)?.projection_cpu_pct ?? "—" },
    ];
  }
  return [
    { label: "Bandwidth · Kapasitas (Mbps)", value: (asset, month) => cell(asset, month)?.bandwidth_capacity_mbps ?? "—" },
    { label: "Bandwidth · Max Pemakaian (Mbps)", value: (asset, month) => cell(asset, month)?.bandwidth_max_usage_mbps ?? "—" },
    { label: "Bandwidth · % Pemakaian", value: (asset, month) => {
      const value = cell(asset, month)?.bandwidth_usage_pct;
      return value == null ? "—" : `${value.toFixed(1)}%`;
    } },
    { label: "Up Time · Perjanjian SLA (%)", value: (asset, month) => cell(asset, month)?.sla_agreement_pct ?? "—" },
    { label: "Up Time · Capaian SLA (%)", value: (asset, month) => cell(asset, month)?.sla_achievement_pct ?? "—" },
    { label: "Keterangan", value: (asset, month) => cell(asset, month)?.notes || "—" },
  ];
}

function borderRow(ws: ExcelJS.Worksheet, rowNumber: number) {
  for (let column = 1; column <= 13; column += 1) {
    ws.getRow(rowNumber).getCell(column).border = THIN_BORDER as ExcelJS.Borders;
  }
}

export async function exportFr026Excel(data: Fr026Dashboard, categories: Fr026Category[]): Promise<void> {
  const selected = categories.length ? categories : (["server", "network"] as Fr026Category[]);
  const wb = new ExcelJS.Workbook();
  wb.creator = "SMKI APTIKA";

  selected.forEach((category) => {
    const meta = data.meta.documents[category];
    const label = category === "server" ? "Server" : "Network";
    const assets = data.assets.filter((asset) => asset.category === category);
    const ws = wb.addWorksheet(label, {
      pageSetup: { paperSize: 5, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      views: [{ state: "frozen", xSplit: 1, ySplit: 5 }],
    });
    ws.columns = [
      { width: 38 },
      ...Array.from({ length: 12 }, () => ({ width: 10.5 })),
    ];

    // Title
    ws.mergeCells(`A1:${LAST_COLUMN}1`);
    const title = ws.getCell("A1");
    title.value = "FORMULIR CAPACITY PLANNING";
    title.font = { name: "Arial", size: 15, bold: true };
    title.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 26;

    ws.mergeCells(`A2:${LAST_COLUMN}2`);
    const subtitle = ws.getCell("A2");
    subtitle.value = `${label.toUpperCase()} • TAHUN ${data.meta.year}`;
    subtitle.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF475569" } };
    subtitle.alignment = { horizontal: "center", vertical: "middle" };

    // Document metadata
    const metadata: Array<[string, string, string, string]> = [
      ["A3", "Nomor dokumen", "B3", meta.code],
      ["E3", "Revisi", "F3", meta.revision],
      ["G3", "Tanggal", "H3", dateLabel(meta.tanggal)],
      ["J3", "Last Update", "K3", dateLabel(meta.last_update)],
    ];
    metadata.forEach(([labelAddress, label, valueAddress, value]) => {
      ws.getCell(labelAddress).value = label;
      ws.getCell(labelAddress).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF64748B" } };
      ws.getCell(valueAddress).value = value;
      ws.getCell(valueAddress).font = { name: "Arial", size: 9 };
    });
    ws.mergeCells("B3:D3");
    ws.mergeCells("H3:I3");
    ws.mergeCells("K3:M3");
    ws.getRow(3).height = 18;

    // Table header
    const headerRow = 5;
    const header = ws.getRow(headerRow);
    header.getCell(1).value = "Kelompok / parameter";
    SHORT_MONTHS.forEach((month, index) => {
      header.getCell(index + 2).value = month;
    });
    for (let column = 1; column <= 13; column += 1) {
      const cellValue = header.getCell(column);
      cellValue.font = { name: "Arial", size: 9, bold: true, color: { argb: column === data.meta.month + 1 ? "FFFFFFFF" : "FF1E293B" } };
      cellValue.alignment = { horizontal: column === 1 ? "left" : "center", vertical: "middle" };
      cellValue.fill = column === data.meta.month + 1 ? GREEN_FILL : HEADER_FILL;
      cellValue.border = THIN_BORDER as ExcelJS.Borders;
    }
    header.height = 20;

    let row = headerRow + 1;

    if (!assets.length) {
      ws.mergeCells(`A${row}:${LAST_COLUMN}${row}`);
      const empty = ws.getCell(`A${row}`);
      empty.value = `Belum ada aset ${label} pada tahun ${data.meta.year}.`;
      empty.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF64748B" } };
      empty.alignment = { horizontal: "center" };
      borderRow(ws, row);
      row += 1;
    }

    assets.forEach((asset, assetIndex) => {
      ws.mergeCells(`A${row}:${LAST_COLUMN}${row}`);
      const group = ws.getCell(`A${row}`);
      group.value = `No. ${String(assetIndex + 1).padStart(2, "0")}   ${asset.asset_name}   IP: ${asset.ip_address || "—"}`;
      group.font = { name: "Arial", size: 10, bold: true };
      group.fill = HEADER_FILL;
      group.alignment = { horizontal: "left", vertical: "middle" };
      borderRow(ws, row);
      row += 1;

      metricRows(category).forEach((metric) => {
        ws.getCell(`A${row}`).value = metric.label;
        ws.getCell(`A${row}`).font = { name: "Arial", size: 9.5 };
        ws.getCell(`A${row}`).alignment = { horizontal: "left", vertical: "middle" };
        for (let month = 1; month <= 12; month += 1) {
          const target = ws.getCell(row, month + 1);
          target.value = metric.value(asset, month);
          target.font = { name: "Arial", size: 9.5, bold: month === data.meta.month };
          target.alignment = { horizontal: "center", vertical: "middle" };
          if (month === data.meta.month) target.fill = ACTIVE_FILL;
        }
        borderRow(ws, row);
        row += 1;
      });
    });

    row += 1;
    ws.mergeCells(`A${row}:${LAST_COLUMN}${row}`);
    const footer = ws.getCell(`A${row}`);
    footer.value = category === "server"
      ? "Current adalah hasil pengukuran; Projection adalah estimasi yang dicatat pengguna."
      : "% Pemakaian = Max Pemakaian ÷ Kapasitas × 100. Perjanjian dan Capaian SLA dipantau terpisah dari pemakaian bandwidth.";
    footer.font = { name: "Arial", size: 8.5, italic: true, color: { argb: "FF64748B" } };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `FR-026_Capacity_Planning_${data.meta.year}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
