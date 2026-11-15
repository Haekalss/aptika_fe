// Mock in-memory store untuk preview UI FR-048 tanpa backend.
// Aktif bila NEXT_PUBLIC_FR048_MOCK_API=true. Data hilang saat refresh penuh (by design).
import type {
  AdminOptionDto,
  AjukanPayload,
  IdentifikasiPayload,
  JenisKonfigurasiDto,
  KonfigurasiItemDto,
  NilaiStandarDto,
  NilaiStandarRowPayload,
  ObjekDto,
  OptionDto,
  PaginatedDto,
  PemantauanDetailDto,
  PemantauanListItemDto,
  PemantauanStatus,
  PemantauanSummaryDto,
  RiwayatItemDto,
} from "./pemantauanKonfigurasiService.types";

const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

let nextId = 90000;
const genId = () => nextId++;

let jenisList: JenisKonfigurasiDto[] = [
  { id: 1, nama: "Server", keterangan: "Server fisik & virtual (VM)", isActive: true },
  { id: 2, nama: "Jaringan", keterangan: "Perangkat jaringan & keamanan", isActive: true },
  { id: 3, nama: "Komputer / Laptop", keterangan: "Perangkat endpoint pengguna", isActive: true },
  { id: 4, nama: "Aplikasi", keterangan: "Aplikasi & sistem informasi", isActive: false },
];
let objekList: ObjekDto[] = [
  { id: 101, jenisKonfigurasiId: 1, jenisKonfigurasiNama: "Server", nama: "SRV-PROD-01", isActive: true },
  { id: 102, jenisKonfigurasiId: 1, jenisKonfigurasiNama: "Server", nama: "SRV-DB-01", isActive: true },
  { id: 103, jenisKonfigurasiId: 2, jenisKonfigurasiNama: "Jaringan", nama: "SW-CORE-01", isActive: true },
  { id: 104, jenisKonfigurasiId: 2, jenisKonfigurasiNama: "Jaringan", nama: "FW-EDGE-01", isActive: true },
  { id: 105, jenisKonfigurasiId: 3, jenisKonfigurasiNama: "Komputer / Laptop", nama: "PC-APTIKA-01", isActive: true },
];
let nilaiStandarList: NilaiStandarDto[] = [
  { id: 1001, objekId: 101, objekNama: "SRV-PROD-01", namaKonfigurasi: "Sistem Operasi", nilaiStandar: "Ubuntu 22.04 LTS", isActive: true },
  { id: 1002, objekId: 101, objekNama: "SRV-PROD-01", namaKonfigurasi: "SSH Root Login", nilaiStandar: "disabled", isActive: true },
  { id: 1003, objekId: 101, objekNama: "SRV-PROD-01", namaKonfigurasi: "Min Password Length", nilaiStandar: "12", isActive: true },
  { id: 1004, objekId: 101, objekNama: "SRV-PROD-01", namaKonfigurasi: "Firewall Aktif", nilaiStandar: "ya", isActive: true },
  { id: 1005, objekId: 102, objekNama: "SRV-DB-01", namaKonfigurasi: "DBMS", nilaiStandar: "PostgreSQL 15", isActive: true },
  { id: 1006, objekId: 102, objekNama: "SRV-DB-01", namaKonfigurasi: "Backup Terjadwal", nilaiStandar: "harian", isActive: true },
  { id: 1007, objekId: 103, objekNama: "SW-CORE-01", namaKonfigurasi: "NTP Server", nilaiStandar: "aktif", isActive: true },
  { id: 1008, objekId: 103, objekNama: "SW-CORE-01", namaKonfigurasi: "Banner Login", nilaiStandar: "aktif", isActive: true },
];

const mkItems = (objekId: number, aktual: Record<string, string>): KonfigurasiItemDto[] =>
  nilaiStandarList
    .filter((n) => n.objekId === objekId && n.isActive)
    .map((n, i) => ({
      id: 5000 + objekId * 10 + i,
      objekId,
      namaKonfigurasi: n.namaKonfigurasi,
      nilaiStandar: n.nilaiStandar,
      nilaiStandarId: n.id,
      nilaiAktual: aktual[n.namaKonfigurasi] ?? "",
      kesesuaian: null,
      isStandar: true,
      keterangan: "",
    }));

