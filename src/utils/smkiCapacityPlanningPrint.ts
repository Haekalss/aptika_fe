import type { Fr026Asset, Fr026Category, Fr026Dashboard } from "@/services/smki/capacityPlanning.types";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dateLabel(value?: string | null): string {
  if (!value) return "Belum diisi";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function cell(asset: Fr026Asset, month: number) {
  return asset.logs.find((log) => log.month === month);
}

function metricRows(category: Fr026Category): Array<{ label: string; value: (asset: Fr026Asset, month: number) => string }> {
  const text = (value: number | null | undefined, digits = 2) =>
    value == null ? "—" : value.toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  if (category === "server") {
    return [
      { label: "Current · Storage (GB)", value: (asset, month) => text(cell(asset, month)?.current_storage_gb, 0) },
      { label: "Current · Memory (%)", value: (asset, month) => text(cell(asset, month)?.current_memory_pct, 0) },
      { label: "Current · CPU Usage (%)", value: (asset, month) => text(cell(asset, month)?.current_cpu_pct, 0) },
      { label: "Projection · Storage (GB)", value: (asset, month) => text(cell(asset, month)?.projection_storage_gb, 0) },
      { label: "Projection · Memory (%)", value: (asset, month) => text(cell(asset, month)?.projection_memory_pct, 0) },
      { label: "Projection · CPU Usage (%)", value: (asset, month) => text(cell(asset, month)?.projection_cpu_pct, 0) },
    ];
  }
  return [
    { label: "Bandwidth · Kapasitas (Mbps)", value: (asset, month) => text(cell(asset, month)?.bandwidth_capacity_mbps, 0) },
    { label: "Bandwidth · Max Pemakaian (Mbps)", value: (asset, month) => text(cell(asset, month)?.bandwidth_max_usage_mbps, 0) },
    { label: "Bandwidth · % Pemakaian", value: (asset, month) => {
      const value = cell(asset, month)?.bandwidth_usage_pct;
      return value == null ? "—" : `${text(value, 1)}%`;
    } },
    { label: "Up Time · Perjanjian SLA (%)", value: (asset, month) => text(cell(asset, month)?.sla_agreement_pct) },
    { label: "Up Time · Capaian SLA (%)", value: (asset, month) => text(cell(asset, month)?.sla_achievement_pct) },
    { label: "Keterangan", value: (asset, month) => cell(asset, month)?.notes || "—" },
  ];
}

function categoryTable(data: Fr026Dashboard, category: Fr026Category): string {
  const meta = data.meta.documents[category];
  const assets = data.assets.filter((asset) => asset.category === category);
  const label = category === "server" ? "SERVER" : "NETWORK";
  const rows = metricRows(category);
  const monthHeaders = SHORT_MONTHS.map((month, index) =>
    `<th class="${index + 1 === data.meta.month ? "active" : ""}">${month}</th>`
  ).join("");

  const body = assets.length
    ? assets.map((asset, assetIndex) => `
      <tr class="group"><th colspan="13">No. ${String(assetIndex + 1).padStart(2, "0")} &nbsp; ${escapeHtml(asset.asset_name)} &nbsp; IP: ${escapeHtml(asset.ip_address || "—")}</th></tr>
      ${rows.map((row) => `
        <tr>
          <th class="parameter">${escapeHtml(row.label)}</th>
          ${Array.from({ length: 12 }, (_, index) => `<td class="${index + 1 === data.meta.month ? "active" : ""}">${escapeHtml(row.value(asset, index + 1))}</td>`).join("")}
        </tr>`).join("")}
    `).join("")
    : `<tr><td colspan="13" class="empty">Belum ada aset ${category === "server" ? "Server" : "Network"} pada tahun ${data.meta.year}.</td></tr>`;

  return `
    <section class="document">
      <header>
        <div class="identity">
          <img src="/logo-jabar.png" alt="Logo Jawa Barat" />
          <div>
            <h1>FORMULIR CAPACITY PLANNING</h1>
            <p>${label} • TAHUN ${data.meta.year}</p>
          </div>
        </div>
        <p class="revision">Revisi ${escapeHtml(meta.revision)}</p>
      </header>
      <div class="meta">
        <div><span>Nomor dokumen</span><strong>${escapeHtml(meta.code)}</strong></div>
        <div><span>Tanggal</span><strong>${escapeHtml(dateLabel(meta.tanggal))}</strong></div>
        <div><span>Last Update</span><strong>${escapeHtml(dateLabel(meta.last_update))}</strong></div>
      </div>
      <table>
        <thead><tr><th class="parameter">Kelompok / parameter</th>${monthHeaders}</tr></thead>
        <tbody>${body}</tbody>
      </table>
      <footer>
        <span>${assets.length} aset • Jan–Des ${data.meta.year}</span>
        <span>FR-026 Capacity Planning</span>
      </footer>
    </section>`;
}

export function printFr026Report(data: Fr026Dashboard, categories: Fr026Category[]): void {
  const target = window.open("", "_blank");
  if (!target) throw new Error("Jendela cetak diblokir peramban. Izinkan pop-up untuk mencetak laporan.");
  target.opener = null;

  const documents = (categories.length ? categories : (["server", "network"] as Fr026Category[]))
    .map((category) => categoryTable(data, category))
    .join("");

  target.document.write(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>FR-026 Capacity Planning ${data.meta.year}</title>
  <style>
    @page { size: legal landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; }
    .document { page-break-after: always; }
    .document:last-child { page-break-after: auto; }
    header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 2px solid #047857; padding-bottom: 8px; }
    .identity { display: flex; align-items: center; gap: 12px; }
    .identity img { width: 42px; height: 48px; object-fit: contain; }
    h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
    header p { margin: 2px 0 0; font-size: 11px; font-weight: 700; color: #475569; }
    .revision { font-size: 11px; font-weight: 700; }
    .meta { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 32px; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding: 8px 0; font-size: 10px; }
    .meta div { display: flex; flex-direction: column; gap: 2px; }
    .meta span { color: #64748b; }
    .meta strong { font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9px; }
    th, td { border: 1px solid #cbd5e1; padding: 4px 3px; text-align: center; }
    thead th { background: #f1f5f9; font-size: 8.5px; }
    thead th.active { background: #047857; color: #fff; }
    th.parameter { width: 190px; text-align: left; font-weight: 600; }
    tr.group th { background: #f1f5f9; text-align: left; font-weight: 700; font-size: 9.5px; }
    td.active { background: #ecfdf5; color: #064e3b; font-weight: 700; }
    td.empty { padding: 24px; color: #64748b; }
    footer { display: flex; justify-content: space-between; gap: 16px; margin-top: 8px; font-size: 8px; color: #64748b; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>${documents}</body>
</html>`);
  target.document.close();
  target.focus();
  target.print();
}
