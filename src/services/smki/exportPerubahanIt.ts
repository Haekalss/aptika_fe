import {
  JENIS_OPTIONS,
  RISIKO_OPTIONS,
  formatRentangJam,
  formatRupiah,
  formatTanggal,
  type PerubahanIt,
} from "@/services/smki/perubahanIt";

const dash = (v?: string | null) => (v && v.trim() ? v : "-");
const box = (checked: boolean) => (checked ? "[X]" : "[ ]");

/**
 * Cetak Formulir Permintaan Perubahan TI (FR-015) ke PDF A4 portrait,
 * mengikuti tata letak template: tabel 3 kolom + 2 baris tanda tangan.
 */
export async function exportPerubahanItPdf(item: PerubahanIt): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("FORMULIR PERMINTAAN PERUBAHAN TI", 105, 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("FR-015 · Request for Change (RFC)", 105, 19.5, { align: "center" });

  const section = (text: string) => [
    {
      content: text,
      colSpan: 3,
      styles: { fontStyle: "bold" as const, fillColor: [226, 240, 234] as [number, number, number] },
    },
  ];

  const row = (label: string, value: string) => [
    { content: label, styles: { fontStyle: "bold" as const } },
    { content: value, colSpan: 2 },
  ];

  const jenis = JENIS_OPTIONS.map((o) => `${box(item.jenis_perubahan === o.value)} ${o.label}`).join("    ");

  const risiko =
    "Kriteria:\n" +
    RISIKO_OPTIONS.map((o) => `${box(item.tingkat_risiko === o.value)} ${o.label}`).join("    ") +
    `\n\nKeterangan: ${item.keterangan_risiko?.trim() || "-"}`;

  const lampiran =
    item.lampiran.length > 0 ? item.lampiran.map((l, i) => `${i + 1}. ${l.nama_asli}`).join("\n") : "-";

  const tanda = (
    tanggal: string | null,
    judul: string,
    jabatan: string,
    nama: string | null
  ) => `Tanggal: ${tanggal ? formatTanggal(tanggal) : ""}\n\n${judul}\n\n${jabatan}\n\n\n\n(${nama?.trim() || "……………………………"})`;

  const ttd = (content: string, colSpan = 1) => ({
    content,
    colSpan,
    styles: { minCellHeight: 42, valign: "top" as const },
  });

  autoTable(doc, {
    startY: 24,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "top",
      lineColor: [90, 90, 90],
      lineWidth: 0.2,
      textColor: 20,
    },
    columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 78 }, 2: { cellWidth: 50 } },
    margin: { left: 15, right: 15 },
    body: [
      row("No. RFC", item.no_rfc),
      row("Judul Perubahan", dash(item.judul)),
      section("Informasi Pemohon"),
      row("Pemohon", dash(item.pemohon)),
      row("Unit Kerja", dash(item.unit_kerja)),
      row("Perangkat Daerah", dash(item.perangkat_daerah)),
      row("Nomor Surat / Contact Person", dash(item.nomor_surat_kontak)),
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
      row(
        "Waktu Perubahan",
        item.tanggal_perubahan
          ? `${formatTanggal(item.tanggal_perubahan)}${
              formatRentangJam(item.jam_mulai, item.jam_selesai) ? `, ${formatRentangJam(item.jam_mulai, item.jam_selesai)}` : ""
            }`
          : "-"
      ),
      row("Lampiran", lampiran),
      [
        ttd(tanda(item.tanggal_diajukan, "Dibuat Oleh:", "Pemohon,", item.pemohon), 2),
        ttd(tanda(item.diterima_pada, "Diterima Oleh:", "Koordinator Agen,", item.diterima_oleh_nama)),
      ],
      [
        ttd(tanda(item.disetujui_pada, "Disetujui Oleh:", "Penanggung Jawab Perangkat,", item.disetujui_oleh_nama), 2),
        ttd(
          tanda(
            item.tanggal_pelaksanaan ?? item.dilaksanakan_pada,
            "Dilaksanakan Oleh:",
            "Agen,",
            item.dilaksanakan_oleh_nama
          )
        ),
      ],
    ],
  });

  doc.save(`${item.no_rfc.replace(/[^\w-]+/g, "_")}.pdf`);
}