const riw = (aksi: RiwayatItemDto["aksi"], pelaku: string, siklus: number, waktu: string, catatan: string | null, hasil: RiwayatItemDto["hasil"]): RiwayatItemDto =>
  ({ id: genId(), aksi, pelaku, siklus, waktu, catatan, hasil });

const seedPemantauan: PemantauanDetailDto[] = [
  {
    id: 48001, noFormulir: "FR-048/KOM.03.05/SANDIKAMI", noRevisi: "0.0", tanggalBerlaku: "2022-11-25", tanggalPemantauan: "2026-11-10", periode: 4,
    jenisKonfigurasiId: 1, jenisKonfigurasiNama: "Server", status: "selesai",
    hasil: "sesuai_seluruhnya", jumlahSesuai: 6, jumlahTidakSesuai: 0,
    catatanTindakLanjut: "", catatanAdmin: null,
    pelaksanaId: 11, pelaksanaNama: "Andi Pratama", adminId: 12, adminNama: "Rina Puspita",
    tanggalTtdPelaksana: "2026-11-11T09:12:00", tanggalTtdAdmin: "2026-11-12T14:03:00", siklus: 1,
    objekList: [
      { id: 7001, objekId: 101, objekNama: "SRV-PROD-01", items: mkItems(101, { "Sistem Operasi": "Ubuntu 22.04 LTS", "SSH Root Login": "disabled", "Min Password Length": "12", "Firewall Aktif": "ya" }).map((i) => ({ ...i, kesesuaian: "sesuai" as const })) },
      { id: 7002, objekId: 102, objekNama: "SRV-DB-01", items: mkItems(102, { "DBMS": "PostgreSQL 15", "Backup Terjadwal": "harian" }).map((i) => ({ ...i, kesesuaian: "sesuai" as const })) },
    ],
    riwayat: [
      riw("dibuat", "Andi Pratama", 1, "2026-11-10T10:00:00", null, null),
      riw("diajukan", "Andi Pratama", 1, "2026-11-11T09:12:00", "Pemantauan triwulan 4", "sesuai_seluruhnya"),
      riw("disetujui", "Rina Puspita", 1, "2026-11-12T14:03:00", null, "sesuai_seluruhnya"),
    ],
    createdAt: "2026-11-10T10:00:00", updatedAt: "2026-11-12T14:03:00",
  },
  {
    id: 48002, noFormulir: "FR-048/KOM.03.05/SANDIKAMI", noRevisi: "0.0", tanggalBerlaku: "2022-11-25", tanggalPemantauan: "2026-11-14", periode: 4,
    jenisKonfigurasiId: 2, jenisKonfigurasiNama: "Jaringan", status: "diajukan",
    hasil: "ada_ketidaksesuaian", jumlahSesuai: 1, jumlahTidakSesuai: 1,
    catatanTindakLanjut: "Banner login SW-CORE-01 belum aktif, akan dikerjakan sebelum 30 Nov 2026.",
    catatanAdmin: null,
    pelaksanaId: 11, pelaksanaNama: "Andi Pratama", adminId: 12, adminNama: "Rina Puspita",
    tanggalTtdPelaksana: "2026-11-14T16:20:00", tanggalTtdAdmin: null, siklus: 1,
    objekList: [
      { id: 7003, objekId: 103, objekNama: "SW-CORE-01", items: mkItems(103, { "NTP Server": "aktif", "Banner Login": "nonaktif" }).map((i) => ({ ...i, kesesuaian: i.nilaiAktual === i.nilaiStandar ? ("sesuai" as const) : ("tidak_sesuai" as const), keterangan: i.nilaiAktual === i.nilaiStandar ? "" : "Banner belum dikonfigurasi" })) },
    ],
    riwayat: [
      riw("dibuat", "Andi Pratama", 1, "2026-11-14T08:30:00", null, null),
      riw("diajukan", "Andi Pratama", 1, "2026-11-14T16:20:00", "Menunggu peninjauan", "ada_ketidaksesuaian"),
    ],
    createdAt: "2026-11-14T08:30:00", updatedAt: "2026-11-14T16:20:00",
  },
  {
    id: 48003, noFormulir: "FR-048/KOM.03.05/SANDIKAMI", noRevisi: "0.0", tanggalBerlaku: "2022-11-25", tanggalPemantauan: "2026-11-05", periode: 4,
    jenisKonfigurasiId: 3, jenisKonfigurasiNama: "Komputer / Laptop", status: "revisi",
    hasil: "ada_ketidaksesuaian", jumlahSesuai: 0, jumlahTidakSesuai: 1,
    catatanTindakLanjut: "Antivirus belum update di PC-APTIKA-01.",
    catatanAdmin: "Mohon lengkapi keterangan baris Antivirus dan periksa ulang sebelum diajukan kembali.",
    pelaksanaId: 13, pelaksanaNama: "Dedi Kurnia", adminId: 12, adminNama: "Rina Puspita",
    tanggalTtdPelaksana: "2026-11-06T09:00:00", tanggalTtdAdmin: null, siklus: 1,
    objekList: [
      {
        id: 7004, objekId: 105, objekNama: "PC-APTIKA-01",
        items: [
          { id: 5001, objekId: 105, namaKonfigurasi: "Antivirus", nilaiAktual: "tidak aktif", nilaiStandar: "aktif", nilaiStandarId: null, kesesuaian: "tidak_sesuai", isStandar: false, keterangan: "" },
        ],
      },
    ],
    riwayat: [
      riw("dibuat", "Dedi Kurnia", 1, "2026-11-05T09:00:00", null, null),
      riw("diajukan", "Dedi Kurnia", 1, "2026-11-06T09:00:00", null, "ada_ketidaksesuaian"),
      riw("dikembalikan", "Rina Puspita", 1, "2026-11-07T10:15:00", "Mohon lengkapi keterangan baris Antivirus dan periksa ulang sebelum diajukan kembali.", "ada_ketidaksesuaian"),
    ],
    createdAt: "2026-11-05T09:00:00", updatedAt: "2026-11-07T10:15:00",
  },
  {
    id: 48004, noFormulir: "", noRevisi: "0.0", tanggalBerlaku: today(), tanggalPemantauan: today(), periode: 4,
    jenisKonfigurasiId: 2, jenisKonfigurasiNama: "Jaringan", status: "draft",
    hasil: null, jumlahSesuai: 0, jumlahTidakSesuai: 0,
    catatanTindakLanjut: "", catatanAdmin: null,
    pelaksanaId: 11, pelaksanaNama: "Andi Pratama", adminId: null, adminNama: null,
    tanggalTtdPelaksana: null, tanggalTtdAdmin: null, siklus: 1,
    objekList: [
      { id: 7005, objekId: 104, objekNama: "FW-EDGE-01", items: [] },
    ],
    riwayat: [riw("dibuat", "Andi Pratama", 1, nowIso(), null, null)],
    createdAt: nowIso(), updatedAt: nowIso(),
  },
];

