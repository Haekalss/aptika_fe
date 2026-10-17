"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPerangkatPribadiDetail, formatTanggalIndo, perangkatErrMsg, PerangkatPribadi } from "@/services/smki/perangkatPribadiService";

const MIN_ROWS = 5;

export default function PrintPerangkatPribadiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<PerangkatPribadi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchPerangkatPribadiDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(perangkatErrMsg(err, "Gagal memuat formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-045...</p>
      </div>
    );
  }

  const rows = item.perangkat || [];
  const blanks = Math.max(0, MIN_ROWS - rows.length);
  const cell = "border border-black px-2 py-1 align-top";

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push("/smki/perangkat-pribadi")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Daftar</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Print / PDF)</span>
        </button>
      </div>

      {/* A4 Paper */}
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-0 print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-5">
        {/* Kop Surat */}
        <div className="border border-black">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-28 p-2 border-r border-black text-center align-middle">
                  <img
                    src="/logo-fr047.png"
                    alt="Logo Jabar"
                    className="w-16 h-auto mx-auto object-contain"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = "/logo.png";
                    }}
                  />
                </td>
                <td className="p-3 border-r border-black text-center align-middle">
                  <h2 className="text-base font-bold tracking-wide uppercase text-slate-900">
                    FORMULIR<br />Bring Your Own Device (BYOD)
                  </h2>
                </td>
                <td className="w-56 p-2 text-[9pt] align-middle">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-0.5 w-24">No.Dokumen</td>
                        <td className="py-0.5">: FR-045/KOM.03/05/SANDIKAMI</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">No.Revisi</td>
                        <td className="py-0.5">: 0.0</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Tanggal Berlaku</td>
                        <td className="py-0.5">: 13 Juli 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Identitas */}
        <div className="space-y-1.5">
          <p className="text-[10pt]">Yang bertanda tangan di bawah ini:</p>
          <table className="w-full border border-black border-collapse text-[10pt]">
            <tbody>
              {[
                ["Nama", item.nama],
                ["NIP", item.nip],
                ["Jabatan", item.jabatan],
                ["Unit Kerja", item.unit_kerja],
              ].map(([label, value], i) => (
                <tr key={i} className={i > 0 ? "border-t border-black" : ""}>
                  <td className="w-56 py-1 px-2 font-semibold border-r border-black bg-slate-50 print:bg-transparent">
                    {label}
                  </td>
                  <td className="py-1 px-2">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Perangkat */}
        <div className="space-y-1.5">
          <p className="text-[10pt]">
            Menyatakan bahwa penggunaan perangkat pribadi di <strong>{item.unit_kerja}</strong> adalah sebagai berikut:
          </p>
          <table className="w-full border border-black border-collapse text-[10pt]">
            <thead>
              <tr className="bg-slate-50 print:bg-transparent">
                <th className={`${cell} w-10 text-center`}>No</th>
                <th className={`${cell} text-left`}>Nama</th>
                <th className={`${cell} text-left`}>NIP</th>
                <th className={`${cell} text-left`}>Jenis perangkat TI</th>
                <th className={`${cell} text-left`}>Merek/ tipe</th>
                <th className={`${cell} text-left`}>Nomor Seri</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id ?? i} className="break-inside-avoid">
                  <td className={`${cell} text-center`}>{i + 1}</td>
                  <td className={cell}>{p.nama}</td>
                  <td className={cell}>{p.nip}</td>
                  <td className={cell}>{p.jenis_perangkat}</td>
                  <td className={cell}>{p.merek_tipe}</td>
                  <td className={cell}>{p.nomor_seri}</td>
                </tr>
              ))}
              {Array.from({ length: blanks }).map((_, i) => (
                <tr key={`b${i}`}>
                  <td className={`${cell} text-center`}>{rows.length + i + 1}</td>
                  <td className={`${cell} h-7`} />
                  <td className={cell} />
                  <td className={cell} />
                  <td className={cell} />
                  <td className={cell} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[9pt]">
          <p>Jenis Perangkat TI dapat diisi dengan:</p>
          <p>*Laptop/PC/Tab</p>
        </div>

        <p className="text-[10pt] text-justify">
          Jika dikemudian hari ditemukan pelanggaran berkaitan dengan penggunaan perangkat pribadi tersebut, maka akan dikenakan sanksi sesuai ketentuan yang berlaku.
        </p>

        {/* Tanda Tangan */}
        <div className="pt-6 text-[10pt] break-inside-avoid">
          <p className="text-right pb-3">
            {item.ditandatangani_di || "Bandung"}, {item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "……………………"}
          </p>
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr>
                <td className="w-1/2" />
                <td className="w-1/2 py-1">Kepala {item.unit_kerja},</td>
              </tr>
              <tr>
                <td />
                <td className="h-20" />
              </tr>
              <tr className="align-bottom">
                <td />
                <td className="py-1">
                  ({item.nama || "............................"})
                  {item.nip && <div className="text-[9pt]">NIP. {item.nip}</div>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-300 text-[8pt] text-slate-500 flex items-center justify-between">
          <span>Klasifikasi : INTERNAL</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>

      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt;
          }
          aside,
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
