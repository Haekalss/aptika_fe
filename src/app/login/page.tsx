"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  FileText,
  Shield,
  BarChart3,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import { login } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const token =
        data.token ||
        data.access_token ||
        data?.data?.token ||
        data?.data?.access_token ||
        "dummy-token-aptika";
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user || data?.data?.user || { name: "User APTIKA Tools" })
      );
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Username/email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* ── LEFT PANEL (Branding & Background Sebelumnya) ── */}
      <div className="relative flex-1 bg-gradient-to-br from-[#0c224a] via-[#1a4480] to-[#2563eb] text-white p-8 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[460px] lg:min-h-screen">
        {/* Background Building Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('/bg-login.png')` }}
        />

        {/* Soft Decorative Ambient Blurs */}
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold animate-in fade-in">
                {error}
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
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
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
            {/* Daftar Magang */}
            <div
              onClick={() => router.push("/magang")}
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
              onClick={() => router.push("/administrasisurat")}
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
    </div>
  );
}