import {
  DEFAULT_NOMOR_DOKUMEN,
  JENIS_OPTIONS,
  RISIKO_OPTIONS,
  formatRentangJam,
  formatRupiah,
  formatTanggal,
  muatSpesimen, // BARU
  type PerubahanIt,
  type SpesimenTte, // BARU
} from "@/services/smki/perubahanIt";
// import { LOGO_BASE64 } from "./perubahanItLogo";

/* Ukuran diambil langsung dari template FR-015_Formulir_Perubahan_TI.docx (satuan twips/DXA). */
const COLS = [3534, 1847, 5381];
const TOTAL = 10762;
const HEADER_COLS = [1260, 6084, 1204, 250, 1964];

const NAVY = "1F3864";
const val = (v?: string | null) => (v && v.trim() ? v : "");
const box = (on: boolean) => (on ? "☒" : "☐");
const today = () => new Date().toISOString().slice(0, 10);

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function loadLogoBytes(): Promise<Uint8Array> {
  const response = await fetch("/logo-diskominfo-jabar.png");

  if (!response.ok) {
    throw new Error("Gagal memuat logo Diskominfo Jabar.");
  }

  const buffer = await response.arrayBuffer();

  return new Uint8Array(buffer);
}

export interface PerubahanItDocxOptions {
  /** Nama berkas tanpa ekstensi. */
  filename?: string;
}

/**
 * Membuat dokumen Word (.docx) Formulir Permintaan Perubahan TI (FR-015).
 * Tata letak mengikuti template resmi: kop (logo + nomor dokumen), bilah biru tua,
 * tabel 3 kolom, dan blok tanda tangan 2x2. Satu formulir per bagian (halaman).
 */
