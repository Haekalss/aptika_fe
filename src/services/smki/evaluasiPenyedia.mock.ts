/**
 * Mock API FR-021 — hanya untuk pengembangan UI sebelum backend siap.
 *
 * Aktif bila `NEXT_PUBLIC_FR021_MOCK=1`.
 * Data disimpan di memori modul; hilang saat halaman di-reload penuh.
 * Hapus/abaikan modul ini setelah backend FR-021 tersedia.
 */

import type {
  Fr021AjukanPayload,
  Fr021Errors,
  Fr021Evaluasi,
  Fr021IdentifikasiPayload,
  Fr021KembalikanPayload,
  Fr021Kriteria,
  Fr021ListParams,
  Fr021ListResponse,
  Fr021ListSummary,
  Fr021Log,
  Fr021Master,
  Fr021Penilaian,
  Fr021PenilaianPayload,
  Fr021Penyedia,
  Fr021PenyediaPayload,
  Fr021Rekomendasi,
  Fr021UserRef,
} from "./evaluasiPenyedia.types";

/* ───────────────────────── Master seed ───────────────────────── */

const KRITERIA: Fr021Kriteria[] = [
  { id: 1, urutan: 1, nama_kriteria: "Ketepatan waktu pelaksanaan pekerjaan" },
  {
    id: 2,
    urutan: 2,
    nama_kriteria:
      "Laporan/permintaan/keluhan langsung ditanggapi penyedia barang/jasa",
  },
  {
    id: 3,
    urutan: 3,
    nama_kriteria:
      "Seluruh ruang lingkup pekerjaan diselesaikan sesuai kontrak/SLA",
  },
  {
    id: 4,
    urutan: 4,
    nama_kriteria:
      "Berkomunikasi dengan baik tentang pelayanan/pekerjaan penyedia barang/jasa",
  },
];

const SKALA = [
  { id: 1, label: "Baik", skor: 100 },
  { id: 2, label: "Sedang", skor: 60 },
  { id: 3, label: "Kurang", skor: 10 },
];

const REKOMENDASI: Fr021Rekomendasi[] = [
  {
    id: 1,
    kategori: "Kurang memuaskan",
    nilai_min: 0,
    nilai_max: 280,
    keterangan: "Kontrak tidak diperpanjang",
  },
  {
    id: 2,
    kategori: "Cukup memuaskan",
    nilai_min: 281,
    nilai_max: 360,
    keterangan: "Kontrak dapat diperpanjang dengan komitmen perbaikan",
  },
  {
    id: 3,
    kategori: "Memuaskan",
    nilai_min: 361,
    nilai_max: 400,
    keterangan: "Kontrak dapat diperpanjang",
  },
];

const MASTER: Fr021Master = {
  kriteria: KRITERIA,
  skala: SKALA,
  rekomendasi: REKOMENDASI,
  template: {
    nomor_dokumen: "FR-021/KOM.03.05/SANDIKAMI",
    nomor_revisi: "1.1",
    tanggal_berlaku: "07 Juli 2022",
  },
};

const ADMINS: Fr021UserRef[] = [
  { id: 2, name: "Siti Rahmawati", position: "Kepala Bidang Aplikasi Informatika" },
  { id: 3, name: "Ahmad Fauzi", position: "Sekretaris Dinas" },
];

const PEGAWAI_NIP: Record<number, string> = {
  1: "199203152019031005",
  2: "198507102010012003",
  3: "197912242006041002",
};

/* ───────────────────────── Store ───────────────────────── */

type StoredEvaluasi = Omit<Fr021Evaluasi, "permissions">;

const PENYEDIA: Fr021Penyedia[] = [
  {
    id: 1,
    nama_penyedia: "PT Solusi Teknologi Nusantara",
    contact_person: "Rina Kartika",
    email: "rina@solusiteknologi.co.id",
  },
  {
    id: 2,
    nama_penyedia: "CV Digital Prima",
    contact_person: "Dedi Kurniawan",
    email: "dedi@digitalprima.co.id",
  },
  {
    id: 3,
    nama_penyedia: "PT Data Center Indonesia",
    contact_person: "Maya Sari",
    email: "maya@dci.co.id",
  },
];

