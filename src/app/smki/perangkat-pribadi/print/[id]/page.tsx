"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
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
  const cell = "border border-black px-2 py-1.5 align-top";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
        <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={() => router.push(`/smki/perangkat-pribadi/detail/${item.id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Detail</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition">
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>

        {/* A4 Paper */}
        <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-[15mm] print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-5">
          {/* Kop */}
          <div className="border border-black">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-28 p-2 border-r border-black text-center align-middle">
                    <img
                      src="/logo-fr047.png"
                      alt="Logo Jabar"
                      className="w-16 h-auto mx-auto object-contain"
                      onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = "/logo.png"; }}
                    />
                  </td>
                  <td className="p-3 border-r border-black text-center align-middle">
                    <h2 className="text-base font-bold tracking-wide uppercase">FORMULIR<br />Bring Your Own Device (BYOD)</h2>
                  </td>
                  <td className="w-64 p-2 text-[9pt] align-middle">
                    <table className="w-full text-left">
                      <tbody>
                        <tr><td className="font-semibold py-0.5 w-24">No. Dokumen</td><td className="py-0.5">: FR-045/KOM.03/05/ SANDIKAMI</td></tr>
                        <tr><td className="font-semibold py-0.5">No. Revisi</td><td className="py-0.5">: 0.0</td></tr>
                        <tr><td className="font-semibold py-0.5">Tanggal Berlaku</td><td className="py-0.5">: 13 Juli 2023</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[10.5pt]">Yang bertanda tangan di bawah ini:</p>
          <table className="w-full border-collapse border border-black text-[10.5pt]">
            <tbody>
              {[
                ["Nama", item.nama],
                ["NIP", item.nip],
                ["Jabatan", item.jabatan],
                ["Unit Kerja", item.unit_kerja],
              ].map(([l, v]) => (
                <tr key={l}>
                  <td className={`${cell} w-40`}>{l}</td>
                  <td className={cell}>{v || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[10.5pt]">Menyatakan bahwa penggunaan perangkat pribadi di <strong>{item.unit_kerja}</strong> adalah sebagai berikut:</p>
          <table className="w-full border-collapse border border-black text-[10pt]">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100">
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
                  <td className={`${cell} h-7`} /><td className={cell} /><td className={cell} /><td className={cell} /><td className={cell} />
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-[9.5pt]">
            <p>Jenis Perangkat TI dapat diisi dengan:</p>
            <p>*Laptop/PC/Tab</p>
          </div>

          <p className="text-[10.5pt] text-justify">
            Jika dikemudian hari ditemukan pelanggaran berkaitan dengan penggunaan perangkat pribadi tersebut, maka akan dikenakan sanksi sesuai ketentuan yang berlaku.
          </p>

          <div className="text-[10.5pt] flex justify-end break-inside-avoid">
            <div className="text-center w-64">
              <p>{item.ditandatangani_di || "Bandung"}, {item.tanggal_ttd ? formatTanggalIndo(item.tanggal_ttd) : "Tanggal Bulan Tahun"}</p>
              <div className="h-24 flex items-center justify-center text-[9pt] text-slate-400 border border-dashed border-slate-300 my-2 rounded print:border-0">
                <span className="print:hidden">Spesimen TTE Kepala Unit Kerja</span>
              </div>
              <p className="font-semibold">{item.nama}</p>
              {item.nip && <p className="text-[9.5pt]">NIP. {item.nip}</p>}
            </div>
          </div>

          <p className="text-[8.5pt] text-slate-500 pt-2">Klasifikasi : INTERNAL</p>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
