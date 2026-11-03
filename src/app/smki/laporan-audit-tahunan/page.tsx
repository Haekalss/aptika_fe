"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { HeaderBanner } from "@/components/smki/laporan-audit-tahunan/organisms/HeaderBanner";
import { StatCard } from "@/components/smki/laporan-audit-tahunan/molecules/StatCard";
import { StatusBadge } from "@/components/smki/laporan-audit-tahunan/atoms/StatusBadge";
import { DetailModal } from "@/components/smki/laporan-audit-tahunan/organisms/DetailModal";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getLaporanAuditTahunanList,
  getLaporanAuditTahunanById,
  deleteLaporanAuditTahunan,
  exportLaporanAuditTahunanDocx,
  LaporanAuditTahunanData
} from "@/services/api";

export default function LaporanAuditTahunanPage() {
  const router = useRouter();
  const { user, isAdminAptika } = useAuthStore();
  const isAdmin = user?.role === "admin" || isAdminAptika;

  const [items, setItems] = useState<LaporanAuditTahunanData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State Detail Modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<LaporanAuditTahunanData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const handleOpenDetail = async (item: LaporanAuditTahunanData) => {
    setSelectedDetailItem(item);
    setIsDetailModalOpen(true);
    if (item.id) {
      try {
        const res = await getLaporanAuditTahunanById(item.id);
        if (res && res.data) {
          setSelectedDetailItem(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail lengkap:", err);
      }
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await getLaporanAuditTahunanList();
      if (res && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar laporan audit tahunan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus formulir rencana tahunan ini?")) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteLaporanAuditTahunan(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      alert("Formulir berhasil dihapus!");
    } catch (err: unknown) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus formulir.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (id: number, tahun: number | string) => {
    try {
      setExportingId(id);
      const blobData = await exportLaporanAuditTahunanDocx(id);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-008_Laporan_Audit_Tahunan_${tahun}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Gagal mengekspor dokumen DOCX:", err);
      alert("Gagal mengekspor dokumen DOCX.");
    } finally {
      setExportingId(null);
    }
  };

  // Memoized filter items & stats to prevent expensive re-computations and memory churn
  const { filteredItems, totalFormulir, draftCount, selesaiCount, uniqueYears } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = items.filter((item) => {
      const matchSearch =
        !q ||
        (item.no_dokumen || "").toLowerCase().includes(q) ||
        (item.tahun_smki?.toString() || "").includes(q) ||
        (item.tim_auditor || []).some((aud) =>
          aud.nama_auditor.toLowerCase().includes(q)
        );

      const matchYear =
        selectedYear === "all" || item.tahun_smki?.toString() === selectedYear;

      const matchStatus =
        selectedStatus === "all" ||
        (item.status || "Draft").toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchYear && matchStatus;
    });

    const total = items.length;
    const drafts = items.filter((i) => (i.status || "Draft") === "Draft").length;
    const selesai = items.filter((i) => i.status === "Selesai").length;
    const years = Array.from(new Set(items.map((i) => i.tahun_smki?.toString()))).filter(Boolean);

    return {
      filteredItems: filtered,
      totalFormulir: total,
      draftCount: drafts,
      selesaiCount: selesai,
      uniqueYears: years,
    };
  }, [items, searchQuery, selectedYear, selectedStatus]);

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-12">
        <HeaderBanner
          title="Formulir Tahunan Audit Internal"
          subtitle="Kelola rencana, cakupan, dan jadwal audit internal SMKI setiap tahun."
        />

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Formulir"
            value={totalFormulir}
            subtitle="Seluruh periode SMKI"
            icon={FileText}
            colorClass="text-slate-500"
            iconBgClass="bg-slate-50"
          />
          <StatCard
            title="Draft"
            value={draftCount}
            subtitle="Pengisian belum lengkap"
            icon={AlertCircle}
            colorClass="text-amber-600"
            iconBgClass="bg-amber-50"
          />
          <StatCard
            title="Selesai"
            value={selesaiCount}
            subtitle="Formulir telah disahkan"
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            iconBgClass="bg-emerald-50"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Daftar Formulir Tahunan</h2>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Administrator
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Mode Peninjau
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? "Kelola master rencana, jadwal audit, dan pengesahan program tahunan SMKI."
                  : "Tinjau jadwal audit internal SMKI dan unduh dokumen resmi untuk persiapan audit unit kerja."}
              </p>
            </div>
            {(
              <button
                onClick={() => router.push("/smki/laporan-audit-tahunan/input")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah formulir</span>
              </button>
            )}
          </div>

          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3 justify-between">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor dokumen, tahun, atau auditor..."
                className="w-full md:w-80 text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition"
              >
                <option value="all">Semua tahun</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition"
              >
                <option value="all">Semua status</option>
                <option value="Draft">Draft</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-5">No. Dokumen</th>
                  <th className="py-3 px-5 text-center">Tahun</th>
                  <th className="py-3 px-5">Tim Auditor</th>
                  <th className="py-3 px-5 text-center">Tanggal Berlaku</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>Memuat formulir audit internal...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada formulir audit tahunan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const lead = item.tim_auditor?.find((t) => t.peran === "Lead Auditor");
                    const objCount = item.objek_audit?.length || 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-emerald-700">{item.no_dokumen}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {objCount} objek audit • Revisi: {item.no_revisi}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center font-bold text-slate-700">
                          {item.tahun_smki}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-800">
                            {lead ? lead.nama_auditor : item.tim_auditor?.[0]?.nama_auditor || "-"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Penyusun: {item.disusun_oleh || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-slate-600 font-medium">
                          {item.tanggal_berlaku}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <StatusBadge status={item.status || "Draft"} />
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Tombol Lihat Detail (Tersedia untuk Admin & User) */}
                            <button
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail & Jadwal Lengkap"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Tombol Export DOCX (Tersedia untuk Admin & User) */}
                            <button
                              onClick={() => handleExport(item.id!, item.tahun_smki)}
                              disabled={exportingId === item.id}
                              title="Export Formulir DOCX (FR-008)"
                              className="p-1.5 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 rounded transition"
                            >
                              {exportingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                              ) : (
                                <FileDown className="w-4 h-4" />
                              )}
                            </button>

                            {/* Tombol Edit & Hapus (HANYA UNTUK ADMIN) */}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => router.push(`/smki/laporan-audit-tahunan/input?id=${item.id}`)}
                                  title="Edit Formulir"
                                  className="p-1.5 hover:bg-amber-50 text-amber-700 hover:text-amber-800 rounded transition"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDelete(item.id!)}
                                  disabled={deletingId === item.id}
                                  title="Hapus Formulir"
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded transition"
                                >
                                  {deletingId === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {filteredItems.length} dari {items.length} formulir tahunan
            </span>
          </div>
        </div>

        {/* Modal Detail Form Program Tahunan */}
        <DetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          item={selectedDetailItem}
          onExport={handleExport}
          isExporting={exportingId === selectedDetailItem?.id}
        />
      </div>
    </ServiceRouteGuard>
  );
}
