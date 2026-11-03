"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  FileText,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getAsetInformasiDetail,
  updateAsetInformasi,
  UnitKerjaDetailItem,
  IntangibleDetailItem,
} from "@/services/smki/asetInformasiService";

export default function AsetInformasiEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"unit_kerja" | "intangible">("unit_kerja");

  // Form Header
  const [noFormulir, setNoFormulir] = useState("");
  const [revisi, setRevisi] = useState("0");
  const [tanggal, setTanggal] = useState("");
  const [bidangNama, setBidangNama] = useState("APTIKA");
  const [klasifikasiDokumen, setKlasifikasiDokumen] = useState("Dokumen Terbatas");

  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerjaDetailItem[]>([]);
  const [intangibleList, setIntangibleList] = useState<IntangibleDetailItem[]>([]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getAsetInformasiDetail(id);
        if (res.status === "success" && res.data) {
          const doc = res.data;
          setNoFormulir(doc.no_formulir);
          setRevisi(doc.revisi);
          setTanggal(doc.tanggal);
          setBidangNama(doc.bidang_nama || "APTIKA");
          setKlasifikasiDokumen(doc.klasifikasi_dokumen || "Dokumen Terbatas");
          setUnitKerjaList(doc.unit_kerja_details || []);
          setIntangibleList(doc.intangible_details || []);
        }
      } catch (error: any) {
        toast.error("Gagal memuat detail dokumen");
        router.push("/smki/aset-informasi");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  // Tab 1 Card Handlers
  const addUnitKerjaCard = () => {
    const nextNum = unitKerjaList.length + 1;
    setUnitKerjaList([
      ...unitKerjaList,
      {
        kode_aset: `DOC-00${nextNum}`,
        nama_aset: "",
        klasifikasi: "Internal",
        tahun_pembuatan: new Date().getFullYear().toString(),
        tahun_update: new Date().getFullYear().toString(),
        deskripsi: "",
        format_penyimpanan: "Softcopy",
        masa_simpan: "5 Tahun",
        lokasi_penyimpanan: "Server APTIKA",
        pemilik_aset: "Bidang APTIKA",
        keterangan: "Aktif",
      },
    ]);
  };

  const removeUnitKerjaCard = (index: number) => {
    setUnitKerjaList(unitKerjaList.filter((_, i) => i !== index));
  };

  const updateUnitKerjaCard = (index: number, field: keyof UnitKerjaDetailItem, value: any) => {
    const updated = [...unitKerjaList];
    updated[index] = { ...updated[index], [field]: value };
    setUnitKerjaList(updated);
  };

  // Tab 2 Card Handlers
  const addIntangibleCard = () => {
    const nextNum = intangibleList.length + 1;
    setIntangibleList([
      ...intangibleList,
      {
        kode_aset: `INT-00${nextNum}`,
        layanan: "Layanan APTIKA",
        nama_aset: "",
        sub_klasifikasi: "Reputasi & SDM",
        pemilik_aset: "Bidang APTIKA",
        kerahasiaan: 2,
        integritas: 2,
        ketersediaan: 2,
        nilai: 2,
        keterangan: "Sedang",
      },
    ]);
  };

  const removeIntangibleCard = (index: number) => {
    setIntangibleList(intangibleList.filter((_, i) => i !== index));
  };

  const updateIntangibleCard = (index: number, field: keyof IntangibleDetailItem, value: any) => {
    const updated = [...intangibleList];
    const item = { ...updated[index], [field]: value };

    if (field === "kerahasiaan" || field === "integritas" || field === "ketersediaan") {
      const c = Number(field === "kerahasiaan" ? value : item.kerahasiaan);
      const i = Number(field === "integritas" ? value : item.integritas);
      const a = Number(field === "ketersediaan" ? value : item.ketersediaan);
      const maxVal = Math.max(c, i, a);
      item.nilai = maxVal;
      item.keterangan = maxVal >= 3 ? "Tinggi" : maxVal === 2 ? "Sedang" : "Rendah";
    }

    updated[index] = item;
    setIntangibleList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noFormulir || !tanggal) {
      toast.error("Nomor formulir dan tanggal wajib diisi");
      return;
    }

    const validUnitKerja = unitKerjaList.filter((r) => r.nama_aset.trim() !== "");
    const validIntangible = intangibleList.filter((r) => r.nama_aset.trim() !== "");

    setSubmitting(true);
    try {
      await updateAsetInformasi(id, {
        no_formulir: noFormulir,
        revisi,
        tanggal,
        bidang_nama: bidangNama,
        klasifikasi_dokumen: klasifikasiDokumen,
        unit_kerja_details: validUnitKerja,
        intangible_details: validIntangible,
      });

      toast.success("Dokumen Formulir FR-028 berhasil diperbarui!");
      router.push("/smki/aset-informasi");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui formulir");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="p-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-3 text-emerald-600" size={32} />
          <p className="text-sm font-medium">Memuat data formulir...</p>
        </div>
      </ServiceRouteGuard>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/smki/aset-informasi")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Formulir</span>
          </button>
          <div className="text-xs text-slate-400 font-mono">
            Edit Formulir #{id} (FR-028)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card Sesuai Template FR-028 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Informasi Dokumen Formulir (FR-028)
                </h2>
                <p className="text-xs text-slate-500">
                  Ubah data dasar formulir inventarisasi aset informasi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  No. Formulir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noFormulir}
                  onChange={(e) => setNoFormulir(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Revisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={revisi}
                  onChange={(e) => setRevisi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Bidang
                </label>
                <input
                  type="text"
                  value={bidangNama}
                  onChange={(e) => setBidangNama(e.target.value)}
                  placeholder="Contoh: Bidang Aplikasi Informatika"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("unit_kerja")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "unit_kerja"
                    ? "bg-[#065f46] text-white shadow-md shadow-emerald-900/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers size={16} />
                <span>Sheet 1: Aset Informasi ({unitKerjaList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("intangible")}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "intangible"
                    ? "bg-purple-700 text-white shadow-md shadow-purple-900/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sparkles size={16} />
                <span>Sheet 2: Aset Intangible & CIA ({intangibleList.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CARD VIEW ASET INFORMASI */}
          {activeTab === "unit_kerja" && (
            <div className="space-y-4">
              {unitKerjaList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.nama_aset || "Aset Informasi"}
                      </span>
                      {item.kode_aset && (
                        <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                          {item.kode_aset}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUnitKerjaCard(idx)}
                      title="Hapus Kartu Ini"
                      className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Kode Aset
                      </label>
                      <input
                        type="text"
                        value={item.kode_aset || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "kode_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Nama Aset Informasi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.nama_aset}
                        onChange={(e) => updateUnitKerjaCard(idx, "nama_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Klasifikasi Informasi
                      </label>
                      <select
                        value={item.klasifikasi}
                        onChange={(e) => updateUnitKerjaCard(idx, "klasifikasi", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Publik">Publik</option>
                        <option value="Internal">Internal</option>
                        <option value="Rahasia">Rahasia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Format Penyimpanan
                      </label>
                      <select
                        value={item.format_penyimpanan}
                        onChange={(e) => updateUnitKerjaCard(idx, "format_penyimpanan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Softcopy">Softcopy</option>
                        <option value="Hardcopy">Hardcopy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Tahun Pembuatan Pertama
                      </label>
                      <input
                        type="text"
                        value={item.tahun_pembuatan || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "tahun_pembuatan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Tahun Update Terakhir
                      </label>
                      <input
                        type="text"
                        value={item.tahun_update || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "tahun_update", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Masa Simpan (Retensi Dokumen)
                      </label>
                      <input
                        type="text"
                        value={item.masa_simpan || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "masa_simpan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Tempat / Lokasi Penyimpanan
                      </label>
                      <input
                        type="text"
                        value={item.lokasi_penyimpanan || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "lokasi_penyimpanan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Pemilik / Penanggung Jawab Aset
                      </label>
                      <input
                        type="text"
                        value={item.pemilik_aset || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "pemilik_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Keterangan
                      </label>
                      <input
                        type="text"
                        value={item.keterangan || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "keterangan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Deskripsi Singkat Aset Informasi
                      </label>
                      <textarea
                        rows={2}
                        value={item.deskripsi || ""}
                        onChange={(e) => updateUnitKerjaCard(idx, "deskripsi", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addUnitKerjaCard}
                className="w-full py-3.5 border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah Kartu Aset Informasi Berikutnya</span>
              </button>
            </div>
          )}

          {/* TAB 2: CARD VIEW ASET INTANGIBLE */}
          {activeTab === "intangible" && (
            <div className="space-y-4">
              {intangibleList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.nama_aset || "Aset Intangible"}
                      </span>
                      {item.kode_aset && (
                        <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
                          {item.kode_aset}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIntangibleCard(idx)}
                      title="Hapus Kartu Ini"
                      className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Kode Aset
                      </label>
                      <input
                        type="text"
                        value={item.kode_aset || ""}
                        onChange={(e) => updateIntangibleCard(idx, "kode_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Layanan Terkait
                      </label>
                      <input
                        type="text"
                        value={item.layanan || ""}
                        onChange={(e) => updateIntangibleCard(idx, "layanan", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Nama Aset Intangible <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.nama_aset}
                        onChange={(e) => updateIntangibleCard(idx, "nama_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Sub Klasifikasi
                      </label>
                      <input
                        type="text"
                        value={item.sub_klasifikasi || ""}
                        onChange={(e) => updateIntangibleCard(idx, "sub_klasifikasi", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Pemilik Aset
                      </label>
                      <input
                        type="text"
                        value={item.pemilik_aset || ""}
                        onChange={(e) => updateIntangibleCard(idx, "pemilik_aset", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Penilaian CIA */}
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                        Penilaian Tingkat Risiko Keamanan (CIA Matrix)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Nilai:</span>
                        <span className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 font-extrabold text-xs flex items-center justify-center text-purple-700 dark:text-purple-300">
                          {item.nilai}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.nilai === 3
                              ? "bg-rose-100 text-rose-700 border border-rose-300"
                              : item.nilai === 2
                              ? "bg-amber-100 text-amber-700 border border-amber-300"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          }`}
                        >
                          {item.keterangan}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Kerahasiaan (Confidentiality)
                        </label>
                        <select
                          value={item.kerahasiaan}
                          onChange={(e) => updateIntangibleCard(idx, "kerahasiaan", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-300 outline-none"
                        >
                          <option value={1}>1 - Rendah</option>
                          <option value={2}>2 - Sedang</option>
                          <option value={3}>3 - Tinggi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Integritas (Integrity)
                        </label>
                        <select
                          value={item.integritas}
                          onChange={(e) => updateIntangibleCard(idx, "integritas", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-300 outline-none"
                        >
                          <option value={1}>1 - Rendah</option>
                          <option value={2}>2 - Sedang</option>
                          <option value={3}>3 - Tinggi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Ketersediaan (Availability)
                        </label>
                        <select
                          value={item.ketersediaan}
                          onChange={(e) => updateIntangibleCard(idx, "ketersediaan", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-300 outline-none"
                        >
                          <option value={1}>1 - Rendah</option>
                          <option value={2}>2 - Sedang</option>
                          <option value={3}>3 - Tinggi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addIntangibleCard}
                className="w-full py-3.5 border-2 border-dashed border-purple-300 dark:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah Kartu Aset Intangible Berikutnya</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.push("/smki/aset-informasi")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#065f46] hover:bg-[#047857] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Simpan Perubahan Formulir</span>
            </button>
          </div>
        </form>
      </div>
    </ServiceRouteGuard>
  );
}