function skorOf(skalaId: number): number {
  return SKALA.find((s) => s.id === skalaId)?.skor ?? 0;
}

function totalOf(penilaian: Fr021Penilaian[]): number {
  return penilaian.reduce((sum, item) => sum + item.skor, 0);
}

function rekomendasiOf(total: number): Fr021Rekomendasi | null {
  return (
    REKOMENDASI.find((r) => total >= r.nilai_min && total <= r.nilai_max) ??
    null
  );
}

function buatPenilaian(...pairs: [number, number][]): Fr021Penilaian[] {
  return pairs.map(([kriteria_id, skala_id]) => ({
    kriteria_id,
    skala_id,
    skor: skorOf(skala_id),
  }));
}

function withRekap(
  penilaian: Fr021Penilaian[]
): Pick<StoredEvaluasi, "total_nilai" | "rekomendasi_id" | "rekomendasi"> {
  const total = totalOf(penilaian);
  const rekomendasi = rekomendasiOf(total);
  return {
    total_nilai: total,
    rekomendasi_id: rekomendasi?.id ?? null,
    rekomendasi: rekomendasi ?? null,
  };
}

const now = () => new Date().toISOString();

const EVALUATIONS: StoredEvaluasi[] = [
  (() => {
    const penilaian = buatPenilaian([1, 1], [2, 2]);
    return {
      id: 1,
      penyedia_id: 1,
      penyedia: PENYEDIA[0],
      evaluator_id: 1,
      evaluator: { id: 1, name: "Budi Santoso" },
      admin_id: null,
      admin: null,
      no_kontrak: "KTR/2026/001",
      sifat_pekerjaan: "pengadaan_baru",
      sifat_pekerjaan_lainnya: null,
      total_nilai: null,
      rekomendasi_id: null,
      rekomendasi: null,
      status: "draft",
      catatan_revisi: null,
      siklus: 1,
      tempat: "Bandung",
      tanggal_evaluasi: "2026-10-20",
      ttd_evaluator_nama: null,
      ttd_evaluator_nip: null,
      ttd_evaluator_jabatan: null,
      tanggal_ttd_evaluator: null,
      ttd_admin_nama: null,
      ttd_admin_nip: null,
      ttd_admin_jabatan: null,
      tanggal_ttd_admin: null,
      penilaian,
      version: 1,
      created_at: "2026-10-20T09:00:00+07:00",
      updated_at: "2026-10-20T09:30:00+07:00",
    };
  })(),
  (() => {
    const penilaian = buatPenilaian([1, 1], [2, 1], [3, 1], [4, 2]);
    return {
      id: 2,
      penyedia_id: 2,
      penyedia: PENYEDIA[1],
      evaluator_id: 1,
      evaluator: { id: 1, name: "Budi Santoso" },
      admin_id: 2,
      admin: ADMINS[0],
      no_kontrak: "KTR/2026/002",
      sifat_pekerjaan: "maintenance_perawatan",
      sifat_pekerjaan_lainnya: null,
      ...withRekap(penilaian),
      status: "diajukan",
      catatan_revisi: null,
      siklus: 1,
      tempat: "Bandung",
      tanggal_evaluasi: "2026-10-24",
      ttd_evaluator_nama: "Budi Santoso",
      ttd_evaluator_nip: PEGAWAI_NIP[1],
      ttd_evaluator_jabatan: "Pranata Komputer Ahli Muda",
      tanggal_ttd_evaluator: "2026-10-25T10:12:00+07:00",
      ttd_admin_nama: null,
      ttd_admin_nip: null,
      ttd_admin_jabatan: null,
      tanggal_ttd_admin: null,
      penilaian,
      version: 3,
      created_at: "2026-10-24T08:00:00+07:00",
      updated_at: "2026-10-25T10:12:00+07:00",
    };
  })(),
  (() => {
    const penilaian = buatPenilaian([1, 1], [2, 2], [3, 2], [4, 2]);
    return {
      id: 3,
      penyedia_id: 3,
      penyedia: PENYEDIA[2],
      evaluator_id: 1,
      evaluator: { id: 1, name: "Budi Santoso" },
      admin_id: 2,
      admin: ADMINS[0],
      no_kontrak: "KTR/2026/003",
      sifat_pekerjaan: "lainnya",
      sifat_pekerjaan_lainnya: "Pekerjaan pengadaan lisensi perangkat lunak",
      ...withRekap(penilaian),
      status: "revisi",
      catatan_revisi:
        "Mohon lengkapi bukti penyelesaian ruang lingkup pekerjaan dan tinjau ulang nilai kriteria ketiga.",
      siklus: 1,
      tempat: "Bandung",
      tanggal_evaluasi: "2026-10-18",
      ttd_evaluator_nama: "Budi Santoso",
      ttd_evaluator_nip: PEGAWAI_NIP[1],
      ttd_evaluator_jabatan: "Pranata Komputer Ahli Muda",
      tanggal_ttd_evaluator: "2026-10-19T14:05:00+07:00",
      ttd_admin_nama: null,
      ttd_admin_nip: null,
      ttd_admin_jabatan: null,
      tanggal_ttd_admin: null,
      penilaian,
      version: 4,
      created_at: "2026-10-18T09:00:00+07:00",
      updated_at: "2026-10-21T09:40:00+07:00",
    };
  })(),
  (() => {
    const penilaian = buatPenilaian([1, 1], [2, 1], [3, 1], [4, 1]);
    return {
      id: 4,
      penyedia_id: 1,
      penyedia: PENYEDIA[0],
      evaluator_id: 1,
      evaluator: { id: 1, name: "Budi Santoso" },
      admin_id: 2,
      admin: ADMINS[0],
      no_kontrak: "KTR/2026/004",
      sifat_pekerjaan: "pengadaan_baru",
      sifat_pekerjaan_lainnya: null,
      ...withRekap(penilaian),
      status: "selesai",
      catatan_revisi: null,
      siklus: 2,
      tempat: "Bandung",
      tanggal_evaluasi: "2026-09-12",
      ttd_evaluator_nama: "Budi Santoso",
      ttd_evaluator_nip: PEGAWAI_NIP[1],
      ttd_evaluator_jabatan: "Pranata Komputer Ahli Muda",
      tanggal_ttd_evaluator: "2026-09-15T11:20:00+07:00",
      ttd_admin_nama: "Siti Rahmawati",
      ttd_admin_nip: PEGAWAI_NIP[2],
      ttd_admin_jabatan: "Kepala Bidang Aplikasi Informatika",
      tanggal_ttd_admin: "2026-09-16T09:05:00+07:00",
      penilaian,
      version: 6,
      created_at: "2026-09-12T08:30:00+07:00",
      updated_at: "2026-09-16T09:05:00+07:00",
    };
  })(),
];