const store: PemantauanDetailDto[] = [...seedPemantauan];

// ─── helpers ───────────────────────────────────────────────────────────────
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const findIdx = (id: number) => store.findIndex((p) => p.id === id);
const requireP = (id: number): PemantauanDetailDto => {
  const idx = findIdx(id);
  if (idx < 0) throw new Error("Pemantauan tidak ditemukan.");
  return store[idx];
};
const applyKesesuaian = (items: KonfigurasiItemDto[]) => {
  for (const it of items) {
    if (it.isStandar && it.nilaiStandar != null) {
      it.kesesuaian = norm(it.nilaiAktual) === norm(it.nilaiStandar) ? "sesuai" : "tidak_sesuai";
    }
  }
};
const recalc = (p: PemantauanDetailDto) => {
  const all = p.objekList.flatMap((o) => o.items);
  p.jumlahSesuai = all.filter((i) => i.kesesuaian === "sesuai").length;
  p.jumlahTidakSesuai = all.filter((i) => i.kesesuaian === "tidak_sesuai").length;
  p.hasil = all.length === 0 ? null : p.jumlahTidakSesuai === 0 ? "sesuai_seluruhnya" : "ada_ketidaksesuaian";
};
const toListItem = (p: PemantauanDetailDto): PemantauanListItemDto => ({
  id: p.id,
  noFormulir: p.noFormulir,
  objekRingkas: p.objekList.map((o) => o.objekNama).join(", ") || "-",
  tanggalPemantauan: p.tanggalPemantauan,
  periode: p.periode,
  jenisKonfigurasiNama: p.jenisKonfigurasiNama,
  status: p.status,
  hasil: p.hasil,
  siklus: p.siklus,
  pelaksanaNama: p.pelaksanaNama,
  adminNama: p.adminNama,
  updatedAt: p.updatedAt,
});
const pushRiwayat = (p: PemantauanDetailDto, aksi: RiwayatItemDto["aksi"], pelaku: string, catatan: string | null) => {
  p.riwayat = [...p.riwayat, riw(aksi, pelaku, p.siklus, nowIso(), catatan, p.hasil)];
};

