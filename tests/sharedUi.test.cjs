/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node test harness uses the existing TypeScript compiler. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, file) => {
    const source = fs.readFileSync(file, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    });
    module._compile(outputText, file);
  };
}

const Input = require('../src/components/ui/Input.tsx').default;
const FormField = require('../src/components/ui/FormField.tsx').default;
const ConfirmModal = require('../src/components/ui/ConfirmModal.tsx').default;
const Modal = require('../src/components/ui/Modal.tsx').default;

test('input labels and validation messages reference the control', () => {
  const html = renderToStaticMarkup(React.createElement(Input, { id: 'nomor', label: 'No', error: 'Wajib diisi' }));
  assert.match(html, /for="nomor"/);
  assert.match(html, /id="nomor"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="nomor-error"/);
  assert.match(html, /id="nomor-error"/);
});

test('textarea hints preserve caller descriptions', () => {
  const html = renderToStaticMarkup(React.createElement(Input, {
    id: 'akar', textarea: true, helperText: 'Penyebab utama', 'aria-describedby': 'extra',
  }));
  assert.match(html, /<textarea/);
  assert.match(html, /aria-describedby="extra akar-hint"/);
});

test('FormField automatically associates a native master select and its hint', () => {
  const html = renderToStaticMarkup(React.createElement(FormField, { label: 'Unit', hint: 'Pilih unit' },
    React.createElement('select', { defaultValue: '' }, React.createElement('option', { value: '' }, 'Pilih'))));
  const labelId = html.match(/<label for="([^"]+)"/)[1];
  assert.ok(html.includes(`id="${labelId}"`));
  assert.match(html, /aria-describedby="[^"]+-hint"/);
});

test('confirmation and general dialogs expose accessible names and close actions', () => {
  const confirmation = renderToStaticMarkup(React.createElement(ConfirmModal, {
    isOpen: true, onClose() {}, onConfirm() {}, title: 'Konfirmasi Close', message: 'Tutup kasus?',
  }));
  assert.match(confirmation, /role="alertdialog"/);
  assert.match(confirmation, /aria-modal="true"/);
  assert.match(confirmation, /aria-labelledby="[^"]+"/);
  assert.match(confirmation, /aria-describedby="[^"]+"/);
  assert.match(confirmation, /aria-label="Tutup dialog"/);
  const modal = renderToStaticMarkup(React.createElement(Modal, { isOpen: true, onClose() {}, title: 'Pratinjau' }, 'Isi'));
  assert.match(modal, /role="dialog"/);
  assert.match(modal, /aria-label="Tutup dialog"/);
});
