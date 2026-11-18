/* eslint-disable @typescript-eslint/no-require-imports -- Real component SSR without a new test dependency. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const loaded = { exports: {} };
  const resolve = name => {
    if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
    const base = name.startsWith('@/') ? path.join(__dirname, '../../../', name.slice(2)) : path.join(path.dirname(file), name);
    return load(['.tsx', '.ts'].map(ext => base + ext).find(p => fs.existsSync(p)));
  };
  new Function('module', 'exports', 'require', js)(loaded, loaded.exports, resolve);
  return loaded.exports;
}
test('empty backup and restore have unique labelled controls despite identical empty validation indexes', () => {
  const { MonthlyResultField } = load(path.join(__dirname, 'molecules/MonthlyResultField.tsx'));
  const children = ['backup', 'restore'].map(operation => React.createElement(MonthlyResultField, {
    key: operation, entry: { month: 1, operation, result: null, performed_on: null, notes: null },
    year: 2026, errors: {}, prefix: 'assets.0.entries.-1', idPrefix: `asset-abc-1-${operation}`, onChange() {},
  }));
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null, children));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, 'each monthly control needs a unique ID');
  for (const match of html.matchAll(/\bfor="([^"]+)"/g)) assert.equal(ids.filter(id => id === match[1]).length, 1);
});