const LOGS: Record<number, Fr021Log[]> = {
  1: [
    {
      id: 1,
      aksi: "dibuat",
      siklus: 1,
      catatan: null,
      total_nilai: null,
      rekomendasi_id: null,
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-10-20T09:00:00+07:00",
    },
  ],
  2: [
    {
      id: 2,
      aksi: "dibuat",
      siklus: 1,
      catatan: null,
      total_nilai: null,
      rekomendasi_id: null,
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-10-24T08:00:00+07:00",
    },
    {
      id: 3,
      aksi: "diajukan",
      siklus: 1,
      catatan: null,
      total_nilai: 360,
      rekomendasi_id: 2,
      rekomendasi: REKOMENDASI[1],
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-10-25T10:12:00+07:00",
      penilaian: EVALUATIONS[1].penilaian,
    },
  ],
  3: [
    {
      id: 4,
      aksi: "dibuat",
      siklus: 1,
      catatan: null,
      total_nilai: null,
      rekomendasi_id: null,
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-10-18T09:00:00+07:00",
    },
    {
      id: 5,
      aksi: "diajukan",
      siklus: 1,
      catatan: null,
      total_nilai: 280,
      rekomendasi_id: 1,
      rekomendasi: REKOMENDASI[0],
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-10-19T14:05:00+07:00",
      penilaian: EVALUATIONS[2].penilaian,
    },
    {
      id: 6,
      aksi: "dikembalikan",
      siklus: 1,
      catatan:
        "Mohon lengkapi bukti penyelesaian ruang lingkup pekerjaan dan tinjau ulang nilai kriteria ketiga.",
      total_nilai: 280,
      rekomendasi_id: 1,
      rekomendasi: REKOMENDASI[0],
      user: { id: 2, name: "Siti Rahmawati" },
      created_at: "2026-10-21T09:40:00+07:00",
    },
  ],
  4: [
    {
      id: 7,
      aksi: "dibuat",
      siklus: 1,
      catatan: null,
      total_nilai: null,
      rekomendasi_id: null,
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-09-12T08:30:00+07:00",
    },
    {
      id: 8,
      aksi: "diajukan",
      siklus: 1,
      catatan: null,
      total_nilai: 360,
      rekomendasi_id: 2,
      rekomendasi: REKOMENDASI[1],
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-09-13T10:00:00+07:00",
      penilaian: buatPenilaian([1, 1], [2, 1], [3, 1], [4, 2]),
    },
    {
      id: 9,
      aksi: "dikembalikan",
      siklus: 1,
      catatan: "Nilai kriteria komunikasi perlu ditinjau kembali.",
      total_nilai: 360,
      rekomendasi_id: 2,
      rekomendasi: REKOMENDASI[1],
      user: { id: 2, name: "Siti Rahmawati" },
      created_at: "2026-09-14T08:15:00+07:00",
    },
    {
      id: 10,
      aksi: "diajukan_ulang",
      siklus: 2,
      catatan: null,
      total_nilai: 400,
      rekomendasi_id: 3,
      rekomendasi: REKOMENDASI[2],
      user: { id: 1, name: "Budi Santoso" },
      created_at: "2026-09-15T11:20:00+07:00",
      penilaian: EVALUATIONS[3].penilaian,
    },
    {
      id: 11,
      aksi: "disetujui",
      siklus: 2,
      catatan: null,
      total_nilai: 400,
      rekomendasi_id: 3,
      rekomendasi: REKOMENDASI[2],
      user: { id: 2, name: "Siti Rahmawati" },
      created_at: "2026-09-16T09:05:00+07:00",
    },
  ],
};

