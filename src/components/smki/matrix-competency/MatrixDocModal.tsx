"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import {
  createMatrix,
  updateMatrix,
  getMatrixDetail,
  getMatrixLookup,
  DEFAULT_COMPETENCIES,
  DEFAULT_KORDINATOR_LEVELS,
  DEFAULT_SMKI_UNITS,
  DEFAULT_TEAM_TEKNIS_LEVELS,
  buildDefaultRoles,
  buildDefaultEmployees,
  errMsg,
  type MatrixLookup,
} from "@/services/smki/matrixCompetencyService";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800/60";

export default function MatrixDocModal({
  open,
  editingId,
  onClose,
  onSaved,
}: {
  open: boolean;
  editingId: number | null;
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [lookup, setLookup] = useState<MatrixLookup | null>(null);
  const [unit, setUnit] = useState("");
  const [comps, setComps] = useState<string[]>(DEFAULT_COMPETENCIES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    getMatrixLookup().then(setLookup).catch(() => {});
    if (editingId) {
      getMatrixDetail(editingId)
        .then((d) => {
          setUnit(d.nama_unit_kerja ?? "");
          setComps(d.competencies?.length ? d.competencies : DEFAULT_COMPETENCIES);
        })
        .catch(() => toast.error("Gagal memuat dokumen."));
    } else {
      setUnit("");
      setComps(DEFAULT_COMPETENCIES);
    }
  }, [open, editingId]);

  const setComp = (i: number, v: string) =>
    setComps((p) => p.map((c, idx) => (idx === i ? v : c)));

  const addComp = () => {
    if (comps.length >= 30) return;
    setComps((p) => [...p, `K-${String(p.length + 1).padStart(2, "0")}`]);
  };

  const removeComp = (i: number) => {
    if (comps.length <= 1) return;
    setComps((p) => p.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    const cleaned = comps.map((c) => c.trim()).filter(Boolean);
    if (!cleaned.length) return toast.error("Minimal 1 nama kompetensi wajib diisi.");
    setSaving(true);
    try {
      if (editingId) {
        const cur = await getMatrixDetail(editingId);
        const payload = {
          nama_unit_kerja: unit.trim() || null,
          competencies: cleaned,
          roles: cur.roles.map((r) => ({
            unit_label: r.unit_label,
            peran: r.peran,
            levels: fitLevels(r.levels, cleaned.length),
          })),
          employees: cur.employees.map((e) => ({
            aset_sdm_id: e.aset_sdm_id ?? null,
            nama: e.nama,
            nip: e.nip ?? null,
            jabatan: e.jabatan,
            peran: e.peran,
            levels: fitLevels(e.levels, cleaned.length),
            usulan_training: e.usulan_training ?? null,
          })),
          trainings: cur.trainings.map((t) => ({
            nama: t.nama,
            jabatan: t.jabatan,
            usulan_training: t.usulan_training,
          })),
        };
        const saved = await updateMatrix(editingId, payload);
        toast.success("Dokumen berhasil diperbarui.");
        onSaved(saved.id);
      } else {
        const defaultRoles = buildDefaultRoles(cleaned.length);
        const trimmedUnit = unit.trim();
        if (
          trimmedUnit &&
          !DEFAULT_SMKI_UNITS.some(
            (u) =>
              u.toLowerCase().includes(trimmedUnit.toLowerCase()) ||
              trimmedUnit.toLowerCase().includes(u.replace(/^SMKI\s+/i, "").toLowerCase())
          )
        ) {
          defaultRoles.push(
            {
              unit_label: trimmedUnit,
              peran: "Kordinator",
              levels: fitLevels(DEFAULT_KORDINATOR_LEVELS, cleaned.length),
            },
            {
              unit_label: trimmedUnit,
              peran: "Team Teknis",
              levels: fitLevels(DEFAULT_TEAM_TEKNIS_LEVELS, cleaned.length),
            }
          );
        }

        const saved = await createMatrix({
          nama_unit_kerja: trimmedUnit || null,
          competencies: cleaned,
          roles: defaultRoles,
          employees: buildDefaultEmployees(cleaned.length),
          trainings: [],
        });
        toast.success("Dokumen berhasil dibuat dengan standar FR-031.");
        onSaved(saved.id);
      }
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan dokumen."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editingId ? "Ubah Dokumen FR-031" : "Buat Dokumen FR-031"}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <label className="block text-xs font-bold">
          Nama Unit Kerja / Bidang SMKI
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="matrix-unit-list"
            className={`${inputCls} mt-1`}
            placeholder="cth. SMKI Bidang Aplikasi Informatika"
          />
          <datalist id="matrix-unit-list">
            {DEFAULT_SMKI_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
            {(lookup?.unit_kerja ?? []).map((u) => (
              <option key={u.id} value={u.nama} />
            ))}
          </datalist>
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold">
              Daftar Kompetensi K-006 ({comps.length})
            </p>
            <button
              type="button"
              onClick={addComp}
              className="rounded-lg border px-2.5 py-1.5 text-[11px] font-bold hover:bg-slate-50"
            >
              + Tambah
            </button>
          </div>
          <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-2">
            {comps.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-[11px] font-bold text-slate-500">
                  {i + 1}.
                </span>
                <input
                  value={c}
                  onChange={(e) => setComp(i, e.target.value)}
                  className={`${inputCls} !py-2`}
                  maxLength={120}
                />
                <button
                  type="button"
                  onClick={() => removeComp(i)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-rose-600"
                  title="Hapus"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Kode default K-01 s.d. K-16 otomatis diekspor menjadi header vertikal{" "}
            <span className="font-semibold">
              &ldquo;Kemampuan yang terdapat pada K-006 Kebijakan Standar Kompetensi Sistem Manajemen Keamanan Informasi&rdquo;
            </span>{" "}
            sesuai file Excel FR-031 asli.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2.5 text-xs font-bold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : editingId
                ? "Simpan Perubahan"
                : "Buat & Buka Editor"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function fitLevels(levels: number[], len: number): number[] {
  const out = Array(len).fill(0);
  levels.slice(0, len).forEach((v, i) => {
    out[i] = Math.min(4, Math.max(0, Number(v) || 0));
  });
  return out;
}
