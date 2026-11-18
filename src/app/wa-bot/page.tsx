"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Calendar,
  Laptop,
  Users,
  Megaphone,
  Rocket,
  Send,
  LogOut,
  MessageSquare,
  CheckCircle2,
  QrCode as QrIcon,
  Activity,
  ChevronDown,
  X,
  Bot,
} from "lucide-react";

interface LogItem {
  id: number;
  time: string;
  direction: "IN" | "OUT";
  sender: string;
  target: string;
  text: string;
}

interface GroupItem {
  id: string;
  subject: string;
}

export default function WaBotDashboardPage() {
  const [status, setStatus] = useState<string>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [botUser, setBotUser] = useState<{ id?: string; name?: string } | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);

  // State Form Broadcast / Kirim Pesan WA
  const [selectedGroupJid, setSelectedGroupJid] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [sendMode, setSendMode] = useState<"group" | "personal">("group");
  const [waMessage, setWaMessage] = useState("");
  
  // State Dialog Konfirmasi (Modal) Broadcast
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // State Web Chat Simulator
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    {
      sender: "bot",
      text: "Halo Admin! Silakan pilih tombol aksi cepat di bawah untuk mengecek data database secara instan atau tanyakan apa saja."
    }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const BOT_API = "http://localhost:3005/api/wa";

 const fetchBotData = async () => {
    try {
      const resStatus = await fetch(`${BOT_API}/status`);
      const dataStatus = await resStatus.json();
      setStatus(dataStatus.status);
      setQrCode(dataStatus.qr);
      setBotUser(dataStatus.user);
      setLogs(dataStatus.logs || []);

      if (dataStatus.status === "connected") {
        const resGroups = await fetch(`${BOT_API}/groups`);
        const dataGroups = await resGroups.json();
        if (dataGroups.success && Array.isArray(dataGroups.groups)) {
          setGroups(dataGroups.groups);
          
          // PERBAIKAN DI SINI: Gunakan callback setter atau cek supaya tidak otomatis menimpa pilihan manual user
          setSelectedGroupJid((prev) => {
            // Jika user belum memilih sama sekali (masih kosong), baru set ke grup pertama
            if (!prev && dataGroups.groups.length > 0) {
              return dataGroups.groups[0].id;
            }
            // Jika user sudah memilih grup tertentu, biarkan pilihan user tetap ada
            return prev;
          });
        }
      }
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingChat]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = sendMode === "group" ? selectedGroupJid : customTarget;
    if (!target || !waMessage.trim()) {
      alert("Pilih target dan isi pesan terlebih dahulu.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteSendWa = async () => {
    const target = sendMode === "group" ? selectedGroupJid : customTarget;
    setSendingWa(true);
    try {
      const res = await fetch(`${BOT_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, message: waMessage })
      });
      const data = await res.json();
      if (data.success) {
        setWaMessage("");
        setShowConfirmModal(false);
        fetchBotData();
        alert("✅ Pesan berhasil dikirim ke WhatsApp!");
      } else {
        alert("❌ Gagal: " + data.error);
      }
    } catch {
      alert("❌ Terjadi kesalahan koneksi ke server bot.");
    } finally {
      setSendingWa(false);
    }
  };

  const handleLogoutWa = async () => {
    if (!confirm("Yakin ingin memutuskan koneksi / logout sesi WhatsApp ini?")) return;
    setLoggingOut(true);
    try {
      const res = await fetch(`${BOT_API}/logout`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("✅ Sesi WhatsApp berhasil diputus.");
        fetchBotData();
      } else {
        alert("❌ Gagal logout: " + data.error);
      }
    } catch {
      alert("❌ Gagal menghubungi server bot.");
    } finally {
      setLoggingOut(false);
    }
  };

  const sendQueryToBot = async (queryText: string) => {
    if (!queryText.trim() || loadingChat) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: queryText }]);
    setLoadingChat(true);

    try {
      const res = await fetch(`${BOT_API}/web-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: queryText })
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "bot", text: data.reply || "Tidak ada balasan." }]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Gagal terhubung ke layanan asisten bot." }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* ── Banner Hijau-Teal Khas WhatsApp ── */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="flex-1 min-w-0 max-w-xl relative z-10">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            • Integrasi Layanan Otomatisasi & AI
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp Bot & Asisten Data Aptika</h1>
          <p className="mt-1.5 text-sm text-emerald-50 max-w-2xl">
            Monitoring koneksi Baileys WhatsApp, Broadcast Agenda Grup, dan Asisten Chat Interaktif Database Aptika Tools
          </p>
        </div>

        {/* Status Pill di Sisi Kanan Banner */}
        <div className="flex flex-col gap-2.5 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/25 min-w-[200px] shadow-sm">
            <span className={`w-3 h-3 rounded-full ${status === "connected" ? "bg-emerald-300 animate-pulse" : status === "qr" ? "bg-amber-300 animate-pulse" : "bg-rose-400"}`} />
            <div>
              <div className="text-[11px] text-emerald-100 font-medium">Status Layanan WA:</div>
              <div className="text-white font-extrabold text-sm capitalize">
                {status === "connected" ? "Aktif & Terhubung" : status === "qr" ? "Menunggu Scan QR" : "Terputus"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ringkasan Status Kartu Atas ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Layanan WA Bot</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-4 w-4 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    : status === "qr"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-xl font-extrabold capitalize text-slate-800">
                {status === "connected"
                  ? "Terhubung (Aktif)"
                  : status === "qr"
                  ? "Menunggu Scan QR"
                  : "Terputus / Offline"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {botUser?.id ? `Perangkat: ${botUser.id.split(":")[0]}` : "Sesi perangkat aktif"}
            </p>
          </div>

          {status === "connected" && (
            <button
              onClick={handleLogoutWa}
              disabled={loggingOut}
              className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition border border-rose-200"
            >
              <LogOut size={14} />
              {loggingOut ? "Memutus Sesi..." : "Putuskan Sesi / Logout"}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Jadwal Rekap Otomatis</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800">Setiap 07:00 WIB</p>
              <p className="text-xs text-emerald-600 font-semibold">Cron job aktif mengirim rekap</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Aktivitas Pesan</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800">{logs.length} Pesan Tercatat</p>
              <p className="text-xs text-slate-500">Pesan masuk & keluar sesi ini</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Konten Utama 2 Kolom ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Web Chat Asisten Database + Tombol Cepat Ikon Lucide */}
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-[600px]">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">💬 Tanya Bot Aptika (Web Chat)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik tombol aksi cepat di bawah atau ketik pertanyaan untuk akses data instan
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot size={18} />
            </div>
          </div>

          {/* Quick Action Chips dengan Ikon Lucide */}
          <div className="py-3 flex flex-wrap gap-1.5 border-b border-slate-100 bg-slate-50/60 -mx-6 px-6">
            <span className="text-[11px] font-extrabold text-slate-400 self-center mr-1">Aksi Cepat:</span>
            <button
              onClick={() => sendQueryToBot("info magang")}
              disabled={loadingChat}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <BarChart3 size={13} /> Info Magang
            </button>
            <button
              onClick={() => sendQueryToBot("magang november")}
              disabled={loadingChat}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Calendar size={13} /> Magang November
            </button>
            <button
              onClick={() => sendQueryToBot("daftar aset")}
              disabled={loadingChat}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200 shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Laptop size={13} /> Daftar Aset
            </button>
            <button
              onClick={() => sendQueryToBot("info pegawai")}
              disabled={loadingChat}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Users size={13} /> Info Pegawai
            </button>
          </div>

          {/* Area Riwayat Chat */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                    item.sender === "user"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-800 border border-slate-200/60"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-slate-50 p-3 rounded-2xl w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                Bot sedang membaca database MySQL...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Chat */}
          <form onSubmit={(e) => { e.preventDefault(); if(chatInput.trim()) { sendQueryToBot(chatInput); setChatInput(""); }}} className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tulis pertanyaan atau klik tombol cepat di atas..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loadingChat}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={15} /> Kirim
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Scan QR Code & Form Kirim Broadcast WA via Dropdown */}
        <div className="space-y-6">
          {status === "qr" && qrCode && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
              <h3 className="text-base font-extrabold text-amber-900">Scan QR Code WhatsApp</h3>
              <p className="mt-1 text-xs text-amber-700">
                Buka WhatsApp di HP &gt; Perangkat Tertaut &gt; Tautkan Perangkat
              </p>
              <img src={qrCode} alt="WA QR Code" className="mx-auto mt-4 h-52 w-52 rounded-2xl shadow border border-amber-200 bg-white p-2" />
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">📢 Kirim Pesan / Broadcast ke WA</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kirim pengumuman langsung ke grup atau nomor personal
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Megaphone size={18} />
              </div>
            </div>

            <form onSubmit={handleOpenConfirmModal} className="space-y-4">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="sendMode" checked={sendMode === "group"} onChange={() => setSendMode("group")} className="text-emerald-600" />
                  Kirim ke Grup WhatsApp
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="sendMode" checked={sendMode === "personal"} onChange={() => setSendMode("personal")} className="text-emerald-600" />
                  Kirim ke Nomor Personal
                </label>
              </div>

              {sendMode === "group" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Grup Target</label>
                  <div className="relative">
                    <select
                      value={selectedGroupJid}
                      onChange={(e) => setSelectedGroupJid(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-500 focus:outline-none appearance-none"
                    >
                      {groups.length === 0 ? (
                        <option value="">(Menunggu bot terhubung / memuat daftar grup...)</option>
                      ) : (
                        groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            👥 {g.subject}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp (Contoh: 08123456789)</label>
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="Masukkan nomor tujuan..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Broadcast</label>
                <textarea
                  rows={4}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Contoh: *AGENDA BIDANG APTIKA HARI INI*&#10;1. 09:00 WIB - Rapat Koordinasi"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tombol dengan kontras tinggi (Hijau Solid) */}
              <button
                type="submit"
                disabled={status !== "connected"}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-extrabold text-white shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Rocket size={16} /> Lanjutkan & Preview Pesan
              </button>
            </form>
          </div>

          {/* Tabel Log Aktivitas Live */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-slate-500" /> Log Pesan WhatsApp Terbaru
            </h2>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada lalu lintas pesan WhatsApp.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-100"
                  >
                    <div>
                      <span
                        className={`mr-2 inline-block rounded-md px-1.5 py-0.5 font-extrabold ${
                          log.direction === "IN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {log.direction === "IN" ? "MASUK" : "KELUAR"}
                      </span>
                      <span className="font-bold text-slate-700">{log.sender}: </span>
                      <span className="text-slate-600">{log.text}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 ml-2 font-mono">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL KONFIRMASI / PREVIEW BROADCAST ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" /> Konfirmasi Kirim Pesan
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-1.5">
                <p><span className="font-bold text-slate-500">Tujuan:</span> <span className="font-extrabold text-slate-800">{sendMode === "group" ? groups.find(g => g.id === selectedGroupJid)?.subject || selectedGroupJid : customTarget}</span></p>
                <p><span className="font-bold text-slate-500">Jenis:</span> <span className="font-extrabold text-slate-800">{sendMode === "group" ? "Grup WhatsApp" : "Nomor Personal"}</span></p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Preview Isi Pesan:</p>
                <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  {waMessage}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-bold text-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={sendingWa}
                onClick={handleExecuteSendWa}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingWa ? "Mengirim..." : "Ya, Kirim Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}