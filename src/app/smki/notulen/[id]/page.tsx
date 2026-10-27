"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Printer,
  FileDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSmkiNotulenById,
  exportSmkiNotulenDocx,
  SmkiNotulenData,
} from "@/services/api";

export default function DetailNotulenPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [notulen, setNotulen] = useState<SmkiNotulenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getSmkiNotulenById(id);
        if (res.success && res.data) {
          setNotulen(res.data);
        }
      } catch (err: any) {
        console.error("Gagal memuat detail notulen:", err);
        toast.error("Gagal memuat detail notulen.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    if (!notulen || !notulen.id) return;
    setIsExportingDocx(true);
    try {
      const blob = await exportSmkiNotulenDocx(notulen.id);
      const cleanNomor = (notulen.nomor_notulen || "F10-SMKI").replace(/[^a-zA-Z0-9_\-]/g, "_");
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-011_${cleanNomor}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal ekspor docx:", err);
      toast.error("Gagal mengunduh dokumen Word.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const formatTanggalIndo = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDayName = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", { weekday: "long" });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="text-sm">Menyiapkan dokumen notulen...</span>
      </div>
    );
  }

  if (!notulen) {
    return (
      <div className="py-20 text-center text-slate-500">
        <AlertCircle size={36} className="mx-auto mb-2 text-rose-500" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
          Notulen Tidak Ditemukan
        </h3>
        <button
          onClick={() => router.push("/smki/notulen")}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const hariPelaksanaan = formatDayName(notulen.tanggal);
  const tanggalPelaksanaan = formatTanggalIndo(notulen.tanggal);
  const waktuPelaksanaan = notulen.waktu_mulai
    ? `${notulen.waktu_mulai} - ${notulen.waktu_selesai || ""} ${notulen.zona_waktu || "WIB"}`
    : "-";

  const rawPesertas = notulen.pesertas || [];
  const defaultAgendas = [
    { nomor_agenda: 1, agenda_item: "Status tindakan review manajemen sebelumnya" },
    { nomor_agenda: 2, agenda_item: "Perubahan isu internal dan eksternal" },
    { nomor_agenda: 3, agenda_item: "Umpan Balik dari kinerja SMKI" },
    { nomor_agenda: 4, agenda_item: "Umpan balik dari pihak yang berkepentingan" },
    { nomor_agenda: 5, agenda_item: "Hasil Penilaian risiko" },
    { nomor_agenda: 6, agenda_item: "Peluang untuk perbaikan berkelanjutan" },
    { nomor_agenda: 7, agenda_item: "Internal Audit" },
    { nomor_agenda: 8, agenda_item: "Kecukupan Sumber Daya" },
    { nomor_agenda: 9, agenda_item: "Perbaikan Kinerja" },
    { nomor_agenda: 10, agenda_item: "Rencana Tanggap Darurat" },
  ];

  const agendas =
    notulen.agendas && notulen.agendas.length > 0 ? notulen.agendas : defaultAgendas;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950/40 py-6 px-4 print:bg-white print:p-0">
      {/* Floating Action Bar - Hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => router.push("/smki/notulen")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Notulen</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/smki/notulen/edit/${notulen.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition shadow-xs"
          >
            <Pencil size={14} />
            <span>Edit Notulen</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 text-xs font-semibold transition disabled:opacity-50"
          >
            {isExportingDocx ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            <span>Unduh Word (.docx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer size={15} />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Container - 1:1 Sesuai Struktur FR-011 Word Diskominfo */}
      <div className="max-w-[210mm] mx-auto bg-white p-4 sm:p-6 print:p-0 print:m-0 print:w-full print:max-w-none text-slate-900 font-sans text-[9pt] leading-normal shadow-lg print:shadow-none">
        
        {/* TABEL UTAMA (Outer Table) - 1 Border Tunggal Sesuai Word Asli */}
        <table className="w-full border-collapse border border-black table-fixed text-[8.5pt]">
          <tbody>
            {/* ROW 0: KOP ROW 1 */}
            <tr className="border-b border-black">
              {/* Logo Box (Rowspan 3) */}
              <td rowSpan={3} className="w-[12%] p-2 border-r border-black text-center align-middle bg-white">
                <img
                  src="/logo-fr047.png"
                  alt="Logo Jabar"
                  className="w-14 h-auto mx-auto object-contain"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "/logo-smki-template.png";
                  }}
                />
              </td>
              {/* Judul Formulir (Rowspan 3) */}
              <td rowSpan={3} className="w-[58%] p-3 border-r border-black text-center align-middle">
                <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900 leading-snug">
                  Formulir Notulen Management<br />Review SMKI
                </h2>
              </td>
              {/* Metadata: No. Dokumen */}
              <td className="w-[12%] py-1 px-2 border-r border-black font-semibold text-[8pt]">No. Dokumen</td>
              <td className="w-[3%] py-1 px-1 border-r border-black text-center text-[8pt]">:</td>
              <td className="w-[15%] py-1 px-2 text-[8pt] font-mono">{notulen.no_dokumen || "F10-SMKI"}</td>
            </tr>

            {/* ROW 1: KOP ROW 2 */}
            <tr className="border-b border-black">
              <td className="py-1 px-2 border-r border-black font-semibold text-[8pt]">No. Revisi</td>
              <td className="py-1 px-1 border-r border-black text-center text-[8pt]">:</td>
              <td className="py-1 px-2 text-[8pt] font-mono">{notulen.no_revisi || "1.1"}</td>
            </tr>

            {/* ROW 2: KOP ROW 3 */}
            <tr className="border-b border-black">
              <td className="py-1 px-2 border-r border-black font-semibold text-[8pt]">Tanggal Berlaku</td>
              <td className="py-1 px-1 border-r border-black text-center text-[8pt]">:</td>
              <td className="py-1 px-2 text-[8pt]">{formatTanggalIndo(notulen.tanggal_berlaku) || "20 Januari 2022"}</td>
            </tr>

            {/* ROW 3: MEETING BANNER (Bar Abu-abu) */}
            <tr className="border-b border-black bg-slate-200/90 print:bg-slate-200">
              <td colSpan={5} className="py-1 px-3 text-[9pt] font-bold text-slate-900">
                Meeting : &nbsp; {notulen.judul_rapat || "ISO 27001:2013 Management Review"}
              </td>
            </tr>

            {/* ROW 4: ISI UTAMA DOKUMEN (Peserta, Waktu, Tujuan, Review Agenda, Pembahasan) */}
            <tr className="border-b border-black">
              <td colSpan={5} className="p-3 bg-white space-y-4">
                
                {/* 1. Bagian Peserta Rapat */}
                <div>
                  <h3 className="font-bold text-[9pt] mb-1.5 text-slate-900">Peserta Rapat</h3>
                  <table className="w-full border-collapse border border-black text-[8.5pt]">
                    <thead>
                      <tr className="border-b border-black bg-white">
                        <th className="w-10 py-1 px-2 text-center border-r border-black font-bold">No</th>
                        <th className="w-1/2 py-1 px-3 text-center border-r border-black font-bold">Nama</th>
                        <th className="w-1/2 py-1 px-3 text-center font-bold">Jabatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {rawPesertas.length > 0 ? (
                        rawPesertas.map((p, idx) => (
                          <tr key={idx} className="h-6">
                            <td className="py-1 px-2 text-center border-r border-black font-medium">{idx + 1}</td>
                            <td className="py-1 px-3 border-r border-black">{p.nama}</td>
                            <td className="py-1 px-3">{p.jabatan}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-2 text-center italic text-slate-500">
                            Belum ada peserta rapat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 2. Bagian Hari, Tanggal Pelaksanaan */}
                <div>
                  <h3 className="font-bold text-[9pt] mb-1.5 text-slate-900">Hari, Tanggal Pelaksanaan :</h3>
                  <table className="w-full border-collapse border border-black text-[8.5pt]">
                    <thead>
                      <tr className="border-b border-black bg-white">
                        <th className="w-1/3 py-1.5 px-3 text-center border-r border-black font-bold">Tanggal</th>
                        <th className="w-1/3 py-1.5 px-3 text-center border-r border-black font-bold">Waktu</th>
                        <th className="w-1/3 py-1.5 px-3 text-center font-bold">Tempat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 px-3 text-center border-r border-black font-medium">
                          {hariPelaksanaan ? `${hariPelaksanaan}, ${tanggalPelaksanaan}` : tanggalPelaksanaan || "-"}
                        </td>
                        <td className="py-1.5 px-3 text-center border-r border-black">
                          {waktuPelaksanaan}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {notulen.tempat || "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Bagian Tujuan Pertemuan */}
                <div className="flex items-start gap-4 text-[8.5pt]">
                  <div className="w-36 shrink-0 font-bold text-[9pt] pt-1 text-slate-900">
                    Tujuan Pertemuan :
                  </div>
                  <div className="flex-1">
                    <table className="w-full border-collapse border border-black text-[8.5pt]">
                      <tbody>
                        <tr>
                          <td className="p-2.5 text-justify leading-relaxed bg-white text-slate-800">
                            {notulen.tujuan ||
                              "Management Review dari hasil implementasi ISO 27001 berdasarkan hasil dari kegiatan Internal Audit yang telah dilakukan dan temuan dari kegiatan Internal Audit, Memastikan sasaran SMKI terpenuhi, Meninjau Kinerja dari pihak Vendor dan pihak ketiga, Meninjau daftar Risk Register, dll"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Bagian Review Agenda */}
                <div className="flex items-start gap-4 text-[8.5pt]">
                  <div className="w-36 shrink-0 font-bold text-[9pt] pt-1 text-slate-900">
                    Review Agenda :
                  </div>
                  <div className="flex-1">
                    <table className="w-full border-collapse border border-black text-[8.5pt]">
                      <tbody className="divide-y divide-black">
                        {agendas.map((ag: any, idx: number) => (
                          <tr key={idx} className="bg-white">
                            <td className="w-9 py-1 px-2 text-center font-bold align-top border-r border-black">
                              {ag.nomor_agenda || idx + 1}.
                            </td>
                            <td className="py-1 px-3 font-medium align-top">
                              {ag.agenda_item}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Bagian Pembahasan */}
                <div>
                  <h3 className="font-bold text-[9pt] mb-1.5 text-slate-900">Pembahasan :</h3>
                  <table className="w-full border-collapse border border-black text-[8pt]">
                    <thead>
                      <tr className="border-b border-black bg-white text-[7.5pt] leading-tight">
                        <th className="w-7 py-1.5 px-1 text-center border-r border-black font-bold">No</th>
                        <th className="w-36 py-1.5 px-2 text-center border-r border-black font-bold">Agenda Item</th>
                        <th className="w-24 py-1.5 px-1.5 text-center border-r border-black font-bold">
                          ISO27001:2013<br />Standard (Clause 9.3)
                        </th>
                        <th className="py-1.5 px-2 text-center border-r border-black font-bold">OUTCOMES</th>
                        <th className="py-1.5 px-2 text-center border-r border-black font-bold">
                          ACTIONS/OUTPUT<br />TO BE TAKEN
                        </th>
                        <th className="w-20 py-1.5 px-1.5 text-center border-r border-black font-bold">PIC</th>
                        <th className="w-24 py-1.5 px-1.5 text-center font-bold">
                          Tanggal<br />Penyelesaian
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {agendas.map((ag: any, idx: number) => (
                        <tr key={idx} className="align-top">
                          <td className="py-1 px-1 text-center border-r border-black font-bold">
                            {ag.nomor_agenda || idx + 1}
                          </td>
                          <td className="py-1 px-2 border-r border-black font-medium">
                            {ag.agenda_item}
                          </td>
                          <td className="py-1 px-1 text-center border-r border-black font-mono text-[7.5pt]">
                            {ag.clause_iso || "Clause 9.3"}
                          </td>
                          <td className="py-1 px-2 border-r border-black leading-relaxed">
                            {ag.outcomes || "-"}
                          </td>
                          <td className="py-1 px-2 border-r border-black leading-relaxed">
                            {ag.actions_output || "-"}
                          </td>
                          <td className="py-1 px-1.5 text-center border-r border-black font-medium">
                            {ag.pic || "-"}
                          </td>
                          <td className="py-1 px-1.5 text-center whitespace-nowrap text-[7.5pt]">
                            {formatTanggalIndo(ag.tgl_penyelesaian) || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </td>
            </tr>

            {/* ROW 5: CATATAN TINDAK LANJUT */}
            <tr className="border-b border-black">
              <td colSpan={5} className="p-3 text-[8.5pt] leading-relaxed text-slate-800">
                {notulen.tindak_lanjut ||
                  "Hasil rapat management review ini akan diperiksa statusnya pada rapat berikutnya yang pelaksanaannya akan ditentukan kemudian."}
              </td>
            </tr>

            {/* ROW 6: TANDA TANGAN (Notulis & Koordinator SMKI) */}
            <tr>
              <td colSpan={5} className="p-0">
                <table className="w-full border-collapse text-[8.5pt]">
                  <tbody>
                    <tr>
                      {/* Kolom Kiri: Notulis */}
                      <td className="w-1/2 p-4 align-top">
                        <p>Bandung, {formatTanggalIndo(notulen.tanggal) || "……………… 202.."}</p>
                        <p className="mt-0.5">Disiapkan oleh:</p>
                        <div className="h-16" />
                        <p className="font-bold underline">
                          {notulen.notulis ? `(${notulen.notulis})` : "(Notulis)"}
                        </p>
                      </td>

                      {/* Kolom Kanan: Koordinator SMKI */}
                      <td className="w-1/2 p-4 text-right pr-6 align-top">
                        <p>Mengetahui,</p>
                        <p className="font-bold mt-0.5">Koordinator SMKI</p>
                        <div className="h-16" />
                        <p className="font-bold underline">
                          {notulen.koordinator_smki
                            ? `(${notulen.koordinator_smki})`
                            : "(…………………………………….)"}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

          </tbody>
        </table>

      </div>

      {/* Print-specific style tag */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside,
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
          }
        }
      `}</style>
    </div>
  );
}
