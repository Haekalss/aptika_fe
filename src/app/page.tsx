"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  FileText,
  ArrowRight,
  Shield,
  BarChart3,
  Cloud,
  CheckCircle2,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { login, createMagang, getBidangs } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Magang modal state
  const [isMagangModalOpen, setIsMagangModalOpen] = useState(false);
  const [magangSubmitting, setMagangSubmitting] = useState(false);
  const [magangSuccess, setMagangSuccess] = useState(false);
  const [bidangs, setBidangs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama: "",
    nama_kampus: "",
    bidang_id: "3", // default APTIKA
    tgl_mulai_magang: "",
    tgl_selesai_magang: "",
    sertifikat: "Belum menerima",
    keterangan: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    getBidangs()
      .then((res) => {
        if (res && res.data) {
          setBidangs(res.data);
          if (res.data.length > 0 && !formData.bidang_id) {
            setFormData((prev) => ({ ...prev, bidang_id: String(res.data[0].id) }));
          }
        }
      })
      .catch((err) => console.error("Gagal memuat bidang:", err));
  }, []);

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

  const currentStatus = computeStatusMagang(
    formData.tgl_mulai_magang,
    formData.tgl_selesai_magang
  );

  const resetMagangForm = () => {
    setFormData({
      nama: "",
      nama_kampus: "",
      bidang_id: bidangs.length > 0 ? String(bidangs[0].id) : "3",
      tgl_mulai_magang: "",
      tgl_selesai_magang: "",
      sertifikat: "Belum menerima",
      keterangan: "",
    });
    setCvFile(null);
    setMagangSuccess(false);
  };

  const handleOpenMagangModal = () => {
    resetMagangForm();
    setIsMagangModalOpen(true);
  };

  const handleCloseMagangModal = () => {
    setIsMagangModalOpen(false);
    resetMagangForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await login(email, password);
      const token =
        data.token ||
        data.access_token ||
        data?.data?.token ||
        data?.data?.access_token ||
        "dummy-token-aptika";
      const loggedUser = data.user || data?.data?.user;
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedUser || { name: "User APTIKA Tools" })
      );
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      await useAuthStore.getState().fetchProfile();

      const authState = useAuthStore.getState();
      const isAdmin =
        loggedUser?.role === "admin" ||
        authState.user?.role === "admin" ||
        authState.isAdminAptika;

      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Username/email atau password salah.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSaveMagang = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cvFile && cvFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file CV Magang tidak boleh melebihi 2MB");
      return;
    }

    setMagangSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nama_kampus", formData.nama_kampus);
      payload.append("bidang_id", formData.bidang_id);
      payload.append("tgl_mulai_magang", formData.tgl_mulai_magang);
      payload.append("tgl_selesai_magang", formData.tgl_selesai_magang);
      payload.append("sertifikat", formData.sertifikat);
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);
      if (cvFile) payload.append("cv_magang", cvFile);

      await createMagang(payload);
      setMagangSuccess(true);
    } catch (error: any) {
      if (error?.response?.status === 413) {
        alert("Gagal menyimpan data: Ukuran file terlalu besar (Maksimal 2MB)");
      } else if (error?.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else {
        alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      }
      console.error("Error submitting magang application:", error);
    } finally {
      setMagangSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* ── LEFT PANEL (Branding & Vector Background Bersih) ── */}
      <div className="relative flex-1 bg-gradient-to-br from-[#0c224a] via-[#1a4480] to-[#2563eb] text-white p-8 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[460px] lg:min-h-screen">
        {/* Background Building Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('/bg-login.png')` }}
        />

        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Decorative Grid Dots (Top Right) */}
        <div className="absolute top-8 right-12 hidden sm:grid grid-cols-6 gap-2 opacity-30 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        {/* Center Tagline & Badges (Diperbesar Ekstra Maksimal) */}
        <div className="relative z-10 my-auto py-8 max-w-3xl">
          <span className="text-xl sm:text-2xl font-extrabold text-cyan-300 mb-3 block tracking-wide">
            Selamat Datang di
          </span>
          <h2 className="text-6xl sm:text-7xl xl:text-8xl font-black tracking-tight text-white mb-6 leading-[1.04]">
            Aptika Tools <br />
            <span className="text-cyan-300">Jawa Barat</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-100/95 leading-relaxed mb-10 max-w-2xl font-normal">
            Platform pengelolaan dan rekap data Aplikasi Informatika Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Data akurat, terpadu, dan mudah diakses.
          </p>

          {/* Instansi & Bidang Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-md min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center text-cyan-300">
                <Shield size={26} />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-semibold tracking-wider uppercase">Instansi</div>
                <div className="text-lg font-black text-white">Diskominfo Jabar</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-md min-w-[190px]">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/30 flex items-center justify-center text-cyan-300">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-semibold tracking-wider uppercase">Bidang</div>
                <div className="text-lg font-black text-white">Aptika</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-cyan-300" />
            <span>Data Terintegrasi</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud size={15} className="text-cyan-300" />
            <span>Akses Cepat</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-cyan-300" />
            <span>Mudah Digunakan</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Login Form & Public Modules) ── */}
      <div className="w-full lg:w-[540px] xl:w-[580px] bg-white flex flex-col justify-center px-8 sm:px-14 py-12 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Header Greeting with Shield Icon */}
          <div className="flex items-start gap-3.5 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
              <Shield size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug">Selamat Datang</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Silakan masuk untuk melanjutkan ke sistem Aptika Tools.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
              LOGIN SISTEM
            </span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              APTIKA Tools Jawa Barat
            </h4>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold animate-in fade-in">
                {loginError}
              </div>
            )}

            {/* Username/Email Input */}
            <div className="border border-slate-200 focus-within:border-blue-600 rounded-2xl p-2.5 px-3.5 flex items-center gap-3 bg-slate-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600 flex-shrink-0">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Masukkan username atau email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 font-medium outline-none pt-0.5"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="border border-slate-200 focus-within:border-blue-600 rounded-2xl p-2.5 px-3.5 flex items-center gap-3 bg-slate-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Lock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 font-medium outline-none pt-0.5"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Silakan hubungi administrator bidang untuk reset password.")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Lupa password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight size={17} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              atau
            </span>
          </div>

          {/* Public Action Cards */}
          <div className="space-y-3">
            {/* Daftar Magang (Open Modal) */}
            <div
              onClick={handleOpenMagangModal}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 group-hover:text-purple-600 transition-colors">
                    Daftar Magang
                  </h5>
                  <p className="text-[10.5px] text-slate-500">
                    Ajukan pendaftaran program magang secara online
                  </p>
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Permohonan RFC */}
            <div
              onClick={() => router.push("/form-perubahan-it")}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    Permohonan RFC
                  </h5>
                  <p className="text-[10.5px] text-slate-500">
                    Ajukan permohonan perubahan sistem & IT
                  </p>
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="mt-8 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100">
            <Shield size={13} className="text-blue-500" />
            <span>Diskominfo Provinsi Jawa Barat</span>
          </div>
        </div>
      </div>

      {/* ── MODAL FORM DAFTAR MAGANG ── */}
      <Modal
        isOpen={isMagangModalOpen}
        onClose={handleCloseMagangModal}
        title={magangSuccess ? "Pendaftaran Berhasil" : "Tambah Data Magang"}
        size="lg"
      >
        {magangSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil Dikirim!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Terima kasih, data pendaftaran magang Anda telah berhasil disimpan. Tim APTIKA Diskominfo Jabar akan memverifikasi berkas Anda.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCloseMagangModal}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveMagang} className="space-y-5">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Bidang Tujuan Magang <span className="text-red-500">*</span>
                </label>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tgl_mulai_magang}
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_mulai_magang: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_selesai_magang: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Magang
                </label>
                <div
                  className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border ${
                    currentStatus === "Sedang magang"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : currentStatus === "Selesai magang"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : currentStatus === "Belum mulai"
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  {currentStatus}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Sertifikat
                </label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload CV (PDF/JPG/PNG) <span className="text-red-500">* (Maks 2MB)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan (Opsional)
              </label>
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
                onClick={handleCloseMagangModal}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={magangSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {magangSubmitting ? "Mengirim..." : "Kirim Data"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}