// ─── API mock ─────────────────────────────────────────────────────────────
export const mockSummary = async (): Promise<PemantauanSummaryDto> => {
  await delay(150);
  return {
    total: store.length,
    draft: store.filter((p) => p.status === "draft").length,
    diajukan: store.filter((p) => p.status === "diajukan").length,
    revisi: store.filter((p) => p.status === "revisi").length,
    selesai: store.filter((p) => p.status === "selesai").length,
  };
};

export const mockGetList = async (query: {
  q?: string; periode?: number | ""; jenisId?: number | ""; status?: PemantauanStatus | "";
  page?: number; perPage?: number;
}): Promise<PaginatedDto<PemantauanListItemDto>> => {
  await delay();
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.max(1, query.perPage ?? 10);
  let rows = [...store];
  const q = norm(query.q);
  if (q) rows = rows.filter((p) => norm(p.objekList.map((o) => o.objekNama).join(" ")).includes(q) || norm(p.noFormulir).includes(q));
  if (query.periode !== "" && query.periode != null) rows = rows.filter((p) => p.periode === query.periode);
  if (query.jenisId !== "" && query.jenisId != null) rows = rows.filter((p) => p.jenisKonfigurasiId === query.jenisId);
  if (query.status !== "" && query.status != null) rows = rows.filter((p) => p.status === query.status);
  rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = rows.slice((page - 1) * perPage, page * perPage).map(toListItem);
  return { data: slice, meta: { page, perPage, total, totalPages } };
};

export const mockGetDetail = async (id: number): Promise<PemantauanDetailDto> => {
  await delay();
  return clone(requireP(id));
};

export const mockCreateDraft = async (actor: { id: number; name: string }): Promise<PemantauanDetailDto> => {
  await delay();
  const p: PemantauanDetailDto = {
    id: genId(), noFormulir: "", noRevisi: "0.0", tanggalBerlaku: today(), tanggalPemantauan: today(), periode: 4,
    jenisKonfigurasiId: 0, jenisKonfigurasiNama: "", status: "draft",
    hasil: null, jumlahSesuai: 0, jumlahTidakSesuai: 0,
    catatanTindakLanjut: "", catatanAdmin: null,
    pelaksanaId: actor.id, pelaksanaNama: actor.name, adminId: null, adminNama: null,
    tanggalTtdPelaksana: null, tanggalTtdAdmin: null, siklus: 1,
    objekList: [],
    riwayat: [riw("dibuat", actor.name, 1, nowIso(), null, null)],
    createdAt: nowIso(), updatedAt: nowIso(),
  };
  store.push(p);
  return clone(p);
};

