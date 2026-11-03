"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Calendar, Hash, Building2, Phone, Mail, Clock, KeyRound, ShieldAlert, CheckSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  HakAksesFisikItem,
  HakAksesFisikLookupData,
  createHakAksesFisik,
  updateHakAksesFisik,
} from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: HakAksesFisikItem | null;
  lookups: HakAksesFisikLookupData | null;
}

const DEFAULT_RUANGAN_OPTIONS = [
  "Data Center",
  "Ruang NOC",
  "UPS",
  "Akses Genset Gedung",
  "Pintu Utama",
  "Ruang SOC",
  "Akses Genset DC",
];

const DEFAULT_KEPERLUAN_OPTIONS = [
  "Instansi",
  "Monitoring",
  "Perawatan",
  "Lainnya : Pindah Tugas / Mutasi OPD lain",
];

export default function HakAksesFisikFormModal({
  open,
  onClose,
  onSuccess,
  item = null,
  lookups,
}: Props) {
  const isEditing = Boolean(item && item.id);

  const [loading, setLoading] = useState(false);

  // Form states
  const [nomorDokumen, setNomorDokumen] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>("");
  const [namaPemohon, setNamaPemohon] = useState("");
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState("Bidang Aplikasi Informatika");
  const [noHandphone, setNoHandphone] = useState("");
  const [email, setEmail] = useState("");

  const [jenisPermintaan, setJenisPermintaan] = useState<string>("Pendaftaran");
  const [sifatAkses, setSifatAkses] = useState<string>("Permanen");
  const [waktuAkses, setWaktuAkses] = useState<string>("7 x 24 jam");
  const [waktuAksesLainnya, setWaktuAksesLainnya] = useState<string>("");
  const [berlakuSampai, setBerlakuSampai] = useState<string>("");

  const [ruanganAkses, setRuanganAkses] = useState<string[]>(["Data Center"]);
  const [keperluanAlasan, setKeperluanAlasan] = useState<string[]>(["Monitoring"]);
  const [keperluanLainnya, setKeperluanLainnya] = useState<string>("");

  // Penanda Tangan (Spesimen TTE)
  const [atasanPegawaiId, setAtasanPegawaiId] = useState<string>("");
  const [atasanNama, setAtasanNama] = useState<string>("");
  const [atasanNip, setAtasanNip] = useState<string>("");

  const [pjPegawaiId, setPjPegawaiId] = useState<string>("");
  const [pjNama, setPjNama] = useState<string>("");
  const [pjNip, setPjNip] = useState<string>("");

  const [agenPegawaiId, setAgenPegawaiId] = useState<string>("");
  const [agenNama, setAgenNama] = useState<string>("");
  const [agenNip, setAgenNip] = useState<string>("");

  // Populate data when editing or opening
  useEffect(() => {
    if (open) {
      if (item) {
        setNomorDokumen(item.nomor_dokumen || "");
        setTanggalPengajuan(
          item.tanggal_pengajuan ? String(item.tanggal_pengajuan).slice(0, 10) : new Date().toISOString().slice(0, 10)
        );
        setSelectedPegawaiId(item.pegawai_id ? String(item.pegawai_id) : "");
        setNamaPemohon(item.nama_pemohon || "");
        setNip(item.nip || "");
        setJabatan(item.jabatan || "");
        setUnitKerja(item.unit_kerja || "Bidang Aplikasi Informatika");
        setNoHandphone(item.no_handphone || "");
        setEmail(item.email || "");

        setJenisPermintaan(item.jenis_permintaan || "Pendaftaran");
        setSifatAkses(item.sifat_akses || "Permanen");
        setWaktuAkses(item.waktu_akses || "7 x 24 jam");
        setWaktuAksesLainnya(item.waktu_akses_lainnya || "");
        setBerlakuSampai(item.berlaku_sampai ? String(item.berlaku_sampai).slice(0, 10) : "");

        setRuanganAkses(Array.isArray(item.ruangan_akses) ? item.ruangan_akses : ["Data Center"]);
        setKeperluanAlasan(Array.isArray(item.keperluan_alasan) ? item.keperluan_alasan : ["Monitoring"]);
        setKeperluanLainnya(item.keperluan_lainnya || "");

        setAtasanNama(item.atasan_nama || "");
        setAtasanNip(item.atasan_nip || "");
        setPjNama(item.penanggung_jawab_nama || "");
        setPjNip(item.penanggung_jawab_nip || "");
        setAgenNama(item.agen_nama || "");
        setAgenNip(item.agen_nip || "");
      } else {
        // Mode Buat Baru
        setNomorDokumen(lookups?.next_nomor_dokumen || "");
        setTanggalPengajuan(new Date().toISOString().slice(0, 10));
        setSelectedPegawaiId("");
        setNamaPemohon("");
        setNip("");
        setJabatan("IT / Developer");
        setUnitKerja("Bidang Aplikasi Informatika");
        setNoHandphone("");
        setEmail("");

        setJenisPermintaan("Pendaftaran");
        setSifatAkses("Permanen");
        setWaktuAkses("7 x 24 jam");
        setWaktuAksesLainnya("");
        setBerlakuSampai("");

        setRuanganAkses(["Data Center"]);
        setKeperluanAlasan(["Monitoring"]);
        setKeperluanLainnya("");

        setAtasanNama("");
        setAtasanNip("");
        setPjNama("");
        setPjNip("");
        setAgenNama("");
        setAgenNip("");
      }
    }
  }, [open, item, lookups]);

  if (!open) return null;

  // Auto-fill from current logged-in user profile (opsional)
  const handleFillCurrentUser = () => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) setNamaPemohon(u.name);
        if (u.email) setEmail(u.email);
        if (u.nip) setNip(u.nip);
        if (u.jabatan) setJabatan(u.jabatan);
        if (u.instansi || u.unit_kerja) setUnitKerja(u.instansi || u.unit_kerja);
        toast.success("Data profil akun Anda berhasil diterapkan!");
        return;
      }
    } catch {
      // ignore
    }
    toast("Silakan isi nama pemohon secara manual.", { icon: "ℹ️" });
  };

  const handleSelectAtasan = (pegawaiIdStr: string) => {
    setAtasanPegawaiId(pegawaiIdStr);
    if (!pegawaiIdStr || !lookups?.pegawai) return;
    const p = lookups.pegawai.find((item) => String(item.id) === pegawaiIdStr);
    if (p) {
      setAtasanNama(p.nama);
      setAtasanNip(p.nip || "");
    }
  };

  const handleSelectPJ = (pegawaiIdStr: string) => {
    setPjPegawaiId(pegawaiIdStr);
    if (!pegawaiIdStr || !lookups?.pegawai) return;
    const p = lookups.pegawai.find((item) => String(item.id) === pegawaiIdStr);
    if (p) {
      setPjNama(p.nama);
      setPjNip(p.nip || "");
    }
  };

  const handleSelectAgen = (pegawaiIdStr: string) => {
    setAgenPegawaiId(pegawaiIdStr);
    if (!pegawaiIdStr || !lookups?.pegawai) return;
    const p = lookups.pegawai.find((item) => String(item.id) === pegawaiIdStr);
    if (p) {
      setAgenNama(p.nama);
      setAgenNip(p.nip || "");
    }
  };

  const toggleRuangan = (ruang: string) => {
    setRuanganAkses((prev) =>
      prev.includes(ruang) ? prev.filter((r) => r !== ruang) : [...prev, ruang]
    );
  };

  const toggleKeperluan = (alasan: string) => {
    setKeperluanAlasan((prev) =>
      prev.includes(alasan) ? prev.filter((a) => a !== alasan) : [...prev, alasan]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemohon.trim()) {
      toast.error("Nama pemohon wajib diisi.");
      return;
    }
    if (!tanggalPengajuan) {
      toast.error("Tanggal pengajuan surat wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<HakAksesFisikItem> = {
        nomor_dokumen: nomorDokumen.trim() || undefined,
        tanggal_pengajuan: tanggalPengajuan,
        pegawai_id: selectedPegawaiId ? Number(selectedPegawaiId) : null,
        nama_pemohon: namaPemohon.trim(),
        nip: nip.trim() || null,
        jabatan: jabatan.trim() || null,
        unit_kerja: unitKerja.trim() || null,
        no_handphone: noHandphone.trim() || null,
        email: email.trim() || null,
        jenis_permintaan: jenisPermintaan,
        sifat_akses: sifatAkses,
        waktu_akses: waktuAkses,
        waktu_akses_lainnya: waktuAkses === "Lainnya" ? waktuAksesLainnya : null,
        berlaku_sampai: sifatAkses === "Sementara" && berlakuSampai ? berlakuSampai : null,
        ruangan_akses: ruanganAkses,
        keperluan_alasan: keperluanAlasan,
        keperluan_lainnya: keperluanLainnya.trim() || null,
        status_pengajuan: item?.status_pengajuan || "Approved",

        pemohon_nama: namaPemohon.trim(),
        pemohon_nip: nip.trim() || null,
        atasan_nama: atasanNama.trim() || null,
        atasan_nip: atasanNip.trim() || null,
        penanggung_jawab_nama: pjNama.trim() || null,
        penanggung_jawab_nip: pjNip.trim() || null,
        agen_nama: agenNama.trim() || null,
        agen_nip: agenNip.trim() || null,
      };

      if (isEditing && item?.id) {
        await updateHakAksesFisik(item.id, payload);
        toast.success("Perubahan pengajuan Hak Akses Fisik berhasil disimpan!");
      } else {
        await createHakAksesFisik(payload);
        toast.success("Pengajuan Hak Akses Fisik (FR-019) berhasil dibuat!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  const ruanganOptions = lookups?.ruangan?.map((r) => r.nama_ruangan) || DEFAULT_RUANGAN_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isEditing ? "Edit Data Pengajuan Hak Akses" : "Tambah Data Pengajuan Hak Akses FR-019"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standar ISO 27001 Sistem Manajemen Keamanan Informasi (SMKI)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs scrollbar-hide">
          {/* Section 0: Nomor Surat & Tanggal Pengajuan */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Hash size={14} className="text-emerald-600" />
              Kontrol Nomor & Tanggal Surat
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Dokumen / Surat
                </label>
                <input
                  type="text"
                  value={nomorDokumen}
                  onChange={(e) => setNomorDokumen(e.target.value)}
                  placeholder="Contoh: FR-019/KOM/2026/0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pengajuan / Surat
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={tanggalPengajuan}
                    onChange={(e) => setTanggalPengajuan(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Data Utama Pemohon (Input Manual Bebas / Pihak Ketiga & Pegawai) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm">
                  Data Utama Pemohon
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dapat diisi langsung oleh pemohon, staf internal, maupun vendor/pihak luar
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillCurrentUser}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                title="Isi otomatis dengan profil user yang sedang login"
              >
                <UserCheck size={13} />
                Gunakan Data Akun Saya
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemohon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPemohon}
                  onChange={(e) => setNamaPemohon(e.target.value)}
                  placeholder="Contoh: Budi Santoso / Teknisi PT ABC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: IT / Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Kerja / Penyedia
                </label>
                <input
                  type="text"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  placeholder="Contoh: Bidang Aplikasi Informatika"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. HP
                </label>
                <input
                  type="text"
                  value={noHandphone}
                  onChange={(e) => setNoHandphone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: nama@diskominfo.jabarprov.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2: Detail Hak Akses Sesuai Formulir FR-019 */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm">
              Detail Hak Akses Sesuai Formulir FR-019
            </h4>

            {/* Jenis Permintaan (Radio) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Permintaan
              </label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="jenis_permintaan"
                    checked={jenisPermintaan === "Pendaftaran"}
                    onChange={() => setJenisPermintaan("Pendaftaran")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  Pendaftaran
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="jenis_permintaan"
                    checked={jenisPermintaan === "Penutupan"}
                    onChange={() => setJenisPermintaan("Penutupan")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  Penutupan
                </label>
              </div>
            </div>

            {/* Sifat & Waktu Akses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sifat Akses
                </label>
                <select
                  value={sifatAkses}
                  onChange={(e) => setSifatAkses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Permanen">Permanen</option>
                  <option value="Sementara">Sementara</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Akses
                </label>
                <select
                  value={waktuAkses}
                  onChange={(e) => setWaktuAkses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="7 x 24 jam">7 x 24 jam</option>
                  <option value="08.00 – 17.00">08.00 – 17.00 (Jam Kerja)</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
              </div>
            </div>

            {/* Conditional Sifat Akses Sementara */}
            {sifatAkses === "Sementara" && (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <label className="block font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Akses ini berlaku sampai tanggal:
                </label>
                <input
                  type="date"
                  value={berlakuSampai}
                  onChange={(e) => setBerlakuSampai(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Conditional Waktu Akses Lainnya */}
            {waktuAkses === "Lainnya" && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Waktu Akses Khusus:
                </label>
                <input
                  type="text"
                  value={waktuAksesLainnya}
                  onChange={(e) => setWaktuAksesLainnya(e.target.value)}
                  placeholder="Contoh: Khusus hari Sabtu dan Minggu (Maintenance)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Checkbox Ruangan / Area */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                Jenis Akses / Ruangan (Pilihan Checkbox)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {ruanganOptions.map((ruang) => {
                  const checked = ruanganAkses.includes(ruang);
                  return (
                    <label
                      key={ruang}
                      onClick={() => toggleRuangan(ruang)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        checked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="truncate">{ruang}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Checkbox Keperluan & Alasan */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                Keperluan dan Alasan (Pilihan Checkbox)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {["Instansi", "Monitoring", "Perawatan"].map((alasan) => {
                  const checked = keperluanAlasan.includes(alasan);
                  return (
                    <label
                      key={alasan}
                      onClick={() => toggleKeperluan(alasan)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        checked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>{alasan}</span>
                    </label>
                  );
                })}
              </div>

              {/* Checkbox Lainnya */}
              <div className="mt-2.5">
                <label
                  onClick={() => toggleKeperluan("Lainnya")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    keperluanAlasan.includes("Lainnya")
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={keperluanAlasan.includes("Lainnya")}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Lainnya : Pindah Tugas / Mutasi OPD lain</span>
                </label>
                {keperluanAlasan.includes("Lainnya") && (
                  <input
                    type="text"
                    value={keperluanLainnya}
                    onChange={(e) => setKeperluanLainnya(e.target.value)}
                    placeholder="Tuliskan keterangan detail keperluan lainnya..."
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3: 4 Penanda Tangan (Spesimen TTE) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                <KeyRound size={16} className="text-emerald-600" />
                Penanda Tangan & Spesimen TTE (Atasan, PJ Perangkat, & Agen)
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pemohon bertanda tangan basah; 3 pejabat lainnya menggunakan spesimen TTE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Atasan Pemohon */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  1. Atasan Langsung Pemohon
                </label>
                <select
                  value={atasanPegawaiId}
                  onChange={(e) => handleSelectAtasan(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  <option value="">— Pilih dari Master Pegawai —</option>
                  {lookups?.pegawai?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={atasanNama}
                  onChange={(e) => setAtasanNama(e.target.value)}
                  placeholder="Nama Atasan"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
                <input
                  type="text"
                  value={atasanNip}
                  onChange={(e) => setAtasanNip(e.target.value)}
                  placeholder="NIP Atasan (untuk TTE)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                />
              </div>

              {/* 2. Penanggung Jawab Perangkat */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  2. Penanggung Jawab Perangkat
                </label>
                <select
                  value={pjPegawaiId}
                  onChange={(e) => handleSelectPJ(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  <option value="">— Pilih dari Master Pegawai —</option>
                  {lookups?.pegawai?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={pjNama}
                  onChange={(e) => setPjNama(e.target.value)}
                  placeholder="Nama Penanggung Jawab"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
                <input
                  type="text"
                  value={pjNip}
                  onChange={(e) => setPjNip(e.target.value)}
                  placeholder="NIP PJ (untuk TTE)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                />
              </div>

              {/* 3. Agen / Pelaksana */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  3. Dilaksanakan Oleh: Agen
                </label>
                <select
                  value={agenPegawaiId}
                  onChange={(e) => handleSelectAgen(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  <option value="">— Pilih dari Master Pegawai —</option>
                  {lookups?.pegawai?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={agenNama}
                  onChange={(e) => setAgenNama(e.target.value)}
                  placeholder="Nama Agen Pelaksana"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                />
                <input
                  type="text"
                  value={agenNip}
                  onChange={(e) => setAgenNip(e.target.value)}
                  placeholder="NIP Agen (untuk TTE)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : isEditing ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
