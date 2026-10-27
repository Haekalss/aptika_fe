/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node 20 CJS test harness using the existing TypeScript compiler. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "guardedNavigation.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const compiledModule = { exports: {} };
new Function("module", "exports", compiled.outputText)(compiledModule, compiledModule.exports);
const { BEFORE_NAVIGATION_EVENT, runGuardedNavigation } = compiledModule.exports;

let actions = 0;
runGuardedNavigation(() => actions++);
assert.equal(actions, 1, "No browser/listener must preserve the existing navigation behavior.");
global.window = new EventTarget();
// CustomEvent is browser-native; supply it for supported Node 20 versions without it.
global.CustomEvent ??= class extends Event {
  constructor(type, options) { super(type, options); this.detail = options.detail; }
};
runGuardedNavigation(() => actions++);
assert.equal(actions, 2);

let pending;
const dirtyForm = (event) => { event.preventDefault(); pending = event.detail.proceed; };
window.addEventListener(BEFORE_NAVIGATION_EVENT, dirtyForm);
runGuardedNavigation(() => actions++);
assert.equal(actions, 2, "Canceled navigation must not run cleanup, logout or route change.");
pending = undefined; // User canceled the confirmation.
assert.equal(actions, 2);
runGuardedNavigation(() => actions++);
pending();
pending();
assert.equal(actions, 3, "Confirmed/deferred navigation must run exactly once.");
window.removeEventListener(BEFORE_NAVIGATION_EVENT, dirtyForm);
const immediate = (event) => event.detail.proceed();
window.addEventListener(BEFORE_NAVIGATION_EVENT, immediate);
runGuardedNavigation(() => actions++);
assert.equal(actions, 4, "An eager listener plus default dispatch still runs the action once.");
window.removeEventListener(BEFORE_NAVIGATION_EVENT, immediate);
delete global.window;
console.log("Guarded navigation self-check: PASS (default, cancellation, deferred and exactly once)");