export async function buildPerubahanItDocx(items: PerubahanIt[]) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Header,
    HorizontalPositionRelativeFrom,
    ImageRun,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    TextWrappingType,
    VerticalAlign,
    VerticalMergeType,
    VerticalPositionRelativeFrom,
    WidthType,
    HeightRule,
  } = await import("docx");

  const logoBytes = await loadLogoBytes();

  const spesimen = await muatSpesimen(
    items.flatMap((i) => [i.created_by, i.diterima_oleh_id, i.disetujui_oleh_id, i.dilaksanakan_oleh_id])
  );
  const ttdDari = (id?: number | null) => (id ? spesimen.get(id) ?? null : null);

  const FONT = "Arial";
  const SYMBOL_FONT = "MS Gothic";
  const single = { style: BorderStyle.SINGLE, size: 4, space: 0, color: "000000" };
  const none = { style: BorderStyle.NONE, size: 0, space: 0, color: "auto" };
  const allBorders = { top: single, bottom: single, left: single, right: single };

  const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string; font?: string } = {}) =>
    new TextRun({
      text,
      bold: o.bold,
      italics: o.italics,
      size: o.size ?? 24,
      color: o.color,
      font: o.font ?? FONT,
    });

  /** Teks multi-baris menjadi paragraf terpisah (spacing after 0 seperti template). */
  const paras = (text: string, o: { bold?: boolean; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) => {
    const lines = text ? text.split("\n") : [""];
    return lines.map(
      (t) =>
        new Paragraph({
          alignment: o.align,
          spacing: { after: 0, line: 240 },
          children: t ? [run(t, { bold: o.bold, size: o.size })] : [],
        })
    );
  };

  const labelCell = (children: any[]) =>
    new TableCell({
      width: { size: COLS[0], type: WidthType.DXA },
      borders: allBorders,
      verticalAlign: VerticalAlign.CENTER,
      children,
    });

  const valueCell = (children: any[]) =>
    new TableCell({
      width: { size: COLS[1] + COLS[2], type: WidthType.DXA },
      columnSpan: 2,
      borders: allBorders,
      verticalAlign: VerticalAlign.CENTER,
      children,
    });

  /** Baris label-isi. `minHeight` dalam twips (atLeast), sesuai tinggi baris pada template. */
  const row = (label: any[] | string, value: any[] | string, minHeight = 612) =>
    new TableRow({
      cantSplit: true,
      height: { value: minHeight, rule: HeightRule.ATLEAST },
      children: [
        labelCell(typeof label === "string" ? paras(label, { bold: true }) : label),
        valueCell(typeof value === "string" ? paras(value) : value),
      ],
    });

  const bar = (text: string) =>
    new TableRow({
      cantSplit: true,
      height: { value: 445, rule: HeightRule.ATLEAST },
      children: [
        new TableCell({
          width: { size: TOTAL, type: WidthType.DXA },
          columnSpan: 3,
          borders: allBorders,
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
          children: [
            new Paragraph({ spacing: { after: 0, line: 240 }, children: [run(text, { bold: true, color: "FFFFFF" })] }),
          ],
        }),
      ],
    });

  const sigCell = (
  width: number,
  span: number | undefined,
  tanggal: string | null,
  judul: string,
  jabatan: string,
  nama: string | null,
  ttd: SpesimenTte | null
) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    borders: allBorders,
    children: [
      ...[`Tanggal: ${tanggal ? formatTanggal(tanggal) : ""}`, judul, jabatan].map(
        (t) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0, line: 240 },
            run: { font: FONT, size: 20 },
            children: [run(t, { size: 20 })],
          })
      ),
      // Pola FR-008: bila spesimen TTE ada, nama tidak ditulis ulang
      // (sudah tercantum di dalam kotak spesimen).
      ttd
        ? new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120, line: 240 },
            children: [
              new ImageRun({
                type: ttd.type,
                data: ttd.bytes,
                transformation: { width: ttd.width, height: ttd.height },
              }),
            ],
          })
        : new Paragraph({
            spacing: { after: 240 },
            run: { font: FONT, size: 20 },
            children: [new TextRun({ text: "", break: 5, size: 20, font: FONT })],
          }),
      ...(ttd
        ? []
        : [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, line: 240 },
              run: { font: FONT, size: 20 },
              children: [run(`(${nama?.trim() || "……………………………"})`, { size: 20 })],
            }),
          ]),
    ],
  });

  const sigRow = (left: any, right: any) =>
    new TableRow({ cantSplit: true, height: { value: 2700, rule: HeightRule.ATLEAST }, children: [left, right] });

  /* ---------------- Kop (header) — logo + judul + nomor dokumen ---------------- */
  const hb = { top: single, bottom: single, left: single, right: single };
  const hText = (t: string, align?: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    new Paragraph({ alignment: align, spacing: { after: 0, line: 240 }, run: { font: FONT, size: 16 }, children: [run(t, { size: 16 })] });
  const hCell = (i: number, t: string, align?: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    new TableCell({
      width: { size: HEADER_COLS[i], type: WidthType.DXA },
      borders: hb,
      verticalAlign: VerticalAlign.CENTER,
      children: [hText(t, align)],
    });
  const hRow = (a: string, c: string, first = false) =>
    new TableRow({
      cantSplit: true,
      height: { value: 445, rule: HeightRule.ATLEAST },
      children: [
        new TableCell({
          width: { size: HEADER_COLS[0], type: WidthType.DXA },
          borders: hb,
          verticalMerge: first ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
          children: [
            new Paragraph({
              spacing: { after: 60, line: 240 },
              children: first
                ? [
                    new ImageRun({
                      type: "png",
                      data: logoBytes,
                      transformation: { width: 67, height: 88 },
                      floating: {
                        horizontalPosition: { relative: HorizontalPositionRelativeFrom.COLUMN, offset: 15240 },
                        verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: -1270 },
                        wrap: { type: TextWrappingType.NONE },
                        allowOverlap: true,
                      },
                    }),
                  ]
                : [],
            }),
          ],
        }),
        new TableCell({
          width: { size: HEADER_COLS[1], type: WidthType.DXA },
          borders: hb,
          verticalMerge: first ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 0, line: 240 },
              run: { font: FONT, size: 28 },
              children: first ? [run("FORMULIR PERMINTAAN PERUBAHAN TI ", { bold: true, size: 28 })] : [],
            }),
          ],
        }),
        hCell(2, a),
        hCell(3, ":", AlignmentType.CENTER),
        hCell(4, c),
      ],
    });

  /** BARU: kop dibuat per formulir supaya No. Dokumen mengikuti data. */
  const buildHeader = (nomorDokumen: string) =>
    new Header({
      children: [
        new Table({
          width: { size: 10762, type: WidthType.DXA },
          columnWidths: HEADER_COLS,
          layout: TableLayoutType.FIXED,
          borders: { top: single, bottom: single, left: single, right: single, insideHorizontal: single, insideVertical: single },
          rows: [
            hRow("No. Dokumen", nomorDokumen, true),
            hRow("No. Revisi", "1.1"),
            hRow("Tanggal Berlaku", "28 April 2022"),
          ],
        }),
        new Paragraph({ children: [] }),
      ],
    });

  /* ---------------- Isi formulir ---------------- */
  const sections = items.map((item) => {
    const jenisLine = new Paragraph({
      spacing: { after: 0, line: 240 },
      children: JENIS_OPTIONS.flatMap((o, i) => [
        run(box(item.jenis_perubahan === o.value), { font: SYMBOL_FONT }),
        run(` ${o.label}${i < JENIS_OPTIONS.length - 1 ? "  " : ""}`),
      ]),
    });

    const rk = (v: string) => RISIKO_OPTIONS.find((o) => o.value === v)!;
    const rkRun = (v: string, gap = "") => [
      run(box(item.tingkat_risiko === v), { font: SYMBOL_FONT }),
      run(` ${rk(v).label}${gap}`),
    ];
    const risikoCell = [
      new Paragraph({ spacing: { after: 240, line: 240 }, children: [run("Kriteria:", { bold: true })] }),
      new Paragraph({
        spacing: { after: 0, line: 240 },
        children: [...rkRun("malapetaka", "      "), ...rkRun("sangat_berat", "   "), ...rkRun("berat")],
      }),
      new Paragraph({
        spacing: { after: 0, line: 240 },
        children: [...rkRun("agak_berat", "      "), ...rkRun("tidak_berat")],
      }),
      new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
      new Paragraph({ spacing: { after: 120, line: 240 }, children: [run("Keterangan:", { bold: true })] }),
      ...paras(val(item.keterangan_risiko)),
      new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
    ];

    const lampiran = item.lampiran.length ? item.lampiran.map((l, i) => `${i + 1}. ${l.nama_asli}`).join("\n") : "";
    const jam = formatRentangJam(item.jam_mulai, item.jam_selesai);
    const waktu = item.tanggal_perubahan ? `${formatTanggal(item.tanggal_perubahan)}${jam ? `, ${jam}` : ""}` : "";
    const biaya = item.estimasi_biaya != null ? formatRupiah(item.estimasi_biaya) : "";

    const table = new Table({
      width: { size: TOTAL, type: WidthType.DXA },
      indent: { size: 5, type: WidthType.DXA },
      columnWidths: COLS,
      layout: TableLayoutType.FIXED,
      rows: [
        // Baris "No. RFC": tanpa garis kiri/kanan/atas, hanya garis bawah (seperti template)
        new TableRow({
          cantSplit: true,
          height: { value: 445, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              width: { size: TOTAL, type: WidthType.DXA },
              columnSpan: 3,
              borders: { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 4, space: 0, color: "auto" } },
              children: [
                new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
                new Paragraph({
                  spacing: { after: 0, line: 240 },
                  children: [run("No. RFC ", { bold: true }), run(item.no_rfc ? `: ${item.no_rfc}` : "")],
                }),
              ],
            }),
          ],
        }),
        bar("Informasi Pemohon"),
        row("Pemohon", val(item.pemohon)),
        row("Unit Kerja", val(item.unit_kerja)),
        row("Perangkat Daerah", val(item.perangkat_daerah)),
        row(
          [
            new Paragraph({
              spacing: { after: 0, line: 240 },
              children: [run("Nomor Surat/", { bold: true }), run("Contact Person", { bold: true, italics: true })],
            }),
          ],
          val(item.nomor_surat_kontak)
        ),
        bar("Informasi Data"),
        row("Jenis Perubahan", [jenisLine]),
        row("Perubahan yang diharapkan", val(item.perubahan_diharapkan)),
        row("Latar belakang perubahan", val(item.latar_belakang)),
        row("Rincian atas perubahan yang diajukan", val(item.rincian_perubahan)),
        row("Risiko terkait bila perubahan tidak dilakukan", risikoCell, 2500),
        row("Solusi yang diharapkan", val(item.solusi_diharapkan)),
        row("Risiko Perubahan", val(item.risiko_perubahan), 900),
        row("Alternatif Perubahan", val(item.alternatif_perubahan), 900),
        row("Biaya Perubahan", biaya, 900),
        row("Waktu Perubahan", waktu, 900),
        row("Lampiran", lampiran, 900),
        sigRow(
          sigCell(COLS[0] + COLS[1], 2, item.tanggal_diajukan, "Dibuat Oleh:", "Pemohon,", item.pemohon, ttdDari(item.created_by)),
          sigCell(COLS[2], undefined, item.diterima_pada, "Diterima Oleh:", "Koordinator Agen,", item.diterima_oleh_nama, ttdDari(item.diterima_oleh_id))
        ),
        sigRow(
          sigCell(COLS[0] + COLS[1], 2, item.disetujui_pada, "Disetujui Oleh:", "Penanggung Jawab Perangkat,", item.disetujui_oleh_nama, ttdDari(item.disetujui_oleh_id)),
          sigCell(
            COLS[2],
            undefined,
            item.tanggal_pelaksanaan ?? item.dilaksanakan_pada,
            "Dilaksanakan Oleh:",
            "Agen,",
            item.dilaksanakan_oleh_nama,
            ttdDari(item.dilaksanakan_oleh_id)
          )
        ),
      ],
    });

    return {
      // BARU: nomor dokumen kop mengikuti data formulir (fallback ke default)
      headers: { default: buildHeader(val(item.nomor_dokumen) || DEFAULT_NOMOR_DOKUMEN) },
      // Ukuran halaman & margin sama dengan template (A4; kiri 709, kanan 1440, header 708).
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1440, bottom: 284, left: 709, header: 708, footer: 708 },
        },
      },
      children: [table, new Paragraph({ children: [] })],
    };
  });

  return new Document({
    creator: "Aptika Tools",
    title: "Formulir Permintaan Perubahan TI (FR-015)",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 24 },
          paragraph: { spacing: { after: 160, line: 259 } },
        },
      },
    },
    sections,
  });
}

/** Mengunduh formulir sebagai .docx. Mengembalikan jumlah formulir yang diekspor. */
export async function exportPerubahanItDocx(items: PerubahanIt[], options: PerubahanItDocxOptions = {}): Promise<number> {
  if (items.length === 0) throw new Error("Tidak ada data perubahan TI yang cocok untuk diekspor.");

  const { Packer } = await import("docx");
  const blob = await Packer.toBlob(await buildPerubahanItDocx(items));

  const name =
    options.filename ?? (items.length === 1 ? items[0].no_rfc.replace(/[^\w-]+/g, "_") : `Perubahan_IT_${today()}`);

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