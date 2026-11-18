/* eslint-disable @typescript-eslint/no-require-imports -- Standalone tests use the installed TypeScript compiler. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, 'form.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const loaded = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputText)(loaded, loaded.exports, require);
const { createEmptyFr030Form, createFr030Asset, hydrateFr030Form, buildFr030Payload, filledFr030Entries, fr030EntrySummary } = loaded.exports;

test('explicit signer refresh survives save payload but never leaks into hydrated snapshots', () => {
  const state = { ...createEmptyFr030Form(2026), refresh_signatories: ['penanggung_jawab'] };
  assert.deepEqual(buildFr030Payload(state, false).refresh_signatories, ['penanggung_jawab']);
  assert.equal('refresh_signatories' in hydrateFr030Form({ ...state, id: 1, version: 2, assets: [] }), false);
});

test('signer completeness uses snapshot until explicit refresh and includes missing pangkat', () => {
  const { fr030SignerIdentity } = loaded.exports;
  const master = [{ id: 1, nama: 'Nama baru', nip: '123', jabatan: 'Teknisi', pangkat: 'III/a' }];
  const saved = { pelaksana_pegawai_id: 1, pelaksana_nama: 'Nama historis', pelaksana_nip: '123', pelaksana_jabatan: '', pelaksana_pangkat: null };
  assert.deepEqual(fr030SignerIdentity('pelaksana', 1, master, saved, false).missing, ['jabatan', 'pangkat']);
  const refreshed = fr030SignerIdentity('pelaksana', 1, master, saved, true);
  assert.equal(refreshed.nama, 'Nama baru');
  assert.deepEqual(refreshed.missing, []);
  assert.equal(fr030SignerIdentity('pelaksana', 99, master).missing.length, 4);
  const blankNameSnapshot = { ...saved, pelaksana_nama: '', pelaksana_jabatan: 'Teknisi', pelaksana_pangkat: 'III/a' };
  assert.deepEqual(fr030SignerIdentity('pelaksana', 1, master, blankNameSnapshot).missing, ['nama']);
  const deletedMasterSnapshot = { ...saved, pelaksana_pegawai_id: null };
  assert.equal(fr030SignerIdentity('pelaksana', null, master, deletedMasterSnapshot).nama, 'Nama historis');
  assert.equal(fr030SignerIdentity('pelaksana', null, master, { pelaksana_pegawai_id: null }).historical, false);
});

test('blank draft has no invented dates, signers or activities', () => {
  const form = createEmptyFr030Form(2026);
  const payload = buildFr030Payload(form, false);
  assert.equal(payload.tahun, 2026);
  assert.equal(payload.tanggal_terbit, null);
  assert.equal(payload.pelaksana_pegawai_id, null);
  assert.equal(payload.penanggung_jawab_pegawai_id, null);
  assert.equal('version' in payload, false);
  assert.deepEqual(payload.assets, []);
  assert.equal(payload.finalize, false);
});

test('hydration isolates editor from query data and preserves stable child IDs', () => {
  const report = { ...createEmptyFr030Form(2026), id: 7, version: 3, status: 'final', tanggal_terbit: '2026-10-01', assets: [{ ...createFr030Asset(), id: 11, nama_aset: 'Server', entries: [{ id: 21, month: 10, operation: 'backup', result: 'berhasil', performed_on: '2026-10-03', notes: null, attachments: [{ id: 31, original_name: 'private.png', mime: 'image/png', size: 80 }] }] }] };
  const editor = hydrateFr030Form(report);
  assert.equal(editor.version, 3);
  assert.equal(editor.assets[0].id, 11);
  assert.equal(editor.assets[0].client_key, report.assets[0].client_key);
  assert.equal(editor.assets[0].entries[0].id, 21);
  editor.assets[0].entries[0].attachments[0].original_name = 'edited';
  assert.equal(report.assets[0].entries[0].attachments[0].original_name, 'private.png');
});

test('payload keeps backup and restore separate, excludes snapshots and never mutates state', () => {
  const form = { ...createEmptyFr030Form(2026), version: 3, pelaksana_nama: 'Forged identity', assets: [{ ...createFr030Asset(), id: 11, nama_aset: ' Server ', entries: [
    { id: 21, month: 10, operation: 'backup', result: 'gagal', performed_on: null, notes: ' partial ', attachments: [] },
    { id: 22, month: 10, operation: 'restore', result: 'berhasil', performed_on: '2026-10-04', notes: '', attachments: [{ id: 31, path: '/secret' }] },
  ] }] };
  const original = structuredClone(form);
  const payload = buildFr030Payload(form, true);
  assert.equal(payload.version, 3);
  assert.equal(payload.finalize, true);
  assert.equal(payload.assets[0].client_key, form.assets[0].client_key);
  assert.equal(payload.assets[0].entries[0].performed_on, null);
  assert.equal(payload.assets[0].entries[0].result, 'gagal');
  assert.equal(payload.assets[0].entries[1].operation, 'restore');
  assert.equal('pelaksana_nama' in payload, false);
  assert.equal('attachments' in payload.assets[0].entries[1], false);
  assert.deepEqual(form, original);
});

test('clearing an entry removes it only when it has no evidence', () => {
  const form = createEmptyFr030Form(2026);
  form.assets.push({ ...createFr030Asset(), entries: [
    { id: 1, month: 1, operation: 'backup', result: null, performed_on: null, notes: ' ', attachments: [] },
    { id: 2, month: 2, operation: 'backup', result: null, performed_on: null, notes: '', attachments: [{ id: 3 }] },
  ] });
  assert.deepEqual(buildFr030Payload(form, false).assets[0].entries.map(e => e.id), [2]);
  assert.deepEqual(filledFr030Entries(form.assets[0].entries).map(e => e.id), [2], 'UI error indexes must use the same meaningful entries as the API payload');
});

test('partial activities never look completed or disappear as unrecorded', () => {
  assert.equal(fr030EntrySummary(undefined), 'Belum dicatat');
  assert.equal(fr030EntrySummary({ notes: 'Perlu ditinjau', result: null, performed_on: null, attachments: [] }), 'Belum lengkap');
  assert.equal(fr030EntrySummary({ notes: null, result: 'berhasil', performed_on: null, attachments: [] }), 'Berhasil · Belum lengkap');
  assert.equal(fr030EntrySummary({ result: 'gagal', performed_on: '2026-10-01', attachments: [] }), 'Gagal');
});
