/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser QA without a new production dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.FR009_PLAYWRIGHT || 'playwright');
const { user, bidang, services, lookup, report } = require('./fr009Pdf.fixtures.cjs');
const base = process.env.FR009_BASE_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
      await context.addCookies([{ name: 'token', value: 'pdf-test-only', url: base }]);
      await context.addInitScript(({ user, bidang, services }) => {
        localStorage.setItem('token', 'pdf-test-only');
        for (const [key, value] of Object.entries({ user, bidang, services })) localStorage.setItem(key, JSON.stringify(value));
      }, { user, bidang, services });
      let denied = false;
      let missingAsset = false;
      let hideExport = false;
      let exportRequests = 0;
      let logoRequests = 0;
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        assert.ok(!url.pathname.endsWith('.ttf'), 'PDF must use built-in fonts, not TTF assets');
        assert.ok(!url.pathname.endsWith('/smki/fr009-logo.png'), 'PDF must reuse the shared logo');
        if (url.pathname === '/logo-jabar.png') {
          logoRequests++;
          if (missingAsset) return route.fulfill({ status: 404, body: 'Not found' });
        }
        if (url.pathname.includes('/api/')) {
          assert.equal(route.request().method(), 'GET', 'PDF checks must not write real data');
          assert.ok(!url.pathname.endsWith('/export-pdf'), 'Browser PDF must not call the Office converter');
          if (url.pathname.endsWith('/export-pdf-data')) {
            exportRequests++;
            return route.fulfill({ status: denied ? 403 : 200, contentType: 'application/json', body: JSON.stringify(denied ? { message: 'Ekspor ditolak oleh server.' } : { data: report() }) });
          }
          const body = url.pathname.endsWith('/me') ? { success: true, user, bidang, services, is_admin_aptika: false }
            : url.pathname.endsWith('/lookup') ? { data: lookup }
              : { data: report(hideExport ? { permissions: { can_export: false, can_update: false, can_delete: false, can_verify: false } } : {}) };
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
        }
        return url.origin === base ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto(`${base}/smki/tindakan-perbaikan/901`);
      const pdf = page.getByRole('button', { name: 'PDF', exact: true });
      await pdf.waitFor();
      assert.equal(await pdf.isEnabled(), true, 'PDF remains enabled even when server converter availability is false');
      assert.equal(await page.getByText(/Ekspor PDF belum tersedia/).count(), 0);
      const [download] = await Promise.all([page.waitForEvent('download'), pdf.click()]);
      assert.equal(download.suggestedFilename(), 'FR-009_FR009_UJI_2026.pdf');
      const file = await download.path();
      assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
      assert.ok(logoRequests > 0, 'PDF loads the shared logo-jabar.png');
      await pdf.waitFor();
      assert.equal(exportRequests, 1);

      denied = true;
      await pdf.click();
      await page.getByText('Ekspor ditolak oleh server.', { exact: true }).waitFor();
      assert.equal(await pdf.isEnabled(), true);
      denied = false;
      missingAsset = true;
      await pdf.click();
      await page.getByText('Aset PDF gagal dimuat. Muat ulang halaman lalu coba lagi.', { exact: true }).waitFor();
      assert.equal(await pdf.isEnabled(), true);
      hideExport = true;
      await page.reload();
      await page.getByRole('heading', { name: 'Detail Tindakan Perbaikan & Pencegahan', exact: true }).waitFor();
      await page.getByText('No. laporan', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'PDF', exact: true }).count(), 0);
      await context.close();
      console.log(`${width}px: PDF download, no-converter mode, authorization failure, missing assets and permissions PASS`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