let sequencer = 100;

/* ───────────────────────── Helper ───────────────────────── */

const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

function apiError(
  status: number,
  message: string,
  errors: Fr021Errors = {}
): never {
  throw {
    isAxiosError: true,
    response: { status, data: { message, errors } },
  };
}

/** Pengguna aktif diambil dari localStorage agar mock mengikuti login nyata. */
function currentUser(): { id: number; name: string; role: string } {
  if (typeof window === "undefined") {
    return { id: 1, name: "Budi Santoso", role: "user" };
  }
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw) as {
        id?: number;
        name?: string;
        role?: string;
      };
      return {
        id: Number(parsed.id) || 1,
        name: String(parsed.name || "Budi Santoso"),
        role: String(parsed.role || "user"),
      };
    }
  } catch {
    /* Abaikan data lokal yang rusak. */
  }
  return { id: 1, name: "Budi Santoso", role: "user" };
}

function permissionsOf(record: StoredEvaluasi): Fr021Evaluasi["permissions"] {
  const me = currentUser();
  const isOwner = record.evaluator_id === me.id;
  const isAssignedAdmin = record.admin_id === me.id;
  const editable = record.status === "draft" || record.status === "revisi";
  return {
    can_update: isOwner && editable,
    can_delete: isOwner && record.status === "draft",
    can_ajukan: isOwner && editable,
    can_approve: isAssignedAdmin && record.status === "diajukan",
    can_export: record.status === "diajukan" || record.status === "selesai",
  };
}

