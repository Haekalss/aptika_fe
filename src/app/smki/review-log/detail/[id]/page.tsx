"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Printer, Pencil, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  fetchReviewLogDetail, formatTanggalIndo, formatPeriode, formatWaktu, reviewLogErrMsg, ReviewLog,
} from "@/services/smki/reviewLogService";

function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div>
      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{value || "-"}</div>
    </div>
  );
}

export default function DetailReviewLogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<ReviewLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchReviewLogDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err) {
        toast.error(reviewLogErrMsg(err, "Gagal memuat detail formulir"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-500">Memuat detail review log...</p>
        </div>
      </ServiceRouteGuard>
    );
  }

  if (!item) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <FileText size={32} className="text-slate-300" />
          <p className="text-sm font-bold text-slate-600">Data tidak ditemukan</p>
          <button onClick={() => router.push("/smki/review-log")} className="text-xs font-bold text-emerald-600 hover:underline">Kembali ke daftar</button>
        </div>
      </ServiceRouteGuard>
    );
  }

  const th = "text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";
  const card = "rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        <div className={card}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <button onClick={() => router.push("/smki/review-log")} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0">
                <ChevronLeft size={18} />
              </button>
              <div>
                <div className="text-[10.5px] font-extrabold tracking-widest uppercase text-slate-400 mb-1">FR-040 &gt; Detail Review Log</div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  Review Log <span className="text-emerald-600">#RVL-{String(item.id).padStart(3, "0")}</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Dibuat oleh akun: {item.user?.name || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button onClick={() => router.push(`/smki/review-log/edit/${item.id}`)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all">
                <Pencil size={15} /> Ubah
              </button>
              <button onClick={() => router.push(`/smki/review-log/print/${item.id}`)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all">
                <Printer size={15} /> Cetak Formulir
              </button>
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Identitas Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Tanggal Review" value={formatTanggalIndo(item.tanggal_review)} />
            <Field label="Periode Review" value={formatPeriode(item.periode_mulai, item.periode_selesai)} />
            <Field label="Obyek Review" value={item.obyek_review} />
            <Field label="Pelaksana Review" value={item.pelaksana_review} />
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Rincian Log ({item.items?.length ?? 0})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className={`${th} w-14 text-center`}>No</th>
                  <th className={th}>User</th>
                  <th className={th}>IP</th>
                  <th className={th}>Tanggal</th>
                  <th className={th}>Waktu</th>
                  <th className={th}>Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {item.items && item.items.length > 0 ? (
                  item.items.map((r, i) => (
                    <tr key={r.id ?? i}>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{r.user_log}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">{r.ip_address}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{formatTanggalIndo(r.tanggal)}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{formatWaktu(r.waktu)}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{r.durasi}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400">Belum ada rincian log.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">Tindak Lanjut</h3>
          <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">{item.tindak_lanjut || "-"}</p>
        </div>

        <div className={card}>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Pengesahan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Ditandatangani di" value={item.ditandatangani_di} />
            <Field label="Tanggal" value={formatTanggalIndo(item.tanggal_ttd)} />
            <Field label="Dibuat Oleh" value={[item.dibuat_oleh_nama, item.dibuat_oleh_nip && `NIP ${item.dibuat_oleh_nip}`].filter(Boolean).join(" · ")} />
            <Field label="Mengetahui" value={[item.mengetahui_nama, item.mengetahui_nip && `NIP ${item.mengetahui_nip}`].filter(Boolean).join(" · ")} />
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