export const mockUpdateIdentifikasi = async (id: number, payload: IdentifikasiPayload): Promise<PemantauanDetailDto> => {
  await delay();
  const idx = findIdx(id);
  if (idx < 0) throw new Error("Pemantauan tidak ditemukan.");
  const p = store[idx];
  if (p.status !== "draft") throw new Error("Identifikasi hanya dapat diubah selama status Draft.");
  if (!payload.noFormulir.trim()) throw new Error("No. Dokumen wajib diisi.");
  if (!payload.noRevisi.trim()) throw new Error("No. Revisi wajib diisi.");
  if (!payload.tanggalBerlaku) throw new Error("Tanggal Berlaku wajib diisi.");
  if (!payload.jenisKonfigurasiId) throw new Error("Jenis Konfigurasi wajib dipilih.");
  if (payload.objekIds.length === 0) throw new Error("Pilih minimal 1 objek.");
  const jenis = jenisList.find((j) => j.id === payload.jenisKonfigurasiId);
  const objeks = payload.objekIds.map((oid) => objekList.find((o) => o.id === oid)!).filter(Boolean);
  // pertahankan items existing per objek, siapkan standar untuk objek baru
  const existing = new Map(p.objekList.map((o) => [o.objekId, o]));
  p.noFormulir = payload.noFormulir.trim();
  p.noRevisi = payload.noRevisi.trim();
  p.tanggalBerlaku = payload.tanggalBerlaku;
  p.tanggalPemantauan = payload.tanggalPemantauan;
  p.periode = payload.periode;
  p.jenisKonfigurasiId = payload.jenisKonfigurasiId;
  p.jenisKonfigurasiNama = jenis?.nama ?? "";
  p.objekList = objeks.map((o) => {
    const keep = existing.get(o.id);
    if (keep) return { ...keep, objekNama: o.nama };
    const standar = nilaiStandarList.filter((n) => n.objekId === o.id && n.isActive);
    return {
      id: genId(), objekId: o.id, objekNama: o.nama,
      items: standar.map((n, i) => ({
        id: genId() + i, objekId: o.id, namaKonfigurasi: n.namaKonfigurasi,
        nilaiStandar: n.nilaiStandar, nilaiStandarId: n.id, nilaiAktual: "",
        kesesuaian: null, isStandar: true, keterangan: "",
      })),
    };
  });
  p.updatedAt = nowIso();
  return clone(p);
};

export const mockSaveKonfigurasi = async (id: number, items: KonfigurasiItemDto[]): Promise<PemantauanDetailDto> => {
  await delay();
  const p = requireP(id);
  if (p.status !== "draft" && p.status !== "revisi") throw new Error("Daftar konfigurasi hanya dapat diubah pada status Draft / Revisi.");
  // validasi minimal: setiap baris punya nama & nilai
  for (const it of items) {
    if (!it.namaKonfigurasi.trim()) throw new Error("Semua baris wajib memiliki Nama Konfigurasi.");
    if (!String(it.nilaiAktual).trim()) throw new Error("Semua baris wajib memiliki Nilai aktual.");
  }
  // regroup ke objekList berdasarkan objekId (pertahankan urutan pilihan identifikasi)
  const grouped = new Map<number, KonfigurasiItemDto[]>();
  for (const it of items) {
    const arr = grouped.get(it.objekId) ?? [];
    arr.push(clone(it));
    grouped.set(it.objekId, arr);
  }
  p.objekList = p.objekList.map((o) => ({ ...o, items: grouped.get(o.objekId) ?? [] }));
  recalc(p);
  p.updatedAt = nowIso();
  return clone(p);
};

export const mockPeriksaKesesuaian = async (id: number): Promise<PemantauanDetailDto> => {
  await delay();
  const p = requireP(id);
  if (p.status !== "draft" && p.status !== "revisi") throw new Error("Pemeriksaan hanya dapat dilakukan pada status Draft / Revisi.");
  const all = p.objekList.flatMap((o) => o.items);
  if (all.length === 0) throw new Error("Belum ada baris konfigurasi.");
  for (const it of all) {
    if (!it.isStandar && !it.kesesuaian) throw new Error("Tandai Kesesuaian (Sesuai / Tidak Sesuai) pada semua baris tanpa nilai standar.");
  }
  for (const o of p.objekList) applyKesesuaian(o.items);
  recalc(p);
  p.updatedAt = nowIso();
  return clone(p);
};