function present(record: StoredEvaluasi): Fr021Evaluasi {
  return { ...record, permissions: permissionsOf(record) };
}

function findEvaluasi(id: number): StoredEvaluasi {
  const found = EVALUATIONS.find((item) => item.id === id);
  if (!found) apiError(404, "Evaluasi tidak ditemukan atau bukan milik Anda.");
  return found;
}

function validateIdentifikasi(payload: Fr021IdentifikasiPayload): void {
  const errors: Fr021Errors = {};
  if (!payload.penyedia_id && !payload.penyedia_nama?.trim()) {
    errors.penyedia_id = ["Penyedia jasa wajib dipilih atau diisi."];
  }
  if (!payload.no_kontrak?.trim()) {
    errors.no_kontrak = ["Nomor kontrak wajib diisi."];
  }
  if (!payload.contact_person?.trim()) {
    errors.contact_person = ["Contact person wajib diisi."];
  }
  if (!payload.email?.trim()) {
    errors.email = ["Email wajib diisi."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = ["Format email tidak valid."];
  }
  if (!payload.tanggal_evaluasi) {
    errors.tanggal_evaluasi = ["Tanggal evaluasi wajib diisi."];
  }
  if (
    payload.sifat_pekerjaan === "lainnya" &&
    !payload.sifat_pekerjaan_lainnya?.trim()
  ) {
    errors.sifat_pekerjaan_lainnya = ["Uraian pekerjaan lainnya wajib diisi."];
  }
  if (Object.keys(errors).length > 0) {
    apiError(422, "Periksa kembali data identifikasi.", errors);
  }
}

function applyIdentifikasi(
  record: StoredEvaluasi,
  payload: Fr021IdentifikasiPayload
): void {
  let penyedia = PENYEDIA.find((p) => p.id === payload.penyedia_id);

  if (!penyedia && payload.penyedia_nama?.trim()) {
    penyedia = {
      id: ++sequencer,
      nama_penyedia: payload.penyedia_nama.trim(),
      contact_person: payload.contact_person.trim(),
      email: payload.email.trim(),
    };
    PENYEDIA.push(penyedia);
  } else if (penyedia) {
    // Perubahan contact person/email ikut memperbarui master penyedia (FR-1.2).
    penyedia.contact_person = payload.contact_person.trim();
    penyedia.email = payload.email.trim();
  }

  if (!penyedia) apiError(422, "Penyedia jasa tidak ditemukan.");

  record.penyedia_id = penyedia.id;
  record.penyedia = penyedia;
  record.no_kontrak = payload.no_kontrak.trim();
  record.sifat_pekerjaan = payload.sifat_pekerjaan;
  record.sifat_pekerjaan_lainnya =
    payload.sifat_pekerjaan === "lainnya"
      ? payload.sifat_pekerjaan_lainnya.trim()
      : null;
  record.tanggal_evaluasi = payload.tanggal_evaluasi;
  record.tempat = payload.tempat?.trim() || null;
}

/* ───────────────────────── API mock ───────────────────────── */

export async function getFr021List(
  params: Fr021ListParams
): Promise<Fr021ListResponse> {
  await sleep();
  const me = currentUser();
  const q = (params.q ?? "").trim().toLowerCase();

  let rows = EVALUATIONS.filter((row) =>
    me.role === "admin" ? true : row.evaluator_id === me.id
  );

  if (q) {
    rows = rows.filter(
      (row) =>
        row.penyedia?.nama_penyedia.toLowerCase().includes(q) ||
        row.no_kontrak.toLowerCase().includes(q)
    );
  }
  if (params.sifat) {
    rows = rows.filter((row) => row.sifat_pekerjaan === params.sifat);
  }
  if (params.status) {
    rows = rows.filter((row) => row.status === params.status);
  }

  const summary: Fr021ListSummary = {
    total: rows.length,
    draft: rows.filter((r) => r.status === "draft").length,
    diajukan: rows.filter((r) => r.status === "diajukan").length,
    revisi: rows.filter((r) => r.status === "revisi").length,
    selesai: rows.filter((r) => r.status === "selesai").length,
  };

  const perPage = params.per_page ?? 10;
  const page = params.page ?? 1;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  rows.sort((a, b) => b.id - a.id);

  return {
    data: rows.slice(start, start + perPage).map(present),
    summary,
    meta: {
      current_page: page,
      last_page: lastPage,
      total,
      per_page: perPage,
    },
  };
}

export async function getFr021(id: number): Promise<Fr021Evaluasi> {
  await sleep();
  return present(findEvaluasi(id));
}

export async function createFr021(
  payload: Fr021IdentifikasiPayload
): Promise<Fr021Evaluasi> {
  await sleep();
  validateIdentifikasi(payload);
  const me = currentUser();
  const record: StoredEvaluasi = {
    id: ++sequencer,
    penyedia_id: 0,
    penyedia: null,
    evaluator_id: me.id,
    evaluator: { id: me.id, name: me.name },
    admin_id: null,
    admin: null,
    no_kontrak: "",
    sifat_pekerjaan: "pengadaan_baru",
    sifat_pekerjaan_lainnya: null,
    total_nilai: null,
    rekomendasi_id: null,
    rekomendasi: null,
    status: "draft",
    catatan_revisi: null,
    siklus: 1,
    tempat: null,
    tanggal_evaluasi: payload.tanggal_evaluasi,
    ttd_evaluator_nama: null,
    ttd_evaluator_nip: null,
    ttd_evaluator_jabatan: null,
    tanggal_ttd_evaluator: null,
    ttd_admin_nama: null,
    ttd_admin_nip: null,
    ttd_admin_jabatan: null,
    tanggal_ttd_admin: null,
    penilaian: [],
    version: 1,
    created_at: now(),
    updated_at: now(),
  };
  applyIdentifikasi(record, payload);
  EVALUATIONS.push(record);
  LOGS[record.id] = [
    {
      id: ++sequencer,
      aksi: "dibuat",
      siklus: 1,
      catatan: null,
      total_nilai: null,
      rekomendasi_id: null,
      user: { id: me.id, name: me.name },
      created_at: now(),
    },
  ];
  return present(record);
}

export async function updateFr021Identifikasi(
  id: number,
  payload: Fr021IdentifikasiPayload
): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  if (record.status !== "draft") {
    apiError(409, "Identifikasi hanya dapat diubah saat status Draft.");
  }
  validateIdentifikasi(payload);
  applyIdentifikasi(record, payload);
  record.version += 1;
  record.updated_at = now();
  return present(record);
}

