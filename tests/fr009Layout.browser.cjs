/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser regression test; no production dependency added. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.FR009_PLAYWRIGHT || 'playwright');
const base = process.env.FR009_BASE_URL || 'http://localhost:3000';
const user = { id: 901, name: 'Layout Test', email: 'layout@example.invalid', role: 'admin' };
const bidang = { id: 901, code: 'TEST', name: 'Bidang Uji' };
const services = [{ id: 16, code: 'SMKI', name: 'SMKI', is_enabled: true }];
const lookup = { units: [], users: [user], auditors: [], sources: [], template: { code: 'FR-009/ KOM.03.05/SANDIKAMI', revision: '3.0', effective_date: '2023-09-11', classification: 'INTERNAL' }, export_pdf_available: false };
const record = {
  id: 901, nomor_laporan: 'LAYOUT-901', id_unit_kerja: null, area: bidang.name, tanggal_laporan: '2026-10-19',
  diajukan_kepada_id: user.id, diajukan_kepada_nama: user.name, dilaporkan_oleh_id: user.id, dilaporkan_oleh_nama: user.name,
  sumber_codes: ['usulan_saran'], sumber_lainnya: '', status_temuan: 'Minor', deskripsi: 'Data tiruan pengujian layout.',
  akar_masalah: 'Pengujian scroll', id_auditor: null, auditor_nama: '', atasan_id: user.id, atasan_nama: user.name,
  items: [], status: 'draft', verifikasi: null, tanggal_verifikasi: null, catatan_verifikasi: null,
  created_by: user.id, bidang_id: bidang.id, verified_by: null, version: 1, template_version: '3.0', verifications: [],
  permissions: { can_update: true, can_delete: true, can_verify: false, can_export: true },
};
const records = Array.from({ length: 12 }, (_, index) => ({ ...record, id: 901 + index, nomor_laporan: `LAYOUT-${901 + index}` }));

