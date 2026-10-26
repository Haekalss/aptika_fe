"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, Info, ShieldCheck, Server, Globe, 
  Lock, Plus, Search, Filter, RefreshCcw, FileText, Loader2
} from "lucide-react";

// URL API Backend (menyesuaikan dengan port Laravel default, bisa diganti jika pakai env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AsetSistemInformasiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk menyimpan data dari API
  const [dataAset, setDataAset] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    aplikasi_web: 0,
    server_vm: 0,
    sistem_rahasia: 0
  });

  // State untuk Form Input
  const initialForm = {
    kode_aset_ti: "",
    kode_virtualisasi: "",
    kode_sistem_info: "",
    nama_sistem: "",
    ip_address: "",
    deskripsi: "",
    spesifikasi: "",
    kategori_sistem: "",
    pemilik: "",
    klasifikasi: ""
  };
  const [formData, setFormData] = useState(initialForm);

  // Fungsi mengambil token dari localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Fungsi Fetch Data dari Laravel
  const fetchAset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/smki/aset-sistem-informasi`, {
        method: "GET",
        headers: getAuthHeader()
      });
      const res = await response.json();
      if (res.status === "success") {
        setDataAset(res.data);
        setStats(res.stats);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchAset saat halaman pertama kali dimuat
  useEffect(() => {
    fetchAset();
  }, []);

  // Handler Input Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/smki/aset-sistem-informasi`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(formData)
      });
      const res = await response.json();
      
      if (response.ok && res.status === "success") {
        alert("Data Aset Sistem Informasi berhasil disimpan!");
        setIsModalOpen(false);
        setFormData(initialForm); // Reset form
        fetchAset(); // Refresh tabel dan statistik
      } else {
        alert("Gagal menyimpan: " + (res.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans space-y-6">
      
      {/* 1. HEADER HIJAU */}
      <div className="bg-[#059669] rounded-2xl p-6 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/20 rounded-xl mt-1">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Daftar Aset Sistem Informasi</h1>
            <p className="text-white text-sm mt-1 max-w-2xl">
              Modul pendataan, spesifikasi teknis, infrastruktur, dan inventarisasi Sistem Elektronik (Aplikasi/Server) sesuai standar FR-036.
            </p>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-slate-200 mt-3 transition-colors">
              <Info className="w-4 h-4" />
              Info/Bantuan
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 relative z-10 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-black/10 px-4 py-2.5 rounded-lg border border-white/10">
            <LayersIcon className="w-5 h-5 text-white" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Bidang</span>
              <span className="text-sm font-semibold text-white">Bidang Aplikasi Informatika</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/10 px-4 py-2.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-5 h-5 text-white" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Status Layanan</span>
              <span className="text-sm font-semibold text-white">Aktif & Beroperasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Sistem</p>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? "-" : stats.total}</h3>
            <p className="text-xs text-slate-400 mt-1">Terdaftar di katalog</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aplikasi Web</p>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? "-" : stats.aplikasi_web}</h3>
            <p className="text-xs text-slate-400 mt-1">Sistem informasi aktif</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Globe className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Server / VM</p>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? "-" : stats.server_vm}</h3>
            <p className="text-xs text-slate-400 mt-1">Infrastruktur & Virtualisasi</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sistem Rahasia</p>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? "-" : stats.sistem_rahasia}</h3>
            <p className="text-xs text-slate-400 mt-1">Klasifikasi data tinggi</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. BAGIAN TABEL & FILTER */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Kategori:</span>
              <select className="border border-slate-300 rounded-lg text-sm px-3 py-2 text-slate-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]">
                <option value="">Semua Kategori</option>
                <option value="Sistem Informasi">Sistem Informasi (Aplikasi)</option>
                <option value="Virtualisasi">Virtualisasi (Server/VM)</option>
                <option value="Aset TI">Aset TI (Infrastruktur)</option>
              </select>
            </div>
            <div className="relative flex-grow lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari nama sistem, IP..." 
                className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button onClick={fetchAset} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg text-sm font-bold hover:bg-[#047857] shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Aset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">KODE ASET</th>
                <th className="p-4">NAMA SISTEM / DOMAIN</th>
                <th className="p-4">IP ADDRESS</th>
                <th className="p-4">KATEGORI</th>
                <th className="p-4">KLASIFIKASI</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#059669]" />
                    Memuat data aset...
                  </td>
                </tr>
              ) : dataAset.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Belum ada data aset sistem informasi yang tersedia.</p>
                      <p className="text-xs mt-1">Silakan klik "+ Tambah Aset" untuk mendata sistem baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataAset.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-center text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="p-4 text-sm text-slate-700">
                      {item.kode_sistem_info || item.kode_virtualisasi || item.kode_aset_ti || "-"}
                    </td>
                    <td className="p-4 text-sm font-bold text-[#059669]">{item.nama_sistem}</td>
                    <td className="p-4 text-sm text-slate-600">{item.ip_address || "-"}</td>
                    <td className="p-4 text-sm text-slate-600">{item.kategori_sistem || "-"}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        item.klasifikasi === 'Rahasia' ? 'bg-rose-100 text-rose-700' :
                        item.klasifikasi === 'Internal' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.klasifikasi || "Publik"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-xs text-slate-500 font-medium">Menampilkan {dataAset.length} data aset</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-400 cursor-not-allowed">Sebelumnya</button>
            <button className="px-3 py-1.5 border border-slate-200 bg-[#059669] text-white rounded text-xs font-bold">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-400 cursor-not-allowed">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* 4. MODAL TAMBAH ASET (FR-036) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#059669] px-6 py-5 flex items-start justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight text-white">Tambah Aset Sistem Informasi (FR-036)</h2>
                  <p className="text-white text-sm font-medium mt-0.5">Pendataan Aplikasi, Server, Domain, dan Infrastruktur TI.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-slate-200 transition-colors bg-white/10 p-1.5 rounded-lg hover:bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] bg-slate-50/50">
              <form id="formAset" onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#059669] rounded-full"></div> Identitas Kode Aset
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Kode Aset TI</label>
                      <input type="text" name="kode_aset_ti" value={formData.kode_aset_ti} onChange={handleChange} placeholder="Contoh: 001/TI/APTIKA" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Kode Virtualisasi</label>
                      <input type="text" name="kode_virtualisasi" value={formData.kode_virtualisasi} onChange={handleChange} placeholder="Contoh: 001/VIRT/APTIKA" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Kode Sistem Informasi</label>
                      <input type="text" name="kode_sistem_info" value={formData.kode_sistem_info} onChange={handleChange} placeholder="Contoh: 001/SE/APTIKA" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#059669] rounded-full"></div> Detail Sistem & Jaringan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Sistem Informasi / Domain <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_sistem" value={formData.nama_sistem} onChange={handleChange} required placeholder="Contoh: aptika.jabarprov.go.id" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">IP Publik / IP Private</label>
                      <input type="text" name="ip_address" value={formData.ip_address} onChange={handleChange} placeholder="Contoh: 103.123.xx.xx / 10.10.xx.xx" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Sistem</label>
                    <textarea rows={2} name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Penjelasan fungsi dan kegunaan aplikasi/server..." className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] resize-none"></textarea>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#059669] rounded-full"></div> Spesifikasi & Klasifikasi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Spesifikasi (Bahasa, Framework, DB) <span className="text-red-500">*</span></label>
                      <textarea rows={4} name="spesifikasi" value={formData.spesifikasi} onChange={handleChange} required placeholder="Contoh: Next.js, Node.js, Tailwind CSS, PostgreSQL" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] resize-none"></textarea>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori Sistem Elektronik</label>
                        <select name="kategori_sistem" value={formData.kategori_sistem} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-white">
                          <option value="">Pilih Kategori...</option>
                          <option value="Sistem Informasi">Sistem Informasi (Aplikasi)</option>
                          <option value="Virtualisasi">Virtualisasi (Server/VM)</option>
                          <option value="Aset TI">Aset TI (Infrastruktur)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Pemilik Aset</label>
                          <input type="text" name="pemilik" value={formData.pemilik} onChange={handleChange} placeholder="Nama Bidang" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Klasifikasi</label>
                          <select name="klasifikasi" value={formData.klasifikasi} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-white">
                            <option value="">Pilih...</option>
                            <option value="Rahasia">Rahasia</option>
                            <option value="Internal">Internal</option>
                            <option value="Publik">Publik</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                Batal
              </button>
              <button type="submit" form="formAset" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] disabled:opacity-70 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />} 
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Icon Helper
function LayersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}