export async function saveFr021Penilaian(
  id: number,
  payload: Fr021PenilaianPayload
): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  if (record.status !== "draft" && record.status !== "revisi") {
    apiError(409, "Penilaian tidak dapat diubah pada status ini.");
  }
  const items = payload.penilaian ?? [];
  if (items.length !== KRITERIA.length) {
    apiError(422, "Seluruh 4 kriteria wajib dinilai.", {
      penilaian: ["Seluruh 4 kriteria wajib dinilai sebelum perhitungan."],
    });
  }
  record.penilaian = items
    .filter((item) => KRITERIA.some((k) => k.id === item.kriteria_id))
    .map((item) => ({
      kriteria_id: item.kriteria_id,
      skala_id: item.skala_id,
      skor: skorOf(item.skala_id),
    }));
  record.version += 1;
  record.updated_at = now();
  return present(record);
}

export async function hitungFr021(id: number): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  if (record.penilaian.length !== KRITERIA.length) {
    apiError(422, "Seluruh 4 kriteria wajib dinilai.", {
      penilaian: ["Seluruh 4 kriteria wajib dinilai sebelum perhitungan."],
    });
  }
  const total = totalOf(record.penilaian);
  const rekomendasi = rekomendasiOf(total);
  if (!rekomendasi) {
    apiError(422, "Rentang rekomendasi tidak ditemukan.");
  }
  record.total_nilai = total;
  record.rekomendasi_id = rekomendasi.id;
  record.rekomendasi = rekomendasi;
  record.version += 1;
  record.updated_at = now();
  return present(record);
}

