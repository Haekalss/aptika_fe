"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
  Activity,
  ChevronDown,
  X,
  Bot,
  Sparkles,
  Power,
  LayoutDashboard,
  Tag,
  FileText,
  Radio,
  QrCode,
  Sliders,
  CalendarClock,
  Plus,
  Trash2,
  KeyRound,
  UserCheck,
  Terminal,
  Copy,
  Check,
  Clock,
  MapPin,
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

interface AutomationRule {
  id: number;
  keyword: string;
  reply: string;
}

interface AgendaItem {
  id: number;
  waktu: string;
  kegiatan: string;
  lokasi: string;
  peserta: string;
  content: string;
  sender: string;
  source: string;
  scheduleFor: string;
  status: string;
  createdAt: string;
}

type MenuKey =
  | "ringkasan"
  | "koneksi"
  | "broadcast"
  | "chat"
  | "automation"
  | "smart-ai"
  | "scheduling"
  | "log";

const CHAT_CATEGORIES = [
  {
    id: "magang",
    label: "Data Magang",
    icon: Users,
    prompts: [
      { label: "Info Magang", query: "info magang" },
      { label: "Magang November", query: "magang november" },
    ],
  },
  {
    id: "aset",
    label: "Aset & Inventaris TI",
    icon: Laptop,
    prompts: [{ label: "Daftar Aset TI", query: "daftar aset" }],
  },
  {
    id: "pegawai",
    label: "Data Pegawai",
    icon: BarChart3,
    prompts: [{ label: "Info Pegawai", query: "info pegawai" }],
  },
  {
    id: "agenda",
    label: "Agenda & Perintah",
    icon: Calendar,
    prompts: [
      { label: "Cek Agenda Hari Ini", query: "agenda hari ini" },
      {
        label: "Tes /tambahagenda",
        query:
          "/tambahagenda 10.00 - 11.30 WIB | Desk Kuesioner Aplikasi Layanan PD | RR Bidang Aptika | Tim Layanan dan Tim Pengelolaan",
      },
    ],
  },
];

const BROADCAST_TEMPLATES: Record<string, string> = {
  agenda:
    "Agenda Bidang Aptika \nKamis, 19 November 2026\n\n1.\tPk. 09.00 - Selesai\nRapat Koordinasi Tim Aptika\nLokasi : RR Bidang Aptika\n(Tim Layanan dan Tim Pengelolaan)\n\n2.\t\n\n#Aptika, Maju Kolaborasi Hebat 💪",
  pengumuman:
    "*PENGUMUMAN BIDANG APTIKA*\nDiberitahukan kepada seluruh pegawai dan peserta magang bahwa...",
  rapat:
    "*UNDANGAN RAPAT*\nHari/Tanggal: ...\nWaktu: Pk. ... WIB\nLokasi / Online: ...\n(Peserta)",
};