export const mockAjukan = async (id: number, payload: AjukanPayload, actor: { id: number; name: string }): Promise<PemantauanDetailDto> => {
  await delay();
  const p = requireP(id);
  if (p.status !== "draft" && p.status !== "revisi") throw new Error("Pemantauan sudah diajukan / selesai.");
  if (!payload.adminId) throw new Error("Admin wajib dipilih.");
  const adminOpt = (await mockAdminOptions()).find((a) => a.id === payload.adminId);
  if (!adminOpt) throw new Error("Admin yang dipilih tidak valid.");
  const all = p.objekList.flatMap((o) => o.items);
  const tidakSesuai = all.filter((i) => i.kesesuaian === "tidak_sesuai");
  for (const it of tidakSesuai) {
    if (!it.keterangan.trim()) throw new Error(`Keterangan wajib diisi pada baris Tidak Sesuai: ${it.namaKonfigurasi}.`);
  }
  if (tidakSesuai.length > 0 && !payload.catatanTindakLanjut.trim()) {
    throw new Error("Catatan Tindak Lanjut wajib diisi karena terdapat baris Tidak Sesuai.");
  }
  const isResubmit = p.status === "revisi";
  if (isResubmit) p.siklus += 1;
  p.adminId = adminOpt.id;
  p.adminNama = adminOpt.name;
  p.catatanTindakLanjut = payload.catatanTindakLanjut.trim();
  p.tanggalTtdPelaksana = nowIso();
  p.tanggalTtdAdmin = null;
  p.catatanAdmin = null;
  p.status = "diajukan";
  p.updatedAt = nowIso();
  pushRiwayat(p, isResubmit ? "diajukan_ulang" : "diajukan", actor.name, p.catatanTindakLanjut || null);
  return clone(p);
};

export const mockKembalikan = async (id: number, catatan: string, actor: { id: number; name: string }): Promise<PemantauanDetailDto> => {
  await delay();
  const p = requireP(id);
  if (p.status !== "diajukan") throw new Error("Hanya pemantauan berstatus Menunggu Persetujuan yang dapat dikembalikan.");
  if (!catatan.trim()) throw new Error("Catatan tinjauan wajib diisi saat mengembalikan pemantauan.");
  p.status = "revisi";
  p.catatanAdmin = catatan.trim();
  p.updatedAt = nowIso();
  pushRiwayat(p, "dikembalikan", actor.name, catatan.trim());
  return clone(p);
};

export const mockSelesaikan = async (id: number, actor: { id: number; name: string }): Promise<PemantauanDetailDto> => {
  await delay();
  const p = requireP(id);
  if (p.status !== "diajukan") throw new Error("Hanya pemantauan berstatus Menunggu Persetujuan yang dapat diselesaikan.");
  p.status = "selesai";
  p.tanggalTtdAdmin = nowIso();
  p.updatedAt = nowIso();
  pushRiwayat(p, "disetujui", actor.name, null);
  return clone(p);
};

export const mockHapusDraft = async (id: number): Promise<void> => {
  await delay();
  const idx = findIdx(id);
  if (idx < 0) throw new Error("Pemantauan tidak ditemukan.");
  if (store[idx].status !== "draft") throw new Error("Hanya pemantauan berstatus Draft yang dapat dihapus.");
  store.splice(idx, 1);
};

// ─── Lookup & master ──────────────────────────────────────────────────────
export const mockJenisOptions = async (): Promise<OptionDto[]> => {
  await delay(100);
  return jenisList.filter((j) => j.isActive).map((j) => ({ id: j.id, nama: j.nama }));
};
export const mockObjekOptions = async (jenisId: number): Promise<OptionDto[]> => {
  await delay(100);
  return objekList.filter((o) => o.isActive && o.jenisKonfigurasiId === jenisId).map((o) => ({ id: o.id, nama: o.nama }));
};
export const mockAdminOptions = async (): Promise<AdminOptionDto[]> => {
  await delay(100);
  return [
    { id: 12, name: "Rina Puspita", email: "rina@aptika.jabarprov.go.id", position: "Administrator SMKI" },
    { id: 14, name: "Bambang Sutrisno", email: "bambang@aptika.jabarprov.go.id", position: "Kepala Seksi Infrastruktur" },
    { id: 15, name: "Sari Wulandari", email: "sari@aptika.jabarprov.go.id", position: "Administrator Jaringan" },
  ];
};

