import {
  JENIS_OPTIONS,
  RISIKO_OPTIONS,
  formatRentangJam,
  formatRupiah,
  formatTanggal,
  type PerubahanIt,
} from "@/services/smki/perubahanIt";

const dash = (v?: string | null) => (v && v.trim() ? v : "-");
const box = (on: boolean) => (on ? "☒" : "☐");
const today = () => new Date().toISOString().slice(0, 10);

/** Lebar kolom dalam twips (A4 - margin 2 cm = 9638, dibulatkan). */
const COLS = [3000, 4000, 2600];
const TOTAL = COLS[0] + COLS[1] + COLS[2];

export interface PerubahanItDocxOptions {
  /** Nama berkas tanpa ekstensi. */
  filename?: string;
}

/**
 * Membuat dokumen Word (.docx) Formulir Permintaan Perubahan TI (FR-015).
 * Satu formulir per halaman; mengikuti tata letak template: tabel 3 kolom + 2 baris tanda tangan.
 */
export async function buildPerubahanItDocx(items: PerubahanIt[]) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
  } = await import("docx");

  const FONT = "Arial";
  const line = { style: BorderStyle.SINGLE, size: 4, color: "555555" };
  const borders = { top: line, bottom: line, left: line, right: line };

  const lines = (text: string, bold = false, size = 20) =>
    text.split("\n").map(
      (t) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: t, bold, size, font: FONT })] })
    );

  const cell = (text: string, width: number, opts: { bold?: boolean; span?: number; fill?: string; minHeight?: number } = {}) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      columnSpan: opts.span,
      borders,
      verticalAlign: VerticalAlign.TOP,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: "auto" } : undefined,
      children: lines(text, opts.bold),
    });

  const row = (label: string, value: string, height?: number) =>
    new TableRow({
      height: height ? { value: height, rule: "atLeast" as never } : undefined,
      children: [cell(label, COLS[0], { bold: true }), cell(value, COLS[1] + COLS[2], { span: 2 })],
    });

  const section = (text: string) =>
    new TableRow({ children: [cell(text, TOTAL, { bold: true, span: 3, fill: "E2F0EA" })] });

  const tanda = (tanggal: string | null, judul: string, jabatan: string, nama: string | null) =>
    `Tanggal: ${tanggal ? formatTanggal(tanggal) : ""}\n\n${judul}\n\n${jabatan}\n\n\n(${nama?.trim() || "……………………………"})`;

  const ttdRow = (left: string, right: string) =>
    new TableRow({
      height: { value: 1900, rule: "atLeast" as never },
      children: [cell(left, COLS[0] + COLS[1], { span: 2 }), cell(right, COLS[2])],
    });

  const sections = items.map((item) => {
    const jenis = JENIS_OPTIONS.map((o) => `${box(item.jenis_perubahan === o.value)} ${o.label}`).join("    ");
    const risiko =
      "Kriteria:\n" +
      RISIKO_OPTIONS.map((o) => `${box(item.tingkat_risiko === o.value)} ${o.label}`).join("    ") +
      `\n\nKeterangan: ${item.keterangan_risiko?.trim() || "-"}`;
    const lampiran = item.lampiran.length ? item.lampiran.map((l, i) => `${i + 1}. ${l.nama_asli}`).join("\n") : "-";
    const waktu = item.tanggal_perubahan
      ? `${formatTanggal(item.tanggal_perubahan)}${
          formatRentangJam(item.jam_mulai, item.jam_selesai) ? `, ${formatRentangJam(item.jam_mulai, item.jam_selesai)}` : ""
        }`
      : "-";

    const table = new Table({
      width: { size: TOTAL, type: WidthType.DXA },
      columnWidths: COLS,
      rows: [
        row("No. RFC", item.no_rfc),
        row("Judul Perubahan", dash(item.judul)),
        section("Informasi Pemohon"),
        row("Pemohon", dash(item.pemohon)),
        row("Unit Kerja", dash(item.unit_kerja)),
        row("Perangkat Daerah", dash(item.perangkat_daerah)),
        row("Nomor Surat/Contact Person", dash(item.nomor_surat_kontak)),
        section("Informasi Data"),
        row("Jenis Perubahan", jenis),
        row("Perubahan yang diharapkan", dash(item.perubahan_diharapkan)),
        row("Latar belakang perubahan", dash(item.latar_belakang)),
        row("Rincian atas perubahan yang diajukan", dash(item.rincian_perubahan)),
        row("Risiko terkait bila perubahan tidak dilakukan", risiko),
        row("Solusi yang diharapkan", dash(item.solusi_diharapkan)),
        row("Risiko Perubahan", dash(item.risiko_perubahan)),
        row("Alternatif Perubahan", dash(item.alternatif_perubahan)),
        row("Biaya Perubahan", formatRupiah(item.estimasi_biaya)),
        row("Waktu Perubahan", waktu),
        row("Lampiran", lampiran),
        ttdRow(
          tanda(item.tanggal_diajukan, "Dibuat Oleh:", "Pemohon,", item.pemohon),
          tanda(item.diterima_pada, "Diterima Oleh:", "Koordinator Agen,", item.diterima_oleh_nama)
        ),
        ttdRow(
          tanda(item.disetujui_pada, "Disetujui Oleh:", "Penanggung Jawab Perangkat,", item.disetujui_oleh_nama),
          tanda(item.tanggal_pelaksanaan ?? item.dilaksanakan_pada, "Dilaksanakan Oleh:", "Agen,", item.dilaksanakan_oleh_nama)
        ),
      ],
    });

    return {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 851, bottom: 851, left: 1134, right: 1134 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "FORMULIR PERMINTAAN PERUBAHAN TI", bold: true, size: 26, font: FONT })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "FR-015 · Request for Change (RFC)", size: 18, font: FONT })],
        }),
        table,
      ],
    };
  });

  return new Document({
    creator: "Aptika Tools",
    title: "Formulir Permintaan Perubahan TI (FR-015)",
    sections,
  });
}

/** Mengunduh formulir sebagai .docx. Mengembalikan jumlah formulir yang diekspor. */
export async function exportPerubahanItDocx(items: PerubahanIt[], options: PerubahanItDocxOptions = {}): Promise<number> {
  if (items.length === 0) throw new Error("Tidak ada data perubahan TI yang cocok untuk diekspor.");

  const { Packer } = await import("docx");
  const blob = await Packer.toBlob(await buildPerubahanItDocx(items));

  const name =
    options.filename ??
    (items.length === 1 ? items[0].no_rfc.replace(/[^\w-]+/g, "_") : `Perubahan_IT_${today()}`);

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

  return items.length;
}