export async function ajukanFr021(
  id: number,
  payload: Fr021AjukanPayload
): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  if (record.status !== "draft" && record.status !== "revisi") {
    apiError(409, "Evaluasi tidak dapat diajukan pada status ini.");
  }
  if (!payload.admin_id) {
    apiError(422, "Atasan wajib dipilih.", {
      admin_id: ["Atasan (Mengetahui) wajib dipilih."],
    });
  }
  if (payload.admin_id === record.evaluator_id) {
    apiError(422, "Atasan tidak boleh sama dengan Evaluator.");
  }
  if (record.total_nilai === null) {
    apiError(409, "Hitung nilai terlebih dahulu sebelum mengajukan.");
  }

  const me = currentUser();
  const rekomendasi = rekomendasiOf(record.total_nilai);
  record.admin_id = payload.admin_id;
  record.admin = ADMINS.find((a) => a.id === payload.admin_id) ?? null;
  record.status = "diajukan";
  record.catatan_revisi = null;
  record.ttd_evaluator_nama = me.name;
  record.ttd_evaluator_nip = PEGAWAI_NIP[me.id] ?? null;
  record.ttd_evaluator_jabatan = "Pranata Komputer";
  record.tanggal_ttd_evaluator = now();
  record.version += 1;
  record.updated_at = now();

  const aksi = (LOGS[id] ?? []).some((log) => log.aksi === "dikembalikan")
    ? "diajukan_ulang"
    : "diajukan";
  if (aksi === "diajukan_ulang") record.siklus += 1;

  LOGS[id] = [
    ...(LOGS[id] ?? []),
    {
      id: ++sequencer,
      aksi,
      siklus: record.siklus,
      catatan: null,
      total_nilai: record.total_nilai,
      rekomendasi_id: record.rekomendasi_id,
      rekomendasi: rekomendasi ?? undefined,
      user: { id: me.id, name: me.name },
      created_at: now(),
      penilaian: record.penilaian,
    },
  ];

  return present(record);
}

export async function setujuiFr021(id: number): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  const me = currentUser();
  if (record.status !== "diajukan") {
    apiError(409, "Evaluasi tidak sedang menunggu persetujuan.");
  }
  if (record.admin_id !== me.id) {
    apiError(403, "Hanya Atasan yang ditugaskan yang dapat menyetujui.");
  }
  const rekomendasi = rekomendasiOf(record.total_nilai ?? 0);
  record.status = "selesai";
  record.ttd_admin_nama = me.name;
  record.ttd_admin_nip = PEGAWAI_NIP[me.id] ?? null;
  record.ttd_admin_jabatan = "Kepala Bidang";
  record.tanggal_ttd_admin = now();
  record.version += 1;
  record.updated_at = now();

  LOGS[id] = [
    ...(LOGS[id] ?? []),
    {
      id: ++sequencer,
      aksi: "disetujui",
      siklus: record.siklus,
      catatan: null,
      total_nilai: record.total_nilai,
      rekomendasi_id: record.rekomendasi_id,
      rekomendasi: rekomendasi ?? undefined,
      user: { id: me.id, name: me.name },
      created_at: now(),
    },
  ];

  return present(record);
}

