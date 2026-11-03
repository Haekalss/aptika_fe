/* eslint-disable @typescript-eslint/no-require-imports -- Node harness reuses the installed TypeScript compiler. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { lookup, report } = require('./fr009Pdf.fixtures.cjs');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const { createFr009Pdf, fr009PdfFilename } = require('../src/utils/smkiTindakanPerbaikanPdf.ts');
const assets = {
  logo: `data:image/png;base64,${fs.readFileSync(path.join(__dirname, '../public/logo-jabar.png')).toString('base64')}`,
};
function saveQa(doc, filename) {
  if (!process.env.FR009_PDF_QA_DIR) return;
  fs.mkdirSync(process.env.FR009_PDF_QA_DIR, { recursive: true });
  fs.writeFileSync(path.join(process.env.FR009_PDF_QA_DIR, filename), Buffer.from(doc.output('arraybuffer')));
}

test('PDF uses Letter paper, built-in Helvetica and the existing shared logo', () => {
  const doc = createFr009Pdf(report(), lookup, assets);
  assert.ok(Math.abs(doc.internal.pageSize.getWidth() - 215.9) < 0.01);
  assert.ok(Math.abs(doc.internal.pageSize.getHeight() - 279.4) < 0.01);
  assert.match(doc.output(), /^%PDF-/);
  assert.equal(doc.getFont().fontName, 'helvetica');
  assert.equal(doc.getFont().isStandardFont, true);
  assert.doesNotMatch(doc.output(), /\/FontFile/);
  assert.equal(doc.getNumberOfPages(), 1);
  saveQa(doc, 'fr009-normal.pdf');
});

test('blank draft accepts nulls without inventing identities or a verification', () => {
  const doc = createFr009Pdf(report({
    nomor_laporan: null, area: '', tanggal_laporan: null, diajukan_kepada_nama: '', dilaporkan_oleh_nama: '',
    sumber_codes: [], sumber_lainnya: '', status_temuan: null, deskripsi: '', akar_masalah: '',
    auditor_nama: '', atasan_nama: '', items: [], status: 'draft', verifikasi: null, tanggal_verifikasi: null, catatan_verifikasi: null,
  }), lookup, assets);
  assert.equal(doc.getNumberOfPages(), 1);
  saveQa(doc, 'fr009-draft.pdf');
});

test('long narratives and many action rows paginate without changing the source data', () => {
  const long = report({
    nomor_laporan: 'PDF-PANJANG', dilaporkan_oleh_nama: 'José Muñoz', akar_masalah: 'Analisis A & B - perlu perbaikan. “Evaluasi” €10.',
    deskripsi: `${'Teks panjang & <uji> untuk memeriksa pemenggalan halaman.\n'.repeat(48)}AKHIR_DESKRIPSI`,
    catatan_verifikasi: 'AKHIR_CATATAN',
    items: Array.from({ length: 36 }, (_, index) => ({
      id: index + 1, jenis: index % 2 ? 'tindakan_korektif' : 'koreksi', urutan: 36 - index,
      uraian: `TINDAKAN_${index + 1} - ${'Uraian tindakan dengan baris lanjutan. '.repeat(5)}\nSELESAI_${index + 1}`,
      pic_id: null, pic_nama: 'PIC José', batas_waktu: '2026-10-23',
    })),
  });
  const before = JSON.stringify(long);
  const doc = createFr009Pdf(long, lookup, assets);
  assert.ok(doc.getNumberOfPages() >= 3);
  assert.ok(doc.getNumberOfPages() < 20);
  assert.equal(JSON.stringify(long), before);
  saveQa(doc, 'fr009-panjang.pdf');
});

test('renderer rejects an explicitly denied export permission', () => {
  assert.throws(() => createFr009Pdf(report({ permissions: { can_export: false } }), lookup, assets), /hak ekspor/);
});

test('unsupported glyphs produce an explicit error instead of an incomplete PDF', () => {
  for (const deskripsi of ['Temuan 😀', 'Analisis α & β']) {
    assert.throws(() => createFr009Pdf(report({ deskripsi }), lookup, assets), /Gunakan ekspor DOCX agar isi tetap utuh/);
  }
});

test('filename sanitizes report numbers and falls back to the record ID', () => {
  assert.equal(fr009PdfFilename(report()), 'FR-009_FR009_UJI_2026.pdf');
  assert.equal(fr009PdfFilename(report({ nomor_laporan: null })), 'FR-009_901.pdf');
  assert.ok(!fr009PdfFilename(report({ nomor_laporan: '../\\laporan\n' })).includes('/'));
});