export const mockListJenis = async (): Promise<JenisKonfigurasiDto[]> => {
  await delay(100);
  return clone(jenisList);
};
export const mockSaveJenis = async (payload: { id?: number; nama: string; keterangan?: string | null; isActive?: boolean }): Promise<JenisKonfigurasiDto> => {
  await delay();
  if (!payload.nama.trim()) throw new Error("Nama Jenis Konfigurasi wajib diisi.");
  const dup = jenisList.find((j) => norm(j.nama) === norm(payload.nama) && j.id !== payload.id);
  if (dup) throw new Error("Nama Jenis Konfigurasi sudah dipakai.");
  if (payload.id) {
    const j = jenisList.find((x) => x.id === payload.id);
    if (!j) throw new Error("Jenis Konfigurasi tidak ditemukan.");
    j.nama = payload.nama.trim();
    j.keterangan = payload.keterangan ?? null;
    if (payload.isActive !== undefined) j.isActive = payload.isActive;
    return clone(j);
  }
  const j: JenisKonfigurasiDto = { id: genId(), nama: payload.nama.trim(), keterangan: payload.keterangan ?? null, isActive: payload.isActive ?? true };
  jenisList = [...jenisList, j];
  return clone(j);
};

export const mockListObjek = async (): Promise<ObjekDto[]> => {
  await delay(100);
  return clone(objekList);
};
export const mockSaveObjek = async (payload: { id?: number; jenisKonfigurasiId: number; nama: string; isActive?: boolean }): Promise<ObjekDto> => {
  await delay();
  if (!payload.nama.trim()) throw new Error("Nama Objek wajib diisi.");
  if (!payload.jenisKonfigurasiId) throw new Error("Jenis Konfigurasi wajib dipilih.");
  const dup = objekList.find((o) => norm(o.nama) === norm(payload.nama) && o.id !== payload.id);
  if (dup) throw new Error("Nama Objek sudah dipakai.");
  const jenisNama = jenisList.find((j) => j.id === payload.jenisKonfigurasiId)?.nama ?? "";
  if (payload.id) {
    const o = objekList.find((x) => x.id === payload.id);
    if (!o) throw new Error("Objek tidak ditemukan.");
    o.nama = payload.nama.trim();
    o.jenisKonfigurasiId = payload.jenisKonfigurasiId;
    o.jenisKonfigurasiNama = jenisNama;
    if (payload.isActive !== undefined) o.isActive = payload.isActive;
    return clone(o);
  }
  const o: ObjekDto = { id: genId(), jenisKonfigurasiId: payload.jenisKonfigurasiId, jenisKonfigurasiNama: jenisNama, nama: payload.nama.trim(), isActive: payload.isActive ?? true };
  objekList = [...objekList, o];
  return clone(o);
};

export const mockGetNilaiStandar = async (objekId?: number): Promise<NilaiStandarDto[]> => {
  await delay(100);
  return clone(nilaiStandarList.filter((n) => objekId == null || n.objekId === objekId));
};
export const mockSaveNilaiStandar = async (objekId: number, rows: NilaiStandarRowPayload[]): Promise<NilaiStandarDto[]> => {
  await delay();
  if (!objekId) throw new Error("Objek wajib dipilih.");
  const seen = new Set<string>();
  for (const r of rows) {
    if (!r.namaKonfigurasi.trim() || !r.nilaiStandar.trim()) throw new Error("Nama Konfigurasi dan Nilai Standar wajib diisi.");
    const key = norm(r.namaKonfigurasi);
    if (seen.has(key)) throw new Error(`Nama Konfigurasi duplikat: ${r.namaKonfigurasi}`);
    seen.add(key);
  }
  // nilai standar hanya berlaku untuk pemantauan baru → nonaktifkan baris lama objek ini, ganti baru
  nilaiStandarList = nilaiStandarList.map((n) => (n.objekId === objekId ? { ...n, isActive: false } : n));
  const created = rows.map((r) => ({
    id: r.id ?? genId(),
    objekId,
    objekNama: objekList.find((o) => o.id === objekId)?.nama ?? null,
    namaKonfigurasi: r.namaKonfigurasi.trim(),
    nilaiStandar: r.nilaiStandar.trim(),
    isActive: true,
  }));
  nilaiStandarList = [...nilaiStandarList, ...created];
  return clone(created);
};
