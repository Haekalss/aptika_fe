/* eslint-disable @typescript-eslint/no-require-imports -- Standalone tests use the installed TypeScript compiler. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const axios = require('axios');
let handler;
const api = axios.create({ adapter: config => handler(config) });
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../../../services/smki/backupRestoreService.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
const loaded = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputText)(loaded, loaded.exports, name => name === '@/services/api' ? { api } : require(name));
const { backupRestoreService, readFr030Error } = loaded.exports;
const response = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

test('list and lookup unwrap their actual paginated envelopes', async () => {
  handler = async config => {
    assert.equal(config.method, 'get');
    if (config.url.endsWith('/lookup')) {
      assert.deepEqual(config.params, { asset_type: 'virtual', page: 2 });
      return response(config, { success: true, data: { bidang: { id: 3, nama: 'APTIKA' }, assets: { data: [{ id: 11, nama_aset: 'VM' }], total: 51, current_page: 2, last_page: 2, per_page: 50 } } });
    }
    assert.equal(config.url, '/smki/backup-restore');
    assert.deepEqual(config.params, { year: 2026, page: 2 });
    return response(config, { success: true, data: { data: [{ id: 7 }], total: 11, current_page: 2, last_page: 2, per_page: 10 } });
  };
  assert.equal((await backupRestoreService.list({ year: 2026, page: 2 })).total, 11);
  assert.equal((await backupRestoreService.lookup({ asset_type: 'virtual', page: 2 })).assets.data[0].nama_aset, 'VM');
});

test('versioned writes use the right parent, method and JSON body', async () => {
  const requests = [];
  handler = async config => { requests.push([config.method, config.url, JSON.parse(config.data)]); return response(config, { data: { id: 7, version: 4 } }); };
  const payload = { version: 3, tahun: 2026, assets: [], finalize: false };
  assert.equal((await backupRestoreService.update(7, payload)).version, 4);
  await backupRestoreService.delete(7, 4);
  const removal = await backupRestoreService.deleteEvidence(7, 21, 5);
  assert.equal(removal.version, 4);
  assert.deepEqual(requests, [
    ['put', '/smki/backup-restore/7', payload],
    ['delete', '/smki/backup-restore/7', { version: 4 }],
    ['delete', '/smki/backup-restore/7/attachments/21', { version: 5 }],
  ]);
});

test('upload sends one file with version and returns the new attachment identity', async () => {
  handler = async config => {
    assert.equal(config.url, '/smki/backup-restore/7/entries/11/attachments');
    assert.equal(config.method, 'post');
    assert.equal(config.data.get('version'), '3');
    assert.equal(config.data.get('file').name, 'proof.png');
    return response(config, { data: { attachment: { id: 21, original_name: 'proof.png', mime: 'image/png', size: 3 }, version: 4 } });
  };
  const result = await backupRestoreService.uploadEvidence(7, 11, new File(['png'], 'proof.png', { type: 'image/png' }), 3);
  assert.equal(result.version, 4);
  assert.equal(result.attachment.id, 21);
});

test('private images and DOCX request authenticated client blobs without public URLs', async () => {
  const requests = [];
  handler = async config => { requests.push(config.url); assert.equal(config.responseType, 'blob'); return response(config, new Blob(['private data'])); };
  assert.equal(await (await backupRestoreService.specimen(7, 'pelaksana')).text(), 'private data');
  assert.equal(await (await backupRestoreService.downloadEvidence(7, 21)).text(), 'private data');
  assert.equal(await (await backupRestoreService.exportDocx(7)).text(), 'private data');
  assert.deepEqual(requests, ['/smki/backup-restore/7/signatories/pelaksana/specimen', '/smki/backup-restore/7/attachments/21', '/smki/backup-restore/7/export-docx']);
});

test('blob validation errors and conflicts retain actionable field errors', async () => {
  const error = new axios.AxiosError('failed', 'ERR_BAD_RESPONSE', {}, {}, { status: 422, data: new Blob([JSON.stringify({ message: 'Tanggal tidak valid', errors: { 'assets.0.entries.0.performed_on': ['Tanggal wajib diisi'] } })]) });
  const parsed = await readFr030Error(error);
  assert.equal(parsed.message, 'Tanggal tidak valid');
  assert.deepEqual(parsed.errors['assets.0.entries.0.performed_on'], ['Tanggal wajib diisi']);
  assert.equal(parsed.status, 422);
});