export async function kembalikanFr021(
  id: number,
  payload: Fr021KembalikanPayload
): Promise<Fr021Evaluasi> {
  await sleep();
  const record = findEvaluasi(id);
  const me = currentUser();
  if (record.status !== "diajukan") {
    apiError(409, "Evaluasi tidak sedang menunggu persetujuan.");
  }
  if (record.admin_id !== me.id) {
    apiError(403, "Hanya Atasan yang ditugaskan yang dapat mengembalikan.");
  }
  if (!payload.catatan?.trim()) {
    apiError(422, "Catatan tinjauan wajib diisi.", {
      catatan: ["Catatan tinjauan wajib diisi saat mengembalikan evaluasi."],
    });
  }
  const rekomendasi = rekomendasiOf(record.total_nilai ?? 0);
  record.status = "revisi";
  record.catatan_revisi = payload.catatan.trim();
  record.version += 1;
  record.updated_at = now();

  LOGS[id] = [
    ...(LOGS[id] ?? []),
    {
      id: ++sequencer,
      aksi: "dikembalikan",
      siklus: record.siklus,
      catatan: payload.catatan.trim(),
      total_nilai: record.total_nilai,
      rekomendasi_id: record.rekomendasi_id,
      rekomendasi: rekomendasi ?? undefined,
      user: { id: me.id, name: me.name },
      created_at: now(),
    },
  ];

  return present(record);
}

export async function getFr021Riwayat(id: number): Promise<Fr021Log[]> {
  await sleep();
  findEvaluasi(id);
  return [...(LOGS[id] ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
}

export async function getFr021Snapshot(
  id: number,
  logId: number
): Promise<Fr021Log> {
  await sleep();
  findEvaluasi(id);
  const log = (LOGS[id] ?? []).find((item) => item.id === logId);
  if (!log) apiError(404, "Snapshot penilaian tidak ditemukan.");
  return log;
}

export async function deleteFr021(id: number): Promise<void> {
  await sleep();
  const record = findEvaluasi(id);
  const me = currentUser();
  if (record.evaluator_id !== me.id) {
    apiError(403, "Hanya pemilik evaluasi yang dapat menghapus.");
  }
  if (record.status !== "draft") {
    apiError(409, "Hanya evaluasi berstatus Draft yang dapat dihapus.");
  }
  const index = EVALUATIONS.findIndex((item) => item.id === id);
  EVALUATIONS.splice(index, 1);
  delete LOGS[id];
}

export async function getFr021Master(): Promise<Fr021Master> {
  await sleep(120);
  return MASTER;
}

export async function getFr021Admins(): Promise<Fr021UserRef[]> {
  await sleep(120);
  const me = currentUser();
  return ADMINS.filter((admin) => admin.id !== me.id);
}

export async function lookupFr021Penyedia(q: string): Promise<Fr021Penyedia[]> {
  await sleep(120);
  const needle = (q ?? "").trim().toLowerCase();
  if (!needle) return PENYEDIA.slice(0, 8);
  return PENYEDIA.filter((p) =>
    p.nama_penyedia.toLowerCase().includes(needle)
  ).slice(0, 8);
}

export async function createFr021Penyedia(
  payload: Fr021PenyediaPayload
): Promise<Fr021Penyedia> {
  await sleep(160);
  if (!payload.nama_penyedia?.trim()) {
    apiError(422, "Nama penyedia wajib diisi.", {
      nama_penyedia: ["Nama penyedia wajib diisi."],
    });
  }
  const penyedia: Fr021Penyedia = {
    id: ++sequencer,
    nama_penyedia: payload.nama_penyedia.trim(),
    contact_person: payload.contact_person?.trim() || null,
    email: payload.email?.trim() || null,
  };
  PENYEDIA.push(penyedia);
  return penyedia;
}
