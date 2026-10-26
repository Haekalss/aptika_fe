"use client";

import { useEffect } from "react";
import { User, Sun, Moon, ShieldCog, FolderKanban, FileText, TrendingUp, Users, ShieldCheck, Database, Home } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/services/api";
import { useTaskStore } from "@/store/useTaskStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBrand?: boolean;
}

export default function Header({ title, subtitle, showBrand = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { currentUser, loadCurrentUser } = useTaskStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const userName = currentUser?.name || "User";
  const isAdmin = currentUser?.role === "admin";

  const handleLogout = async () => {
    try {
      await logout();
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const isIkiPage = pathname.startsWith("/integrasiinteroperabilitas") ||
                    pathname.startsWith("/pengelolaanaplikasi") ||
                    pathname.startsWith("/rekayasaaplikasi") ||
                    pathname.startsWith("/sidebarjabar") ||
                    pathname.startsWith("/smartjabar") ||
                    pathname.startsWith("/sadajabar");

  const isSuratPage = pathname.startsWith("/administrasisurat") ||
                      pathname.startsWith("/spd") ||
                      pathname.startsWith("/perubahan-it");

  const isModulePage = pathname.startsWith("/manajementugasdigital") || 
                       isSuratPage || 
                       pathname.startsWith("/magang") || 
                       pathname.startsWith("/smki") || 
                       pathname.startsWith("/daftar-aset-ti") ||
                       pathname.startsWith("/master") ||
                       isIkiPage;

  const moduleNavItems = [
    { label: "Administrasi Surat", path: "/administrasisurat", icon: <FileText size={15} /> },
    { label: "Magang", path: "/magang/dashboard", icon: <Users size={15} /> },
    { label: "Manajemen Tugas Digital", path: "/manajementugasdigital", icon: <FolderKanban size={15} /> },
    { label: "IKI Report", path: "/integrasiinteroperabilitas/dashboard", icon: <TrendingUp size={15} /> },
    { label: "SMKI", path: "/smki", icon: <ShieldCheck size={15} /> },
    { label: "Data Master", path: "/master", icon: <Database size={15} /> },
  ];

  const profileMenuItems = [
    ...(isAdmin
      ? [
          {
            label: "Admin Panel",
            onClick: () => router.push("/admin"),
            icon: <ShieldCog size={14} className="text-amber-500" />,
          },
        ]
      : []),
    {
      label: "Profil Saya",
      onClick: () => router.push("/profile"),
      icon: <User size={14} />,
    },
    {
      label: "Keluar",
      onClick: handleLogout,
      icon: <User size={14} className="text-red-400" />,
      destructive: true,
    },
  ];

  return (
    <header className="flex items-center justify-between bg-white/60 dark:bg-[#071733]/90 backdrop-blur-md border border-white/70 dark:border-slate-800 rounded-2xl px-5 py-3.5 shadow-sm select-none relative z-30 transition-colors duration-300 print:hidden gap-3">
      {/* Logo / Brand */}
      {showBrand ? (
        <div
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          onClick={() => router.push("/dashboard")}
          title="Kembali ke Beranda"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b2146] via-[#163868] to-[#1d4ed8] flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-extrabold text-slate-800 dark:text-white tracking-wider group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              APTIKA TOOLS
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
              Diskominfo Jawa Barat
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-wide leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide">{subtitle}</p>
          )}
        </div>
      )}

      {/* Center Nav Links — Hanya ditampilkan di halaman modul (navbar dashboard dihapus) */}
      {showBrand && isModulePage && (
        <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
          {moduleNavItems.map((item) => {
            const isActive = item.label === "Administrasi Surat"
              ? isSuratPage
              : item.label === "IKI Report"
              ? isIkiPage
              : item.label === "SMKI"
              ? pathname.startsWith("/smki") || pathname.startsWith("/daftar-aset-ti")
              : pathname.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-200/70 font-bold dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">


        <NotificationBell />

        {isAdmin && (
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:text-amber-300 transition-all border border-amber-200/90 dark:border-amber-700/80 group"
            title="Admin Panel"
          >
            <ShieldCog size={13} className="text-amber-600 dark:text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span>Admin Panel</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700" />

        {/* Profile */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
              <Avatar name={userName} src={currentUser?.avatar_url || currentUser?.avatar} size="sm" indicator="online" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 max-w-[110px] truncate leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 max-w-[110px] truncate">
                  {currentUser?.position || currentUser?.jabatan || (isAdmin ? "Admin" : "Anggota Tim")}
                </span>
              </div>
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
}
export { Header };