async function assertShellIsAnchored(page, viewport, label) {
  const bannerColors = await page.locator('main header').first().locator('h1, p, h1 svg')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color));
  assert.equal(bannerColors.length, 4, `${label}: banner has a label, title, icon and description`);
  assert.ok(bannerColors.every((color) => color === 'rgb(255, 255, 255)'), `${label}: all banner text and the icon must be white`);
  const metrics = await page.evaluate(() => {
    const main = document.querySelector('main');
    const shell = main.closest('.h-dvh');
    const column = main.parentElement;
    const header = column.querySelector('header');
    const sidebar = document.querySelector('aside');
    return {
      windowY: scrollY, documentHeight: document.documentElement.scrollHeight,
      shellScrollTop: shell.scrollTop, columnScrollTop: column.scrollTop,
      mainBottom: main.getBoundingClientRect().bottom, headerTop: header.getBoundingClientRect().top,
      sidebarTop: sidebar.getBoundingClientRect().top, sidebarBottom: sidebar.getBoundingClientRect().bottom,
    };
  });
  console.log(`${viewport.width}px ${label}:`, JSON.stringify(metrics));
  assert.equal(metrics.windowY, 0, `${label}: document must not scroll`);
  assert.ok(metrics.documentHeight <= viewport.height + 1, `${label}: document must fit viewport`);
  assert.equal(metrics.shellScrollTop, 0, `${label}: shell must not scroll when Next.js brings the route into view`);
  assert.equal(metrics.columnScrollTop, 0, `${label}: header/content wrapper must not scroll`);
  assert.ok(metrics.headerTop >= 0, `${label}: global SMKI header must remain visible`);
  assert.ok(Math.abs(metrics.mainBottom - viewport.height) <= 1, `${label}: content must reach viewport bottom`);
  if (viewport.width >= 1024) {
    assert.ok(metrics.sidebarTop >= 0, `${label}: sidebar must not move above viewport`);
    assert.ok(Math.abs(metrics.sidebarBottom - viewport.height) <= 1, `${label}: sidebar must reach viewport bottom`);
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [];
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 1440, height: 900, impersonating: true }]) {
      const context = await browser.newContext({ viewport });
      await context.addCookies([{ name: 'token', value: 'layout-test-token', url: base }]);
      await context.addInitScript(({ user, bidang, services, impersonating }) => {
        localStorage.setItem('token', 'layout-test-token');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('bidang', JSON.stringify(bidang));
        localStorage.setItem('services', JSON.stringify(services));
        if (impersonating) localStorage.setItem('admin_token_backup', 'layout-backup-token');
      }, { user, bidang, services, impersonating: viewport.impersonating });
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.includes('/api/')) {
          assert.equal(route.request().method(), 'GET', 'Layout checks must not write data');
          const body = url.pathname.endsWith('/me') ? { success: true, user, bidang, services, is_admin_aptika: false }
            : url.pathname.endsWith('/lookup') ? { data: lookup }
              : /\/smki\/tindakan-perbaikan\/\d+$/.test(url.pathname) ? { data: record }
                : { data: records, meta: { current_page: 1, last_page: 1, total: records.length, per_page: 15 }, summary: { total: records.length, needs_follow_up: records.length, closed: 0 } };
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
        }
        return url.origin === base ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto(`${base}/smki/tindakan-perbaikan`);
      const add = page.getByRole('link', { name: '+ Tambah laporan', exact: true });
      await add.waitFor();
      if (await add.evaluate((link) => Boolean(link.closest('header')))) failures.push(`${viewport.width}: add link is still inside the banner`);
      await add.click();
      await page.getByLabel('Nomor laporan', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Tambah koreksi', exact: true }).click();
      await page.locator('main').evaluate((main) => { main.scrollTop = main.scrollHeight; });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.mouse.move(viewport.width - 35, viewport.height - 50);
      await page.mouse.wheel(0, 10000);
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(() => {
        const main = document.querySelector('main');
        const actions = [...document.querySelectorAll('button')].find((button) => button.textContent === 'Simpan draft').parentElement.parentElement;
        const sidebar = document.querySelector('aside');
        return { viewport: innerHeight, documentHeight: document.documentElement.scrollHeight, windowY: scrollY,
          mainTop: main.getBoundingClientRect().top, mainBottom: main.getBoundingClientRect().bottom,
          mainHeight: main.clientHeight, mainScrollHeight: main.scrollHeight, mainScrollTop: main.scrollTop,
          actionBottom: actions.getBoundingClientRect().bottom, sidebarTop: sidebar.getBoundingClientRect().top, sidebarBottom: sidebar.getBoundingClientRect().bottom };
      });
      console.log(`${viewport.width}px${viewport.impersonating ? ' simulation' : ''} scroll metrics:`, JSON.stringify(metrics));
      if (metrics.documentHeight > viewport.height + 1 || metrics.windowY !== 0) failures.push(`${viewport.width}: page has an outer scroll region`);
      if (metrics.actionBottom > viewport.height + 1 || metrics.actionBottom < viewport.height - 32) failures.push(`${viewport.width}: form does not end near the action bar`);
      if (viewport.width >= 1024 && (metrics.sidebarTop < -1 || metrics.sidebarBottom > viewport.height + 1)) failures.push('Desktop sidebar moved out of viewport');
      await assertShellIsAnchored(page, viewport, 'add form');
      await page.emulateMedia({ media: 'print' });
      const printMetrics = await page.locator('main').evaluate((main) => ({ overflow: getComputedStyle(main).overflowY, height: main.clientHeight, scrollHeight: main.scrollHeight }));
      assert.equal(printMetrics.overflow, 'visible', 'Print layout must retain natural content flow');
      assert.ok(printMetrics.scrollHeight <= printMetrics.height + 1, 'Print content must not be clipped to the viewport');

      // The bug appears on cached navigation, not just on the first page load.
      const navigation = await context.newPage();
      await navigation.goto(`${base}/smki/tindakan-perbaikan`);
      for (let visit = 0; visit < 3; visit++) {
        await navigation.getByRole('link', { name: 'LAYOUT-901', exact: true }).waitFor();
        await navigation.locator('main').evaluate((main) => { main.scrollTop = main.scrollHeight; });
        await navigation.getByRole('link', { name: 'Lihat laporan LAYOUT-912', exact: true }).click();
        await navigation.getByText(record.deskripsi, { exact: true }).waitFor();
        await assertShellIsAnchored(navigation, viewport, `detail visit ${visit + 1}`);
        await navigation.getByRole('link', { name: 'Edit', exact: true }).click();
        await navigation.getByLabel('Nomor laporan', { exact: true }).waitFor();
        await assertShellIsAnchored(navigation, viewport, `edit visit ${visit + 1}`);
        await navigation.locator('main').evaluate((main) => { main.scrollTop = main.scrollHeight; });
        const actionBottom = await navigation.getByRole('button', { name: 'Simpan draft', exact: true })
          .evaluate((button) => button.parentElement.parentElement.getBoundingClientRect().bottom);
        assert.ok(actionBottom >= viewport.height - 32 && actionBottom <= viewport.height + 1, 'Edit action bar must end near viewport bottom');
        await navigation.getByRole('button', { name: 'Kembali', exact: true }).click();
      }

      const landing = await context.newPage();
      await landing.goto(`${base}/smki`);
      await landing.getByRole('heading', { name: 'SMKI Diskominfo Jawa Barat', exact: true }).waitFor();
      assert.equal(await landing.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1), false, 'Shared SMKI landing keeps a bounded shell');
      await context.close();
    }
    assert.deepEqual(failures, []);
    console.log('FR009 layout regression PASS: add/edit/detail, cached navigation, fixed shell, desktop/mobile/simulation, and print.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
