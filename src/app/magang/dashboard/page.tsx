"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Eye, Edit, Pencil, Trash2, Plus, Printer, Upload, Download, FileText, Search, RotateCcw, GraduationCap, ClipboardList, CheckCircle2, Award } from "lucide-react";
import { getMagangList, deleteMagang, createMagang, updateMagang, uploadMagangNda, getBidangs } from "@/services/api";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/useAuthStore";

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const cleanStr = dateString.includes("T") ? dateString.split("T")[0] : dateString;
    const parts = cleanStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

const numberToWords = (n: number): string => {
  const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (n < 12) return units[n];
  if (n < 20) return numberToWords(n - 10) + " Belas";
  if (n < 100) return numberToWords(Math.floor(n / 10)) + " Puluh" + (n % 10 !== 0 ? " " + numberToWords(n % 10) : "");
  if (n < 200) return "Seratus" + (n % 100 !== 0 ? " " + numberToWords(n % 100) : "");
  if (n < 1000) return numberToWords(Math.floor(n / 100)) + " Ratus" + (n % 100 !== 0 ? " " + numberToWords(n % 100) : "");
  if (n < 2000) return "Seribu" + (n % 1000 !== 0 ? " " + numberToWords(n % 1000) : "");
  if (n < 10000) return numberToWords(Math.floor(n / 1000)) + " Ribu" + (n % 1000 !== 0 ? " " + numberToWords(n % 1000) : "");
  return String(n);
};

const formatIndonesianFullDateText = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return "-";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const yearNum = date.getFullYear();

  const dayWords = numberToWords(dayNum);
  const yearWords = numberToWords(yearNum);

  return `${dayName} tanggal ${dayWords} Bulan ${monthName} tahun ${yearWords} (${dayNum} ${monthName} ${yearNum})`;
};

const isSertifikatEligible = (tglSelesai: string) => {
  if (!tglSelesai) return false;
  const cleanStr = tglSelesai.includes("T") ? tglSelesai.split("T")[0] : tglSelesai;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(cleanStr + "T00:00:00");
  end.setHours(0, 0, 0, 0);
  return today.getTime() >= end.getTime();
};

const formatCertificatePeriod = (tglMulaiStr: string, tglSelesaiStr: string) => {
  if (!tglMulaiStr || !tglSelesaiStr) return "-";
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const cleanMulai = tglMulaiStr.includes("T") ? tglMulaiStr.split("T")[0] : tglMulaiStr;
  const cleanSelesai = tglSelesaiStr.includes("T") ? tglSelesaiStr.split("T")[0] : tglSelesaiStr;

  const startDate = new Date(cleanMulai + "T00:00:00");
  const endDate = new Date(cleanSelesai + "T00:00:00");

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return `${cleanMulai} s.d ${cleanSelesai}`;
  }

  const startDay = startDate.getDate();
  const startMonth = months[startDate.getMonth()];
  const startYear = startDate.getFullYear();

  const endDay = endDate.getDate();
  const endMonth = months[endDate.getMonth()];
  const endYear = endDate.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startDay} s.d ${endDay} ${endMonth} ${endYear}`;
    }
    return `${startDay} ${startMonth} s.d ${endDay} ${endMonth} ${endYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} s.d ${endDay} ${endMonth} ${endYear}`;
};


/* Ilustrasi banner Magang — gaya sama dengan IsometricIllustration di Dashboard */
function MagangIllustration() {
  const rows = [
    { color: "bg-cyan-400/70", pill: "bg-blue-400/50", w: "w-14" },
    { color: "bg-emerald-400/70", pill: "bg-emerald-400/50", w: "w-10" },
    { color: "bg-purple-400/70", pill: "bg-blue-400/50", w: "w-12" },
  ];
  return (
    <div className="relative w-[320px] h-[180px] flex items-center justify-center pointer-events-none select-none">
      <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full transform scale-75" />

      {/* Jendela preview data magang */}
      <div className="relative z-10 w-[200px] h-[130px] rounded-xl bg-gradient-to-tr from-slate-900/90 to-blue-950/95 border border-white/30 backdrop-blur-md shadow-2xl p-2.5 flex flex-col gap-2 transform -rotate-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
            <span className="w-2 h-2 rounded-full bg-green-400/80" />
          </div>
          <span className="text-[8px] text-cyan-200/80 font-mono">magang.preview</span>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-1.5 py-1">
              <span className={`w-4 h-4 rounded-full ${r.color} flex-shrink-0`} />
              <div className="flex-1 space-y-0.5">
                <div className={`${r.w} h-1 bg-white/50 rounded-full`} />
                <div className="w-8 h-1 bg-white/25 rounded-full" />
              </div>
              <span className={`w-7 h-2.5 rounded-full ${r.pill}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Ikon melayang */}
      <div className="absolute left-6 top-3 z-20 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-900/40 border border-white/30 flex items-center justify-center transform -rotate-12">
        <GraduationCap size={20} className="text-white" />
      </div>
      <div className="absolute right-5 top-3 z-20 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl shadow-rose-900/40 border border-white/30 flex items-center justify-center transform rotate-12">
        <FileText size={17} className="text-white" />
      </div>
      <div className="absolute right-10 -bottom-1 z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-900/40 border border-white/30 flex items-center justify-center transform rotate-6">
        <Award size={20} className="text-white" />
      </div>
      <div className="absolute left-9 bottom-2 z-20 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-teal-900/40 border border-white/30 flex items-center justify-center transform rotate-12">
        <UserCheck size={16} className="text-white" />
      </div>
    </div>
  );
}

