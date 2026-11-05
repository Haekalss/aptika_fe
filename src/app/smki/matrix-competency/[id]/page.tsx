"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Info,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getMatrixDetail,
  getMatrixLookup,
  updateMatrix,
  calcGap,
  standardForPeran,
  buildDefaultRoles,
  buildDefaultEmployees,
  DEFAULT_COMPETENCIES,
  DEFAULT_EMPLOYEE_LEVELS,
  DEFAULT_KORDINATOR_LEVELS,
  DEFAULT_SMKI_UNITS,
  DEFAULT_TEAM_TEKNIS_LEVELS,
  errMsg,
  type MatrixDocument,
  type MatrixEmployeeRow,
  type MatrixLookup,
  type MatrixRoleRow,
} from "@/services/smki/matrixCompetencyService";
import { exportMatrixCompetencyXlsx } from "@/utils/smkiMatrixCompetencyXlsx";

const K006_TEXT =
  "Kemampuan yang terdapat pada K-006 Kebijakan Standar Kompetensi Sistem Manajemen Keamanan Informasi";

const LEVEL_META: {
  level: number;
  short: string;
  desc: string;
  pillCls: string;
  selectCls: string;
}[] = [
  {
    level: 0,
    short: "Lv 0 • Tidak Perlu",
    desc: "Tidak perlu memiliki pengetahuan",
    pillCls:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    selectCls:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    level: 1,
    short: "Lv 1 • Dasar",
    desc: "Harus memiliki pengetahuan dasar",
    pillCls:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300",
    selectCls:
      "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  },
  {
    level: 2,
    short: "Lv 2 • Didukung",
    desc: "Harus dilakukan dengan dukungan",
    pillCls:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300",
    selectCls:
      "border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200",
  },
  {
    level: 3,
    short: "Lv 3 • Mandiri",
    desc: "Harus memiliki pengetahuan & melakukannya secara mandiri",
    pillCls:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300",
    selectCls:
      "border-indigo-200 bg-indigo-50/90 text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200",
  },
  {
    level: 4,
    short: "Lv 4 • Mahir & Melatih",
    desc: "Harus pandai teori dan praktis dan bisa melatih",
    pillCls:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300",
    selectCls:
      "border-emerald-300 bg-emerald-100/90 text-emerald-950 font-extrabold dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  },
];

function getLevelSelectCls(v: number | null | undefined): string {
  const idx = Math.min(4, Math.max(0, Number(v ?? 0)));
  return LEVEL_META[idx]?.selectCls ?? LEVEL_META[0].selectCls;
}

function getGapBadgeCls(g: number | null | undefined): string {
  if (g === null || g === undefined) {
    return "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40";
  }
  if (g < 0) {
    return "border-rose-200 bg-rose-50 text-rose-700 font-extrabold dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300";
  }
  if (g === 0) {
    return "border-slate-200/80 bg-slate-100/80 text-slate-600 font-semibold dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300";
}

function shortCompCode(label: string | undefined, index: number): string {
  const t = (label ?? "").trim();
  if (!t || /^K-\d+$/i.test(t)) {
    return `K-${String(index + 1).padStart(2, "0")}`;
  }
  return t.length > 10 ? `K-${String(index + 1).padStart(2, "0")}` : t;
}

function fullCompTooltip(label: string | undefined, index: number): string {
  const code = `K-${String(index + 1).padStart(2, "0")}`;
  const t = (label ?? "").trim();
  if (!t || /^K-\d+$/i.test(t)) {
    return `${code} — ${K006_TEXT}`;
  }
  return `${code} — ${t}`;
}

const TABS = [
  { id: "roles", label: "Standar Peran (Roles)", icon: ShieldCheck },
  { id: "employees", label: "Kompetensi Pegawai", icon: Users },
  { id: "gap", label: "Gap Analisis", icon: Layers },
  { id: "training", label: "Rencana Training", icon: GraduationCap },
  { id: "dokumen", label: "Daftar Kompetensi (K-006)", icon: Building2 },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function MatrixDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [doc, setDoc] = useState<MatrixDocument | null>(null);
  const [lookup, setLookup] = useState<MatrixLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<TabId>("roles");
  const [onlyNegativeGap, setOnlyNegativeGap] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMatrixDetail(id), getMatrixLookup()])
      .then(([d, l]) => {
        const normalized = normalizeDoc(d);
        setDoc(normalized);
        setSavedSnapshot(snapshotOf(normalized));
        setLookup(l);
      })
      .catch(() => {
        toast.error("Dokumen tidak ditemukan.");
        router.push("/smki/matrix-competency");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const isDirty = useMemo(
    () => !!doc && savedSnapshot !== null && snapshotOf(doc) !== savedSnapshot,
    [doc, savedSnapshot]
  );

  // Cegah perubahan hilang saat tab browser ditutup / refresh.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const goBack = () => {
    if (
      isDirty &&
      !window.confirm(
        "Ada perubahan yang belum disimpan. Keluar dari editor tanpa menyimpan?"
      )
    ) {
      return;
    }
    router.push("/smki/matrix-competency");
  };

  const discardChanges = async () => {
    if (
      !window.confirm(
        "Buang semua perubahan yang belum disimpan dan muat ulang data tersimpan?"
      )
    ) {
      return;
    }
    try {
      const d = await getMatrixDetail(id);
      const normalized = normalizeDoc(d);
      setDoc(normalized);
      setSavedSnapshot(snapshotOf(normalized));
      toast.success("Perubahan dibuang, data tersimpan dimuat ulang.");
    } catch {
      toast.error("Gagal memuat ulang data.");
    }
  };

  const isDefault16 = useMemo(() => {
    if (!doc) return true;
    return (
      doc.competencies.length === 16 &&
      doc.competencies.every(
        (c, i) => c === `K-${String(i + 1).padStart(2, "0")}`
      )
    );
  }, [doc]);

  // Sesuai struktur FR-031:
  // - Roles Matrix (2): 15 kolom kompetensi (K-01 s.d. K-15)
  // - Employee Matrix: 16 kolom kompetensi (K-01 s.d. K-16)
  // - Gap Analisis: 15 kolom kompetensi (K-01 s.d. K-15)
  const nRoles = doc ? (isDefault16 ? 15 : doc.competencies.length) : 15;
  const nEmp = doc ? doc.competencies.length : 16;
  const nGap = doc ? (isDefault16 ? 15 : doc.competencies.length) : 15;

  const displayEmployees = useMemo<MatrixEmployeeRow[]>(() => {
    if (!doc) return [];
    if (doc.employees.length > 0) return doc.employees;
    return buildDefaultEmployees(doc.competencies.length);
  }, [doc]);

  const gaps = useMemo(() => {
    if (!doc) return new Map<number, (number | null)[]>();
    const map = new Map<number, (number | null)[]>();
    displayEmployees.forEach((e, idx) => {
      const std =
        standardForPeran(doc.roles, e.peran, doc.nama_unit_kerja) ??
        (e.peran === "Kordinator"
          ? DEFAULT_KORDINATOR_LEVELS
          : DEFAULT_TEAM_TEKNIS_LEVELS);
      map.set(idx, calcGap(e.levels.slice(0, nGap), std.slice(0, nGap)));
    });
    return map;
  }, [doc, displayEmployees, nGap]);

  const { gapCount, employeesWithGap } = useMemo(() => {
    let totalPoints = 0;
    let empCount = 0;
    gaps.forEach((g) => {
      const negs = g.filter((v) => (v ?? 0) < 0).length;
      totalPoints += negs;
      if (negs > 0) empCount += 1;
    });
    return { gapCount: totalPoints, employeesWithGap: empCount };
  }, [gaps]);

  const roleGroups = useMemo(() => {
    if (!doc) return [];
    const groups: {
      unit: string;
      items: { row: MatrixRoleRow; index: number }[];
    }[] = [];
    doc.roles.forEach((row, index) => {
      const u = row.unit_label || "SMKI Bidang.....";
      const found = groups.find((g) => g.unit === u);
      if (found) found.items.push({ row, index });
      else groups.push({ unit: u, items: [{ row, index }] });
    });
    return groups;
  }, [doc]);

  const filteredRoleGroups = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roleGroups;
    return roleGroups.filter((g) => g.unit.toLowerCase().includes(q));
  }, [roleGroups, roleSearch]);

  const setField = (k: "nama_unit_kerja", v: string) =>
    setDoc((d) => (d ? { ...d, [k]: v } : d));

  const setComp = (i: number, v: string) =>
    setDoc((d) =>
      d
        ? {
            ...d,
            competencies: d.competencies.map((c, idx) => (idx === i ? v : c)),
          }
        : d
    );

  const resizeComps = (next: string[]) =>
    setDoc((d) => {
      if (!d) return d;
      const len = next.length;
      return {
        ...d,
        competencies: next,
        roles: d.roles.map((r) => ({ ...r, levels: fit(r.levels, len) })),
        employees: d.employees.map((e) => ({
          ...e,
          levels: fit(e.levels, len),
        })),
      };
    });

  const updateRole = (i: number, patch: Partial<MatrixRoleRow>) =>
    setDoc((d) =>
      d
        ? {
            ...d,
            roles: d.roles.map((r, idx) =>
              idx === i ? { ...r, ...patch } : r
            ),
          }
        : d
    );

  const updateUnitNameInGroup = (oldUnit: string, newUnit: string) =>
    setDoc((d) =>
      d
        ? {
            ...d,
            roles: d.roles.map((r) =>
              r.unit_label === oldUnit ? { ...r, unit_label: newUnit } : r
            ),
          }
        : d
    );

  const removeUnitGroup = (unitName: string) =>
    setDoc((d) =>
      d
        ? {
            ...d,
            roles: d.roles.filter((r) => r.unit_label !== unitName),
          }
        : d
    );

  const updateEmp = (i: number, patch: Partial<MatrixEmployeeRow>) =>
    setDoc((d) => {
      if (!d) return d;
      const baseList =
        d.employees.length > 0
          ? d.employees
          : buildDefaultEmployees(d.competencies.length);
      return {
        ...d,
        employees: baseList.map((e, idx) =>
          idx === i ? { ...e, ...patch } : e
        ),
      };
    });

  const pickPegawai = (i: number, asetId: string) =>
    setDoc((d) => {
      if (!d) return d;
      const baseList =
        d.employees.length > 0
          ? d.employees
          : buildDefaultEmployees(d.competencies.length);
      if (!asetId)
        return {
          ...d,
          employees: baseList.map((e, idx) =>
            idx === i ? { ...e, aset_sdm_id: null } : e
          ),
        };
      const p = lookup?.pegawai.find((x) => String(x.id) === asetId);
      if (!p) return d;
      return {
        ...d,
        employees: baseList.map((e, idx) =>
          idx === i
            ? {
                ...e,
                aset_sdm_id: p.id,
                nama: p.nama,
                nip: p.nip,
                jabatan: p.jabatan,
              }
            : e
        ),
      };
    });

  const addUnitGroup = () =>
    setDoc((d) => {
      if (!d) return d;
      const len = d.competencies.length;
      const newUnit = `SMKI Bidang Baru ${roleGroups.length + 1}`;
      return {
        ...d,
        roles: [
          ...d.roles,
          {
            unit_label: newUnit,
            peran: "Kordinator",
            levels: fit(DEFAULT_KORDINATOR_LEVELS, len),
          },
          {
            unit_label: newUnit,
            peran: "Team Teknis",
            levels: fit(DEFAULT_TEAM_TEKNIS_LEVELS, len),
          },
        ],
      };
    });

  const resetStandardRoles = () =>
    setDoc((d) => {
      if (!d) return d;
      toast.success("Standar 7 Bidang SMKI (FR-031) berhasil dimuat.");
      return {
        ...d,
        roles: buildDefaultRoles(d.competencies.length),
      };
    });

  const resetDefaultEmployees = () =>
    setDoc((d) => {
      if (!d) return d;
      toast.success("6 baris standar Employee Matrix FR-031 berhasil dimuat.");
      return {
        ...d,
        employees: buildDefaultEmployees(d.competencies.length),
      };
    });

  const addEmployee = () =>
    setDoc((d) => {
      if (!d) return d;
      const baseList =
        d.employees.length > 0
          ? d.employees
          : buildDefaultEmployees(d.competencies.length);
      return {
        ...d,
        employees: [
          ...baseList,
          {
            nama: "",
            jabatan: "Team Teknis",
            peran: "Team Teknis",
            levels: fit(
              DEFAULT_EMPLOYEE_LEVELS[1].levels,
              d.competencies.length
            ),
            usulan_training: "",
          },
        ],
      };
    });

  const addTraining = () =>
    setDoc((d) =>
      d
        ? {
            ...d,
            trainings: [
              ...d.trainings,
              { nama: "", jabatan: "", usulan_training: "" },
            ],
          }
        : d
    );

  const generateTraining = () => {
    if (!doc) return;
    const rows = displayEmployees
      .map((e, idx) => ({ e, idx, gap: gaps.get(idx) ?? [] }))
      .filter(({ gap }) => gap.some((g) => (g ?? 0) < 0))
      .map(({ e, idx, gap }) => {
        const need = gap
          .map((g, i) =>
            (g ?? 0) < 0 ? shortCompCode(doc.competencies[i], i) : null
          )
          .filter(Boolean)
          .join(", ");
        return {
          nama: e.nama.trim() || `${e.peran} #${idx + 1}`,
          jabatan: e.jabatan.trim() || e.peran,
          usulan_training:
            e.usulan_training?.trim() ||
            (need
              ? `Penguatan kompetensi SMKI (${need})`
              : "Pelatihan kompetensi SMKI"),
        };
      });
    if (!rows.length) {
      toast("Seluruh pegawai sudah memenuhi standar (tidak ada gap negatif).");
      return;
    }
    setDoc((d) => (d ? { ...d, trainings: [...d.trainings, ...rows] } : d));
    setTab("training");
    toast.success(`${rows.length} usulan training berhasil ditarik dari Gap Analisis.`);
  };

  const save = async () => {
    if (!doc) return;
    const comps = doc.competencies.map((c) => c.trim()).filter(Boolean);
    if (!comps.length) return toast.error("Minimal 1 kompetensi wajib diisi.");
    for (const [i, r] of doc.roles.entries()) {
      if (!r.unit_label.trim())
        return toast.error(`Standar Peran baris ${i + 1}: nama bidang wajib diisi.`);
    }
    setSaving(true);
    try {
      const saved = await updateMatrix(doc.id, {
        nama_unit_kerja: doc.nama_unit_kerja?.trim() || null,
        competencies: comps,
        roles: doc.roles.map((r) => ({
          unit_label: r.unit_label.trim(),
          peran: r.peran,
          levels: r.levels.map(level0),
        })),
        employees: displayEmployees.map((e) => ({
          aset_sdm_id: e.aset_sdm_id ?? null,
          nama: e.nama.trim(),
          nip: e.nip?.trim() || null,
          jabatan: e.jabatan.trim() || e.peran,
          peran: e.peran,
          levels: e.levels.map(level0),
          usulan_training: e.usulan_training?.trim() || null,
        })),
        trainings: doc.trainings
          .filter((t) => t.nama.trim() || t.usulan_training.trim())
          .map((t) => ({
            nama: t.nama.trim() || "-",
            jabatan: t.jabatan.trim() || "-",
            usulan_training: t.usulan_training.trim() || "-",
          })),
      });
      const normalized = normalizeDoc(saved);
      setDoc(normalized);
      setSavedSnapshot(snapshotOf(normalized));
      toast.success("Matriks kompetensi berhasil disimpan.");
      router.push("/smki/matrix-competency");
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan matriks."));
    } finally {
      setSaving(false);
    }
  };

  const doExport = async () => {
    if (!doc) return;
    setExporting(true);
    try {
      await exportMatrixCompetencyXlsx({
        ...doc,
        employees: displayEmployees,
      });
      toast.success("File Excel FR-031 berhasil diunduh.");
    } catch {
      toast.error("Gagal mengekspor Excel.");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !doc) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          <Loader2 size={24} className="mx-auto mb-2 animate-spin text-emerald-600" />
          Memuat dokumen matriks kompetensi...
        </div>
      </ServiceRouteGuard>
    );
  }

  const unitTitle = doc.nama_unit_kerja?.trim() || "SMKI Bidang (Semua Unit)";

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex min-w-0 flex-col gap-4 pb-6">
        {/* ===================================================================
            HEADER & UNIT KERJA SELECTOR
        =================================================================== */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={goBack}
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                    FR-031
                  </span>
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Matriks Kompetensi SMKI — {unitTitle}
                  </h1>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Kelola standar kompetensi peran, penilaian pegawai, analisis kesenjangan (gap), dan usulan training dalam satu tampilan terpadu.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isDirty && (
                <button
                  type="button"
                  onClick={discardChanges}
                  title="Buang semua perubahan yang belum disimpan"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw size={14} /> Buang Perubahan
                </button>
              )}
              <button
                type="button"
                onClick={doExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                {exporting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={15} />
                )}
                Ekspor Excel FR-031 (.xlsx)
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || !isDirty}
                title={isDirty ? "Simpan perubahan lalu kembali ke daftar" : "Tidak ada perubahan yang perlu disimpan"}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Simpan Perubahan
                {isDirty && !saving && (
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" title="Ada perubahan belum disimpan" />
                )}
              </button>
            </div>
          </div>

          {/* Unit Kerja Active Bar + Quick Summary KPI */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/50 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Unit Kerja / Bidang SMKI Aktif (Acuan Employee & Gap Analisis)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Building2 size={15} className="shrink-0 text-emerald-600" />
                <input
                  value={doc.nama_unit_kerja ?? ""}
                  onChange={(e) => setField("nama_unit_kerja", e.target.value)}
                  list="mx-unit-global"
                  placeholder="Pilih atau ketik nama bidang (cth. SMKI Bidang Aplikasi Informatika)..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <datalist id="mx-unit-global">
                  {DEFAULT_SMKI_UNITS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                  {lookup?.unit_kerja.map((u) => (
                    <option key={u.id} value={u.nama} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Standar Peran</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {roleGroups.length}{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    Bidang ({doc.roles.length} peran)
                  </span>
                </p>
              </div>
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Pegawai Dinilai</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {displayEmployees.length}{" "}
                  <span className="text-xs font-semibold text-slate-500">Baris</span>
                </p>
              </div>
              <Users size={20} className="text-blue-600" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total Titik Gap</p>
                <p
                  className={`text-lg font-black ${
                    gapCount > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {gapCount}{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    ({employeesWithGap} pegawai)
                  </span>
                </p>
              </div>
              {gapCount > 0 ? (
                <AlertTriangle size={20} className="text-rose-500" />
              ) : (
                <CheckCircle2 size={20} className="text-emerald-600" />
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            SKALA KOMPETENSI LEGEND BAR (LEVEL 0 - 4)
        =================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Info size={15} className="text-emerald-600" />
            <span>Definisi Skala Kompetensi (K-006):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {LEVEL_META.map((m) => (
              <span
                key={m.level}
                title={m.desc}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${m.pillCls}`}
              >
                <span className="font-extrabold">{m.level}</span>
                <span className="opacity-75">—</span>
                <span>{m.desc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ===================================================================
            NAVIGATION TABS
        =================================================================== */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <Icon size={15} />
                <span>{t.label}</span>
                {t.id === "roles" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {roleGroups.length}
                  </span>
                )}
                {t.id === "employees" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {displayEmployees.length}
                  </span>
                )}
                {t.id === "gap" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      gapCount > 0
                        ? active
                          ? "bg-rose-500 text-white"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : active
                          ? "bg-emerald-800 text-emerald-100"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {gapCount > 0 ? `${gapCount} Gap` : "Sesuai"}
                  </span>
                )}
                {t.id === "training" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {doc.trainings.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            TAB 1: STANDAR PERAN (ROLES MATRIX)
        =================================================================== */}
        {tab === "roles" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Standar Kompetensi Peran per Bidang SMKI
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Nilai target level kompetensi (<code className="font-mono">0–4</code>) untuk peran{" "}
                  <strong>Kordinator</strong> dan <strong>Team Teknis</strong> pada setiap Bidang ({nRoles} kompetensi).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Cari bidang SMKI..."
                  className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={resetStandardRoles}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw size={13} /> Reset Default 7 Bidang
                </button>
                <button
                  type="button"
                  onClick={addUnitGroup}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                >
                  <Plus size={14} /> Tambah Bidang
                </button>
              </div>
            </div>

            <p className="border-b border-slate-100 px-5 pb-2 pt-2 text-[11px] text-slate-400 dark:border-slate-800 md:hidden">
              Geser tabel ke kanan untuk melihat semua kolom kompetensi.
            </p>
            <div className="max-h-[62vh] overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-left text-xs" aria-label="Standar kompetensi peran per bidang SMKI">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <th className="sticky left-0 top-0 z-30 min-w-[260px] bg-slate-100 px-4 py-3 text-xs font-extrabold dark:bg-slate-800">
                      Bidang SMKI / Peran
                    </th>
                    {Array.from({ length: nRoles }).map((_, i) => (
                      <th
                        key={i}
                        title={fullCompTooltip(doc.competencies[i], i)}
                        className="sticky top-0 z-20 min-w-[52px] cursor-help border-l border-slate-200/70 bg-slate-100 px-1.5 py-2.5 text-center font-mono text-[11px] font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <div className="flex flex-col items-center">
                          <span>{shortCompCode(doc.competencies[i], i)}</span>
                          <span className="text-[9px] font-normal text-slate-400">
                            #{i + 1}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="sticky top-0 z-20 w-12 border-l border-slate-200/70 bg-slate-100 px-2 py-2.5 text-center text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRoleGroups.map((group) => (
                    <Fragment key={group.unit}>
                      {/* Group Header Row: Nama Bidang */}
                      <tr className="bg-emerald-50 dark:bg-emerald-950/30">
                        <td
                          colSpan={nRoles + 1}
                          className="sticky left-0 z-10 bg-emerald-50 px-4 py-2 dark:bg-emerald-950"
                        >
                          <div className="flex items-center gap-2">
                            <Building2
                              size={14}
                              className="shrink-0 text-emerald-700 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            <input
                              value={group.unit}
                              aria-label={`Nama bidang untuk grup ${group.unit}`}
                              onChange={(e) =>
                                updateUnitNameInGroup(group.unit, e.target.value)
                              }
                              className="w-full max-w-md rounded-lg border border-transparent bg-transparent px-2 py-0.5 text-xs font-extrabold text-slate-900 transition hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none dark:text-white dark:focus:bg-slate-800"
                              title="Klik untuk mengubah nama bidang"
                            />
                          </div>
                        </td>
                        <td className="bg-emerald-50 px-2 py-2 text-center dark:bg-emerald-950">
                          <button
                            type="button"
                            title={`Hapus bidang ${group.unit} beserta standarnya`}
                            aria-label={`Hapus bidang ${group.unit}`}
                            onClick={() => setUnitToDelete(group.unit)}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>

                      {/* Role Rows under this Bidang */}
                      {group.items.map(({ row, index }) => (
                        <tr
                          key={index}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="sticky left-0 z-10 bg-white px-4 py-2 pl-9 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                  row.peran === "Kordinator"
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                    : "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                                }`}
                              >
                                {row.peran}
                              </span>
                            </div>
                          </td>
                          {Array.from({ length: nRoles }).map((_, j) => {
                            const val = row.levels[j] ?? 0;
                            return (
                              <td
                                key={j}
                                className="border-l border-slate-100 p-1 text-center dark:border-slate-800"
                              >
                                <select
                                  value={val}
                                  aria-label={`${group.unit} ${row.peran} ${shortCompCode(doc.competencies[j], j)}`}
                                  title={`${group.unit} (${row.peran}) — ${fullCompTooltip(
                                    doc.competencies[j],
                                    j
                                  )}: Level ${val}`}
                                  onChange={(e) => {
                                    const lv = [...row.levels];
                                    lv[j] = Number(e.target.value);
                                    updateRole(index, { levels: lv });
                                  }}
                                  className={`h-7 w-11 cursor-pointer rounded-lg border text-center text-xs font-bold transition focus:ring-2 focus:ring-emerald-500 focus:outline-none ${getLevelSelectCls(
                                    val
                                  )}`}
                                >
                                  {[0, 1, 2, 3, 4].map((o) => (
                                    <option
                                      key={o}
                                      value={o}
                                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                                    >
                                      {o}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            );
                          })}
                          <td className="border-l border-slate-100 px-2 text-center text-[11px] text-slate-400 dark:border-slate-800">
                            —
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ===================================================================
            TAB 2: KOMPETENSI PEGAWAI (EMPLOYEE MATRIX)
        =================================================================== */}
        {tab === "employees" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Penilaian Kompetensi Pegawai — {unitTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pilih pegawai dari <strong>Aset SDM</strong> atau ketik nama secara manual, tentukan tingkatan peran, lalu isi level kompetensi aktual (<code className="font-mono">0–4</code>).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetDefaultEmployees}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw size={13} /> Muat 6 Baris Default
                </button>
                <button
                  type="button"
                  onClick={addEmployee}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                >
                  <Plus size={14} /> Tambah Baris Pegawai
                </button>
              </div>
            </div>

            <p className="border-b border-slate-100 px-5 pb-2 pt-2 text-[11px] text-slate-400 dark:border-slate-800 md:hidden">
              Geser tabel ke kanan untuk melihat semua kolom kompetensi.
            </p>
            <div className="max-h-[62vh] overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-left text-xs" aria-label="Penilaian kompetensi pegawai">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <th className="sticky left-0 top-0 z-30 w-10 bg-slate-100 px-3 py-3 text-center font-extrabold dark:bg-slate-800">#</th>
                    <th className="sticky left-10 top-0 z-30 min-w-[270px] bg-slate-100 px-3 py-3 font-extrabold dark:bg-slate-800">
                      Nama Pegawai / Aset SDM
                    </th>
                    <th className="sticky top-0 z-20 min-w-[140px] border-l border-slate-200/70 bg-slate-100 px-3 py-3 font-extrabold dark:border-slate-700 dark:bg-slate-800">
                      Tingkatan / Peran
                    </th>
                    {Array.from({ length: nEmp }).map((_, i) => (
                      <th
                        key={i}
                        title={fullCompTooltip(doc.competencies[i], i)}
                        className="sticky top-0 z-20 min-w-[52px] cursor-help border-l border-slate-200/70 bg-slate-100 px-1.5 py-2.5 text-center font-mono text-[11px] font-extrabold dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex flex-col items-center">
                          <span>{shortCompCode(doc.competencies[i], i)}</span>
                          <span className="text-[9px] font-normal text-slate-400">
                            #{i + 1}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="sticky top-0 z-20 w-12 border-l border-slate-200/70 bg-slate-100 px-2 py-2.5 text-center font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayEmployees.map((e, i) => (
                    <tr
                      key={i}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="sticky left-0 z-10 bg-white px-2 py-2.5 text-center font-bold text-slate-400 dark:bg-slate-900">
                        {i + 1}
                      </td>
                      <td className="sticky left-10 z-10 bg-white px-3 py-2 dark:bg-slate-900">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={e.aset_sdm_id ?? ""}
                              onChange={(ev) => pickPegawai(i, ev.target.value)}
                              aria-label={`Sumber data Aset SDM untuk baris pegawai ${i + 1}`}
                              className="w-28 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              title="Pilih dari daftar Aset SDM"
                            >
                              <option value="">Pilih SDM...</option>
                              {(lookup?.pegawai ?? []).map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nama}
                                </option>
                              ))}
                            </select>
                            <input
                              value={e.nama}
                              aria-label={`Nama pegawai baris ${i + 1}`}
                              onChange={(ev) =>
                                updateEmp(i, { nama: ev.target.value })
                              }
                              placeholder={`Nama Pegawai #${i + 1} (opsional)`}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                          <input
                            value={e.jabatan ?? ""}
                            aria-label={`Jabatan pegawai baris ${i + 1}`}
                            onChange={(ev) =>
                              updateEmp(i, { jabatan: ev.target.value })
                            }
                            placeholder="Jabatan spesifik (opsional)..."
                            className="w-full rounded-md border border-transparent bg-slate-50/70 px-2 py-0.5 text-[11px] text-slate-600 focus:border-slate-300 focus:bg-white focus:outline-none dark:bg-slate-800/40 dark:text-slate-400"
                          />
                        </div>
                      </td>

                      <td className="border-l border-slate-100 px-3 py-2 dark:border-slate-800">
                        <select
                          value={e.peran}
                          aria-label={`Tingkatan peran pegawai baris ${i + 1}`}
                          onChange={(ev) =>
                            updateEmp(i, {
                              peran: ev.target.value as MatrixEmployeeRow["peran"],
                            })
                          }
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold focus:outline-none ${
                            e.peran === "Kordinator"
                              ? "border-indigo-200 bg-indigo-50/70 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
                              : "border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300"
                          }`}
                        >
                          <option value="Kordinator">Kordinator</option>
                          <option value="Team Teknis">Team Teknis</option>
                        </select>
                      </td>

                      {Array.from({ length: nEmp }).map((_, j) => {
                        const val = e.levels[j] ?? 0;
                        return (
                          <td
                            key={j}
                            className="border-l border-slate-100 p-1 text-center dark:border-slate-800"
                          >
                            <select
                              value={val}
                              aria-label={`${e.nama.trim() || `Pegawai baris ${i + 1}`} ${shortCompCode(doc.competencies[j], j)}`}
                              title={`${e.nama || e.peran} — ${fullCompTooltip(
                                doc.competencies[j],
                                j
                              )}: Level ${val}`}
                              onChange={(ev) => {
                                const lv = [...e.levels];
                                lv[j] = Number(ev.target.value);
                                updateEmp(i, { levels: lv });
                              }}
                              className={`h-7 w-11 cursor-pointer rounded-lg border text-center text-xs font-bold transition focus:ring-2 focus:ring-emerald-500 focus:outline-none ${getLevelSelectCls(
                                val
                              )}`}
                            >
                              {[0, 1, 2, 3, 4].map((o) => (
                                <option
                                  key={o}
                                  value={o}
                                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                                >
                                  {o}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}

                      <td className="border-l border-slate-100 px-2 text-center dark:border-slate-800">
                        <button
                          type="button"
                          title="Hapus baris pegawai"
                          aria-label={`Hapus baris pegawai ${e.nama.trim() || i + 1}`}
                          onClick={() => {
                            setDoc((d) =>
                              d
                                ? {
                                    ...d,
                                    employees: displayEmployees.filter(
                                      (_, x) => x !== i
                                    ),
                                  }
                                : d
                            );
                            toast(`Baris pegawai dihapus dari draf — klik Simpan untuk menyimpan.`);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ===================================================================
            TAB 3: GAP ANALISIS (CLEAN ANALYTICAL VIEW)
        =================================================================== */}
        {tab === "gap" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Analisis Kesenjangan Kompetensi (Gap Analysis) — {unitTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dihitung otomatis dari{" "}
                  <strong>Level Pegawai − Level Standar Peran ({unitTitle})</strong>. Nilai negatif (<code className="font-mono text-rose-600">-1, -2</code>) menandakan kompetensi yang memerlukan pelatihan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={onlyNegativeGap}
                    onChange={(e) => setOnlyNegativeGap(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Hanya yang punya Gap Negatif ({employeesWithGap})
                </label>

                <button
                  type="button"
                  onClick={generateTraining}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  <Wand2 size={14} /> Tarik Gap Negatif ke Rencana Training
                </button>
              </div>
            </div>

            {/* Gap Indicator Legend */}
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-white px-5 py-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-900">
              <span className="font-bold text-slate-500">Keterangan Indikator Gap:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-5 w-7 rounded border border-rose-200 bg-rose-50 text-center font-extrabold leading-5 text-rose-700">
                  -1
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Di bawah standar (Butuh Training)
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-5 w-7 rounded border border-slate-200 bg-slate-100 text-center font-bold leading-5 text-slate-600">
                  0
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Sesuai target standar peran
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-5 w-7 rounded border border-emerald-200 bg-emerald-50 text-center font-bold leading-5 text-emerald-700">
                  +1
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Melampaui standar peran
                </span>
              </span>
            </div>

            <p className="border-b border-slate-100 px-5 pb-2 pt-2 text-[11px] text-slate-400 dark:border-slate-800 md:hidden">
              Geser tabel ke kanan untuk melihat semua kolom kompetensi.
            </p>
            <div className="max-h-[62vh] overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-left text-xs" aria-label="Hasil gap analisis kompetensi pegawai">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <th className="sticky left-0 top-0 z-30 w-10 bg-slate-100 px-3 py-3 text-center font-extrabold dark:bg-slate-800">#</th>
                    <th className="sticky left-10 top-0 z-30 min-w-[210px] bg-slate-100 px-3 py-3 font-extrabold dark:bg-slate-800">
                      Pegawai
                    </th>
                    <th className="sticky top-0 z-20 min-w-[120px] border-l border-slate-200/70 bg-slate-100 px-3 py-3 font-extrabold dark:border-slate-700 dark:bg-slate-800">
                      Tingkatan
                    </th>
                    {Array.from({ length: nGap }).map((_, i) => (
                      <th
                        key={i}
                        title={fullCompTooltip(doc.competencies[i], i)}
                        className="sticky top-0 z-20 min-w-[48px] cursor-help border-l border-slate-200/70 bg-slate-100 px-1.5 py-2.5 text-center font-mono text-[11px] font-extrabold dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex flex-col items-center">
                          <span>{shortCompCode(doc.competencies[i], i)}</span>
                          <span className="text-[9px] font-normal text-slate-400">
                            #{i + 1}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="sticky top-0 z-20 min-w-[180px] border-l border-slate-200/70 bg-slate-100 px-3 py-3 font-extrabold dark:border-slate-700 dark:bg-slate-800">
                      Ringkasan Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayEmployees.map((e, i) => {
                    const rowGaps = (gaps.get(i) ?? []).slice(0, nGap);
                    const negItems = rowGaps
                      .map((g, j) =>
                        (g ?? 0) < 0 ? shortCompCode(doc.competencies[j], j) : null
                      )
                      .filter(Boolean) as string[];

                    if (onlyNegativeGap && negItems.length === 0) return null;

                    const stdLevels =
                      standardForPeran(doc.roles, e.peran, doc.nama_unit_kerja) ??
                      (e.peran === "Kordinator"
                        ? DEFAULT_KORDINATOR_LEVELS
                        : DEFAULT_TEAM_TEKNIS_LEVELS);

                    return (
                      <tr
                        key={i}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="sticky left-0 z-10 bg-white px-2 py-2.5 text-center font-bold text-slate-400 dark:bg-slate-900">
                          {i + 1}
                        </td>
                        <td className="sticky left-10 z-10 bg-white px-3 py-2.5 dark:bg-slate-900">
                          {e.nama.trim() ? (
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {e.nama}
                              </p>
                              {e.jabatan && (
                                <p className="text-[11px] text-slate-500">
                                  {e.jabatan}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">
                              Baris #{i + 1} ({e.peran})
                            </span>
                          )}
                        </td>

                        <td className="border-l border-slate-100 px-3 py-2.5 dark:border-slate-800">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              e.peran === "Kordinator"
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                : "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                            }`}
                          >
                            {e.peran}
                          </span>
                        </td>

                        {rowGaps.map((g, j) => {
                          const empLv = e.levels[j] ?? 0;
                          const stdLv = stdLevels[j] ?? 0;
                          return (
                            <td
                              key={j}
                              className="border-l border-slate-100 p-1 text-center dark:border-slate-800"
                            >
                              <span
                                title={`${shortCompCode(
                                  doc.competencies[j],
                                  j
                                )}: Aktual Lv ${empLv} vs Standar Lv ${stdLv} → Gap ${
                                  (g ?? 0) > 0 ? `+${g}` : g
                                }`}
                                className={`inline-flex h-7 w-10 items-center justify-center rounded-lg border text-xs ${getGapBadgeCls(
                                  g
                                )}`}
                              >
                                {g === null || g === undefined
                                  ? "-"
                                  : g > 0
                                    ? `+${g}`
                                    : g}
                              </span>
                            </td>
                          );
                        })}

                        <td className="border-l border-slate-100 px-3 py-2.5 dark:border-slate-800">
                          {negItems.length === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 size={13} /> Memenuhi Standar
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                <AlertTriangle size={12} /> {negItems.length} Kompetensi Kurang
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                Perlu: {negItems.slice(0, 5).join(", ")}
                                {negItems.length > 5
                                  ? ` +${negItems.length - 5}`
                                  : ""}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ===================================================================
            TAB 4: RENCANA TRAINING
        =================================================================== */}
        {tab === "training" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Rencana Training — {unitTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Daftar usulan pelatihan bagi pegawai yang memerlukan peningkatan kompetensi SMKI.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateTraining}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  <Sparkles size={14} /> Tarik Otomatis dari Gap Analisis
                </button>
                <button
                  type="button"
                  onClick={addTraining}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                >
                  <Plus size={14} /> Tambah Usulan Training
                </button>
              </div>
            </div>

            <div className="p-5">
              {doc.trainings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-800 dark:bg-slate-800/30">
                  <GraduationCap
                    size={32}
                    className="mx-auto text-emerald-600/80"
                  />
                  <h3 className="mt-2.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Belum Ada Daftar Usulan Training
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                    Anda dapat menarik rekomendasi pelatihan otomatis berdasarkan hasil{" "}
                    <strong>Gap Analisis</strong> atau menambahkan baris usulan secara manual.
                  </p>
                  <div className="mt-4 flex justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={generateTraining}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50"
                    >
                      <Wand2 size={14} /> Tarik dari Gap Analisis ({employeesWithGap} Pegawai)
                    </button>
                    <button
                      type="button"
                      onClick={addTraining}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      <Plus size={14} /> Tambah Baris Manual
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-800 dark:bg-slate-800">
                        <th scope="col" className="w-12 px-3 py-3 text-center font-extrabold">
                          No
                        </th>
                        <th scope="col" className="w-64 px-4 py-3 font-extrabold">
                          Nama Pegawai
                        </th>
                        <th scope="col" className="w-64 px-4 py-3 font-extrabold">
                          Jabatan / Peran
                        </th>
                        <th scope="col" className="px-4 py-3 font-extrabold">
                          Usulan Materi Training
                        </th>
                        <th scope="col" className="w-14 px-3 py-3 text-center font-extrabold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {doc.trainings.map((t, i) => (
                        <tr
                          key={i}
                          className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-3 py-2.5 text-center font-bold text-slate-500">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={t.nama}
                              aria-label={`Nama pegawai usulan training ${i + 1}`}
                              list="training-pegawai-list"
                              onChange={(e) => {
                                const v = e.target.value;
                                const match = displayEmployees.find(
                                  (emp) =>
                                    emp.nama.trim().toLowerCase() ===
                                    v.trim().toLowerCase()
                                );
                                setDoc((d) =>
                                  d
                                    ? {
                                        ...d,
                                        trainings: d.trainings.map((x, idx) =>
                                          idx === i
                                            ? {
                                                ...x,
                                                nama: v,
                                                // Isi jabatan otomatis hanya bila masih kosong.
                                                jabatan: !x.jabatan.trim() && match
                                                  ? match.jabatan || match.peran
                                                  : x.jabatan,
                                              }
                                            : x
                                        ),
                                      }
                                    : d
                                );
                              }}
                              placeholder="Nama pegawai..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={t.jabatan}
                              aria-label={`Jabatan usulan training ${i + 1}`}
                              onChange={(e) =>
                                setDoc((d) =>
                                  d
                                    ? {
                                        ...d,
                                        trainings: d.trainings.map((x, idx) =>
                                          idx === i
                                            ? { ...x, jabatan: e.target.value }
                                            : x
                                        ),
                                      }
                                    : d
                                )
                              }
                              placeholder="Jabatan / Kordinator / Team Teknis..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={t.usulan_training}
                              aria-label={`Usulan materi training ${i + 1}`}
                              onChange={(e) =>
                                setDoc((d) =>
                                  d
                                    ? {
                                        ...d,
                                        trainings: d.trainings.map((x, idx) =>
                                          idx === i
                                            ? {
                                                ...x,
                                                usulan_training: e.target.value,
                                              }
                                            : x
                                        ),
                                      }
                                    : d
                                )
                              }
                              placeholder="Contoh: Pelatihan ISO/IEC 27001 Lead Implementer / Penguatan K-09..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              title="Hapus usulan"
                              aria-label={`Hapus usulan training ${t.nama.trim() || i + 1}`}
                              onClick={() => {
                                setDoc((d) =>
                                  d
                                    ? {
                                        ...d,
                                        trainings: d.trainings.filter(
                                          (_, idx) => idx !== i
                                        ),
                                      }
                                    : d
                                );
                                toast(`Usulan training dihapus dari draf — klik Simpan untuk menyimpan.`);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <datalist id="training-pegawai-list">
                    {displayEmployees
                      .map((e) => e.nama.trim())
                      .filter(Boolean)
                      .map((nama) => (
                        <option key={nama} value={nama} />
                      ))}
                  </datalist>
                </div>
              )}

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <FileSpreadsheet size={13} className="text-emerald-600" />
                <span>
                  Saat diekspor ke Excel (<strong>.xlsx</strong>), sheet{" "}
                  <strong>Rencana Training</strong> akan otomatis dicetak mengikuti format tabel 26 baris resmi FR-031.
                </span>
              </p>
            </div>
          </section>
        )}

        {/* ===================================================================
            TAB 5: DAFTAR KOMPETENSI (K-006)
        =================================================================== */}
        {tab === "dokumen" && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Daftar Kolom Kompetensi K-006 ({doc.competencies.length} Kolom)
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Secara default menggunakan kode <code className="font-mono">K-01</code> s.d.{" "}
                  <code className="font-mono">K-16</code> yang otomatis dikonversi menjadi judul vertikal K-006 saat diekspor ke Excel. Anda juga dapat mengisi nama kompetensi spesifik.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => resizeComps(DEFAULT_COMPETENCIES)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw size={13} /> Reset K-01..K-16
                </button>
                <button
                  type="button"
                  onClick={() =>
                    resizeComps([
                      ...doc.competencies,
                      `K-${String(doc.competencies.length + 1).padStart(2, "0")}`,
                    ])
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <Plus size={14} /> Tambah Kolom
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {doc.competencies.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <span className="flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 font-mono text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {i + 1}
                  </span>
                  <input
                    value={c}
                    aria-label={`Nama kompetensi kolom ${i + 1}`}
                    onChange={(e) => setComp(i, e.target.value)}
                    maxLength={120}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={doc.competencies.length <= 1}
                    onClick={() =>
                      resizeComps(doc.competencies.filter((_, x) => x !== i))
                    }
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    title="Hapus kolom"
                    aria-label={`Hapus kolom kompetensi ${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <ConfirmModal
        isOpen={!!unitToDelete}
        title={`Hapus bidang ${unitToDelete ?? ""}?`}
        message="Seluruh baris standar Kordinator dan Team Teknis pada bidang ini akan dihapus dari draf. Klik Simpan untuk menyimpan perubahan."
        confirmText="Ya, hapus bidang"
        cancelText="Batal"
        isDanger
        onClose={() => setUnitToDelete(null)}
        onConfirm={() => {
          if (unitToDelete) {
            removeUnitGroup(unitToDelete);
            toast(`Bidang ${unitToDelete} dihapus dari draf — klik Simpan untuk menyimpan.`);
            setUnitToDelete(null);
          }
        }}
      />
    </ServiceRouteGuard>
  );
}

function snapshotOf(d: MatrixDocument): string {
  return JSON.stringify({
    unit: d.nama_unit_kerja ?? "",
    comps: d.competencies,
    roles: d.roles.map((r) => [r.unit_label, r.peran, r.levels]),
    employees: d.employees.map((e) => [
      e.aset_sdm_id ?? null,
      e.nama,
      e.nip ?? "",
      e.jabatan,
      e.peran,
      e.levels,
      e.usulan_training ?? "",
    ]),
    trainings: d.trainings,
  });
}

function normalizeDoc(d: MatrixDocument): MatrixDocument {
  const n = d.competencies?.length || 16;
  const rawRoles = d.roles ?? [];
  const allZero =
    rawRoles.length <= 2 &&
    rawRoles.every((r) => (r.levels ?? []).every((v) => Number(v) === 0));

  const roles = allZero
    ? buildDefaultRoles(n)
    : rawRoles.map((r) => ({ ...r, levels: fit(r.levels ?? [], n) }));

  const rawEmployees = d.employees ?? [];
  const allEmpZero =
    rawEmployees.length > 0 &&
    rawEmployees.every((e) => (e.levels ?? []).every((v) => Number(v) === 0));

  const employees =
    rawEmployees.length > 0 && !allEmpZero
      ? rawEmployees.map((e, idx) => ({
          ...e,
          levels: fit(
            e.levels ?? [],
            n,
            DEFAULT_EMPLOYEE_LEVELS[idx]?.levels ??
              (e.peran === "Kordinator"
                ? DEFAULT_KORDINATOR_LEVELS
                : DEFAULT_TEAM_TEKNIS_LEVELS)
          ),
        }))
      : buildDefaultEmployees(n);

  return {
    ...d,
    nama_unit_kerja: d.nama_unit_kerja ?? "",
    roles,
    employees,
  };
}

function fit(levels: number[], len: number, fallback?: number[]): number[] {
  const out = Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    const v = levels[i] ?? fallback?.[i] ?? 0;
    out[i] = level0(v);
  }
  return out;
}

function level0(v: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(4, Math.max(0, Math.round(n)));
}
