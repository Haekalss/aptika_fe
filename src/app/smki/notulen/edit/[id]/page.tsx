"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSmkiNotulenLookup,
  getSmkiNotulenById,
  updateSmkiNotulen,
  SmkiNotulenAgendaItem,
  SmkiNotulenPesertaItem,
} from "@/services/api";

export default function EditNotulenPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Master lookup states
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);
  const [masterAgendasTemplate, setMasterAgendasTemplate] = useState<SmkiNotulenAgendaItem[]>([]);

  // Form Fields
  const [form, setForm] = useState({
    nomor_notulen: "",
    no_dokumen: "F10-SMKI",
    no_revisi: "1.1",
    tanggal_berlaku: "2022-01-20",
    judul_formulir: "Formulir Notulen Management Review SMKI",
    judul_rapat: "",
    tanggal: "",
    waktu_mulai: "09:00",
    waktu_selesai: "12:00",
    zona_waktu: "WIB",
    tempat: "",
    notulis: "",
    koordinator_smki: "",
    tujuan: "",
    tindak_lanjut: "",
  });

  // Dynamic Peserta
  const [pesertas, setPesertas] = useState<SmkiNotulenPesertaItem[]>([]);

  // Agendas
  const [agendas, setAgendas] = useState<SmkiNotulenAgendaItem[]>([]);

  // Fetch Existing Data & Master Lookup
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [lookupRes, notulenRes] = await Promise.all([
          getSmkiNotulenLookup(),
          getSmkiNotulenById(id),
        ]);

        if (lookupRes.success && lookupRes.data) {
          setPegawaiList(lookupRes.data.pegawai || []);
          if (lookupRes.data.default_agendas) {
            setMasterAgendasTemplate(lookupRes.data.default_agendas);
          }
        }

        if (notulenRes.success && notulenRes.data) {
          const item = notulenRes.data;
          setForm({
            nomor_notulen: item.nomor_notulen || "",
            no_dokumen: item.no_dokumen || "F10-SMKI",
            no_revisi: item.no_revisi || "1.1",
            tanggal_berlaku: item.tanggal_berlaku ? item.tanggal_berlaku.split("T")[0] : "2022-01-20",
            judul_formulir: item.judul_formulir || "Formulir Notulen Management Review SMKI",
            judul_rapat: item.judul_rapat || "",
            tanggal: item.tanggal ? item.tanggal.split("T")[0] : "",
            waktu_mulai: item.waktu_mulai || "09:00",
            waktu_selesai: item.waktu_selesai || "12:00",
            zona_waktu: item.zona_waktu || "WIB",
            tempat: item.tempat || "",
            notulis: item.notulis || "",
            koordinator_smki: item.koordinator_smki || "",
            tujuan: item.tujuan || "",
            tindak_lanjut: item.tindak_lanjut || "",
          });

          if (item.pesertas && item.pesertas.length > 0) {
            setPesertas(item.pesertas);
          } else {
            setPesertas([{ nama: "", jabatan: "" }]);
          }

          if (item.agendas && item.agendas.length > 0) {
            setAgendas(
              item.agendas.map((ag: any) => ({
                ...ag,
                tgl_penyelesaian: ag.tgl_penyelesaian ? ag.tgl_penyelesaian.split("T")[0] : "",
              }))
            );
          } else if (lookupRes.data?.default_agendas) {
            setAgendas(lookupRes.data.default_agendas);
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat detail notulen untuk diedit:", err);
        toast.error("Gagal memuat data notulen.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Peserta handlers
  const handleAddPeserta = () => {
    setPesertas((prev) => [...prev, { nama: "", jabatan: "" }]);
  };

  const handleRemovePeserta = (index: number) => {
    if (pesertas.length === 1) {
      toast.error("Minimal harus ada satu peserta rapat.");
      return;
    }
    setPesertas((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePesertaChange = (
    index: number,
    field: "nama" | "jabatan" | "pegawai_id",
    val: any
  ) => {
    const updated = [...pesertas];
    updated[index] = { ...updated[index], [field]: val };
    setPesertas(updated);
  };

  const handleSelectPegawaiForPeserta = (index: number, pegId: string) => {
    if (!pegId) {
      handlePesertaChange(index, "pegawai_id", null);
      return;
    }
    const found = pegawaiList.find((p) => String(p.id) === pegId);
    if (found) {
      const updated = [...pesertas];
      updated[index] = {
        ...updated[index],
        pegawai_id: found.id,
        nama: found.nama,
        jabatan: found.jabatan || updated[index].jabatan || "Staf Aptika",
      };
      setPesertas(updated);
    }
  };

  // Agenda handlers
  const handleAgendaChange = (
    index: number,
    field: keyof SmkiNotulenAgendaItem,
    value: string
  ) => {
    const updated = [...agendas];
    updated[index] = { ...updated[index], [field]: value };
    setAgendas(updated);
  };

  const handleSelectPredefinedAgenda = (index: number, agendaItemName: string) => {
    const found = masterAgendasTemplate.find((m) => m.agenda_item === agendaItemName);
    const updated = [...agendas];
    if (found) {
      updated[index] = {
        ...updated[index],
        agenda_item: found.agenda_item,
        clause_iso: found.clause_iso || "9.3",
      };
    } else {
      updated[index] = {
        ...updated[index],
        agenda_item: agendaItemName,
      };
    }
    setAgendas(updated);
  };

  const handleAddAgenda = () => {
    const nextNomor = agendas.length + 1;
    setAgendas((prev) => [
      ...prev,
      {
        nomor_agenda: nextNomor,
        agenda_item: "",
        clause_iso: "",
        outcomes: "",
        actions_output: "",
        pic: "",
        tgl_penyelesaian: "",
      },
    ]);
  };

  const handleRemoveAgenda = (index: number) => {
    if (agendas.length <= 1) {
      toast.error("Minimal harus ada satu agenda pembahasan.");
      return;
    }
    const updated = agendas
      .filter((_, i) => i !== index)
      .map((ag, i) => ({
        ...ag,
        nomor_agenda: i + 1,
      }));
    setAgendas(updated);
  };

  const availablePics = pesertas
    .map((p) => p.nama.trim())
    .filter((n) => n.length > 0);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Form Submit Trigger - Buka Modal Konfirmasi
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nomor_notulen.trim()) {
      toast.error("Nomor notulen wajib diisi.");
      return;
    }
    if (!form.judul_rapat.trim()) {
      toast.error("Judul rapat wajib diisi.");
      return;
    }

    const validPesertas = pesertas.filter(
      (p) => p.nama.trim() !== "" && p.jabatan.trim() !== ""
    );
    if (validPesertas.length === 0) {
      toast.error("Harap isi minimal 1 peserta rapat.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Submit Handler Setelah Dikonfirmasi
  const handleConfirmSubmit = async () => {
    const validPesertas = pesertas.filter(
      (p) => p.nama.trim() !== "" && p.jabatan.trim() !== ""
    );

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        pesertas: validPesertas,
        agendas: agendas,
      };

      const res = await updateSmkiNotulen(id, payload);
      if (res.success) {
        setIsConfirmModalOpen(false);
        toast.success(res.message || "Notulen berhasil diperbarui!");
        router.push(`/smki/notulen/${id}`);
      }
    } catch (err: any) {
      console.error("Gagal memperbarui notulen:", err);
      toast.error(
        err.response?.data?.message || "Terjadi kesalahan saat memperbarui notulen."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="text-sm">Memuat data notulen...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handlePreSubmit} className="flex flex-col gap-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/smki/notulen/${id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Detail</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Notulen</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbarui catatan dan tindak lanjut Management Review SMKI ({form.nomor_notulen}).
          </p>
        </div>
      </div>

      {/* Section 1: Identitas Dokumen (Dapat Disesuaikan / Diedit) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Identitas Dokumen
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesuaikan kode formulir, nomor revisi, tanggal penetapan, dan judul dokumen SMKI.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
            Dapat Disesuaikan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              No. Dokumen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.no_dokumen}
              onChange={(e) => setForm({ ...form, no_dokumen: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              No. Revisi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.no_revisi}
              onChange={(e) => setForm({ ...form, no_revisi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Tanggal Berlaku <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.tanggal_berlaku}
              onChange={(e) => setForm({ ...form, tanggal_berlaku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Judul Formulir <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.judul_formulir}
              onChange={(e) => setForm({ ...form, judul_formulir: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Pelaksanaan Rapat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          Pelaksanaan Rapat
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="lg:col-span-2">
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Judul Rapat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.judul_rapat}
              onChange={(e) => setForm({ ...form, judul_rapat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Nomor Notulen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nomor_notulen}
              onChange={(e) => setForm({ ...form, nomor_notulen: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Tanggal Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Waktu Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={form.waktu_mulai}
                onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                value={form.waktu_selesai}
                onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
              />
              <span className="text-xs font-semibold text-slate-500">WIB</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Tempat / Media Rapat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.tempat}
              onChange={(e) => setForm({ ...form, tempat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Notulis Rapat <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col gap-1.5">
              <select
                onChange={(e) => {
                  if (e.target.value) setForm({ ...form, notulis: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="">-- Pilih dari Master Pegawai --</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama} ({p.jabatan || "Pegawai"})
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={form.notulis}
                onChange={(e) => setForm({ ...form, notulis: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Koordinator SMKI <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col gap-1.5">
              <select
                onChange={(e) => {
                  if (e.target.value) setForm({ ...form, koordinator_smki: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="">-- Pilih dari Master Pegawai --</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama} ({p.jabatan || "Koordinator"})
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={form.koordinator_smki}
                onChange={(e) => setForm({ ...form, koordinator_smki: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Peserta Rapat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Peserta Rapat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola peserta yang hadir beserta jabatannya.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddPeserta}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-all"
          >
            <Plus size={14} />
            <span>Tambah Peserta</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">NO</th>
                <th className="py-2.5 px-3">PILIH DARI MASTER PEGAWAI</th>
                <th className="py-2.5 px-3">NAMA PESERTA *</th>
                <th className="py-2.5 px-3">JABATAN *</th>
                <th className="py-2.5 px-3 w-16 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pesertas.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3 w-64">
                    <select
                      value={p.pegawai_id || ""}
                      onChange={(e) => handleSelectPegawaiForPeserta(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <option value="">-- Pilih Pegawai --</option>
                      {pegawaiList.map((peg) => (
                        <option key={peg.id} value={peg.id}>
                          {peg.nama} ({peg.jabatan || "-"})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap peserta"
                      value={p.nama}
                      onChange={(e) => handlePesertaChange(idx, "nama", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      required
                      placeholder="Jabatan"
                      value={p.jabatan}
                      onChange={(e) => handlePesertaChange(idx, "jabatan", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemovePeserta(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Hapus Baris"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: CARD 1 - Daftar Agenda Review (Tabel Pemilihan Agenda) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Agenda Review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih agenda dari template baku ISO 27001 (Klausul 9.3) atau ketik topik agenda sendiri. Agenda yang ditambah otomatis muncul di form pembahasan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAgenda}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-all"
          >
            <Plus size={14} />
            <span>Tambah Agenda Rapat</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">NO</th>
                <th className="py-2.5 px-3 w-72">PILIH DARI TEMPLATE ISO 27001</th>
                <th className="py-2.5 px-3">JUDUL AGENDA *</th>
                <th className="py-2.5 px-3 w-28 text-center">KLAUSUL</th>
                <th className="py-2.5 px-3 w-16 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {agendas.map((ag, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={masterAgendasTemplate.some((m) => m.agenda_item === ag.agenda_item) ? ag.agenda_item : ""}
                      onChange={(e) => {
                        if (e.target.value) handleSelectPredefinedAgenda(idx, e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <option value="">-- Pilih Template Standar --</option>
                      {masterAgendasTemplate.map((tmpl) => (
                        <option key={tmpl.nomor_agenda} value={tmpl.agenda_item}>
                          {tmpl.nomor_agenda}. {tmpl.agenda_item} ({tmpl.clause_iso || "Clause 9.3"})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      required
                      placeholder="Judul topik agenda rapat"
                      value={ag.agenda_item}
                      onChange={(e) => handleAgendaChange(idx, "agenda_item", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="text"
                      placeholder="9.3"
                      value={ag.clause_iso || ""}
                      onChange={(e) => handleAgendaChange(idx, "clause_iso", e.target.value)}
                      className="w-full text-center px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveAgenda(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: CARD 2 - Pembahasan & Rencana Tindak Lanjut (Otomatis Tersinkron) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Pembahasan &amp; Tindak Lanjut
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {agendas.length} Item Pembahasan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lengkapi hasil pembahasan (Outcomes), tindakan nyata (Actions/Output), PIC pelaksana (otomatis dari peserta), dan target penyelesaian untuk setiap agenda.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {agendas.map((agenda, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header Box Pembahasan Item */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {agenda.nomor_agenda}
                  </span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {agenda.agenda_item || `Agenda ${agenda.nomor_agenda}`}
                  </span>
                </div>

                {agenda.clause_iso && (
                  <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                    Klausul {agenda.clause_iso}
                  </span>
                )}
              </div>

              {/* Form Input Detail Pembahasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    PIC Pelaksana (Pilih dari Peserta)
                  </label>
                  <select
                    value={agenda.pic || ""}
                    onChange={(e) => handleAgendaChange(idx, "pic", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Pilih PIC dari Peserta Rapat --</option>
                    {availablePics.map((name, pIdx) => (
                      <option key={pIdx} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Target Tanggal Penyelesaian
                  </label>
                  <input
                    type="date"
                    value={agenda.tgl_penyelesaian || ""}
                    onChange={(e) => handleAgendaChange(idx, "tgl_penyelesaian", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Outcomes (Hasil Evaluasi / Keputusan Rapat)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Dua tindakan selesai; pembaruan daftar aset masih berjalan..."
                    value={agenda.outcomes || ""}
                    onChange={(e) => handleAgendaChange(idx, "outcomes", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Actions / Output to be Taken (Tindakan Lanjut)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Lengkapi daftar aset dan bukti verifikasi pemilik aset..."
                    value={agenda.actions_output || ""}
                    onChange={(e) => handleAgendaChange(idx, "actions_output", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Tindak Lanjut */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm text-xs">
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 uppercase tracking-wider">
          Tindak Lanjut &amp; Catatan Penutup
        </label>
        <textarea
          rows={2}
          value={form.tindak_lanjut}
          onChange={(e) => setForm({ ...form, tindak_lanjut: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Action Submit Bottom */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/smki/notulen/${id}`)}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{submitting ? "Memperbarui..." : "Perbarui Notulen"}</span>
        </button>
      </div>

      {/* Modal Konfirmasi Perbarui (Update) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Save size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">
              Konfirmasi Perbarui Notulen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Apakah Anda yakin ingin menyimpan perubahan pada notulen rapat{" "}
              <strong className="text-slate-800 dark:text-white font-medium">
                "{form.judul_rapat}"
              </strong>{" "}
              (
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {form.nomor_notulen}
              </span>
              )?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{submitting ? "Memperbarui..." : "Ya, Simpan Perubahan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