export default function MagangDashboard() {
  const { bidang: authBidang, isAdminAptika } = useAuthStore();
  const [magangs, setMagangs] = useState<any[]>([]);
  const [bidangs, setBidangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("add");
  const [selectedMagang, setSelectedMagang] = useState<any>(null);

  // NDA Modal state
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [ndaFormData, setNdaFormData] = useState({
    magangId: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  // Upload NDA Modal State
  const [isUploadNdaModalOpen, setIsUploadNdaModalOpen] = useState(false);
  const [targetMagangForNda, setTargetMagangForNda] = useState<any>(null);
  const [uploadNdaFile, setUploadNdaFile] = useState<File | null>(null);
  const [isUploadingNda, setIsUploadingNda] = useState(false);

  const handleOpenUploadNdaModal = (magang: any) => {
    setTargetMagangForNda(magang);
    setUploadNdaFile(null);
    setIsUploadNdaModalOpen(true);
  };

  const handleSaveNdaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMagangForNda || !uploadNdaFile) return;

    try {
      setIsUploadingNda(true);
      await uploadMagangNda(targetMagangForNda.id, uploadNdaFile);
      await fetchData();
      setIsUploadNdaModalOpen(false);
      setUploadNdaFile(null);
      alert("File NDA berhasil diupload!");
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengupload file NDA: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingNda(false);
    }
  };

  const handlePrintCertificate = async (item: any) => {
    if (!isSertifikatEligible(item.tgl_selesai)) {
      alert(`Sertifikat belum dapat dicetak. Tanggal selesai magang adalah ${formatDate(item.tgl_selesai)}.`);
      return;
    }

    if (item.sertifikat !== "Sudah menerima") {
      try {
        const payload = new FormData();
        payload.append("nama", item.nama);
        payload.append("nama_kampus", item.nama_kampus);
        payload.append("tgl_mulai_magang", item.tgl_mulai);
        payload.append("tgl_selesai_magang", item.tgl_selesai);
        payload.append("sertifikat", "Sudah menerima");
        if (item.keterangan) payload.append("keterangan", item.keterangan);

        await updateMagang(item.id, payload);
        fetchData();
      } catch (e) {
        console.error("Gagal memperbarui status sertifikat", e);
      }
    }

    const periodText = formatCertificatePeriod(item.tgl_mulai, item.tgl_selesai);
    const logoUrl = typeof window !== "undefined" ? window.location.origin + "/logo-jabar.png" : "/logo-jabar.png";
    const esignLogoUrl = typeof window !== "undefined" ? window.location.origin + "/logo-esign.png" : "/logo-esign.png";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Mohon izinkan pop-up di browser Anda.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Sertifikat Magang - ${item.nama}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }
          @media print {
            html, body {
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          *, *:before, *:after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            background-color: #ffffff;
            position: relative;
            overflow: hidden;
            color: #0f172a;
          }

          .bg-waves {
            position: absolute;
            inset: 0;
            z-index: 1;
            opacity: 0.45;
            pointer-events: none;
            width: 100%;
            height: 100%;
          }

          .geo-left-bar {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 14px;
            background-color: #0F62FE;
            z-index: 2;
          }

          .geo-tl {
            position: absolute;
            top: 0;
            left: 14px;
            z-index: 2;
          }
          .geo-tl .block-teal-1 { position: absolute; top: 12px; left: 0; width: 22px; height: 50px; background-color: #00CBA5; }
          .geo-tl .block-blue-1 { position: absolute; top: 12px; left: 26px; width: 38px; height: 95px; background-color: #0F62FE; }
          .geo-tl .block-yellow-1 { position: absolute; top: 38px; left: 68px; width: 44px; height: 35px; background-color: #FFE135; }
          .geo-tl .block-teal-2 { position: absolute; top: 125px; left: 0; width: 62px; height: 32px; background-color: #00CBA5; }
          .geo-tl .block-yellow-2 { position: absolute; top: 165px; left: 0; width: 22px; height: 50px; background-color: #FFE135; }

          .geo-br {
            position: absolute;
            bottom: 0;
            right: 0;
            z-index: 2;
          }
          .geo-br .block-yellow-1 { position: absolute; bottom: 215px; right: 14px; width: 45px; height: 35px; background-color: #FFE135; }
          .geo-br .block-teal-1 { position: absolute; bottom: 175px; right: 14px; width: 120px; height: 35px; background-color: #00CBA5; }
          .geo-br .block-blue-1 { position: absolute; bottom: 48px; right: 80px; width: 50px; height: 120px; background-color: #0F62FE; }
          .geo-br .block-yellow-2 { position: absolute; bottom: 110px; right: 14px; width: 60px; height: 38px; background-color: #FFE135; }
          .geo-br .block-teal-2 { position: absolute; bottom: 14px; right: 14px; width: 45px; height: 90px; background-color: #00CBA5; }
          .geo-br .block-yellow-3 { position: absolute; bottom: 35px; right: 145px; width: 75px; height: 42px; background-color: #FFE135; }
          .geo-br .bottom-bar { position: absolute; bottom: 0; right: 0; width: 340px; height: 16px; background-color: #0F62FE; }
          .geo-br .right-bar { position: absolute; bottom: 0; right: 0; top: 0; width: 14px; background-color: #0F62FE; }

          .logo-badge {
            position: absolute;
            top: 28px;
            right: 48px;
            z-index: 3;
            background: rgba(255, 255, 255, 0.95);
            border: 1.5px solid #e2e8f0;
            border-radius: 40px;
            padding: 6px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-badge img {
            height: 42px;
            width: auto;
          }

          .watermark-logo {
            position: absolute;
            top: 50%;
            left: 34%;
            transform: translate(-50%, -50%);
            z-index: 1;
            opacity: 0.07;
            pointer-events: none;
          }
          .watermark-logo img {
            width: 360px;
            height: auto;
          }

          .cert-container {
            position: relative;
            z-index: 10;
            padding: 48px 80px 40px 105px;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          .header-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 38pt;
            font-weight: 800;
            color: #081B4B;
            margin: 0 0 2px 0;
            letter-spacing: -0.5px;
            text-align: left;
          }

          .header-subtitle {
            font-size: 13.5pt;
            font-weight: 500;
            color: #334155;
            margin: 0 0 16px 0;
            text-align: left;
          }

          .recipient-name {
            font-family: 'Great Vibes', cursive;
            font-size: 46pt;
            font-weight: 400;
            color: #091D4C;
            margin: 0 0 16px 0;
            line-height: 1.2;
            text-align: left;
          }

          .cert-body {
            font-size: 11pt;
            line-height: 1.55;
            color: #1e293b;
            text-align: left;
            max-width: 680px;
            margin: 0;
            font-weight: 500;
          }

          .cert-body strong {
            font-weight: 700;
            color: #0f172a;
          }

          .footer-section {
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            gap: 30px;
            padding: 0;
            margin-top: 28px;
          }

          .esign-box {
            border: 1.5px solid #1e293b;
            border-radius: 16px;
            padding: 10px 14px;
            width: 310px;
            background: #ffffff;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
          }

          .esign-icon {
            height: 52px;
            width: auto;
            object-fit: contain;
            flex-shrink: 0;
          }

          .esign-text {
            font-size: 7.5pt;
            line-height: 1.35;
            color: #0f172a;
          }

          .esign-text .header-esign {
            font-size: 7pt;
            color: #475569;
            margin-bottom: 3px;
          }

          .esign-text .title-esign {
            font-weight: 700;
            font-size: 7.5pt;
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 10px;
          }

          .esign-text .signer-name {
            font-weight: 800;
            font-size: 8.5pt;
            margin-bottom: 3px;
          }

          .esign-text .signer-rank {
            font-size: 7.5pt;
            color: #334155;
          }

          .gold-medal {
            width: 82px;
            height: 82px;
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>

        <svg class="bg-waves" viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Upper Wave Ribbon (4px spacing) -->
          <path d="M-100 180 C150 80, 350 380, 600 230 C850 80, 1050 330, 1200 180" stroke="#CBD5E1" stroke-width="1" fill="none"/>
          <path d="M-100 184 C150 84, 350 384, 600 234 C850 84, 1050 334, 1200 184" stroke="#D1D5DB" stroke-width="1" fill="none"/>
          <path d="M-100 188 C150 88, 350 388, 600 238 C850 88, 1050 338, 1200 188" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          <path d="M-100 192 C150 92, 350 392, 600 242 C850 92, 1050 342, 1200 192" stroke="#E5E7EB" stroke-width="1" fill="none"/>
          <path d="M-100 196 C150 96, 350 396, 600 246 C850 96, 1050 346, 1200 196" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          <path d="M-100 200 C150 100, 350 400, 600 250 C850 100, 1050 350, 1200 200" stroke="#CBD5E1" stroke-width="1" fill="none"/>
          <path d="M-100 204 C150 104, 350 404, 600 254 C850 104, 1050 354, 1200 204" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          <path d="M-100 208 C150 108, 350 408, 600 258 C850 108, 1050 358, 1200 208" stroke="#F1F5F9" stroke-width="1" fill="none"/>

          <!-- Lower Wave Ribbon (4px spacing) -->
          <path d="M-100 480 C200 330, 450 630, 750 430 C950 300, 1100 480, 1200 430" stroke="#CBD5E1" stroke-width="1" fill="none"/>
          <path d="M-100 484 C200 334, 450 634, 750 434 C950 304, 1100 484, 1200 434" stroke="#D1D5DB" stroke-width="1" fill="none"/>
          <path d="M-100 488 C200 338, 450 638, 750 438 C950 308, 1100 488, 1200 438" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          <path d="M-100 492 C200 342, 450 642, 750 442 C950 312, 1100 492, 1200 442" stroke="#E5E7EB" stroke-width="1" fill="none"/>
          <path d="M-100 496 C200 346, 450 646, 750 446 C950 316, 1100 496, 1200 446" stroke="#E2E8F0" stroke-width="1" fill="none"/>
          <path d="M-100 500 C200 350, 450 650, 750 450 C950 320, 1100 500, 1200 450" stroke="#CBD5E1" stroke-width="1" fill="none"/>
        </svg>

        <div class="geo-left-bar"></div>

        <div class="watermark-logo">
          <img src="${logoUrl}" alt="Watermark Diskominfo" />
        </div>

        <div class="geo-tl">
          <div class="block-teal-1"></div>
          <div class="block-blue-1"></div>
          <div class="block-yellow-1"></div>
          <div class="block-teal-2"></div>
          <div class="block-yellow-2"></div>
        </div>

        <div class="geo-br">
          <div class="block-yellow-1"></div>
          <div class="block-teal-1"></div>
          <div class="block-blue-1"></div>
          <div class="block-yellow-2"></div>
          <div class="block-teal-2"></div>
          <div class="block-yellow-3"></div>
          <div class="bottom-bar"></div>
          <div class="right-bar"></div>
        </div>

        <div class="logo-badge">
          <img src="${logoUrl}" alt="Logo Diskominfo Jabar" />
        </div>

        <div class="cert-container">

          <div>
            <h1 class="header-title">Sertifikat</h1>
            <p class="header-subtitle">Diberikan kepada :</p>
            <div class="recipient-name">${item.nama}</div>
            <div class="cert-body">
              Yang telah selesai melaksanakan Kerja Praktek di Dinas Komunikasi dan Informatika Provinsi Jawa Barat, pada <strong>${periodText}</strong> dan yang bersangkutan dinyatakan memenuhi persyaratan dan peraturan yang berlaku, sehingga kepadanya diberikan sertifikat.
            </div>
          </div>

          <div class="footer-section">

            <div class="esign-box">
              <img src="${esignLogoUrl}" class="esign-icon" alt="Logo E-Sign" />
              <div class="esign-text">
                <div class="header-esign">Ditandatangani secara elektronik oleh:</div>
                <div class="title-esign">KEPALA DINAS KOMUNIKASI DAN INFORMATIKA<br>PROVINSI JAWA BARAT</div>
                <div class="signer-name">MAS ADI KOMAR, S.STP., M.Tr.A.P.</div>
                <div class="signer-rank">Pembina Tk.I</div>
              </div>
            </div>

            <div class="gold-medal">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38 65 L28 95 L40 88 L48 95 L43 65 Z" fill="#D97706"/>
                <path d="M62 65 L57 95 L65 88 L77 95 L67 65 Z" fill="#B45309"/>
                <circle cx="50" cy="45" r="38" fill="#F59E0B"/>
                <circle cx="50" cy="45" r="34" fill="#FBBF24"/>
                <circle cx="50" cy="45" r="30" fill="#F59E0B"/>
                <circle cx="50" cy="45" r="28" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
                <circle cx="50" cy="45" r="22" fill="#F59E0B"/>
                <path d="M50 29 L54 38 L64 39 L57 46 L59 56 L50 51 L41 56 L43 46 L36 39 L46 38 Z" fill="#FEF3C7"/>
              </svg>
            </div>

          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };







  // Melacak ID anak magang yang sudah mencetak NDA
  const [printedNdaIds, setPrintedNdaIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("printed_nda_ids");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch (e) { }
      }
    }
    return [];
  });

  const availableMagangs = magangs.filter(
    (m) => !printedNdaIds.includes(String(m.id))
  );



  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    nama_kampus: "",
    bidang_id: "",
    tgl_mulai_magang: "",
    tgl_selesai_magang: "",
    sertifikat: "Belum menerima",
    keterangan: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Compute status magang otomatis berdasarkan tanggal
  const computeStatusMagang = (tglMulai: string, tglSelesai: string) => {
    if (!tglMulai || !tglSelesai) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(tglMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tglSelesai);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Belum mulai";
    if (today > end) return "Selesai magang";
    return "Sedang magang";
  };

  const currentStatus = computeStatusMagang(formData.tgl_mulai_magang, formData.tgl_selesai_magang);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMagang, resBidang] = await Promise.all([
        getMagangList(),
        getBidangs().catch(() => ({ data: [] })),
      ]);
      if (resMagang?.data) {
        const sorted = [...resMagang.data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
        setMagangs(sorted);
      }
      if (resBidang?.data) {
        setBidangs(resBidang.data);
      }
    } catch (error) {
      console.error("Failed to fetch magang data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
      try {
        await deleteMagang(id);
        const updatedPrintedIds = printedNdaIds.filter((printedId) => printedId !== String(id));
        setPrintedNdaIds(updatedPrintedIds);
        if (typeof window !== "undefined") {
          localStorage.setItem("printed_nda_ids", JSON.stringify(updatedPrintedIds));
        }
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleOpenModal = (mode: "view" | "edit" | "add", data?: any) => {
    setModalMode(mode);
    setSelectedMagang(data || null);
    if (data && mode !== "add") {
      setFormData({
        nama: data.nama || "",
        nama_kampus: data.nama_kampus || "",
        bidang_id: data.bidang_id ? String(data.bidang_id) : (data.bidang?.id ? String(data.bidang.id) : (authBidang?.id ? String(authBidang.id) : "")),
        tgl_mulai_magang: data.tgl_mulai || "",
        tgl_selesai_magang: data.tgl_selesai || "",
        sertifikat: data.sertifikat || "Belum menerima",
        keterangan: data.keterangan || "",
      });
      setCvFile(null);
    } else {
      setFormData({
        nama: "",
        nama_kampus: "",
        bidang_id: authBidang?.id ? String(authBidang.id) : "",
        tgl_mulai_magang: "",
        tgl_selesai_magang: "",
        sertifikat: "Belum menerima",
        keterangan: "",
      });
      setCvFile(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenNdaModal = () => {
    const unprinted = magangs.filter((m) => !printedNdaIds.includes(String(m.id)));
    setNdaFormData({
      magangId: unprinted.length > 0 ? String(unprinted[0].id) : "",
      tanggal: new Date().toISOString().split("T")[0],
    });
    setIsNdaModalOpen(true);
  };

  const handleOpenNdaModalForMagang = (magangId: number) => {
    setNdaFormData({
      magangId: String(magangId),
      tanggal: new Date().toISOString().split("T")[0],
    });
    setIsNdaModalOpen(true);
  };

  const handlePrintNda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ndaFormData.magangId) {
      alert("Silakan pilih nama anak magang terlebih dahulu.");
      return;
    }

    const selected = magangs.find((m) => String(m.id) === String(ndaFormData.magangId));
    if (!selected) {
      alert("Data anak magang tidak ditemukan.");
      return;
    }

    const selectedIndex = magangs.findIndex((m) => String(m.id) === String(ndaFormData.magangId));
    const seqNumber = String(selectedIndex >= 0 ? selectedIndex + 7 : 7).padStart(2, "0");
    const fullDateText = formatIndonesianFullDateText(ndaFormData.tanggal);
    const dateObj = new Date(ndaFormData.tanggal + "T00:00:00");
    const yearNum = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
    const generatedNomorSurat = `NO: ${seqNumber}/NDA/APTIKA/${yearNum}`;
    const logoUrl = typeof window !== "undefined" ? window.location.origin + "/logo-jabar.png" : "/logo-jabar.png";

    // Tandai anak magang ini sudah selesai mencetak NDA (dihapus dari list dropdown)
    const updatedPrintedIds = Array.from(new Set([...printedNdaIds, String(selected.id)]));
    setPrintedNdaIds(updatedPrintedIds);

    if (typeof window !== "undefined") {
      localStorage.setItem("printed_nda_ids", JSON.stringify(updatedPrintedIds));
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Mohon izinkan pop-up di browser Anda.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title></title>
        <style>
          @page {
            size: A4;
            margin: 2cm 20mm 15mm 20mm;
          }
          *, *:before, *:after {
            box-sizing: border-box;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.45;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 12px;
          }
          .logo-container img {
            width: 80px;
            height: auto;
          }
          .title-header {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            line-height: 1.35;
            margin-bottom: 18px;
          }
          .title-header .doc-no {
            margin-top: 8px;
            font-size: 10pt;
            font-weight: bold;
          }
          p {
            margin-top: 0;
            margin-bottom: 8px;
            text-align: justify;
            text-justify: inter-word;
          }
          .party-block {
            margin-left: 15px;
            margin-bottom: 8px;
          }
          .table-party {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
          }
          .table-party td {
            padding: 1px 4px;
            vertical-align: top;
          }
          .table-party td.label {
            width: 85px;
          }
          .table-party td.colon {
            width: 15px;
            text-align: center;
          }
          .section-title {
            font-weight: bold;
            margin-top: 12px;
            margin-bottom: 4px;
            page-break-after: avoid;
          }
          .sub-block {
            padding-left: 15px;
          }
          .sub-block-2 {
            padding-left: 15px;
          }
          .signature-container {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .signature-role {
            margin-bottom: 60px;
          }
          .signature-name {
            font-weight: bold;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>

        <div class="logo-container">
          <img src="${logoUrl}" alt="Logo Jawa Barat" />
        </div>

        <div class="title-header">
          PERJANJIAN<br>
          LARANGAN PENGUNGKAPAN DAN KERAHASIAAN<br>
          ANTARA<br>
          DINAS KOMUNIKASI DAN INFORMATIKA PROVINSI JAWA BARAT<br>
          DENGAN<br>
          MAHASISWA MAGANG<br>
          ${(selected.nama_kampus || "").toUpperCase()}<br>
          <div class="doc-no">${generatedNomorSurat}</div>
        </div>

        <p>
          Perjanjian Larangan Pengungkapan dan Kerahasiaan (untuk selanjutnya disebut sebagai "Perjanjian") ini diadakan dan ditandatangani pada hari ${fullDateText}, antara:
        </p>

        <div class="party-block">
          <table class="table-party">
            <tr>
              <td class="label">1. Nama</td>
              <td class="colon">:</td>
              <td>Dian Istanti, S.Sos, MAP</td>
            </tr>
            <tr>
              <td class="label">&nbsp;&nbsp;&nbsp;NIP</td>
              <td class="colon">:</td>
              <td>19690519 199803 2 001</td>
            </tr>
            <tr>
              <td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td>
              <td class="colon">:</td>
              <td>Kepala Bidang Aplikasi Informatika</td>
            </tr>
          </table>
          <p style="margin-left: 0;">
            yang bertindak sebagai dan atas nama Dinas Komunikasi dan Informatika Provinsi Jawa Barat untuk selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
          </p>
        </div>

        <div class="party-block">
          <table class="table-party">
            <tr>
              <td class="label">2. Nama</td>
              <td class="colon">:</td>
              <td>${selected.nama}</td>
            </tr>
            <tr>
              <td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td>
              <td class="colon">:</td>
              <td>Mahasiswa Magang</td>
            </tr>
          </table>
          <p style="margin-left: 0;">
            yang bertindak sebagai Mahasiswa Magang Dari ${selected.nama_kampus} untuk selanjutnya disebut Sebagian <strong>PIHAK KEDUA</strong>.
          </p>
        </div>

        <p>
          PIHAK PERTAMA dan PIHAK KEDUA selanjutnya bersama-sama dapat disebut "Para Pihak", atau masing-masing disebut "Pihak" dengan ini menjelaskan dan menyatakan sebagai berikut:
        </p>

        <p>
          Bahwa, dalam pelaksanaan kerja sama, Para Pihak akan saling bertukar informasi yang wajib dijaga kerahasiaannya.
        </p>

        <p>
          Bahwa, para Pihak merasa perlu untuk melindungi kepentingannya atas informasi yang diberikan kepada Pihak lainnya.
        </p>

        <p>
          Karenanya, Para Pihak dengan ini mengadakan Perjanjian ini, berdasarkan syarat-syarat dan ketentuan sebagai berikut:
        </p>

        <div class="section-title">1. PENGERTIAN</div>
        <div class="sub-block">
          <p>a. "Pihak Yang Mengungkapkan" berarti suatu Pihak yang memberikan Informasi Rahasia kepada Pihak lainnya;</p>
          <p>b. "Pihak Yang Menerima" berarti suatu Pihak yang menerima Informasi Rahasia dari Pihak lainnya;</p>
          <p>c. "Afiliasi" berarti setiap pihak, kerabat, anak perusahaan, atau induk perusahaan dari suatu Pihak, Perorangan atau perusahaan yang dikendalikan oleh, atau mengendalikan suatu Pihak;</p>
          <p>d. "Informasi Rahasia" berarti mencakup Informasi "Rahasia/Penting/Strategis" milik Pemerintah Daerah Provinsi Jawa Barat dapat berupa dokumen tercetak (hardcopy) atau file elektronik (softcopy), meliputi antara lain:</p>
          <div class="sub-block-2">
            <p>1) Data pribadi pegawai;</p>
            <p>2) Konfigurasi IT dan IP address;</p>
            <p>3) Password;</p>
            <p>4) Kode program (source code);</p>
            <p>5) Hasil scanning vulnerability/penetration testing;</p>
            <p>6) Hasil kajian risiko (risk assessment) dan hasil audit;</p>
            <p>7) Data lelang; dan</p>
            <p>8) Data/Informasi berkategori "Internal/Terbatas/Sensitif/Kritikal/Rahasia" lainnya milik Pemerintah Daerah Provinsi Jawa Barat.</p>
          </div>
        </div>

        <div class="section-title">2. KERAHASIAAN</div>
        <div class="sub-block">
          <p>a. Pihak Yang Menerima dengan ini setuju bahwa Informasi Rahasia merupakan hak milik dari, dan dimiliki oleh Pihak Yang Mengungkapkan. Tidak ada satu ketentuan pun dalam Perjanjian ini yang memberikan pengertian atau penafsiran, atau dapat ditafsirkan bahwa setiap Informasi Rahasia yang diberikan, dikirimkan atau diungkapkan kepada Pihak Yang Menerima adalah bentuk dari pengalihan kepemilikan, hibah, pemberian opsi, atau pemberian lisensi hak kekayaan intelektual atas Informasi Rahasia;</p>
          <p>b. Dengan diberikan atau diungkapkannya Informasi Rahasia oleh Pihak Yang Mengungkapkan kepada Pihak Yang Menerima, Pihak Yang Menerima wajib untuk:</p>
          <div class="sub-block-2">
            <p>1) Tidak membocorkan Informasi Rahasia/Penting/Strategis kepada pihak manapun baik secara langsung maupun tidak langsung;</p>
            <p>2) Tidak mempergunakan Informasi Rahasia yang dapat merugikan Pihak Yang Mengungkapkan dan tidak, dengan cara melawan hukum atau dengan cara yang tidak etis, mempergunakan Informasi Rahasia untuk keuntungan dirinya sendiri atau pihak lain;</p>
            <p>3) Tidak memanfaatkan informasi yang diakses dari Pemerintah Daerah Provinsi Jawa Barat selama penugasan untuk kepentingan di luar pelaksanaan tugas dan pekerjaan yang diberikan;</p>
            <p>4) Menjaga kerahasiaannya dan memastikan bahwa Informasi Rahasia tidak diungkapkan kepada Personil atau Afiliasi kecuali dalam hal pengungkapan tersebut dipandang perlu untuk kepentingan pekerjaan dan atas dasar "perlu untuk diketahui" untuk kepentingan pekerjaan tanpa mengesampingkan ketentuan lain dari Perjanjian ini;</p>
            <p>5) Mengamankan seluruh informasi dan sistem informasi sesuai kebijakan yang ditetapkan Pemerintah Daerah Provinsi Jawa Barat;</p>
            <p>6) Tidak membuka Informasi Rahasia kepada pihak ketiga manapun kecuali sebelumnya telah mendapatkan persetujuan tertulis dari Pihak Yang Mengungkapkan;</p>
            <p>7) Tidak, atau mengizinkan pihak lain, termasuk Personil dan Afiliasinya, untuk membuat fotokopi/salinan atau mereproduksi dalam bentuk apapun, setiap Informasi Rahasia tanpa sebelumnya telah mendapatkan persetujuan tertulis dari Pihak Yang Mengungkapkan, kecuali yang secara wajar diperlukan untuk pekerjaan; dan</p>
            <p>8) Mematuhi seluruh kebijakan dan prosedur yang ditetapkan Pemerintah Daerah Provinsi Jawa Barat menyangkut keamanan informasi.</p>
          </div>
          <p>c. Kewajiban untuk menjaga Informasi Rahasia sebagaimana dimaksud dalam butir b di atas tidak berlaku dalam hal Informasi Rahasia:</p>
          <div class="sub-block-2">
            <p>1) Telah menjadi pengetahuan umum atau telah dipublikasikan kepada umum dengan cara yang tidak melanggar ketentuan kerahasiaan berdasarkan Perjanjian ini maupun ketentuan lain yang terkait dengannya;</p>
            <p>2) Telah diketahui oleh Pihak Yang Menerima sebelum Informasi Rahasia diberikan atau diungkapkan kepada Pihak Yang Menerima sebagaimana dibuktikan dengan bukti tertulis Pihak Yang Menerima; dan</p>
            <p>3) Disyaratkan untuk diungkapkan berdasarkan ketentuan hukum yang berlaku atau berdasarkan perintah badan peradilan atau instansi Pemerintah terkait.</p>
          </div>
        </div>

        <div class="section-title">3. PENGEMBALIAN DAN PEMUSNAHAN INFORMASI RAHASIA</div>
        <p>
          Atas permintaan Pihak Yang Mengungkapkan, Pihak Yang Menerima wajib mengembalikan seluruh dokumen atau fasilitas sistem informasi Pemerintah Daerah Provinsi Jawa Barat yang dipinjamkan selama penugasan saya, termasuk mengembalikan hak akses baik logic (User ID) maupun fisik (ID Card) yang saya terima sebagai bagian dari pelaksanaan tugas dan pekerjaan yang diberikan.
        </p>

        <div class="section-title">4. JANJI LEBIH LANJUT</div>
        <p>Untuk lebih lanjut menjaga kerahasiaan dari Informasi Rahasia, Pihak Yang Menerima wajib:</p>
        <div class="sub-block">
          <p>a. Membuat agar seluruh Informasi Rahasia dan seluruh informasi yang dihasilkan oleh Pihak Yang Menerima dari Informasi Rahasia terpisah dari dokumen dan catatan-catatan/rekaman-rekaman lain Pihak Yang Menerima dan mengatur serta memelihara tempat penyimpanan yang layak dan aman atas setiap Informasi Rahasia dalam bentuk apapun yang berada padanya; dan</p>
          <p>b. Untuk tidak menggunakan, mereproduksi, mengalih bentuk, atau menyimpan setiap dari Informasi Rahasia pada komputer atau sistem penerimaan informasi elektronik yang dapat diakses oleh eksternal atau mengirimkan Informasi Rahasia tersebut dalam bentuk apapun ke luar tempat usaha Pihak Yang Menerima.</p>
        </div>

        <div class="section-title">5. PEMULIHAN</div>
        <p>
          Para Pihak mengakui dan sepakat bahwa ganti rugi berupa uang mungkin bukan merupakan penggantian yang cukup dalam hal pelanggaran terhadap Perjanjian ini oleh Pihak Yang Menerima. Karenanya, Para Pihak sepakat bahwa Pihak Yang Mengungkapkan berhak untuk mendapatkan penetapan-penetapan atau putusan-putusan pengadilan yang memerintahkan Pihak Yang Menerima wajib untuk berbuat atau untuk tidak berbuat sesuatu, termasuk penetapan-penetapan pengadilan yang mewajibkan Pihak Yang Menerima untuk melaksanakan ketentuan Perjanjian ini dalam hal terjadinya pelanggaran terhadap Perjanjian ini, sebagai tambahan dari hak-hak pemulihan lain yang dimiliki oleh Pihak Yang Mengungkapkan berdasarkan ketentuan peraturan yang berlaku.
        </p>

        <div class="section-title">6. KEBERLAKUAN</div>
        <p>
          Perjanjian ini memiliki jangka waktu paling lama selama 1 (satu) tahun. Meskipun demikian, kewajiban-kewajiban untuk menjaga kerahasiaan dan pembatasan-pembatasan atas penggunaan dan pengungkapan Informasi Rahasia yang berlaku atas Pihak Yang Menerima berdasarkan Perjanjian ini akan tetap berlanjut walaupun perjanjian telah diselesaikan, tidak berjalan, dibatalkan atau terjadinya pengakhiran dari Perjanjian ini.
        </p>

        <div class="section-title">7. HUKUM YANG BERLAKU</div>
        <p>
          Perjanjian ini serta pelaksanaan dari dan penafsiran atas Perjanjian ini diatur oleh dan tunduk pada hukum Negara Republik Indonesia.
        </p>

        <div class="section-title">8. PERUBAHAN</div>
        <p>
          Setiap perubahan terhadap Perjanjian ini tidak berlaku dan tidak mengikat bagi Para Pihak kecuali apabila perubahan tersebut dituangkan secara tertulis dan ditandatangani oleh wakil-wakil yang sah dari Para Pihak. Setelah perubahan tersebut ditandatangani dengan sebagaimana mestinya oleh wakil-wakil yang sah dari Para Pihak, perubahan tersebut akan menjadi satu kesatuan dengan dan bagian yang tidak terpisahkan dari Perjanjian ini.
        </p>

        <div class="section-title">9. KESELURUHAN PERJANJIAN</div>
        <p>
          Perjanjian ini memuat keseluruhan perjanjian antara Para Pihak dalam Perjanjian ini yang berkaitan dengan materi pokok dari Perjanjian ini, dan menggantikan setiap dan semua perjanjian, komunikasi dan kesepahaman sebelumnya, baik secara tertulis atau lisan, mengenai materi pokok tersebut.
        </p>

        <p style="margin-top: 15px;">
          Demikian Perjanjian ini dibuat, yang masing-masing ditandatangani serta bermeterai cukup dengan sebagaimana mestinya oleh Para Pihak pada tanggal sebagaimana disebut di awal Perjanjian ini, dan masing-masing mempunyai kekuatan hukum yang sama.
        </p>

        <div class="signature-container">
          <div class="signature-box">
            <div class="signature-title">PIHAK KESATU</div>
            <div class="signature-role">Kepala Bidang Aplikasi Informatika,</div>
            <div class="signature-name">Dian Istanti, S.Sos, MAP</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">PIHAK KEDUA</div>
            <div class="signature-role">Mahasiswa Magang,</div>
            <div class="signature-name">${selected.nama}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsNdaModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi file size maksimal 2MB
    if (cvFile && cvFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file CV Magang tidak boleh melebihi 2MB");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nama_kampus", formData.nama_kampus);

      const effectiveBidangId = (!isAdminAptika && authBidang?.id)
        ? String(authBidang.id)
        : formData.bidang_id;

      if (effectiveBidangId) {
        payload.append("bidang_id", effectiveBidangId);
      }
      payload.append("tgl_mulai_magang", formData.tgl_mulai_magang);
      payload.append("tgl_selesai_magang", formData.tgl_selesai_magang);
      payload.append("sertifikat", formData.sertifikat);
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);

      if (cvFile) {
        payload.append("cv_magang", cvFile);
      }

      if (modalMode === "add") {
        await createMagang(payload);
      } else if (modalMode === "edit" && selectedMagang) {
        await updateMagang(selectedMagang.id, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.response?.status === 413) {
        alert("Gagal menyimpan data: Ukuran file terlalu besar (Maksimal 2MB)");
      } else if (error?.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else {
        alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      }
      console.error(error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBidang, setFilterBidang] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSertifikat, setFilterSertifikat] = useState<string>("all");

  const filteredMagangs = magangs.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = (item.nama || "").toLowerCase().includes(q);
      const matchKampus = (item.nama_kampus || "").toLowerCase().includes(q);
      if (!matchNama && !matchKampus) return false;
    }

    if (filterBidang !== "all") {
      const itemBidangId = String(item.bidang_id || item.bidang?.id || "");
      if (itemBidangId !== filterBidang) return false;
    }

    if (filterStatus !== "all") {
      if (item.status_magang !== filterStatus) return false;
    }

    if (filterSertifikat !== "all") {
      const cert = item.sertifikat || "Belum menerima";
      if (cert !== filterSertifikat) return false;
    }

    return true;
  });

  const isFiltered = searchQuery.trim() !== "" || filterBidang !== "all" || filterStatus !== "all" || filterSertifikat !== "all";

  const handleResetFilter = () => {
    setSearchQuery("");
    setFilterBidang("all");
    setFilterStatus("all");
    setFilterSertifikat("all");
  };

  const activeMagangs = magangs.filter(m => m.status_magang === 'Sedang magang').length;
  const selesaiMagangs = magangs.filter(m => m.status_magang === 'Selesai magang').length;
  const sertifikatTerbit = magangs.filter(m => m.sertifikat === 'Sudah menerima').length;

  return (
    <div className="flex flex-col gap-6 pb-6 font-sans">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, #124d96 0%, #1964c0 38%, #2680e2 72%, #4ea3f5 100%)",
        }}
      >
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-cyan-300/15 translate-y-1/2 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-7 py-7 sm:px-9">
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-lg">
              <GraduationCap size={34} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                Magang
              </h1>
              <p className="text-sm text-blue-100/95 mt-1.5 font-normal">
                Dashboard monitoring dan pendataan Magang
              </p>
            </div>
          </div>

          {/* Right: Vector SVG Illustration (Laptop + Topi Wisuda + Dokumen + Daun) */}
          <div className="hidden md:flex items-center justify-end flex-shrink-0 pr-2 select-none pointer-events-none">
            <svg width="360" height="118" viewBox="0 0 360 118" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="magangScreenGrad" x1="115" y1="16" x2="245" y2="96" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e6ce0" />
                  <stop offset="55%" stopColor="#358ef5" />
                  <stop offset="100%" stopColor="#6bc1ff" />
                </linearGradient>
                <linearGradient id="magangDocGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#e8f3ff" stopOpacity="0.92" />
                </linearGradient>
              </defs>

              {/* Soft glow behind laptop */}
              <ellipse cx="182" cy="64" rx="125" ry="48" fill="white" opacity="0.12" />

              {/* Left tropical leaves */}
              <g opacity="0.92">
                <path d="M58 106 C34 96, 22 76, 24 54 C42 60, 56 78, 58 106 Z" fill="#2dd4bf" opacity="0.75" />
                <path d="M68 108 C42 88, 36 62, 46 40 C62 52, 70 78, 68 108 Z" fill="#34d399" opacity="0.85" />
                <path d="M46 40 L64 104" stroke="#a7f3d0" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                <path d="M76 106 C58 92, 56 70, 68 52 C78 64, 80 86, 76 106 Z" fill="#60a5fa" opacity="0.65" />
              </g>

              {/* Right tropical leaves */}
              <g opacity="0.92">
                <path d="M302 106 C326 96, 338 76, 336 54 C318 60, 304 78, 302 106 Z" fill="#2dd4bf" opacity="0.75" />
                <path d="M292 108 C318 88, 324 62, 314 40 C298 52, 290 78, 292 108 Z" fill="#34d399" opacity="0.85" />
                <path d="M314 40 L296 104" stroke="#a7f3d0" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
                <path d="M284 106 C302 92, 304 70, 292 52 C282 64, 280 86, 284 106 Z" fill="#93c5fd" opacity="0.65" />
              </g>

              {/* Left Floating Clipboard / Profile Card (tilted -10deg) */}
              <g transform="rotate(-10 86 64)">
                <rect x="54" y="24" width="60" height="78" rx="9" fill="url(#magangDocGrad)" stroke="white" strokeWidth="1.5" />
                {/* Clipboard top clip */}
                <rect x="73" y="19" width="22" height="8" rx="3" fill="#60a5fa" />
                {/* Avatar circle */}
                <circle cx="71" cy="43" r="8" fill="#dbeafe" />
                <circle cx="71" cy="41" r="3" fill="#2563eb" />
                <path d="M65 48 C66.5 45, 75.5 45, 77 48" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                {/* Lines next to avatar */}
                <rect x="83" y="38" width="22" height="4" rx="2" fill="#3b82f6" opacity="0.85" />
                <rect x="83" y="45" width="15" height="3.5" rx="1.75" fill="#93c5fd" />
                {/* Checklist rows */}
                <rect x="63" y="58" width="42" height="4" rx="2" fill="#bfdbfe" />
                <rect x="63" y="67" width="36" height="4" rx="2" fill="#bfdbfe" />
                <rect x="63" y="76" width="40" height="4" rx="2" fill="#bfdbfe" />
                <rect x="63" y="85" width="26" height="4" rx="2" fill="#93c5fd" />
              </g>

              {/* Right Floating Clipboard / Checklist Card (tilted +10deg) */}
              <g transform="rotate(10 274 64)">
                <rect x="246" y="24" width="60" height="78" rx="9" fill="url(#magangDocGrad)" stroke="white" strokeWidth="1.5" />
                {/* Clipboard top clip */}
                <rect x="265" y="19" width="22" height="8" rx="3" fill="#38bdf8" />
                {/* Header bar */}
                <rect x="255" y="34" width="30" height="4.5" rx="2.25" fill="#2563eb" opacity="0.85" />
                {/* Bullet rows */}
                <circle cx="259" cy="49" r="3.5" fill="#34d399" />
                <rect x="266" y="47" width="31" height="4" rx="2" fill="#bfdbfe" />
                <circle cx="259" cy="61" r="3.5" fill="#3b82f6" />
                <rect x="266" y="59" width="28" height="4" rx="2" fill="#bfdbfe" />
                <circle cx="259" cy="73" r="3.5" fill="#38bdf8" />
                <rect x="266" y="71" width="31" height="4" rx="2" fill="#bfdbfe" />
                {/* Bottom badge */}
                <rect x="255" y="83" width="24" height="7" rx="3.5" fill="#dbeafe" />
              </g>

              {/* Centerpiece Laptop */}
              <g>
                {/* Laptop Outer Frame / Bezel */}
                <rect x="114" y="16" width="132" height="84" rx="9" fill="#0f2952" stroke="#93c5fd" strokeWidth="1.5" />
                {/* Laptop Glowing Screen */}
                <rect x="120" y="22" width="120" height="72" rx="5" fill="url(#magangScreenGrad)" />
                {/* Screen decorative inner circles */}
                <circle cx="225" cy="34" r="18" fill="white" opacity="0.1" />
                <circle cx="136" cy="82" r="22" fill="white" opacity="0.08" />

                {/* Graduation Cap on Laptop Screen */}
                <g transform="translate(180, 54)">
                  {/* Cap Top Diamond */}
                  <polygon points="0,-18 32,-5 0,8 -32,-5" fill="#ffffff" />
                  <polygon points="0,-16 28,-5 0,6 -28,-5" fill="#f0f7ff" />
                  {/* Cap Skull Base */}
                  <path d="M-17,2 L-17,13 C-17,18 17,18 17,13 L17,2 L0,9 Z" fill="#dbeafe" />
                  {/* Tassel */}
                  <circle cx="0" cy="-5" r="2.5" fill="#fbbf24" />
                  <path d="M0,-5 Q18,-2 23,12" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="23" cy="13" r="2.2" fill="#fbbf24" />
                </g>

                {/* Laptop Keyboard Base */}
                <path d="M98 99 H262 L254 107 C252 109 249 110 245 110 H115 C111 110 108 109 106 107 L98 99 Z" fill="#e2e8f0" />
                <path d="M98 99 H262 L259 103 H101 L98 99 Z" fill="#f8fafc" />
                {/* Trackpad notch */}
                <rect x="166" y="99" width="28" height="3" rx="1.5" fill="#94a3b8" />
              </g>

              {/* Sparkle dots */}
              <circle cx="102" cy="22" r="2.5" fill="white" opacity="0.65" />
              <circle cx="262" cy="18" r="2" fill="white" opacity="0.65" />
              <circle cx="42" cy="48" r="2" fill="#bae6fd" opacity="0.6" />
              <circle cx="322" cy="44" r="2.5" fill="#bae6fd" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── STATISTIC CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl px-6 py-5 shadow-sm border border-white/70 dark:border-slate-800 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total Anak Magang</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{magangs.length}</h3>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl px-6 py-5 shadow-sm border border-white/70 dark:border-slate-800 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Sedang Magang</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{activeMagangs}</h3>
          </div>
        </div>
      </div>

      {/* ── DAFTAR ANAK MAGANG (Header + Filter + Tabel) ── */}
      <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
        {/* Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">Daftar Anak Magang</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Menampilkan data dan informasi anak magang
                {isFiltered && ` (${filteredMagangs.length} dari ${magangs.length} data)`}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            Tambah Data Magang
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 py-4">
          {/* Search */}
          <div className="relative lg:w-[240px] flex-shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau kampus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-[12.5px] bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-slate-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:justify-end">
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="sm:w-[190px] px-3 py-2.5 text-[12.5px] bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Semua Bidang / Unit Kerja</option>
              {bidangs.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="sm:w-[190px] px-3 py-2.5 text-[12.5px] bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Semua Status Magang</option>
              <option value="Sedang magang">Sedang magang</option>
              <option value="Selesai magang">Selesai magang</option>
              <option value="Belum mulai">Belum mulai</option>
            </select>

            <select
              value={filterSertifikat}
              onChange={(e) => setFilterSertifikat(e.target.value)}
              className="sm:w-[170px] px-3 py-2.5 text-[12.5px] bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Semua Status Sertifikat</option>
              <option value="Sudah menerima">Sudah menerima</option>
              <option value="Belum menerima">Belum menerima</option>
            </select>

            {isFiltered && (
              <button
                onClick={handleResetFilter}
                title="Reset Filter"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex-shrink-0"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tabel */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0b1630]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-[#f1f5fb] dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide w-10 text-center">No</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Nama</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Kampus</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Bidang</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Periode</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status Magang</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Sertifikat</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide text-center">NDA</th>
                  <th className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-sm text-slate-500">Memuat data...</td>
                  </tr>
                ) : filteredMagangs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-sm text-slate-500">
                      {isFiltered ? "Tidak ada data anak magang yang sesuai filter" : "Tidak ada data magang"}
                    </td>
                  </tr>
                ) : (
                  filteredMagangs.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-3 text-[12.5px] text-slate-700 dark:text-slate-300 font-semibold text-center">{idx + 1}</td>
                      <td className="px-3 py-3 text-[12.5px] font-bold text-slate-800 dark:text-white max-w-[170px]">{item.nama}</td>
                      <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 max-w-[170px] leading-snug">{item.nama_kampus}</td>
                      <td className="px-3 py-3">
                        {item.bidang ? (
                          <span className="inline-block max-w-[170px] text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md leading-snug">
                            {item.bidang.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(item.tgl_mulai)} - {formatDate(item.tgl_selesai)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border ${item.status_magang === 'Sedang magang' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          item.status_magang === 'Selesai magang' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                          {item.status_magang}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border ${item.sertifikat === 'Sudah menerima' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {item.sertifikat || 'Belum menerima'}
                          </span>
                          {isSertifikatEligible(item.tgl_selesai) && (
                            <button
                              onClick={() => handlePrintCertificate(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Cetak Sertifikat Magang"
                            >
                              <Printer size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenNdaModalForMagang(item.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Cetak Surat NDA"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenUploadNdaModal(item)}
                            className={`p-1.5 rounded-md transition-colors ${item.nda_file ? 'text-emerald-600 hover:bg-emerald-50' : 'text-blue-600 hover:bg-blue-50'}`}
                            title={item.nda_file ? "Ganti File NDA" : "Upload File NDA"}
                          >
                            <Upload size={15} />
                          </button>
                          {item.nda_file && (
                            <a
                              href={item.nda_file}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Unduh / Lihat Dokumen NDA"
                            >
                              <Download size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleOpenModal("view", item)} className="w-7 h-7 flex items-center justify-center text-blue-600 bg-blue-50/60 border border-blue-100 hover:bg-blue-100 rounded-md transition-colors" title="Lihat Detail">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleOpenModal("edit", item)} className="w-7 h-7 flex items-center justify-center text-blue-600 bg-blue-50/60 border border-blue-100 hover:bg-blue-100 rounded-md transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL FORM ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Tambah Data Magang" : modalMode === "edit" ? "Edit Data Magang" : "Detail Anak Magang"}
        size="lg"
      >
        {modalMode === "view" && selectedMagang ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Nama</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Kampus</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.nama_kampus}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Bidang / Unit Kerja</span>
              <span className="col-span-2 font-semibold text-blue-700">
                {selectedMagang.bidang ? `${selectedMagang.bidang.name} (${selectedMagang.bidang.code})` : "-"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Mulai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_mulai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Tgl Selesai</span>
              <span className="col-span-2 font-semibold text-slate-900">{formatDate(selectedMagang.tgl_selesai)}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.status_magang}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">Sertifikat</span>
              <span className="col-span-2 font-semibold text-slate-900">{selectedMagang.sertifikat}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">CV Magang</span>
              <span className="col-span-2 font-semibold text-blue-600 hover:underline">
                {selectedMagang.cv_magang ? <a href={selectedMagang.cv_magang} target="_blank" rel="noreferrer">Lihat File</a> : "-"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-medium">File NDA</span>
              <span className="col-span-2 font-semibold text-blue-600 hover:underline">
                {selectedMagang.nda_file ? <a href={selectedMagang.nda_file} target="_blank" rel="noreferrer">Lihat File NDA</a> : <span className="text-slate-400 font-normal">Belum diupload</span>}
              </span>
            </div>
            <div className="grid grid-cols-3 pb-3">
              <span className="text-slate-500 font-medium">Keterangan</span>
              <span className="col-span-2 font-semibold text-slate-900 whitespace-pre-line">{selectedMagang.keterangan || "-"}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kampus / Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_kampus}
                  onChange={(e) => setFormData({ ...formData, nama_kampus: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan institusi"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bidang Tujuan Magang {!isAdminAptika && authBidang && <span className="text-slate-400 font-normal"></span>} <span className="text-red-500">*</span>
                </label>
                {isAdminAptika ? (
                  <select
                    required
                    value={formData.bidang_id}
                    onChange={(e) => setFormData({ ...formData, bidang_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">-- Pilih Bidang / Unit Kerja --</option>
                    {bidangs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full border border-slate-200 bg-slate-50/90 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 flex items-center justify-between">
                    <span>{authBidang?.name ? `${authBidang.name} (${authBidang.code})` : "Bidang Pengguna"}</span>
                    <span className="text-xs font-normal text-slate-400 italic">Terisi otomatis</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tgl_mulai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_mulai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tgl_selesai_magang}
                  onChange={(e) => setFormData({ ...formData, tgl_selesai_magang: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Magang</label>
                <div className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border ${currentStatus === 'Sedang magang' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    currentStatus === 'Selesai magang' ? 'bg-green-50 text-green-700 border-green-200' :
                      currentStatus === 'Belum mulai' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                  {currentStatus}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Sertifikat</label>
                <select
                  required
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Belum menerima">Belum menerima</option>
                  <option value="Sudah menerima">Sudah menerima</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload CV (PDF/JPG/PNG)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={modalMode === "add"}
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                rows={3}
                placeholder="Masukkan keterangan jika ada..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Simpan Data
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL CETAK NDA ── */}
      <Modal
        isOpen={isNdaModalOpen}
        onClose={() => setIsNdaModalOpen(false)}
        title="Cetak Surat NDA (Non-Disclosure Agreement)"
        size="md"
      >
        <form onSubmit={handlePrintNda} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Anak Magang
            </label>
            <div className="w-full border border-slate-200 bg-slate-50/80 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800">
              {magangs.find((m) => String(m.id) === String(ndaFormData.magangId))
                ? `${magangs.find((m) => String(m.id) === String(ndaFormData.magangId))?.nama} - ${magangs.find((m) => String(m.id) === String(ndaFormData.magangId))?.nama_kampus}`
                : "-"}
            </div>
            {ndaFormData.magangId && (
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                Nomor Surat (Otomatis):{" "}
                <span className="font-bold text-slate-800">
                  NO: {String((magangs.findIndex((m) => String(m.id) === String(ndaFormData.magangId)) >= 0 ? magangs.findIndex((m) => String(m.id) === String(ndaFormData.magangId)) + 7 : 7)).padStart(2, "0")}/NDA/APTIKA/{new Date().getFullYear()}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Surat NDA
            </label>
            <input
              type="date"
              required
              value={ndaFormData.tanggal}
              onChange={(e) => setNdaFormData({ ...ndaFormData, tanggal: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            {ndaFormData.tanggal && (
              <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 space-y-1">
                <span className="font-bold text-blue-900 block">Teks Otomatis Tanggal:</span>
                <p className="italic font-medium leading-relaxed">
                  "{formatIndonesianFullDateText(ndaFormData.tanggal)}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNdaModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Printer size={16} />
              Cetak Dokumen NDA
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL UPLOAD NDA ── */}
      <Modal
        isOpen={isUploadNdaModalOpen}
        onClose={() => setIsUploadNdaModalOpen(false)}
        title="Upload Dokumen NDA (Non-Disclosure Agreement)"
        size="md"
      >
        <form onSubmit={handleSaveNdaUpload} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Anak Magang
            </label>
            <div className="w-full border border-slate-200 bg-slate-50/80 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800">
              {targetMagangForNda ? `${targetMagangForNda.nama} - ${targetMagangForNda.nama_kampus}` : "-"}
            </div>
          </div>

          {targetMagangForNda?.nda_file && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold block mb-0.5">Dokumen Ter-upload:</span>
                <span className="text-slate-600">File NDA sudah pernah diupload.</span>
              </div>
              <a
                href={targetMagangForNda.nda_file}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <FileText size={14} />
                Lihat File
              </a>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih File Dokumen NDA (Khusus Format PDF)
            </label>
            <input
              type="file"
              required
              accept=".pdf,application/pdf"
              onChange={(e) => setUploadNdaFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadNdaModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploadingNda || !uploadNdaFile}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Upload size={16} />
              {isUploadingNda ? "Mengupload..." : "Upload Dokumen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

