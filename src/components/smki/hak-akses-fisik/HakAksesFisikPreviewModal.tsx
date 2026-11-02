"use client";

import React, { useRef } from "react";
import { X, Printer, Download, CheckSquare, Square } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import TteSpecimen from "@/components/smki/TteSpecimen";
import { HakAksesFisikItem, exportHakAksesFisikDocx } from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  data: HakAksesFisikItem | null;
}

const formatDateIndonesian = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  try {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export default function HakAksesFisikPreviewModal({ open, onClose, data }: Props) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!open || !data) return null;

  const ruanganList = Array.isArray(data.ruangan_akses) ? data.ruangan_akses : [];
  const keperluanList = Array.isArray(data.keperluan_alasan) ? data.keperluan_alasan : [];

  const isPendaftaran = (data.jenis_permintaan || "").toLowerCase() === "pendaftaran" || !data.jenis_permintaan;
  const isPenutupan = (data.jenis_permintaan || "").toLowerCase() === "penutupan";

  const isPermanen = (data.sifat_akses || "").toLowerCase() === "permanen" || !data.sifat_akses;
  const isSementara = (data.sifat_akses || "").toLowerCase() === "sementara";

  const waktuStr = data.waktu_akses || "7 x 24 jam";
  const is7x24 = waktuStr.includes("7 x 24") || waktuStr.includes("24 jam");
  const isJamKerja = waktuStr.includes("08.00") || waktuStr.toLowerCase().includes("kerja");
  const isWaktuLain = !is7x24 && !isJamKerja;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = async () => {
    try {
      const blob = await exportHakAksesFisikDocx({ id: data.id });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-019_${(data.nama_pemohon || "Dokumen").replace(/\s+/g, "_")}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Dokumen Word (.docx) berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh dokumen Word.");
    }
  };

  const renderCheckbox = (checked: boolean, label: string) => (
    <span className="inline-flex items-center gap-1.5 mr-4 text-[11px] leading-tight">
      {checked ? (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-black font-extrabold text-[10px] leading-none bg-black text-white">
          X
        </span>
      ) : (
        <span className="inline-flex w-3.5 h-3.5 border border-black bg-white" />
      )}
      <span>{label}</span>
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:static print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 print:hidden">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Preview Dokumen Resmi: FR-019 Formulir Hak Akses Fisik
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Format resmi SMKI Dinas Komunikasi dan Informatika Provinsi Jawa Barat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-all shadow-xs"
            >
              <Printer size={14} />
              Cetak / PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs"
            >
              <Download size={14} />
              Unduh Word (.docx)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container for Preview Paper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/50 dark:bg-slate-950 flex justify-center scrollbar-hide print:p-0 print:bg-white print:overflow-visible">
          {/* A4 Document Paper Container */}
          <div
            ref={printAreaRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 md:p-10 shadow-lg border border-slate-300 font-sans text-xs print:p-0 print:m-0 print:border-none print:shadow-none"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Kop & Header Box FR-019 */}
            <div className="border border-black">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    {/* Logo Pemprov */}
                    <td className="w-[140px] border-r border-black p-2 text-center align-middle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo-jabar.png"
                        alt="Logo Jabar"
                        width={70}
                        height={70}
                        className="mx-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="text-[9px] font-bold mt-1 uppercase tracking-tight">
                        Diskominfo<br />Provinsi Jawa Barat
                      </div>
                    </td>

                    {/* Judul Formulir */}
                    <td className="border-r border-black p-4 text-center align-middle">
                      <h1 className="text-base md:text-lg font-bold tracking-wide uppercase">
                        Formulir Hak Akses Fisik
                      </h1>
                    </td>

                    {/* Kontrol Dokumen */}
                    <td className="w-[240px] p-2 text-[10px] align-middle">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="font-bold py-0.5 w-[90px]">No. Dokumen</td>
                            <td className="w-2">:</td>
                            <td className="font-mono font-medium">{data.header_no_dokumen || data.nomor_dokumen || "FR-019//KOM.03.05/SANDIKAMI"}</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">No. Revisi</td>
                            <td>:</td>
                            <td>{data.header_no_revisi || "1.1"}</td>
                          </tr>
                          <tr>
                            <td className="font-bold py-0.5">Tanggal Berlaku</td>
                            <td>:</td>
                            <td>{data.header_tanggal_berlaku ? formatDateIndonesian(data.header_tanggal_berlaku) : "07 Juli 2022"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Data Pemohon Table */}
              <table className="w-full border-t border-black text-[11px]">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-[100px] p-1.5 font-bold border-r border-black bg-slate-50/50">Nama</td>
                    <td className="w-2 p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5 border-r border-black font-semibold">{data.nama_pemohon}</td>
                    <td className="w-[120px] p-1.5 font-bold border-r border-black bg-slate-50/50">Jabatan</td>
                    <td className="w-2 p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5">{data.jabatan || "-"}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 font-bold border-r border-black bg-slate-50/50">Tanggal</td>
                    <td className="p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5 border-r border-black">{formatDateIndonesian(data.tanggal_pengajuan)}</td>
                    <td className="p-1.5 font-bold border-r border-black bg-slate-50/50">Unit Kerja/Penyedia</td>
                    <td className="p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5">{data.unit_kerja || "-"}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 font-bold border-r border-black bg-slate-50/50">No. HP</td>
                    <td className="p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5 border-r border-black">{data.no_handphone || "-"}</td>
                    <td className="p-1.5 font-bold border-r border-black bg-slate-50/50">Email</td>
                    <td className="p-1.5 border-r border-black text-center">:</td>
                    <td className="p-1.5">{data.email || "-"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Content Checklist Area */}
              <div className="p-3 text-[11px] space-y-2.5">
                {/* 1. Jenis Permintaan */}
                <div>
                  <span className="font-bold mr-3">Jenis Permintaan :</span>
                  {renderCheckbox(isPendaftaran, "Pendaftaran")}
                  {renderCheckbox(isPenutupan, "Penutupan")}
                </div>

                {/* 2. Jenis Akses (Ruangan) */}
                <div>
                  <div className="font-bold mb-1">
                    Jenis akses ( beri tanda X untuk pilihan yang sesuai ) :
                  </div>
                  <div className="grid grid-cols-4 gap-y-1 pl-2">
                    {renderCheckbox(ruanganList.includes("Data Center"), "Data Center")}
                    {renderCheckbox(ruanganList.includes("Ruang NOC"), "Ruang NOC")}
                    {renderCheckbox(ruanganList.includes("UPS"), "UPS")}
                    {renderCheckbox(ruanganList.includes("Akses Genset Gedung"), "Akses Genset Gedung")}
                    {renderCheckbox(ruanganList.includes("Pintu Utama"), "Pintu Utama")}
                    {renderCheckbox(ruanganList.includes("Ruang SOC"), "Ruang SOC")}
                    {renderCheckbox(ruanganList.includes("Akses Genset DC"), "Akses Genset DC")}
                  </div>
                </div>

                {/* 3. Keperluan & Alasan */}
                <div>
                  <div className="font-bold mb-1">
                    Keperluan dan alasan pendaftaran/penutupan akses:
                  </div>
                  <div className="flex flex-wrap gap-y-1 pl-2">
                    {renderCheckbox(keperluanList.includes("Instansi"), "Instansi")}
                    {renderCheckbox(keperluanList.includes("Monitoring"), "Monitoring")}
                    {renderCheckbox(keperluanList.includes("Perawatan"), "Perawatan")}
                    {renderCheckbox(
                      keperluanList.includes("Lainnya") || Boolean(data.keperluan_lainnya),
                      `Lainnya : ${data.keperluan_lainnya || "Pindah Tugas / Mutasi OPD lain"}`
                    )}
                  </div>
                </div>

                {/* 4. Sifat Akses & Waktu Akses */}
                <div className="grid grid-cols-2 gap-4 border-t border-dotted border-black/40 pt-2">
                  <div>
                    <span className="font-bold mr-3">Sifat Akses:</span>
                    {renderCheckbox(isPermanen, "Permanen")}
                    {renderCheckbox(isSementara, "Sementara")}
                  </div>
                  <div>
                    <span className="font-bold mr-3">Waktu Akses:</span>
                    {renderCheckbox(is7x24, "7 x 24 jam")}
                    {renderCheckbox(isJamKerja, "08.00 – 17.00")}
                    {isWaktuLain && renderCheckbox(true, `Lainnya : ${data.waktu_akses_lainnya || waktuStr}`)}
                  </div>
                </div>

                {isSementara && data.berlaku_sampai && (
                  <div className="pl-2 italic text-slate-700">
                    * Hak Akses ini berlaku sampai tanggal :{" "}
                    <strong>{formatDateIndonesian(data.berlaku_sampai)}</strong>
                  </div>
                )}

                {/* 5. Ketentuan Penggunaan Hak Akses */}
                <div className="border-t border-black pt-2 text-[10px] leading-relaxed">
                  <div className="font-bold mb-1 uppercase tracking-tight">Ketentuan Penggunaan Hak Akses :</div>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Pemohon harus menyetujui dan mematuhi kebijakan keamanan Informasi Dinas Komunikasi dan Informatika Provinsi Jawa Barat;</li>
                    <li>Pemohon dilarang mengalihkan dan/atau meminjamkan hak akses kepada pihak lain;</li>
                    <li>Pemohon dilarang menyalahgunakan akses untuk kepentingan selain penugasan yang telah ditetapkan;</li>
                    <li>Penyalahgunaan hak akses menjadi tanggungjawab Pemohon dan akan menyebabkan pencabutan akses, tindakan disiplin dan/atau sanksi peraturan yang berlaku;</li>
                  </ol>
                  <p className="mt-1.5 italic font-semibold text-center">
                    &ldquo;Saya bersedia mematuhi ketentuan ini. Saya akan menggunakan hak akses fisik sesuai pekerjaan saya dan akan melaporkan setiap gangguan, masalah atau insiden yang saya ketahui kepada petugas yang ditetapkan.&rdquo;
                  </p>
                </div>
              </div>

              {/* 6. Signature Grid (4 Kolom dengan Spesimen TTE) */}
              <div className="border-t border-black grid grid-cols-2 text-center text-[10.5px]">
                {/* Kolom 1: Pemohon (Tanda Tangan Basah) */}
                <div className="p-2 border-r border-b border-black flex flex-col justify-between min-h-[135px]">
                  <div>
                    <div className="font-semibold">Dibuat Oleh:</div>
                    <div className="font-bold">Pemohon,</div>
                  </div>
                  <div className="my-2 flex items-center justify-center min-h-[55px]">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded print:hidden">
                      ( Tanda Tangan Basah )
                    </span>
                  </div>
                  <div>
                    <div className="font-bold underline">
                      ( {data.pemohon_nama || data.nama_pemohon || "…………………………………"} )
                    </div>
                    {data.nip && <div className="text-[9px] text-slate-600">NIP. {data.nip}</div>}
                  </div>
                </div>

                {/* Kolom 2: Atasan Pemohon */}
                <div className="p-2 border-b border-black flex flex-col justify-between min-h-[135px]">
                  <div>
                    <div className="font-semibold">Diketahui Oleh:</div>
                    <div className="font-bold">Atasan Pemohon,</div>
                  </div>
                  <div className="my-1 flex items-center justify-center min-h-[55px]">
                    <TteSpecimen
                      nip={data.atasan_nip}
                      nama={data.atasan_nama}
                      width={180}
                    />
                  </div>
                  <div className="font-bold underline">
                    ( {data.atasan_nama || "…………………………………"} )
                  </div>
                  {data.atasan_nip && <div className="text-[9px] text-slate-600">NIP. {data.atasan_nip}</div>}
                </div>

                {/* Kolom 3: Penanggung Jawab Perangkat */}
                <div className="p-2 border-r border-black flex flex-col justify-between min-h-[135px]">
                  <div>
                    <div className="font-semibold">Disetujui Oleh:</div>
                    <div className="font-bold">Penanggung Jawab Perangkat,</div>
                  </div>
                  <div className="my-1 flex items-center justify-center min-h-[55px]">
                    <TteSpecimen
                      nip={data.penanggung_jawab_nip}
                      nama={data.penanggung_jawab_nama}
                      width={180}
                    />
                  </div>
                  <div className="font-bold underline">
                    ( {data.penanggung_jawab_nama || "…………………………………"} )
                  </div>
                  {data.penanggung_jawab_nip && <div className="text-[9px] text-slate-600">NIP. {data.penanggung_jawab_nip}</div>}
                </div>

                {/* Kolom 4: Agen / Pelaksana */}
                <div className="p-2 flex flex-col justify-between min-h-[135px]">
                  <div>
                    <div className="font-semibold">Dilaksanakan Oleh:</div>
                    <div className="font-bold">Agen,</div>
                  </div>
                  <div className="my-1 flex items-center justify-center min-h-[55px]">
                    <TteSpecimen
                      nip={data.agen_nip}
                      nama={data.agen_nama}
                      width={180}
                    />
                  </div>
                  <div className="font-bold underline">
                    ( {data.agen_nama || "…………………………………"} )
                  </div>
                  {data.agen_nip && <div className="text-[9px] text-slate-600">NIP. {data.agen_nip}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 print:hidden">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Nomor: <strong className="text-slate-800 dark:text-slate-200">{data.nomor_dokumen}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Tutup Preview
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
            >
              <Printer size={14} />
              Print / Cetak PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={14} />
              Unduh File Asli Word (.docx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
