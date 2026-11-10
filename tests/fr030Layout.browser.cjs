/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser checks reuse Playwright without adding a dependency. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.FR030_PLAYWRIGHT || 'playwright');
const base = process.env.FR030_BASE_URL || 'http://127.0.0.1:3000';
const user = { id: 901, name: 'FR030 Test', role: 'user', email: 'qa@example.invalid' };
const bidang = { id: 901, name: 'Bidang Uji', code: 'QA' };
const services = [{ id: 16, code: 'SMKI', name: 'SMKI', is_enabled: true }];
const original = { id: 7, version: 1, tahun: 2026, status: 'final', bidang_id: 901, unit_kerja_nama: bidang.name,
  nomor_dokumen: 'FR-030/QA', nomor_revisi: '1.0', tanggal_terbit: '2026-10-01', pelaksana_pegawai_id: 2, penanggung_jawab_pegawai_id: 1,
  pelaksana_nama: 'Nama Historis', pelaksana_nip: '002', pelaksana_jabatan: 'Pranata', pelaksana_pangkat: 'IIIc',
  penanggung_jawab_nama: 'Atasan Historis', penanggung_jawab_nip: '001', penanggung_jawab_jabatan: 'Kepala', penanggung_jawab_pangkat: 'IVa',
  permissions: { can_update: true, can_delete: true, can_export: true }, updated_at: '2026-11-07T00:00:00Z', finalized_at: '2026-10-01T00:00:00Z',
  assets: [{ id: 11, client_key: '48c85cb0-dc80-4ef0-a134-5ae21a9c0622', nama_aset: 'Server Uji', kode_aset: 'QA1', aset_ti_id: null, virtual_instance_id: null,
    entries: [{ id: 21, month: 10, operation: 'backup', result: 'berhasil', performed_on: '2026-10-01', notes: 'Catatan awal', attachments: [] }] }],
};
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await context.addCookies([{ name: 'token', value: 'fr030-qa', url: base }]);
    await context.addInitScript(({ user, bidang, services }) => {
      localStorage.setItem('token', 'fr030-qa'); localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('bidang', JSON.stringify(bidang)); localStorage.setItem('services', JSON.stringify(services));
    }, { user, bidang, services });
    let report = structuredClone(original), saveMode = 'ok', deleted = false, failReads = false;
    let validationErrors = { nomor_dokumen: ['Nomor dokumen wajib diisi'] };
    const writes = [], specimenRequests = [], unexpectedApi = [];
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url()), pathname = url.pathname;
      if (!pathname.startsWith('/api/')) return route.continue();
      const json = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
      if (pathname === '/api/me') return json({ success: true, user, bidang, services });
      if (pathname === '/api/tte/pegawai') return json({ data: [{ id: 1, nama: 'Budi', nip: '001', jabatan: 'Kepala', pangkat: 'IV/a', role: 'staff' }, { id: 2, nama: 'Budi', nip: '002', jabatan: 'Pranata', pangkat: 'III/c', role: 'staff' }] });
      if (/specimen|spesimen/.test(pathname)) {
        specimenRequests.push(pathname);
        return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jO1cAAAAASUVORK5CYII=', 'base64') });
      }
      if (pathname.endsWith('/export-docx')) return route.fulfill({ contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', body: Buffer.from('QA download') });
      if (pathname === '/api/smki/backup-restore/7' && req.method() === 'DELETE') {
        writes.push({ method: 'DELETE', pathname, data: req.postDataJSON() }); deleted = true;
        return json({ success: true });
      }
      if (/\/backup-restore\/7\/entries\/\d+\/attachments$/.test(pathname) && req.method() === 'POST') {
        assert.ok(req.postData().includes('name="version"'), 'Multipart upload carries version');
        const entry = report.assets.flatMap(asset => asset.entries).find(item => pathname.includes(`/entries/${item.id}/`));
        const attachment = { id: 501, original_name: 'proof.png', mime: 'image/png', size: 8 };
        entry.attachments.push(attachment); report.version++;
        return json({ data: { attachment, version: report.version } });
      }
      if (pathname === '/api/smki/backup-restore/7/attachments/501' && req.method() === 'GET') return route.fulfill({ contentType: 'image/png', body: Buffer.from('QA image') });
      if (pathname === '/api/smki/backup-restore/7/attachments/501' && req.method() === 'DELETE') {
        assert.equal(req.postDataJSON().version, report.version);
        report.assets.forEach(asset => asset.entries.forEach(entry => { entry.attachments = []; })); report.version++;
        return json({ data: { version: report.version } });
      }
      if (pathname.endsWith('/backup-restore/lookup')) { const page = Number(url.searchParams.get('page') || 1); return json({ data: { bidang: { id: bidang.id, nama: bidang.name }, assets: { data: [{ id: page === 1 ? 100 : 101, nama_aset: page === 1 ? 'Master Server' : 'Aset halaman kedua', kode_aset: 'M'+page }], current_page: page, last_page: 2, total: 51, per_page: 50 } } }); }
      if (pathname === '/api/smki/backup-restore' && req.method() === 'GET') return json({ data: { data: deleted ? [] : [report], current_page: 1, last_page: 1, total: deleted ? 0 : 1, per_page: 10 } });
      if (pathname === '/api/smki/backup-restore/7' && req.method() === 'GET') return failReads ? route.fulfill({ status: 503, json: { message: 'Background refresh failed' } }) : json({ data: report });
      if (pathname.startsWith('/api/smki/backup-restore') && ['PUT', 'POST', 'DELETE'].includes(req.method())) {
        const data = req.postDataJSON(); writes.push({ method: req.method(), pathname, data });
        if (saveMode !== 'ok') return route.fulfill({ status: Number(saveMode), contentType: 'application/json', body: JSON.stringify({ message: saveMode === '409' ? 'Data telah berubah' : 'Periksa isian', errors: saveMode === '422' ? validationErrors : {} }) });
        report = { ...report, ...data, status: data.finalize ? 'final' : 'draft', version: report.version + 1, assets: (data.assets ?? []).map((asset, i) => ({ ...asset, id: asset.id ?? 11 + i, entries: asset.entries.map((entry, j) => ({ ...entry, id: entry.id ?? 21 + j, attachments: [] })) })) };
        return json({ data: report });
      }
      // Non-module dashboard notifications are irrelevant fixtures; never reach real APIs.
      if (!pathname.includes('backup-restore')) return json({ data: [], success: true });
      unexpectedApi.push(pathname); return route.fulfill({ status: 500, body: 'Unexpected test request' });
    });
    const page = await context.newPage();
    await page.goto(`${base}/smki/backup-restore`);
    await page.getByRole('button', { name: 'Tambah laporan', exact: true }).waitFor({ timeout: 20000 });
    assert.equal(await page.getByRole('button', { name: 'Berita Acara Backup', exact: true }).count(), 1);
    await page.getByRole('heading', { level: 1, name: /Berita Acara Backup/ }).waitFor();
    if (process.env.FR030_SCREENSHOTS) await page.screenshot({ path: `${process.env.FR030_SCREENSHOTS}/list-desktop.png`, fullPage: true });
    assert.equal(await page.getByRole('button', { name: 'Edit laporan 7', exact: true }).count(), 1, 'Final is editable');
    assert.equal(await page.getByRole('button', { name: 'Hapus laporan 7', exact: true }).count(), 1, 'Final is deletable');
    await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
    await page.getByLabel('Tahun laporan', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Tanggal terbit', { exact: true }).inputValue(), '');
    await page.getByRole('button', { name: 'Tambah aset', exact: true }).click();
    await page.getByLabel('Sumber aset 1', { exact: true }).selectOption('physical');
    assert.equal(await page.getByLabel('Cari master aset 1', { exact: true }).count(), 0);
    await page.getByLabel('Pilih master aset 1', { exact: true }).selectOption('100');
    assert.equal(await page.getByLabel('Nama aset 1', { exact: true }).count(), 0, 'Master identity is a summary, not duplicate read-only input');
    await page.getByRole('button', { name: 'Berikutnya', exact: true }).click();
    await page.getByLabel('Pilih master aset 1', { exact: true }).selectOption('101');
    await page.getByText('Aset halaman kedua', { exact: true }).filter({ visible: true }).first().waitFor();
    await page.getByLabel('Sumber aset 1', { exact: true }).selectOption('manual');
    await page.getByLabel('Nama aset 1', { exact: true }).fill('Aset baru');
    await page.getByRole('button', { name: 'Aset baru · Oktober', exact: true }).click();
    const modal = page.getByRole('dialog');
    await modal.getByLabel('Hasil Backup', { exact: true }).selectOption('gagal');
    await modal.getByLabel('Catatan Backup', { exact: true }).fill('Tetap tersimpan');
    await modal.getByLabel('Hasil Restore', { exact: true }).selectOption('berhasil');
    await modal.getByLabel('Tanggal Restore', { exact: true }).fill('2026-10-04');
    assert.equal(await modal.getByLabel('Bukti Backup', { exact: true }).isDisabled(), true);
    await modal.getByRole('button', { name: 'Selesai', exact: true }).click();
    await page.getByRole('button', { name: 'Simpan Draf', exact: true }).click();
    await page.waitForURL('**/backup-restore/7/edit');
    const saved = writes.at(-1).data;
    assert.deepEqual(saved.assets[0].entries.map(e => [e.operation, e.result, e.performed_on]), [['backup', 'gagal', null], ['restore', 'berhasil', '2026-10-04']]);
    await page.reload();
    await page.getByRole('button', { name: 'Aset baru · Oktober', exact: true }).click();
    assert.equal(await page.getByLabel('Catatan Backup', { exact: true }).inputValue(), 'Tetap tersimpan');
    await page.getByLabel('Bukti Backup', { exact: true }).setInputFiles({ name: 'proof.png', mimeType: 'image/png', buffer: Buffer.from('QA image') });
    await page.getByRole('button', { name: 'Unduh bukti', exact: true }).waitFor();
    const fileDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Unduh bukti', exact: true }).click();
    assert.equal((await fileDownload).suggestedFilename(), 'proof.png');
    await page.getByRole('button', { name: 'Hapus bukti', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Hapus', exact: true }).click();
    await page.getByRole('button', { name: 'Unduh bukti', exact: true }).waitFor({ state: 'detached' });
    assert.equal(report.version, 4, 'Create, upload and delete each reconcile server version');
    await page.getByRole('dialog').getByRole('button', { name: 'Selesai', exact: true }).click();
    await page.getByLabel('No. Dokumen', { exact: true }).fill('FR-030/LOCAL');
    failReads = true;
    const backgroundFailure = page.waitForResponse(response => new URL(response.url()).pathname === '/api/smki/backup-restore/7' && response.status() === 503);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await backgroundFailure;
    assert.equal(await page.getByLabel('No. Dokumen', { exact: true }).count(), 1, 'A failed background refetch must not unmount the dirty editor');
    assert.equal(await page.getByLabel('No. Dokumen', { exact: true }).inputValue(), 'FR-030/LOCAL');
    failReads = false;
    saveMode = '409';
    await page.getByRole('button', { name: 'Simpan Draf', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Data telah berubah' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Muat ulang data', exact: true }).count(), 1);
    assert.equal(await page.getByLabel('No. Dokumen', { exact: true }).inputValue(), 'FR-030/LOCAL');
    saveMode = '422';
    await page.getByRole('button', { name: 'Simpan & Finalisasi', exact: true }).click();
    await page.locator('[data-fr030-errors]').waitFor();
    assert.equal(await page.locator('[data-fr030-errors]').evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', { name: 'Aset baru · Oktober', exact: true }).click();
    await page.getByLabel('Hasil Backup', { exact: true }).selectOption('');
    await page.getByLabel('Catatan Backup', { exact: true }).fill('');
    await page.getByLabel('Tanggal Restore', { exact: true }).fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Selesai', exact: true }).click();
    validationErrors = { 'assets.0.entries.0.performed_on': ['Tanggal Restore wajib diisi'] };
    await page.getByRole('button', { name: 'Simpan & Finalisasi', exact: true }).click();
    await page.getByRole('link', { name: 'Tanggal Restore wajib diisi', exact: true }).click();
    assert.equal(await page.getByLabel('Tanggal Restore', { exact: true }).getAttribute('aria-invalid'), 'true');
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-fr030-error-field') === 'assets.0.entries.0.performed_on');
    await page.getByRole('dialog').getByRole('button', { name: 'Selesai', exact: true }).click();
    await page.getByRole('button', { name: 'Ringkasan SMKI', exact: true }).click();
    const confirm = page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: 'Batal', exact: true }).click();
    assert.ok(page.url().endsWith('/7/edit'));
    assert.equal(await page.getByLabel('No. Dokumen', { exact: true }).inputValue(), 'FR-030/LOCAL');
    await page.getByRole('button', { name: 'Ringkasan SMKI', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Tinggalkan halaman', exact: true }).click();
    await page.waitForURL('**/smki');
    await page.getByRole('button', { name: 'Berita Acara Backup', exact: true }).first().click();
    await page.waitForURL('**/smki/backup-restore');
    report = structuredClone(original); saveMode = 'ok';
    await page.goto(`${base}/smki/backup-restore/7`);
    await page.getByRole('button', { name: 'Edit laporan', exact: true }).waitFor();
    await page.getByAltText('Spesimen Pelaksana', { exact: true }).waitFor();
    assert.ok(specimenRequests.includes('/api/smki/backup-restore/7/signatories/pelaksana/specimen'));
    assert.ok(specimenRequests.includes('/api/smki/backup-restore/7/signatories/penanggung-jawab/specimen'));
    const docxDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Ekspor DOCX', exact: true }).click();
    assert.equal((await docxDownload).suggestedFilename(), 'FR-030-2026-7.docx');
    report.assets = Array.from({ length: 50 }, (_, i) => ({ ...structuredClone(original.assets[0]), id: 11 + i,
      client_key: `48c85cb0-dc80-4ef0-a134-${String(i).padStart(12, '0')}`, nama_aset: `Server panjang ${i + 1} — nama aset dengan informasi tambahan`, entries: [] }));
    await page.getByRole('button', { name: 'Edit laporan', exact: true }).click();
    await page.getByLabel('Nama aset 50', { exact: true }).waitFor();
    for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 375, height: 812 }]) {
      await page.setViewportSize(viewport);
      await page.locator('main').evaluate(main => { main.scrollTop = main.scrollHeight; });
      const geometry = await page.evaluate(() => {
        const main = document.querySelector('main'), actions = document.querySelector('[data-fr030-actions]');
        return { y: scrollY, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight,
          width: innerWidth, height: innerHeight, actionBottom: actions.getBoundingClientRect().bottom,
          mainBottom: main.getBoundingClientRect().bottom };
      });
      assert.equal(geometry.y, 0, 'Only main may scroll');
      assert.ok(geometry.documentWidth <= geometry.width + 1, 'Matrix scroll must not overflow the page');
      assert.ok(geometry.documentHeight <= geometry.height + 1, 'Shell must fit the viewport');
      assert.ok(Math.abs(geometry.mainBottom - geometry.actionBottom) < 65, `No bottom void: ${JSON.stringify(geometry)}`);
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
    if (process.env.FR030_SCREENSHOTS) await page.screenshot({ path: `${process.env.FR030_SCREENSHOTS}/form-desktop.png`, fullPage: true });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.locator('main').evaluate(main => { main.scrollTop = main.scrollHeight; });
    const darkColors = await page.locator('[data-fr030-actions] button').first().evaluate(el => {
      let background = el;
      while (background.parentElement && ['rgba(0, 0, 0, 0)', 'transparent'].includes(getComputedStyle(background).backgroundColor)) background = background.parentElement;
      return { text: getComputedStyle(el).color, background: getComputedStyle(background).backgroundColor };
    });
    const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    const textLight = luminance(darkColors.text), backgroundLight = luminance(darkColors.background);
    assert.ok((Math.max(textLight, backgroundLight) + 0.05) / (Math.min(textLight, backgroundLight) + 0.05) >= 4.5, `Readable dark button contrast: ${JSON.stringify(darkColors)}`);
    await page.screenshot({ path: '../.superpowers/sdd/2026-11-07-fr030-berita-acara-backup/fr030-form-dark.png' });
    await page.getByLabel('Pelaksana', { exact: true }).selectOption('1');
    await page.waitForResponse(response => new URL(response.url()).pathname === '/api/tte/spesimen/1');
    assert.ok(specimenRequests.includes('/api/tte/spesimen/1'), 'New selections resolve by exact employee ID, never fuzzy name');
    await page.getByLabel('No. Dokumen', { exact: true }).fill('FR-030/UNSAVED');
    saveMode = '409';
    await page.getByRole('button', { name: 'Simpan perubahan', exact: true }).click();
    await page.getByRole('button', { name: 'Muat ulang data', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Batal', exact: true }).click();
    assert.equal(await page.getByLabel('No. Dokumen', { exact: true }).inputValue(), 'FR-030/UNSAVED');
    report.nomor_dokumen = 'FR-030/SERVER';
    await page.getByRole('button', { name: 'Muat ulang data', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Muat ulang', exact: true }).click();
    await page.waitForFunction(() => document.getElementById('fr030-nomor_dokumen')?.value === 'FR-030/SERVER');
    await page.getByRole('button', { name: 'Kembali', exact: true }).click();
    await page.getByRole('button', { name: 'Hapus laporan 7', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Hapus', exact: true }).click();
    await page.getByText('Belum ada laporan yang sesuai.', { exact: false }).waitFor();
    assert.deepEqual(writes.at(-1), { method: 'DELETE', pathname: '/api/smki/backup-restore/7', data: { version: 1 } });
    assert.deepEqual(unexpectedApi, []);
    report = { ...structuredClone(original), status: 'draft', pelaksana_jabatan: '', pelaksana_pangkat: '' };
    deleted = false; saveMode = 'ok';
    await page.goto(`${base}/smki/backup-restore/7/edit`);
    await page.getByText('Belum lengkap: jabatan, pangkat.', { exact: false }).waitFor();
    const signerPanel = page.getByLabel('Pelaksana', { exact: true }).locator('..').locator('..');
    await signerPanel.getByRole('button', { name: 'Perbarui identitas dari master', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Ambil identitas terbaru', exact: true }).click();
    await signerPanel.getByText('Identitas lengkap untuk finalisasi.', { exact: true }).waitFor();
    await page.getByLabel('No. Revisi', { exact: true }).fill('2.0');
    const refreshedSave = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().endsWith('/backup-restore/7'));
    await page.getByRole('button', { name: 'Simpan Draf', exact: true }).click();
    await refreshedSave;
    assert.deepEqual(writes.at(-1).data.refresh_signatories, ['pelaksana']);
    assert.equal(writes.at(-1).data.nomor_revisi, '2.0', 'Refreshing identity must not discard other edits');
    report = { ...structuredClone(original), pelaksana_pegawai_id: null };
    await page.goto(`${base}/smki/backup-restore/7/edit`);
    const historicalSigner = page.getByLabel('Pelaksana', { exact: true }).locator('..').locator('..');
    await historicalSigner.getByText(report.pelaksana_nama, { exact: true }).waitFor();
    assert.match(await historicalSigner.locator('select option:checked').textContent(), /tersimpan/);
    await historicalSigner.getByAltText('Spesimen Pelaksana', { exact: true }).waitFor();
    console.log('FR030 browser PASS: Final CRUD, blank metadata, independent activities, Draf roundtrip, clean-only upload, 409 retention, 422 focus, navigation cancel.');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
