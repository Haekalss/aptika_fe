"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  FileDown,
  FileText,
  Layers,
  Search,
  Plus,
  Printer,
  ServerCog,
  Save,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  createDaftarAsetVirtual,
  deleteDaftarAsetVirtual,
  fetchAllDaftarAsetVirtual,
  fetchDaftarAsetVirtual,
  getDaftarAsetVirtualErrorMessage,
  updateDaftarAsetVirtual,
  type DaftarAsetVirtual,
} from "@/services/smki/daftarAsetVirtualService";

type VirtualizationRow = {
  id: number;
  kodeAset: string;
  namaInstance: string;
  deskripsi: string;
  tipeVirtualisasi: string;
  alamat: string;
  hostname: string;
  spesifikasi: string;
  pemilik: string;
  klasifikasi: string;
};

type VirtualizationForm = {
  noDokumen: string;
  noRevisi: string;
  tanggalBerlaku: string;
  kodeAset: string;
  namaAset: string;
  lokasiAset: string;
  rows: VirtualizationRow[];
};

type SavedVirtualizationForm = VirtualizationForm & Pick<DaftarAsetVirtual, "id" | "savedAt" | "status">;

type PageMode = "dashboard" | "form" | "document";

const createRow = (id: number): VirtualizationRow => ({
  id,
  kodeAset: "",
  namaInstance: "",
  deskripsi: "",
  tipeVirtualisasi: "",
  alamat: "",
  hostname: "",
  spesifikasi: "",
  pemilik: "",
  klasifikasi: "",
});

const createEmptyForm = (): VirtualizationForm => ({
  noDokumen: "FR-035/KOM.03.05/SANDIKAMI",
  noRevisi: "0.0",
  tanggalBerlaku: "2022",
  kodeAset: "",
  namaAset: "",
  lokasiAset: "",
  rows: [createRow(1)],
});

const getFilledRows = (rows: VirtualizationRow[]) =>
  rows.filter((row) =>
    [
      row.kodeAset,
      row.namaInstance,
      row.deskripsi,
      row.tipeVirtualisasi,
      row.alamat,
      row.hostname,
      row.spesifikasi,
      row.pemilik,
      row.klasifikasi,
    ].some((value) => value.trim()),
  );

const getSequentialAssetCode = (baseAssetCode: string, index: number) => {
  const match = baseAssetCode.trim().match(/^(\d+)(\/.*)$/);
  if (!match) return "";
  return `${String(Number(match[1]) + index).padStart(match[1].length, "0")}${match[2]}`;
};

const getRowsWithUniqueAssetCodes = (rows: VirtualizationRow[], baseAssetCode: string) => {
  const usedCodes = new Set<string>();
  return getFilledRows(rows).map((row, index) => {
    let assetCode = row.kodeAset.trim();
    if (!assetCode || usedCodes.has(assetCode)) {
      let sequence = index;
      assetCode = getSequentialAssetCode(baseAssetCode, sequence);
      while (assetCode && usedCodes.has(assetCode)) {
        sequence += 1;
        assetCode = getSequentialAssetCode(baseAssetCode, sequence);
      }
    }
    if (assetCode) usedCodes.add(assetCode);
    return { ...row, kodeAset: assetCode };
  });
};

