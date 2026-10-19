// Run with Node >=20 using the project's already installed TypeScript compiler.
/* eslint-disable @typescript-eslint/no-require-imports -- This standalone Node 20 CJS test harness intentionally uses CommonJS. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "form.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const compiledModule = { exports: {} };
new Function("module", "exports", "require", compiled.outputText)(compiledModule, compiledModule.exports, require);
const { createAction, emptyFr009Form, isAuditSource, orderedFilledActions, recordToForm, toFr009Payload } = compiledModule.exports;

const draft = emptyFr009Form({ id: 7, name: "Pelapor" });
assert.equal(draft.dilaporkan_oleh_id, 7);
assert.equal(toFr009Payload(draft).items.length, 0, "Completely blank placeholder rows must not reach the API.");
draft.nomor_laporan = "  TP-001  ";
draft.version = 3;
draft.sumber_codes = ["lainnya", "lainnya"];
draft.sumber_lainnya = "  Pemeriksaan manual  ";
draft.items = [
  { ...createAction("koreksi"), id: 12, uraian: "  Perbaiki akses  ", pic_id: 7, pic_nama: " Pelapor ", batas_waktu: "2026-10-20" },
  createAction("koreksi"),
  { ...createAction("tindakan_korektif"), uraian: "Perbarui prosedur", pic_nama: "PIC eksternal" },
];
const payload = toFr009Payload(draft);
assert.equal(payload.version, 3);
assert.equal(payload.nomor_laporan, "TP-001");
assert.deepEqual(payload.sumber_codes, ["lainnya"]);
assert.equal(payload.items[0].id, 12, "Editing must preserve stable database row IDs.");
assert.equal(payload.items[0].urutan, 1);
assert.equal(payload.items[1].urutan, 1, "The two tables have independent ordering.");
assert.ok(!("clientKey" in payload.items[0]));
assert.equal(draft.items[0].uraian, "  Perbaiki akses  ", "Building a payload must not mutate unsaved form state.");
draft.sumber_codes = [];
assert.equal(toFr009Payload(draft).sumber_lainnya, "");
assert.equal(draft.sumber_lainnya, "  Pemeriksaan manual  ", "Unselecting Other must not destroy the local draft text.");
assert.equal(isAuditSource(["audit_eksternal"]), true);
assert.equal(isAuditSource(["laporan_insiden"]), false);

const emptyPersisted = {
  ...payload, id: 1, area: null, deskripsi: null, akar_masalah: null, sumber_lainnya: null,
  diajukan_kepada_nama: null, dilaporkan_oleh_nama: null, auditor_nama: null, atasan_nama: null,
  items: [], status: "draft", verifikasi: null, tanggal_verifikasi: null,
  catatan_verifikasi: null, version: 4,
};
const hydrated = recordToForm(emptyPersisted);
assert.equal(hydrated.area, "");
assert.equal(hydrated.deskripsi, "");
assert.equal(hydrated.auditor_nama, "");
assert.equal(hydrated.version, 4);
assert.equal(toFr009Payload(hydrated).items.length, 0);
const localEdit = { ...hydrated, deskripsi: "Belum disimpan" };
recordToForm({ ...emptyPersisted, deskripsi: "Refetch server" });
assert.equal(localEdit.deskripsi, "Belum disimpan", "A server mapping must not mutate the independent editing snapshot.");

const blank = createAction("koreksi");
const corrective = { ...createAction("tindakan_korektif"), id: 44, pic_nama: "Partial corrective" };
const correctionOne = { ...createAction("koreksi"), id: 11, uraian: "First correction" };
const correctionTwo = { ...createAction("koreksi"), id: 22, uraian: "Second correction" };
const interleaved = [blank, corrective, correctionOne, createAction("tindakan_korektif"), correctionTwo];
const originalKeys = interleaved.map((item) => item.clientKey);
const canonical = orderedFilledActions(interleaved);
assert.deepEqual(canonical.map((item) => item.id), [11, 22, 44], "Canonical validation indexes must group the two tables and retain intra-group order.");
const errorIndices = new Map(canonical.map((item, index) => [item.clientKey, index]));
assert.equal(errorIndices.get(blank.clientKey) ?? -1, -1, "Blank placeholders have no server validation index.");
assert.equal(errorIndices.get(correctionOne.clientKey), 0);
assert.equal(errorIndices.get(correctionTwo.clientKey), 1);
assert.equal(errorIndices.get(corrective.clientKey), 2, "Partial corrective fields must display items.2 errors even when the original row precedes corrections.");
assert.deepEqual(interleaved.map((item) => item.clientKey), originalKeys, "Canonicalizing must not reorder or mutate UI draft rows.");
const groupedPayload = toFr009Payload({ ...emptyFr009Form(), items: interleaved });
assert.deepEqual(groupedPayload.items.map((item) => item.id), [11, 22, 44]);
assert.deepEqual(groupedPayload.items.map((item) => item.urutan), [1, 2, 1]);
console.log("FR-009 form payload self-check: PASS (blank drafts, null hydration, IDs, ordering, snapshots, versions)");