function extractStartMinutes(waktuStr = "") {
  const match = waktuStr.match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function getTodayIndoDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WaBotDashboardPage() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("ringkasan");

  // Status Bot & Smart Chat AI
  const [status, setStatus] = useState<string>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [botUser, setBotUser] = useState<{ id?: string; name?: string } | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [aiTone, setAiTone] = useState<"ramah" | "formal">("ramah");
  const [savingAi, setSavingAi] = useState<boolean>(false);

  // Automation (Jawaban Manual)
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newReply, setNewReply] = useState("");

  // Agenda Terstruktur & Scheduling Posting Automation
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [agendaWaktu, setAgendaWaktu] = useState("");
  const [agendaKegiatan, setAgendaKegiatan] = useState("");
  const [agendaLokasi, setAgendaLokasi] = useState("");
  const [agendaPeserta, setAgendaPeserta] = useState("");
  const [agendaSchedule, setAgendaSchedule] = useState("Besok 07:00 WIB");
  const [customDateLabel, setCustomDateLabel] = useState<string>(() => getTodayIndoDate());
  const [broadcastingAgendas, setBroadcastingAgendas] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Form Kirim Pesan Personal & Broadcast Grup
  const [selectedGroupJid, setSelectedGroupJid] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [sendMode, setSendMode] = useState<"group" | "personal">("group");
  const [waMessage, setWaMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Web Chat & Kategori
  const [selectedCategory, setSelectedCategory] = useState<string>("magang");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    {
      sender: "bot",
      text: "Halo Admin! Pilih kategori chat di atas, ketik 'agenda hari ini', atau uji perintah /tambahagenda di sini.",
    },
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const BOT_API = process.env.NEXT_PUBLIC_WA_BOT_URL || "http://localhost:3005/api/wa";

  // Urutkan agenda berdasarkan jam dan susun Live Preview Format Resmi Bidang Aptika
  const sortedAgendas = useMemo(() => {
    return [...agendas].sort((a, b) => extractStartMinutes(a.waktu) - extractStartMinutes(b.waktu));
  }, [agendas]);

  const officialAgendaPreview = useMemo(() => {
    const dateText = customDateLabel.trim() || getTodayIndoDate();
    if (sortedAgendas.length === 0) {
      return `Agenda Bidang Aptika \n${dateText}\n\n1.\t(Belum ada agenda tercatat)\n\n#Aptika, Maju Kolaborasi Hebat 💪`;
    }
    const body = sortedAgendas
      .map((item, idx) => {
        const lines = [`${idx + 1}.\t${item.waktu}`, item.kegiatan];
        if (item.lokasi) lines.push(item.lokasi);
        lines.push(`(${item.peserta || "Tim Aptika"})`);
        return lines.join("\n");
      })
      .join("\n\n");

    return `Agenda Bidang Aptika \n${dateText}\n\n${body}\n\n${sortedAgendas.length + 1}.\t\n\n#Aptika, Maju Kolaborasi Hebat 💪`;
  }, [sortedAgendas, customDateLabel]);

  const fetchAllData = async () => {
    try {
      const resStatus = await fetch(`${BOT_API}/status`);
      const dataStatus = await resStatus.json();
      setStatus(dataStatus.status);
      setQrCode(dataStatus.qr);
      setBotUser(dataStatus.user);
      setLogs(dataStatus.logs || []);
      if (typeof dataStatus.aiEnabled === "boolean") setAiEnabled(dataStatus.aiEnabled);
      if (dataStatus.aiTone === "ramah" || dataStatus.aiTone === "formal") setAiTone(dataStatus.aiTone);

      const [resAuto, resAgendas] = await Promise.all([
        fetch(`${BOT_API}/automations`).then((r) => r.json()).catch(() => null),
        fetch(`${BOT_API}/agendas`).then((r) => r.json()).catch(() => null),
      ]);
      if (resAuto?.automations) setAutomations(resAuto.automations);
      if (resAgendas?.agendas) setAgendas(resAgendas.agendas);

      if (dataStatus.status === "connected") {
        const resGroups = await fetch(`${BOT_API}/groups`);
        const dataGroups = await resGroups.json();
        if (dataGroups.success && Array.isArray(dataGroups.groups)) {
          setGroups(dataGroups.groups);
          setSelectedGroupJid((prev) => {
            if (!prev && dataGroups.groups.length > 0) return dataGroups.groups[0].id;
            return prev;
          });
        }
      }
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatHistory.length > 1 || loadingChat) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [chatHistory, loadingChat]);

  const updateAiSettings = async (nextEnabled: boolean, nextTone: "ramah" | "formal") => {
    setAiEnabled(nextEnabled);
    setAiTone(nextTone);
    setSavingAi(true);
    try {
      await fetch(`${BOT_API}/ai-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled, tone: nextTone }),
      });
    } catch {
      // Tetap responsif di UI
    } finally {
      setSavingAi(false);
    }
  };

  const handleAddAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newReply.trim()) return;
    try {
      const res = await fetch(`${BOT_API}/automations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword, reply: newReply }),
      });
      const data = await res.json();
      if (data.success) {
        setAutomations(data.automations);
        setNewKeyword("");
        setNewReply("");
      }
    } catch {
      alert("Gagal menyimpan aturan automation. Pastikan server wa-bot menyala.");
    }
  };

  const handleDeleteAutomation = async (id: number) => {
    try {
      const res = await fetch(`${BOT_API}/automations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setAutomations(data.automations);
    } catch {
      alert("Gagal menghapus aturan.");
    }
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaKegiatan.trim()) return alert("Nama kegiatan wajib diisi.");
    try {
      const res = await fetch(`${BOT_API}/agendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waktu: agendaWaktu.trim() || "Pk. 09.00 - Selesai",
          kegiatan: agendaKegiatan.trim(),
          lokasi: agendaLokasi.trim(),
          peserta: agendaPeserta.trim() || "Tim Aptika",
          sender: "Admin Web",
          scheduleFor: agendaSchedule,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAgendas(data.agendas);
        setAgendaWaktu("");
        setAgendaKegiatan("");
        setAgendaLokasi("");
        setAgendaPeserta("");
      }
    } catch {
      alert("Gagal menyimpan agenda. Pastikan server wa-bot menyala.");
    }
  };

  const handleDeleteAgenda = async (id: number) => {
    try {
      const res = await fetch(`${BOT_API}/agendas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setAgendas(data.agendas);
    } catch {
      alert("Gagal menghapus agenda.");
    }
  };

  const handleBroadcastAgendas = async () => {
    if (!selectedGroupJid) return alert("Pilih grup tujuan terlebih dahulu.");
    setBroadcastingAgendas(true);
    try {
      const res = await fetch(`${BOT_API}/agendas/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: selectedGroupJid, dateLabel: customDateLabel }),
      });
      const data = await res.json();
      if (data.success) {
        setAgendas(data.agendas);
        alert("Agenda Bidang Aptika berhasil dikirim ke grup WhatsApp!");
      } else {
        alert("Gagal: " + data.error);
      }
    } catch {
      alert("Gagal menghubungi server bot.");
    } finally {
      setBroadcastingAgendas(false);
    }
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(officialAgendaPreview);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

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
        body: JSON.stringify({ target, message: waMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setWaMessage("");
        setShowConfirmModal(false);
        fetchAllData();
        alert("Pesan berhasil dikirim ke WhatsApp!");
      } else {
        alert("Gagal: " + data.error);
      }
    } catch {
      alert("Terjadi kesalahan koneksi ke server bot.");
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
        alert("Sesi WhatsApp berhasil diputus.");
        fetchAllData();
      } else {
        alert("Gagal logout: " + data.error);
      }
    } catch {
      alert("Gagal menghubungi server bot.");
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
        body: JSON.stringify({ text: queryText }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "bot", text: data.reply || "Tidak ada balasan." }]);
      if (queryText.toLowerCase().startsWith("/tambahagenda")) {
        fetchAllData();
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Gagal terhubung ke layanan asisten bot. Pastikan server backend menyala." },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const activeCategoryObj =
    CHAT_CATEGORIES.find((c) => c.id === selectedCategory) || CHAT_CATEGORIES[0];

  const sidebarMenus: { key: MenuKey; label: string; icon: React.ElementType; section?: string }[] = [
    { key: "ringkasan", label: "Ringkasan WA Bot", icon: LayoutDashboard },
    { key: "koneksi", label: "Koneksi WhatsApp", icon: QrCode, section: "Manajemen Bot" },
    { key: "broadcast", label: "Chat Personal & Grup", icon: Megaphone },
    { key: "chat", label: "Web Chat & Kategori", icon: MessageSquare },
    { key: "automation", label: "Automation Manual", icon: Sliders, section: "Otomatisasi & AI" },
    { key: "smart-ai", label: "Smart Chat AI", icon: Sparkles },
    { key: "scheduling", label: "Agenda & Scheduling", icon: CalendarClock },
    { key: "log", label: "Log Aktivitas WA", icon: Activity, section: "Monitoring" },
  ];

  return (
    <MainLayout
      title="WhatsApp Bot & Asisten Data"
      subtitle="Integrasi Layanan Otomatisasi, Scheduling & Smart Chat AI"
      hideSidebar={true}
    >
      <div className="flex flex-col md:flex-row gap-6 pt-2 min-w-0">
        {/* ── SIDEBAR KIRI (8 Menu Terstruktur) ── */}
        <aside className="w-full md:w-64 shrink-0 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col self-start md:sticky md:top-2">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 text-emerald-700 font-extrabold text-sm">
            <Bot size={18} />
            <span>WA BOT & SMART AI</span>
          </div>

          <nav className="space-y-1">
            {sidebarMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.key;
              return (
                <React.Fragment key={item.key}>
                  {item.section && (
                    <div className="pt-3.5 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveMenu(item.key)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/60 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon size={15} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.key === "scheduling" && agendas.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        {agendas.length}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Quick Toggle AI di Bawah Sidebar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  Smart Chat AI
                </span>
                <button
                  type="button"
                  onClick={() => updateAiSettings(!aiEnabled, aiTone)}
                  disabled={savingAi}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    aiEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {aiEnabled
                  ? `Aktif • Gaya ${aiTone === "ramah" ? "Ramah / Santai" : "Formal"}`
                  : "Nonaktif • Mode Keyword Manual"}
              </p>
            </div>
          </div>
        </aside>

        {/* ── KONTEN UTAMA ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Banner Hijau-Teal */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="flex-1 min-w-0 max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2.5 text-white">
                <Bot size={13} /> Integrasi Layanan Otomatisasi & Smart Chat AI
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                WhatsApp Bot & Asisten Data Aptika
              </h1>
              <p className="mt-1.5 text-sm text-emerald-50">
                Chat Personal & Grup, Perintah /tambahagenda Otomatis, Smart Answer Gemini AI, dan Scheduling Agenda Bidang Aptika
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0 relative z-10 w-full lg:w-64">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/25">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    status === "connected"
                      ? "bg-emerald-300 animate-pulse"
                      : status === "qr"
                      ? "bg-amber-300 animate-pulse"
                      : "bg-rose-400"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-[11px] text-emerald-100 font-medium">WhatsApp Connection:</div>
                  <div className="text-white font-extrabold text-sm capitalize truncate">
                    {status === "connected"
                      ? "Aktif & Terhubung"
                      : status === "qr"
                      ? "Menunggu Scan QR"
                      : "Terputus"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/25">
                <span className="text-xs font-semibold text-emerald-50 flex items-center gap-1.5">
                  <Sparkles size={14} /> Smart Chat AI
                </span>
                <button
                  type="button"
                  onClick={() => updateAiSettings(!aiEnabled, aiTone)}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition ${
                    aiEnabled ? "bg-white text-emerald-700" : "bg-slate-900/40 text-slate-200"
                  }`}
                >
                  {aiEnabled ? `ON (${aiTone})` : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* ── KARTU RINGKASAN ── */}
          {activeMenu === "ringkasan" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveMenu("koneksi")}
                className="text-left rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm hover:border-emerald-300 transition"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Koneksi WA</p>
                <p className="mt-2 text-lg font-extrabold text-slate-800">
                  {status === "connected" ? "Terhubung" : status === "qr" ? "Scan QR" : "Offline"}
                </p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">Kelola QR & Sesi</p>
              </button>

              <button
                onClick={() => setActiveMenu("smart-ai")}
                className="text-left rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm hover:border-emerald-300 transition"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Smart Chat AI</p>
                <p className="mt-2 text-lg font-extrabold text-slate-800">
                  {aiEnabled ? "Aktif (ON)" : "Nonaktif"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Gaya: <span className="font-bold capitalize">{aiTone}</span>
                </p>
              </button>

              <button
                onClick={() => setActiveMenu("scheduling")}
                className="text-left rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm hover:border-emerald-300 transition"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agenda Terjadwal</p>
                <p className="mt-2 text-lg font-extrabold text-slate-800">{agendas.length} Agenda</p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">Format Resmi Aptika</p>
              </button>

              <button
                onClick={() => setActiveMenu("automation")}
                className="text-left rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm hover:border-emerald-300 transition"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Automation Manual</p>
                <p className="mt-2 text-lg font-extrabold text-slate-800">{automations.length} Aturan</p>
                <p className="mt-1 text-xs text-slate-500">{logs.length} log pesan aktif</p>
              </button>
            </div>
          )}

          {/* ── MENU 2: KONEKSI WHATSAPP (QR CODE & SESI) ── */}
          {activeMenu === "koneksi" && (
            <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <QrCode size={20} className="text-emerald-600" />
                    Koneksi Perangkat WhatsApp (Baileys)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tautkan nomor WhatsApp admin untuk mengaktifkan chat personal, grup, dan /tambahagenda
                  </p>
                </div>
                {status === "connected" && (
                  <button
                    onClick={handleLogoutWa}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    <LogOut size={14} /> {loggingOut ? "Memutus..." : "Putuskan Sesi"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
                  {status === "qr" && qrCode ? (
                    <>
                      <p className="text-sm font-extrabold text-slate-800 mb-1">Scan QR Code di Bawah Ini</p>
                      <p className="text-xs text-slate-500 mb-4">
                        WhatsApp HP &gt; Perangkat Tertaut &gt; Tautkan Perangkat
                      </p>
                      <img
                        src={qrCode}
                        alt="WA QR Code"
                        className="mx-auto h-56 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                      />
                    </>
                  ) : status === "connected" ? (
                    <div className="py-10 space-y-2">
                      <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
                      <p className="text-base font-extrabold text-slate-800">Perangkat WhatsApp Terhubung</p>
                      <p className="text-xs text-slate-500">
                        Nomor aktif: {botUser?.id ? botUser.id.split(":")[0] : "Sesi tersimpan"}
                      </p>
                    </div>
                  ) : (
                    <div className="py-10 space-y-2">
                      <QrCode size={48} className="mx-auto text-slate-300" />
                      <p className="text-base font-extrabold text-slate-700">Server WA Bot Belum Terhubung</p>
                      <p className="text-xs text-slate-500">
                        Nyalakan service backend (node index.js di folder wa-bot) agar QR Code tampil di sini.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <h3 className="font-extrabold text-slate-800">Langkah Penyambungan:</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-xs leading-relaxed">
                    <li>Pastikan service backend Node.js Baileys berjalan aktif di server/lokal.</li>
                    <li>Buka aplikasi WhatsApp di ponsel admin yang akan dijadikan bot.</li>
                    <li>Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong> lalu tekan <strong>Tautkan Perangkat</strong>.</li>
                    <li>Arahkan kamera ke QR Code hingga status berubah menjadi <strong>Aktif & Terhubung</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ── MENU 5: AUTOMATION (JAWABAN MANUAL) ── */}
          {activeMenu === "automation" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-1">
                  <Sliders size={18} className="text-emerald-600" />
                  Tambah Jawaban Manual (Automation)
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  Atur balasan statis otomatis ketika pengguna mengetik kata kunci tertentu
                </p>

                <form onSubmit={handleAddAutomation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Kunci (Keyword)</label>
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Contoh: jam kerja, kontak admin, syarat magang"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Balasan Otomatis</label>
                    <textarea
                      rows={4}
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Tulis teks balasan yang akan dikirim bot..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <Plus size={16} /> Simpan Aturan Automation
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 mb-4">
                  Daftar Kata Kunci Aktif ({automations.length})
                </h2>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {automations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada aturan jawaban manual.</p>
                  ) : (
                    automations.map((rule) => (
                      <div
                        key={rule.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-extrabold mb-1.5">
                            {rule.keyword}
                          </span>
                          <p className="text-xs text-slate-600 whitespace-pre-line break-words">{rule.reply}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAutomation(rule.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition shrink-0"
                          title="Hapus aturan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MENU 6: SMART CHAT AI (GEMINI API & GAYA BAHASA) ── */}
          {activeMenu === "smart-ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-600" />
                      Konfigurasi Smart Chat AI
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mengatur balasan dinamis (Smart Answer) berbasis Gemini API Key
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAiSettings(!aiEnabled, aiTone)}
                    disabled={savingAi}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                      aiEnabled
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <Power size={14} /> {aiEnabled ? "AI AKTIF (ON)" : "AI NONAKTIF (OFF)"}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Gaya Bahasa Balasan Bot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateAiSettings(aiEnabled, "ramah")}
                      className={`p-4 rounded-2xl border text-left transition ${
                        aiTone === "ramah"
                          ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-white border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <p className="text-sm font-extrabold text-slate-800">Ramah & Santai</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Luwes & akrab, cocok untuk grup internal tim.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateAiSettings(aiEnabled, "formal")}
                      className={`p-4 rounded-2xl border text-left transition ${
                        aiTone === "formal"
                          ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-white border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <p className="text-sm font-extrabold text-slate-800">Formal & Sopan</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bahasa baku khas layanan pemerintahan Diskominfo.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center gap-3 text-xs">
                  <KeyRound size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Integrasi Gemini API Key</p>
                    <p className="text-slate-500">
                      API Key dikelola aman pada file <code>wa-bot/.env</code> di server backend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Simulasi Respons Perintah /tambahagenda
                </h3>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="flex justify-end">
                    <div className="bg-emerald-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[85%]">
                      /tambahagenda 13.00 - Selesai | Optimalisasi Aplikasi Dishut | Kantor Dishut | Kabid, Mdeni, Deri, Dwi
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] shadow-2xs whitespace-pre-line">
                      {!aiEnabled
                        ? "Agenda berhasil disimpan:\nPk. 13.00 - Selesai\nOptimalisasi Aplikasi Dishut\nLokasi : Kantor Dishut\n(Kabid, Mdeni, Deri, Dwi)"
                        : aiTone === "ramah"
                        ? "Oke banget nih agendanya! Sudah saya save ya untuk kegiatan Dishut jam 13.00 nanti. Langsung masuk urutan resmi dan siap dibagikan ke grup!"
                        : "Baik, agenda Optimalisasi Aplikasi Dishut pukul 13.00 WIB telah berhasil disimpan ke dalam sistem dan akan dibagikan secara otomatis sesuai jadwal."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MENU 7: AGENDA & SCHEDULING POSTING AUTOMATION (FORMAT RESMI APTIKA) ── */}
          {activeMenu === "scheduling" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Input Agenda Terstruktur */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <CalendarClock size={18} className="text-emerald-600" />
                      Input Agenda Bidang Aptika
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Otomatis diurutkan berdasarkan jam dan disusun ke format resmi WhatsApp
                    </p>
                  </div>

                  <form onSubmit={handleAddAgenda} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Waktu</label>
                      <input
                        type="text"
                        value={agendaWaktu}
                        onChange={(e) => setAgendaWaktu(e.target.value)}
                        placeholder="Contoh: Pk. 08.30 - 10.00 WIB atau Pk. 13.00 - Selesai"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kegiatan</label>
                      <input
                        type="text"
                        value={agendaKegiatan}
                        onChange={(e) => setAgendaKegiatan(e.target.value)}
                        placeholder="Contoh: Desk Kuesioner Aplikasi Layanan PD Dinas Sosial"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lokasi / Detail Online (Opsional)
                      </label>
                      <textarea
                        rows={3}
                        value={agendaLokasi}
                        onChange={(e) => setAgendaLokasi(e.target.value)}
                        placeholder={"Lokasi : RR Bidang Aptika\n(atau tempel Link Zoom, Meeting ID, dan Passcode)"}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Peserta / PIC</label>
                      <input
                        type="text"
                        value={agendaPeserta}
                        onChange={(e) => setAgendaPeserta(e.target.value)}
                        placeholder="Contoh: Tim Layanan dan Tim Pengelolaan"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jadwal Posting Otomatis</label>
                      <select
                        value={agendaSchedule}
                        onChange={(e) => setAgendaSchedule(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Hari Ini (Segera)">Hari Ini (Segera)</option>
                        <option value="Besok 07:00 WIB">Besok 07:00 WIB (Cron Harian)</option>
                        <option value="Senin 07:00 WIB">Senin 07:00 WIB (Rekap Mingguan)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Plus size={16} /> Tambahkan ke Daftar Agenda
                    </button>
                  </form>

                  <div className="rounded-xl bg-emerald-50 border border-emerald-200/70 p-3.5 text-xs text-emerald-800 space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <Terminal size={13} /> Format Perintah dari Grup WA:
                    </p>
                    <p className="leading-relaxed">
                      <code>/tambahagenda 10.00 - Selesai | Rapat Tim | RR Bidang Aptika | Dwi, Angga</code>
                    </p>
                  </div>
                </div>

                {/* Live Preview Format Resmi WhatsApp + Kontrol Kirim */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Live Preview Format Resmi WhatsApp
                      </h2>
                      <p className="text-xs text-slate-500">
                        Otomatis diurutkan dari pagi ke sore lengkap dengan tagar Bidang Aptika
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPreview}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-700 transition self-start sm:self-auto"
                    >
                      {copiedPreview ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedPreview ? "Tersalin!" : "Salin Teks"}
                    </button>
                  </div>

                  {/* Pengaturan Header Tanggal & Grup Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Header Tanggal Agenda
                      </label>
                      <input
                        type="text"
                        value={customDateLabel}
                        onChange={(e) => setCustomDateLabel(e.target.value)}
                        placeholder="Contoh: Rabu, 18 November 2026"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Grup WhatsApp Tujuan
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedGroupJid}
                          onChange={(e) => setSelectedGroupJid(e.target.value)}
                          className="flex-1 min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                        >
                          {groups.length === 0 ? (
                            <option value="">(Grup belum termuat)</option>
                          ) : (
                            groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.subject}
                              </option>
                            ))
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={handleBroadcastAgendas}
                          disabled={broadcastingAgendas || agendas.length === 0 || status !== "connected"}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition"
                        >
                          <Send size={13} /> {broadcastingAgendas ? "Mengirim..." : "Share WA"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kotak Preview Pesan WA */}
                  <div className="flex-1 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 overflow-y-auto max-h-[380px]">
                    <pre className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed break-words">
                      {officialAgendaPreview}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Daftar Item Agenda Terstruktur (Bisa Hapus Per Item) */}
              <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Butir Agenda Tercatat ({sortedAgendas.length})
                </h3>
                {sortedAgendas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">
                    Belum ada agenda tersimpan. Tambahkan melalui form di atas atau ketik <code>/tambahagenda</code> di grup WhatsApp / Web Chat.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedAgendas.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                              #{idx + 1}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <Clock size={12} /> {item.waktu}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === "Terkirim"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 break-words">{item.kegiatan}</p>
                          {item.lokasi && (
                            <p className="text-xs text-slate-600 whitespace-pre-line break-words flex items-start gap-1">
                              <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                              <span>{item.lokasi}</span>
                            </p>
                          )}
                          <p className="text-xs font-semibold text-slate-500">({item.peserta})</p>
                          <p className="text-[10px] text-slate-400">
                            Sumber: {item.source} • Oleh {item.sender}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAgenda(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition shrink-0"
                          title="Hapus agenda"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PANEL WEB CHAT & BROADCAST (Ringkasan, Chat, Broadcast, Log) ── */}
          {(activeMenu === "ringkasan" || activeMenu === "chat" || activeMenu === "broadcast" || activeMenu === "log") && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Web Chat & Kategori */}
              {(activeMenu === "ringkasan" || activeMenu === "chat") && (
                <div
                  className={`flex flex-col rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm h-[620px] min-w-0 ${
                    activeMenu === "chat" ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <MessageSquare size={18} className="text-emerald-600 shrink-0" />
                        Tanya Bot Aptika (Web Chat)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Akses database instan, uji perintah /tambahagenda, dan Smart Chat AI
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        aiEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      AI: {aiEnabled ? `ON (${aiTone})` : "OFF"}
                    </span>
                  </div>

                  {/* Pilihan Kategori Chat */}
                  <div className="py-3 border-b border-slate-100 bg-slate-50/70 -mx-6 px-6 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <Tag size={12} /> Kategori Chat
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CHAT_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                              isActive
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                            }`}
                          >
                            <Icon size={13} /> {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {activeCategoryObj.prompts.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => sendQueryToBot(item.query)}
                          disabled={loadingChat}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200/70 transition active:scale-95"
                        >
                          + {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Riwayat Chat */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto py-4 space-y-3 min-w-0"
                  >
                    {chatHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line break-words leading-relaxed ${
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
                        Bot sedang memproses...
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (chatInput.trim()) {
                        sendQueryToBot(chatInput);
                        setChatInput("");
                      }
                    }}
                    className="mt-2 flex gap-2 border-t border-slate-100 pt-3"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Tanya seputar ${activeCategoryObj.label} atau ketik /tambahagenda...`}
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loadingChat}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      <Send size={15} /> Kirim
                    </button>
                  </form>
                </div>
              )}

              {/* Kolom Kanan: Broadcast Personal/Grup & Log */}
              <div
                className={`space-y-6 min-w-0 ${
                  activeMenu === "broadcast" || activeMenu === "log" ? "lg:col-span-2" : ""
                }`}
              >
                {(activeMenu === "ringkasan" || activeMenu === "broadcast") && (
                  <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                          <Megaphone size={18} className="text-emerald-600" />
                          Chat Personal (One-by-One) & Broadcast Grup
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Kirim pesan langsung ke grup WhatsApp atau nomor personal dari admin
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Radio size={18} />
                      </div>
                    </div>

                    <form onSubmit={handleOpenConfirmModal} className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                        <button
                          type="button"
                          onClick={() => setSendMode("group")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            sendMode === "group"
                              ? "bg-white text-emerald-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Users size={14} /> Chat ke Grup WA
                        </button>
                        <button
                          type="button"
                          onClick={() => setSendMode("personal")}
                          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            sendMode === "personal"
                              ? "bg-white text-emerald-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <UserCheck size={14} /> Chat Personal (1-on-1)
                        </button>
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
                                    {g.subject}
                                  </option>
                                ))
                              )}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nomor WhatsApp Tujuan (Contoh: 08123456789)
                          </label>
                          <input
                            type="text"
                            value={customTarget}
                            onChange={(e) => setCustomTarget(e.target.value)}
                            placeholder="Masukkan nomor personal..."
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <span className="block text-xs font-bold text-slate-700 mb-1.5">Template Cepat:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setWaMessage(officialAgendaPreview)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200/70 transition flex items-center gap-1"
                          >
                            <CalendarClock size={12} /> Muat Rekap Agenda Resmi
                          </button>
                          <button
                            type="button"
                            onClick={() => setWaMessage(BROADCAST_TEMPLATES.pengumuman)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Megaphone size={12} /> Pengumuman
                          </button>
                          <button
                            type="button"
                            onClick={() => setWaMessage(BROADCAST_TEMPLATES.rapat)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <FileText size={12} /> Undangan Rapat
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan</label>
                        <textarea
                          rows={5}
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          placeholder="Tulis pesan untuk dikirim ke grup atau nomor personal..."
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status !== "connected"}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-extrabold text-white shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        <Rocket size={16} /> Lanjutkan & Preview Pesan
                      </button>
                    </form>
                  </div>
                )}

                {(activeMenu === "ringkasan" || activeMenu === "log") && (
                  <div className="rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-sm min-w-0">
                    <h2 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-emerald-600" /> Log Pesan WhatsApp Terbaru
                    </h2>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {logs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada lalu lintas pesan WhatsApp.</p>
                      ) : (
                        logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 min-w-0"
                          >
                            <div className="min-w-0 flex-1 break-words">
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
                            <span className="text-slate-400 shrink-0 font-mono">{log.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL PREVIEW BROADCAST ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
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
                <p>
                  <span className="font-bold text-slate-500">Tujuan:</span>{" "}
                  <span className="font-extrabold text-slate-800">
                    {sendMode === "group"
                      ? groups.find((g) => g.id === selectedGroupJid)?.subject || selectedGroupJid
                      : customTarget}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-slate-500">Jenis:</span>{" "}
                  <span className="font-extrabold text-slate-800">
                    {sendMode === "group" ? "Grup WhatsApp" : "Chat Personal (1-on-1)"}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Preview Isi Pesan:</p>
                <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 text-sm text-slate-800 whitespace-pre-line break-words leading-relaxed max-h-64 overflow-y-auto">
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
    </MainLayout>
  );
}