const panel =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90";
const control =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${panel} p-5 sm:p-6`}>
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          {number}
        </span>
        <div>
          <h2 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200">{title}</h2>
          <p className="mt-1 text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function FormulirDaftarAsetVirtualisasiPage() {
  const [mode, setMode] = useState<PageMode>("dashboard");
  const [forms, setForms] = useState<SavedVirtualizationForm[]>([]);
  const [draft, setDraft] = useState<VirtualizationForm>(createEmptyForm);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<SavedVirtualizationForm | null>(null);
  const [documentStatusFilter, setDocumentStatusFilter] = useState<"Semua Status" | "Draf" | "Tersimpan">("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openingFormId, setOpeningFormId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportConfirmationOpen, setExportConfirmationOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadForms = async () => {
      try {
        const result = await fetchAllDaftarAsetVirtual();
        if (active) {
          setForms(result);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Gagal memuat daftar aset virtual dari API.", error);
        if (active) {
          setErrorMessage(getDaftarAsetVirtualErrorMessage(
            error,
            "Daftar aset virtual gagal dimuat dari server.",
          ));
        }
      } finally {
        if (active) setStorageReady(true);
      }
    };

    void loadForms();
    return () => {
      active = false;
    };
  }, []);

  const filteredForms = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return forms.filter((form) => {
      const matchesStatus = documentStatusFilter === "Semua Status" || form.status === documentStatusFilter;
      const searchableFields = [
        form.kodeAset,
        form.namaAset,
        form.lokasiAset,
        form.noDokumen,
        ...form.rows.flatMap((row) => [row.kodeAset, row.namaInstance, row.hostname, row.alamat]),
      ];
      const matchesSearch = !query || searchableFields.some((value) => value.toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [documentStatusFilter, forms, searchQuery]);

  const instanceCount = forms.reduce(
    (total, form) => total + form.rows.filter((row) => row.namaInstance.trim()).length,
    0,
  );
  const draftCount = forms.filter((form) => form.status === "Draf").length;
  const savedCount = forms.length - draftCount;

  const startNewForm = () => {
    setDraft(createEmptyForm());
    setActiveFormId(null);
    setActiveDocument(null);
    setErrorMessage("");
    setMode("form");
  };

  const updateDraft = (field: keyof Omit<VirtualizationForm, "rows">, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateRow = (
    id: number,
    field: keyof Omit<VirtualizationRow, "id">,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const addRow = () => {
    setDraft((current) => ({
      ...current,
      rows: [...current.rows, createRow(Math.max(0, ...current.rows.map((row) => row.id)) + 1)],
    }));
  };

  const removeRow = (id: number) => {
    setDraft((current) => ({
      ...current,
      rows: current.rows.length > 1 ? current.rows.filter((row) => row.id !== id) : current.rows,
    }));
  };

  const saveForm = async (status: "Draf" | "Tersimpan") => {
    if (saving) return;
    const filledRows = getFilledRows(draft.rows);

    if (status === "Tersimpan") {
      if (!draft.noDokumen.trim() || !draft.noRevisi.trim() || !draft.tanggalBerlaku.trim()) {
        setErrorMessage("Lengkapi nomor dokumen, nomor revisi, dan tanggal berlaku.");
        return;
      }
      if (!draft.kodeAset.trim() || !draft.namaAset.trim() || !draft.lokasiAset.trim()) {
        setErrorMessage("Lengkapi Kode Aset, Nama Aset, dan Lokasi Aset terlebih dahulu.");
        return;
      }
      if (filledRows.length === 0) {
        setErrorMessage("Isi setidaknya satu baris instance virtualisasi.");
        return;
      }
      if (filledRows.some((row, index) =>
        (!row.kodeAset.trim() && !getSequentialAssetCode(draft.kodeAset, index)) ||
        !row.namaInstance.trim() ||
        !row.klasifikasi,
      )) {
        setErrorMessage("Setiap baris instance yang diisi wajib memiliki Kode Aset, Nama Instance, dan Klasifikasi.");
        return;
      }
    } else {
      const hasAnyValue = [
        draft.noDokumen,
        draft.noRevisi,
        draft.tanggalBerlaku,
        draft.kodeAset,
        draft.namaAset,
        draft.lokasiAset,
        ...filledRows.flatMap((row) => [
          row.kodeAset,
          row.namaInstance,
          row.deskripsi,
          row.tipeVirtualisasi,
          row.alamat,
          row.hostname,
          row.spesifikasi,
          row.pemilik,
          row.klasifikasi,
        ]),
      ].some((value) => value.trim());
      if (!hasAnyValue) {
        setErrorMessage("Isi minimal satu data sebelum menyimpan draf.");
        return;
      }
    }

    const rowsWithUniqueCodes = getRowsWithUniqueAssetCodes(filledRows, draft.kodeAset);
    const payload = {
      status,
      no_dokumen: draft.noDokumen,
      no_revisi: draft.noRevisi,
      tanggal_berlaku: draft.tanggalBerlaku,
      kode_aset: draft.kodeAset,
      nama_aset: draft.namaAset,
      lokasi_aset: draft.lokasiAset,
      rows: rowsWithUniqueCodes.map((row) => ({
        kode_aset: row.kodeAset,
        nama_instance: row.namaInstance,
        deskripsi: row.deskripsi,
        tipe_virtualisasi: row.tipeVirtualisasi,
        alamat: row.alamat,
        hostname: row.hostname,
        spesifikasi: row.spesifikasi,
        pemilik: row.pemilik,
        klasifikasi: row.klasifikasi,
      })),
    };

    setSaving(true);
    try {
      const document = activeFormId
        ? await updateDaftarAsetVirtual(activeFormId, payload)
        : await createDaftarAsetVirtual(payload);
      const nextForms = activeFormId
        ? forms.map((form) => (form.id === activeFormId ? document : form))
        : [document, ...forms];

      setForms(nextForms);
      setErrorMessage("");
      setActiveFormId(document.id);
      if (status === "Tersimpan") {
        setActiveDocument(document);
        setMode("document");
      } else {
        setMode("dashboard");
      }
    } catch (error) {
      console.error("Gagal menyimpan formulir aset virtualisasi ke API.", error);
      setErrorMessage(getDaftarAsetVirtualErrorMessage(
        error,
        "Formulir gagal disimpan ke server. Silakan coba lagi.",
      ));
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async (id: string) => {
    const form = forms.find((item) => item.id === id);
    if (!form || !window.confirm(`Hapus formulir aset "${form.namaAset}" dari daftar ini?`)) return;

    try {
      await deleteDaftarAsetVirtual(id);
      setForms((current) => current.filter((item) => item.id !== id));
      setErrorMessage("");
    } catch (error) {
      console.error("Gagal menghapus formulir aset virtualisasi dari API.", error);
      setErrorMessage(getDaftarAsetVirtualErrorMessage(
        error,
        "Formulir gagal dihapus dari server. Silakan coba lagi.",
      ));
    }
  };

  const openForm = async (form: SavedVirtualizationForm, target: "form" | "document") => {
    if (openingFormId) return;
    setOpeningFormId(form.id);
    setErrorMessage("");
    try {
      const detail = await fetchDaftarAsetVirtual(form.id);
      setForms((current) => current.map((item) => item.id === detail.id ? detail : item));

      if (target === "document") {
        setActiveDocument(detail);
        setMode("document");
        return;
      }

      setDraft({
        noDokumen: detail.noDokumen,
        noRevisi: detail.noRevisi,
        tanggalBerlaku: detail.tanggalBerlaku,
        kodeAset: detail.kodeAset,
        namaAset: detail.namaAset,
        lokasiAset: detail.lokasiAset,
        rows: detail.rows.length ? detail.rows : [createRow(1)],
      });
      setActiveFormId(detail.id);
      setActiveDocument(null);
      setMode("form");
    } catch (error) {
      console.error("Gagal memuat detail formulir aset virtualisasi.", error);
      setErrorMessage(getDaftarAsetVirtualErrorMessage(
        error,
        "Detail formulir gagal dimuat dari server.",
      ));
    } finally {
      setOpeningFormId(null);
    }
  };

  const editForm = (form: SavedVirtualizationForm) => {
    void openForm(form, "form");
  };

  const printDocument = () => window.print();

  const exportDocx = async () => {
    if (exporting) return;
    if (filteredForms.length === 0) {
      setErrorMessage("Tidak ada formulir yang dapat diekspor. Tambahkan formulir atau sesuaikan pencarian dan filter.");
      return;
    }

    setExporting(true);
    setErrorMessage("");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    try {
      const documentsToExport = await Promise.all(
        filteredForms.map((form) => fetchDaftarAsetVirtual(form.id)),
      );
      const border = { style: BorderStyle.SINGLE, size: 4, color: "666666" };
      const borders = { top: border, bottom: border, left: border, right: border };
      const cell = (
        text: string,
        bold = false,
        options: {
          width?: number;
          fontSize?: number;
          align?: (typeof AlignmentType)[keyof typeof AlignmentType];
        } = {},
      ) =>
        new TableCell({
          borders,
          width: { size: options.width ?? 1, type: WidthType.DXA },
          margins: { top: 45, bottom: 45, left: 65, right: 65 },
          children: [
            new Paragraph({
              alignment: options.align ?? AlignmentType.LEFT,
              children: [new TextRun({ text, bold, font: "Arial", size: options.fontSize ?? 18 })],
            }),
          ],
        });
      let logoData: Uint8Array | undefined;
      try {
        const logoResponse = await fetch("/logo-diskominfo-jabar.png");
        if (logoResponse.ok) logoData = new Uint8Array(await logoResponse.arrayBuffer());
      } catch (error) {
        console.warn("Logo Diskominfo tidak dapat dimuat untuk ekspor DOCX.", error);
      }
      const children = documentsToExport.flatMap((form, formIndex) => {
        const rowsWithUniqueCodes = getRowsWithUniqueAssetCodes(form.rows, form.kodeAset);
        const content = [
          new Paragraph({
            text: "",
            pageBreakBefore: formIndex > 0,
            spacing: { after: 0, line: 1 },
          }),
          new Table({
            width: { size: 11200, type: WidthType.DXA },
            columnWidths: [1456, 5936, 3808],
            rows: [
              new TableRow({
                height: { value: 1100, rule: "atLeast" },
                children: [
                  new TableCell({
                    width: { size: 1456, type: WidthType.DXA },
                    borders,
                    verticalAlign: "center",
                    margins: { top: 60, bottom: 60, left: 60, right: 60 },
                    children: [new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: logoData
                        ? [new ImageRun({ type: "png", data: logoData, transformation: { width: 72, height: 96 } })]
                        : [new TextRun({ text: "DISKOMINFO\nPROVINSI JAWA BARAT", bold: true, font: "Arial", size: 14 })],
                    })],
                  }),
                  new TableCell({
                    width: { size: 5936, type: WidthType.DXA },
                    borders,
                    verticalAlign: "center",
                    margins: { top: 80, bottom: 80, left: 100, right: 100 },
                    children: [new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "FORMULIR DAFTAR ASET VIRTUALISASI", bold: true, font: "Arial", size: 24 })],
                    })],
                  }),
                  new TableCell({
                    width: { size: 3808, type: WidthType.DXA },
                    borders,
                    margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    children: [
                      new Table({
                        width: { size: 3808, type: WidthType.DXA },
                        columnWidths: [1500, 180, 2128],
                        rows: [
                          ["No. Dokumen", form.noDokumen],
                          ["No. Revisi", form.noRevisi],
                          ["Tanggal. Berlaku", form.tanggalBerlaku],
                        ].map(([label, value]) => new TableRow({
                          children: [
                            new TableCell({
                              width: { size: 1500, type: WidthType.DXA },
                              borders,
                              children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 18 })] })],
                            }),
                            new TableCell({
                              width: { size: 180, type: WidthType.DXA },
                              borders,
                              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ":", font: "Arial", size: 18 })] })],
                            }),
                            new TableCell({
                              width: { size: 2128, type: WidthType.DXA },
                              borders,
                              children: [new Paragraph({ children: [new TextRun({ text: value || "-", font: "Arial", size: 18 })] })],
                            }),
                          ],
                        })),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 260 } }),
          new Paragraph({
            children: [new TextRun({ text: "Informasi Aset TI (Server Fisik)", bold: true, underline: {}, font: "Arial", size: 20 })],
            spacing: { after: 170 },
          }),
          ...[
            `Kode Aset: ${form.kodeAset || ""}`,
            `Nama Aset: ${form.namaAset || ""}`,
            `Lokasi Aset: ${form.lokasiAset || ""}`,
          ].map((text) => new Paragraph({
            children: [new TextRun({ text, font: "Arial", size: 18 })],
            spacing: { after: 190 },
          })),
          new Paragraph({ text: "", spacing: { after: 220 } }),
          new Table({
            width: { size: 12800, type: WidthType.DXA },
            columnWidths: [340, 1410, 1710, 2080, 1640, 1510, 2210, 1210, 690],
            indent: { size: 1800, type: WidthType.DXA },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  "No",
                  "Kode Aset",
                  "Nama Instance",
                  "Deskripsi",
                  "Tipe Virtualisasi",
                  "Alamat IP/Hostname",
                  "Spesifikasi",
                  "Pemilik",
                  "Klasifikasi",
                ].map((heading, index) => cell(heading, true, {
                  width: [340, 1410, 1710, 2080, 1640, 1510, 2210, 1210, 690][index],
                  fontSize: 17,
                  align: AlignmentType.CENTER,
                })),
              }),
              ...Array.from(
                { length: Math.max(10, rowsWithUniqueCodes.length) },
                (_, index) => {
                const row = rowsWithUniqueCodes[index] ?? createRow(index + 1);
                return new TableRow({
                  children: [
                    String(index + 1),
                    row.kodeAset,
                    row.namaInstance,
                    row.deskripsi,
                    row.tipeVirtualisasi,
                    [row.alamat, row.hostname].filter(Boolean).join(" / "),
                    row.spesifikasi,
                    row.pemilik,
                    row.klasifikasi,
                  ].map((value, cellIndex) => cell(value, false, {
                    width: [340, 1410, 1710, 2080, 1640, 1510, 2210, 1210, 690][cellIndex],
                    fontSize: 16,
                    align: cellIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                  })),
                });
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 120 } }),
          new Paragraph({
            children: [new TextRun({ text: "Nb. Kode Aset Virtualisasi, dapat diisi dengan format : xxx/VIRT/Nama Unit Kerja", font: "Arial", size: 16 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            indent: { left: 560 },
            children: [new TextRun({ text: "-      Klasifikasi diisi Rahasia/Internal/Publik", font: "Arial", size: 16 })],
          }),
        ];
        return content;
      });

      const document = new Document({
        creator: "APTIKA Tools",
        title: "Daftar Aset Virtualisasi FR-035",
        sections: [
          {
            properties: {
              page: {
                size: { width: 16838, height: 11906, orientation: "landscape" },
                margin: { top: 500, bottom: 500, left: 567, right: 567 },
              },
            },
            children,
          },
        ],
      });
      const blob = await Packer.toBlob(document);
      if (blob.size === 0) throw new Error("File DOCX yang dihasilkan kosong.");
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `Daftar_Aset_Virtualisasi_${new Date().toISOString().slice(0, 10)}.docx`;
      anchor.style.display = "none";
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 10_000);
      setExportConfirmationOpen(false);
    } catch (error) {
      console.error("Gagal mengekspor daftar aset virtualisasi ke DOCX.", error);
      const details = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Ekspor DOCX gagal: ${details}`);
    } finally {
      setExporting(false);
    }
  };

  const renderDashboard = () => {
    const cards = [
      {
        label: "Total Formulir",
        value: forms.length,
        sub: "Formulir FR-035 tersimpan",
        icon: Layers,
        color: "text-blue-600",
        box: "border-blue-200 bg-blue-50",
      },
      {
        label: "Draf",
        value: draftCount,
        sub: "Masih dapat dilengkapi",
        icon: FileText,
        color: "text-purple-600",
        box: "border-purple-200 bg-purple-50",
      },
      {
        label: "Tersimpan",
        value: savedCount,
        sub: "Siap dilihat dan diekspor",
        icon: CheckCircle2,
        color: "text-emerald-600",
        box: "border-emerald-200 bg-emerald-50",
      },
      {
        label: "Total Instance",
        value: instanceCount,
        sub: `${new Set(forms.map((form) => form.kodeAset).filter(Boolean)).size} server fisik terdaftar`,
        icon: ServerCog,
        color: "text-cyan-600",
        box: "border-cyan-200 bg-cyan-50",
      },
    ];

    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 text-white shadow-lg sm:p-7">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Formulir Daftar Aset Virtualisasi
              </h1>
              <p className="text-sm leading-relaxed text-emerald-100">
                Inventarisasi server fisik dan instance virtualisasi: kode aset, alamat IP/hostname,
                spesifikasi, pemilik, serta klasifikasi informasi pada formulir FR-035.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold">
              <Building2 size={16} className="text-emerald-200" />
              Dinas Komunikasi dan Informatika Jawa Barat
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className={`${panel} flex items-center justify-between gap-2 p-4`}>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">{card.label}</p>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{card.sub}</p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${card.box} ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          ))}
        </div>

        <section className={`${panel} space-y-4 p-5`}>
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Cari formulir aset virtualisasi"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari kode aset, nama server, lokasi, atau nomor dokumen..."
              className={`${control} rounded-2xl py-3 pl-11 text-sm`}
            />
          </label>
          <div className="flex flex-row items-end justify-between gap-5">
            <label className="block min-w-0 flex-1 text-xs font-semibold text-slate-500">
              Bidang
              <select aria-label="Bidang" value="Dinas Komunikasi dan Informatika" disabled className={`${control} mt-1.5 min-w-[320px] disabled:cursor-not-allowed disabled:opacity-100`}>
                <option value="Dinas Komunikasi dan Informatika">Dinas Komunikasi dan Informatika</option>
              </select>
            </label>

            <div className="flex items-end justify-end gap-2">
              <label className="block text-xs font-semibold text-slate-500">
                Status Dokumen
                <select
                  aria-label="Filter status dokumen"
                  value={documentStatusFilter}
                  onChange={(event) => setDocumentStatusFilter(event.target.value as typeof documentStatusFilter)}
                  className={`${control} mt-1.5 min-w-[200px]`}
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Draf">Simpan Draft</option>
                  <option value="Tersimpan">Tersimpan</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setExportConfirmationOpen(true)}
                disabled={exporting}
                aria-busy={exporting}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-wait disabled:opacity-70"
              >
                <FileDown size={15} />
                Ekspor (DOCX)
              </button>

              <button type="button" onClick={startNewForm} className={primary}>
                <Plus size={15} />
                Tambah Formulir
              </button>
            </div>
          </div>
          <p className="text-right text-[11px] text-slate-400">
            Menampilkan {filteredForms.length} dari {forms.length} formulir
          </p>
        </section>

        {errorMessage && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <section className={`${panel} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Aset Virtualisasi</h2>
            <p className="text-[11px] text-slate-400">
              {storageReady ? `Menampilkan ${filteredForms.length} dari ${forms.length} formulir` : "Memuat data..."}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <tr>
                  {["No", "Kode Aset", "Nama Aset", "Lokasi", "Jumlah Instance", "Status", "Klasifikasi", "Aksi"].map((label) => (
                    <th key={label} scope="col" className="px-5 py-3 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!storageReady ? (
                  <tr><td colSpan={8} className="p-12 text-center text-sm text-slate-500">Memuat daftar formulir...</td></tr>
                ) : filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center text-slate-400">
                        <Database className="mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Belum ada data aset virtualisasi</p>
                        <p className="mt-1 text-xs">Pilih Tambah Formulir untuk mulai mengisi FR-035.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((form, index) => {
                    const classifications = [...new Set(form.rows.map((row) => row.klasifikasi).filter(Boolean))].join(", ");
                    return (
                      <tr key={form.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4 text-xs text-slate-500">{index + 1}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200">{form.kodeAset}</td>
                        <td className="px-5 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400">{form.namaAset}</td>
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{form.lokasiAset}</td>
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{form.rows.filter((row) => row.namaInstance.trim()).length}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${
                            form.status === "Draf"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}>
                            {form.status ?? "Tersimpan"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">{classifications || "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => void openForm(form, "document")} disabled={openingFormId !== null} aria-label="Lihat dokumen" className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50">
                              <Eye size={15} />
                            </button>
                            <button type="button" onClick={() => editForm(form)} disabled={openingFormId !== null || saving} aria-label="Edit formulir" className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50">
                              <Pencil size={15} />
                            </button>
                            <button type="button" onClick={() => void deleteForm(form.id)} disabled={openingFormId !== null || saving} aria-label="Hapus formulir" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
            <span>Data tersimpan pada server</span>
            <span>FR-035</span>
          </div>
        </section>
      </div>
    );
  };

  const renderForm = () => (
    <div className="space-y-5 pb-8">
      <button type="button" onClick={() => { setMode("dashboard"); setErrorMessage(""); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600">
        <ArrowLeft size={15} /> Manajemen Aset Virtualisasi
      </button>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {activeFormId ? "Edit Formulir Aset Virtualisasi" : "Tambah Aset Virtualisasi"}
        </h1>
        <p className="mt-2 text-xs text-slate-400">Isi informasi server fisik dan daftar instance untuk menghasilkan dokumen FR-035.</p>
      </div>

      <Section number="01" title="Detail Dokumen" description="Informasi pada kop formulir resmi.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {([
            ["noDokumen", "No. Dokumen"],
            ["noRevisi", "No. Revisi"],
            ["tanggalBerlaku", "Tanggal Berlaku"],
          ] as const).map(([field, label]) => (
            <label key={field} className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {label} <span className="text-red-500">*</span>
              <input value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} className={`${control} mt-1.5`} />
            </label>
          ))}
        </div>
      </Section>

      <Section number="02" title="Informasi Aset TI (Server Fisik)" description="Identitas server fisik yang menjadi host virtualisasi.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {([
            ["kodeAset", "Kode Aset", "Contoh: 001/TI/APTIKA"],
            ["namaAset", "Nama Aset", "Nama server fisik"],
            ["lokasiAset", "Lokasi Aset", "Data Center / Unit Kerja"],
          ] as const).map(([field, label, placeholder]) => (
            <label key={field} className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {label} <span className="text-red-500">*</span>
              <input value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} placeholder={placeholder} className={`${control} mt-1.5`} />
            </label>
          ))}
        </div>
      </Section>

      <Section number="03" title="Detail Sistem dan Jaringan" description="Nama instance, platform virtualisasi, alamat IP, hostname, dan deskripsi.">
        <div className="space-y-4">
          {draft.rows.map((row, index) => (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/30">
              <label className="mb-4 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Kode Aset <span className="text-red-500">*</span>
                <input value={row.kodeAset} onChange={(event) => updateRow(row.id, "kodeAset", event.target.value)} className={`${control} mt-1.5`} placeholder={`Contoh: ${String(index + 1).padStart(3, "0")}/VIRT/APTIKA`} />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Nama Instance <span className="text-red-500">*</span>
                  <input value={row.namaInstance} onChange={(event) => updateRow(row.id, "namaInstance", event.target.value)} className={`${control} mt-1.5`} placeholder="Server Pengujian Uji" />
                </label>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Tipe Virtualisasi <span className="text-red-500">*</span>
                  <input value={row.tipeVirtualisasi} onChange={(event) => updateRow(row.id, "tipeVirtualisasi", event.target.value)} className={`${control} mt-1.5`} placeholder="Proxmox" />
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Alamat IP
                  <input value={row.alamat} onChange={(event) => updateRow(row.id, "alamat", event.target.value)} className={`${control} mt-1.5`} placeholder="192.0.2.14" />
                </label>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Hostname
                  <input value={row.hostname} onChange={(event) => updateRow(row.id, "hostname", event.target.value)} className={`${control} mt-1.5`} placeholder="vm-uji-05.test" />
                </label>
              </div>

              <label className="mt-4 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Deskripsi
                <textarea value={row.deskripsi} onChange={(event) => updateRow(row.id, "deskripsi", event.target.value)} rows={3} className={`${control} mt-1.5 min-h-[90px] resize-y`} placeholder="Mesin virtual untuk uji coba aplikasi." />
              </label>

              {draft.rows.length > 1 && (
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => removeRow(row.id)} aria-label={`Hapus instance ${index + 1}`} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40">
                    <Trash2 size={14} /> Hapus Instance
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <button type="button" onClick={addRow} className={secondary}><Plus size={15} /> Tambah Instance</button>
          </div>
        </div>
      </Section>

      <Section number="04" title="Spesifikasi dan Klasifikasi" description="Spesifikasi, pemilik, dan klasifikasi informasi.">
        <div className="space-y-4">
          {draft.rows.map((row) => (
            <div key={`spec-${row.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/30">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Spesifikasi <span className="text-red-500">*</span>
                <input value={row.spesifikasi} onChange={(event) => updateRow(row.id, "spesifikasi", event.target.value)} className={`${control} mt-1.5`} placeholder="Ubuntu Server, 2 vCPU, RAM 4 GB, storage 50 GB" />
              </label>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Pemilik <span className="text-red-500">*</span>
                  <input value={row.pemilik} onChange={(event) => updateRow(row.id, "pemilik", event.target.value)} className={`${control} mt-1.5`} placeholder="Unit Uji Coba" />
                </label>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Klasifikasi <span className="text-red-500">*</span>
                  <select value={row.klasifikasi} onChange={(event) => updateRow(row.id, "klasifikasi", event.target.value)} className={`${control} mt-1.5`}>
                    <option value="">Pilih</option>
                    <option value="Rahasia">Rahasia</option>
                    <option value="Internal">Internal</option>
                    <option value="Publik">Publik</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{errorMessage}</p>
      )}
      <div className={`${panel} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Simpan formulir aset virtualisasi?</p>
          <p className="mt-1 text-[10px] text-slate-400">
            Simpan memerlukan isian lengkap. Draf dapat dilengkapi kemudian.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setMode("dashboard"); setErrorMessage(""); }} disabled={!storageReady} className={secondary}>
            Batal
          </button>
          <button type="button" onClick={() => void saveForm("Draf")} disabled={!storageReady || saving} className={secondary}>
            {saving ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button type="button" onClick={() => void saveForm("Tersimpan")} disabled={!storageReady || saving} className={primary}>
            <Save size={15} /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocument = () => {
    if (!activeDocument) return null;
    const filledRows = getRowsWithUniqueAssetCodes(activeDocument.rows, activeDocument.kodeAset);
    const documentRows = [
      ...filledRows,
      ...Array.from({ length: Math.max(0, 10 - filledRows.length) }, (_, index) => createRow(-(index + 1))),
    ];

    return (
      <div className="space-y-4 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button type="button" onClick={() => setMode("dashboard")} className={secondary}>
            <ArrowLeft size={15} /> Kembali ke Daftar Aset
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => editForm(activeDocument)} className={secondary}>
              <Pencil size={14} /> Edit
            </button>
            <button type="button" onClick={printDocument} className={primary}>
              <Printer size={14} /> Cetak / Simpan PDF
            </button>
          </div>
        </div>
        <div className="virtualization-print mx-auto max-w-[1120px] border border-slate-300 bg-white p-6 text-slate-900 shadow-sm">
          <table className="document-header w-[73%] border-collapse text-sm">
            <tbody>
              <tr>
                <td className="w-[13%] border border-slate-800 p-2 text-center">
                  <Image src="/logo-diskominfo-jabar.png" alt="Logo Diskominfo Provinsi Jawa Barat" width={90} height={90} className="mx-auto h-[82px] w-[82px] object-contain" />
                </td>
                <td className="border border-slate-800 px-3 py-4 text-center">
                  <h2 className="text-xl font-extrabold leading-tight">FORMULIR DAFTAR ASET VIRTUALISASI</h2>
                </td>
                <td className="w-[34%] border border-slate-800 p-0">
                  <table className="w-full border-collapse">
                    <tbody>
                      {([
                        ["No. Dokumen", activeDocument.noDokumen],
                        ["No. Revisi", activeDocument.noRevisi],
                        ["Tanggal. Berlaku", activeDocument.tanggalBerlaku],
                      ] as const).map(([label, value]) => (
                        <tr key={label}>
                          <td className="w-[37%] border-b border-slate-800 px-2 py-2">{label}</td>
                          <td className="w-5 border-b border-slate-800 px-1 py-2 text-center">:</td>
                          <td className="border-b border-slate-800 px-2 py-2">{value || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="document-body pt-6">
            <section className="asset-information mb-8 space-y-3">
              <h3 className="text-sm font-bold underline">Informasi Aset TI (Server Fisik)</h3>
              <p>Kode Aset: {activeDocument.kodeAset}</p>
              <p>Nama Aset: {activeDocument.namaAset}</p>
              <p>Lokasi Aset: {activeDocument.lokasiAset}</p>
            </section>
            <table className="asset-table ml-[14%] w-[83%] border-collapse text-center text-xs">
                  <colgroup>
                    <col style={{ width: "3%" }} /><col style={{ width: "10.5%" }} /><col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} /><col style={{ width: "12.5%" }} /><col style={{ width: "12%" }} />
                    <col style={{ width: "16%" }} /><col style={{ width: "9%" }} /><col style={{ width: "7%" }} />
                  </colgroup>
                  <thead>
                    <tr className="font-bold">
                      <th>No</th><th>Kode Aset</th><th>Nama Instance</th><th>Deskripsi</th><th>Tipe Virtualisasi</th>
                      <th>Alamat<br />IP/Hostname</th><th>Spesifikasi</th><th>Pemilik</th><th>Klasifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td><td>{row.kodeAset || (filledRows.length > index ? getSequentialAssetCode(activeDocument.kodeAset, index) : "") || "\u00a0"}</td><td>{row.namaInstance || "\u00a0"}</td>
                        <td>{row.deskripsi || "\u00a0"}</td><td>{row.tipeVirtualisasi || "\u00a0"}</td>
                        <td>{[row.alamat, row.hostname].filter(Boolean).join(" / ") || "\u00a0"}</td><td>{row.spesifikasi || "\u00a0"}</td>
                        <td>{row.pemilik || "\u00a0"}</td><td>{row.klasifikasi || "\u00a0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            <div className="document-notes mt-4 space-y-1 text-xs">
              <p>Nb. Kode Aset Virtualisasi, dapat diisi dengan format : xxx/VIRT/Nama Unit Kerja</p>
              <p className="pl-7">- Klasifikasi diisi Rahasia/Internal/Publik</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
        <style jsx global>{`
          @page { size: A4 landscape; margin: 12mm; }
          @media print {
            body * { visibility: hidden !important; }
            .virtualization-print, .virtualization-print * { visibility: visible !important; }
            .virtualization-print {
              position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important;
              margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important;
              color: #000 !important; background: #fff !important; font-family: Arial, Helvetica, sans-serif !important;
              font-size: 9pt !important;
            }
            .virtualization-print .document-header {
              width: 73% !important; margin: 0 0 28px 0 !important; table-layout: fixed !important;
            }
            .virtualization-print .asset-table {
              width: 83% !important; margin-left: 14% !important; table-layout: fixed !important;
            }
            .virtualization-print table { border-collapse: collapse !important; }
            .virtualization-print th, .virtualization-print td {
              border: 1px solid #222 !important; color: #000 !important; padding: 4px 3px !important; overflow-wrap: anywhere !important;
            }
            .virtualization-print .document-body { padding: 0 !important; }
            .virtualization-print .asset-information { margin-bottom: 38px !important; }
            .virtualization-print .asset-table { font-size: 8pt !important; }
            .virtualization-print .asset-table thead { display: table-header-group; }
            .virtualization-print .asset-table tr { break-inside: avoid; }
            .virtualization-print .document-notes { margin-top: 16px !important; }
          }
        `}</style>
        {mode === "dashboard" ? renderDashboard() : mode === "form" ? renderForm() : renderDocument()}
        {exportConfirmationOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !exporting) setExportConfirmationOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-confirmation-title"
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="export-confirmation-title" className="text-base font-bold text-slate-800 dark:text-white">
                  Ekspor Formulir FR-035
                </h2>
                <button
                  type="button"
                  aria-label="Tutup dialog ekspor"
                  disabled={exporting}
                  onClick={() => setExportConfirmationOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>
              <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  {filteredForms.length > 0
                    ? `Ekspor ${filteredForms.length} formulir yang sesuai dengan pencarian dan filter status ke dokumen Word.`
                    : "Tidak ada formulir yang cocok dengan pencarian dan filter status. Sesuaikan filter untuk melanjutkan ekspor."}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExportConfirmationOpen(false)}
                  disabled={exporting}
                  className={secondary}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={exportDocx}
                  disabled={exporting || filteredForms.length === 0}
                  className={primary}
                >
                  <FileDown size={15} />
                  {exporting ? "Menyiapkan DOCX..." : "Unduh DOCX"}
                </button>
              </div>
            </section>
          </div>
        )}
    </ServiceRouteGuard>
  );
}
