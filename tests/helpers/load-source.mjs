import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const runtimeRequire = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

export function loadSource(file, overrides = {}, globals = {}) {
  const filename = path.resolve(projectRoot, file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const sandboxModule = { exports: {} };
  vm.runInNewContext(output, {
    module: sandboxModule, exports: sandboxModule.exports,
    require: name => {
      if (name in overrides) return overrides[name];
      if (name.startsWith("@/")) {
        const base = `src/${name.slice(2)}`;
        return loadSource(fs.existsSync(path.join(projectRoot, base + ".ts")) ? base + ".ts" : base + ".tsx", overrides, globals);
      }
      return runtimeRequire(name);
    },
    ...globals,
  }, { filename });
  return sandboxModule.exports;
}
