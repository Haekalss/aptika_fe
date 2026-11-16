"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Tag, Server, ListChecks, Loader2 } from "lucide-react";
import { listJenis, listObjek, getApiErrorMessage } from "@/services/smki/pemantauanKonfigurasiService";
import { showToast } from "@/components/ui/Toast";
import Fr048MasterJenis from "../organisms/Fr048MasterJenis";
import Fr048MasterObjek from "../organisms/Fr048MasterObjek";
import Fr048MasterNilaiStandar from "../organisms/Fr048MasterNilaiStandar";
import type { JenisKonfigurasiDto, ObjekDto } from "@/services/smki/pemantauanKonfigurasiService.types";

type Tab = "jenis" | "objek" | "nilai-standar";

const TABS: { key: Tab; label: string; hint: string; icon: typeof Tag }[] = [
  { key: "jenis", label: "Jenis Konfigurasi", hint: "Kategori pemantauan (Server, Jaringan, ...)", icon: Tag },
  { key: "objek", label: "Objek", hint: "Perangkat/aset yang dipantau per jenis", icon: Server },
  { key: "nilai-standar", label: "Nilai Standar", hint: "Tabel acuan Nama Konfigurasi + Nilai Standar per Objek", icon: ListChecks },
];

/** Halaman Data Master FR-048 (UC-08, admin-only). */
export default function Fr048MasterTemplate() {
  const [tab, setTab] = useState<Tab>("jenis");
  const [jenis, setJenis] = useState<JenisKonfigurasiDto[]>([]);
  const [objek, setObjek] = useState<ObjekDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [j, o] = await Promise.all([listJenis(), listObjek()]);
      setJenis(j);
      setObjek(o);
    } catch (err) {
      showToast.error(getApiErrorMessage(err, "Gagal memuat data master."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listJenis(), listObjek()])
      .then(([j, o]) => {
        if (cancelled) return;
        setJenis(j);
        setObjek(o);
      })
      .catch((err) => {
        if (cancelled) return;
        showToast.error(getApiErrorMessage(err, "Gagal memuat data master."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-violet-200/60 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/30 px-4 py-3 flex items-center gap-3">
        <Database size={18} className="text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <div className="min-w-0">
          <h2 className="text-xs font-extrabold text-violet-900 dark:text-violet-200">Data Master — Pemantauan Konfigurasi (FR-048)</h2>
          <p className="text-[10px] text-violet-700/80 dark:text-violet-300/80">
            Data dipakai sebagai acuan pemantauan. Data yang sudah dipakai tidak dapat dihapus, hanya dinonaktifkan. Perubahan Nilai Standar hanya berlaku untuk pemantauan baru.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-col sm:flex-row gap-2" role="tablist" aria-label="Jenis data master">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-left rounded-2xl border px-4 py-3 transition-all ${
                active
                  ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-violet-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={16} className={active ? "text-white" : "text-violet-600 dark:text-violet-400"} />
                <span className="text-[11px] font-extrabold">{t.label}</span>
              </span>
              <span className={`block mt-1 text-[9px] ${active ? "text-violet-100" : "text-slate-400"}`}>{t.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Konten tab */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-slate-400 text-xs gap-2">
          <Loader2 size={16} className="animate-spin" /> Memuat data master...
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm p-4">
          {tab === "jenis" && <Fr048MasterJenis items={jenis} onChanged={reload} />}
          {tab === "objek" && <Fr048MasterObjek items={objek} jenisItems={jenis} onChanged={reload} />}
          {tab === "nilai-standar" && <Fr048MasterNilaiStandar objekItems={objek} />}
        </div>
      )}
    </div>
  );
}
