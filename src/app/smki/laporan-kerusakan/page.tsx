"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  FileDown,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getLaporanKerusakanList,
  getLaporanKerusakanLookup,
  createLaporanKerusakan,
  updateLaporanKerusakan,
  deleteLaporanKerusakan,
  validateLaporanKerusakan,
  exportLaporanKerusakanDocx,
  exportBatchLaporanKerusakanDocx,
  LaporanKerusakanItem,
  LaporanKerusakanStats,
  DataCenterAssetItem,
} from "@/services/api";
import { HeaderBanner } from "@/components/smki/laporan-kerusakan/organisms/HeaderBanner";
import { StatCard } from "@/components/smki/laporan-kerusakan/molecules/StatCard";
import { LaporanTable } from "@/components/smki/laporan-kerusakan/organisms/LaporanTable";
import { DetailModal } from "@/components/smki/laporan-kerusakan/organisms/DetailModal";
import { LaporanFormModal } from "@/components/smki/laporan-kerusakan/organisms/LaporanFormModal";

interface UserOption {
  id: number;
  name: string;
  role?: string;
  email?: string;
}

export default function SmkiLaporanKerusakanPage() {
  const { user, isAdminAptika } = useAuthStore();
  const isSupervisor = user?.role === "admin" || isAdminAptika;

  const [reports, setReports] = useState<LaporanKerusakanItem[]>([]);
  const [stats, setStats] = useState<LaporanKerusakanStats>({
    total: 0,
    baru: 0,
    diproses: 0,
    selesai: 0,
  });
  const [assets, setAssets] = useState<DataCenterAssetItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [supervisors, setSupervisors] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tanggalFilter, setTanggalFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sorted reports for consistent table presentation
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(`${a.tanggal || ""} ${a.jam || "00:00"}`).getTime();
      const dateB = new Date(`${b.tanggal || ""} ${b.jam || "00:00"}`).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [reports, sortOrder]);

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formEditItem, setFormEditItem] = useState<LaporanKerusakanItem | null>(null);

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState<LaporanKerusakanItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load lookup data (assets, users & supervisors)
  useEffect(() => {
    async function loadLookup() {
      try {
        const res = await getLaporanKerusakanLookup();
        if (res && res.data) {
          setAssets(res.data.assets || []);
          setUsers(res.data.users || []);
          setSupervisors(res.data.supervisors || []);
        }
      } catch (err) {
        console.error("Gagal memuat lookup data:", err);
      }
    }
    loadLookup();
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getLaporanKerusakanList({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() !== "" ? searchQuery : undefined,
        tanggal: tanggalFilter !== "" ? tanggalFilter : undefined,
      });

      if (res && res.data) {
        setReports(res.data);
      }
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Gagal memuat daftar laporan kerusakan:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, tanggalFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const [isExportingBatch, setIsExportingBatch] = useState<boolean>(false);

  const downloadBlob = (blobData: BlobPart, fileName: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSingle = async (report: LaporanKerusakanItem) => {
    if (!report.id) return;
    if (report.status !== "Closed") {
      alert("Dokumen belum dapat diekspor. Laporan harus divalidasi dan disahkan (Closed) terlebih dahulu oleh Supervisor.");
      return;
    }
    try {
      const blob = await exportLaporanKerusakanDocx(report.id);
      const safeNum = (report.nomor_laporan || "FR-024").replace(/[^a-zA-Z0-9_\-]/g, "_");
      downloadBlob(blob, `FR-024_${safeNum}.docx`);
    } catch (err: unknown) {
      console.error("Gagal mengekspor dokumen:", err);
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengekspor dokumen. Pastikan laporan telah disahkan.";
      alert(errorMsg);
    }
  };

  const handleExportBatch = async () => {
    try {
      setIsExportingBatch(true);
      const blob = await exportBatchLaporanKerusakanDocx({
        search: searchQuery.trim() !== "" ? searchQuery : undefined,
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `Rekapitulasi_Laporan_${dateStr}.docx`);
    } catch (err: unknown) {
      console.error("Gagal mengekspor data:", err);
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengekspor data. Pastikan terdapat laporan yang telah disahkan (Closed).";
      alert(errorMsg);
    } finally {
      setIsExportingBatch(false);
    }
  };

  const handleOpenCreate = () => {
    setFormEditItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: LaporanKerusakanItem) => {
    if (item.status === "Closed" && !isSupervisor) {
      alert("Laporan kerusakan ini telah divalidasi dan disahkan (Closed) oleh Supervisor. Anda tidak dapat mengubah data ini.");
      return;
    }
    setFormEditItem(item);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<LaporanKerusakanItem>, autoExport?: boolean) => {
    let savedItem: LaporanKerusakanItem | null = null;
    if (data.id) {
      const res = await updateLaporanKerusakan(data.id, data);
      savedItem = res?.data || data;
      alert("Laporan kerusakan berhasil diperbarui!");
    } else {
      const res = await createLaporanKerusakan(data);
      savedItem = res?.data || data;
      alert("Laporan kerusakan baru berhasil dikirim!");
    }

    if (autoExport && savedItem?.id) {
      await handleExportSingle(savedItem);
    }

    fetchReports();
  };

  const handleDetail = (item: LaporanKerusakanItem) => {
    setSelectedReport(item);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus laporan kerusakan ini?")) {
      return;
    }
    try {
      await deleteLaporanKerusakan(id);
      fetchReports();
    } catch (err) {
      console.error("Gagal menghapus laporan kerusakan:", err);
      alert("Gagal menghapus laporan kerusakan.");
    }
  };

  const handleValidate = async (valid: boolean, catatan: string) => {
    if (!selectedReport?.id) return;
    try {
      await validateLaporanKerusakan(selectedReport.id, {
        valid,
        catatan_validasi: catatan,
      });
      alert(valid ? "Laporan telah disetujui (Closed)." : "Laporan ditolak dan dikembalikan ke teknisi.");
      setIsDetailOpen(false);
      fetchReports();
    } catch (err) {
      console.error("Gagal memproses validasi laporan:", err);
      alert("Gagal memproses validasi laporan.");
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-12">
        {/* Header Banner Konsisten Tema SMKI */}
        <HeaderBanner
          title="Laporan Kerusakan Data Center"
          subtitle="Pantau, tangani, dan validasi rekaman insiden kerusakan aset fisik dan perangkat jaringan Data Center."
        />

        {/* 4 Stat Cards persis Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Laporan"
            value={stats.total}
            subtitle={`${stats.total} laporan tercatat`}
            icon={FileText}
            colorClass="text-slate-600"
            iconBgClass="bg-slate-100"
          />
          <StatCard
            title="Laporan Baru"
            value={stats.baru}
            subtitle={`${stats.baru} perlu ditinjau`}
            icon={AlertTriangle}
            colorClass="text-sky-600"
            iconBgClass="bg-sky-50"
          />
          <StatCard
            title="Sedang Diproses"
            value={stats.diproses}
            subtitle={`${stats.diproses} dalam penanganan`}
            icon={Clock}
            colorClass="text-amber-600"
            iconBgClass="bg-amber-50"
          />
          <StatCard
            title="Selesai"
            value={stats.selesai}
            subtitle={`${stats.selesai} sudah ditangani`}
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            iconBgClass="bg-emerald-50"
          />
        </div>

        {/* Main Table Container Konsisten dengan Modul SMKI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header & Actions */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Daftar Laporan Kerusakan</h2>
                {isSupervisor ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Supervisor / Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Teknisi Data Center
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau status perbaikan, penugasan teknisi, dan approval validasi kerusakan data center.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Tombol Export Rekap hanya untuk Supervisor / Admin */}
              {isSupervisor && (
                <button
                  onClick={handleExportBatch}
                  disabled={isExportingBatch}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition disabled:opacity-50"
                  title="Export Rekapitulasi Laporan (Khusus Administrator/Supervisor)"
                >
                  <FileDown className="w-4 h-4 text-emerald-700" />
                  <span>{isExportingBatch ? "Mengekspor..." : "Export"}</span>
                </button>
              )}

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Laporan</span>
              </button>
            </div>
          </div>

          {/* Filter Bar Konsisten */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3 justify-between">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama aset atau penanggung jawab..."
                className="w-full md:w-80 text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-600 focus:ring-1 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition"
              >
                <option value="all">Semua status</option>
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Closed">Closed</option>
              </select>

              <input
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Table */}
          <LaporanTable
            reports={sortedReports}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDetail={handleDetail}
            onDelete={isSupervisor ? handleDelete : undefined}
            onExport={handleExportSingle}
            isSupervisor={isSupervisor}
            sortOrder={sortOrder}
            onToggleSort={handleToggleSort}
          />

          {/* Pagination / Total Info */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <span>Menampilkan 1-{reports.length} dari {stats.total} laporan</span>
            <span className="font-medium text-slate-400">Total data tercatat: {stats.total} item</span>
          </div>
        </div>

        {/* Modal Form Tambah / Edit Terpadu */}
        <LaporanFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          editItem={formEditItem}
          assets={assets}
          users={users}
          supervisors={supervisors}
          isSupervisor={isSupervisor}
        />

        {/* Modal Detail & Approval Supervisor */}
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          report={selectedReport}
          isSupervisor={isSupervisor}
          onValidate={handleValidate}
          onExport={handleExportSingle}
        />
      </div>
    </ServiceRouteGuard>
  );
}
