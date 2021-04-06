import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import ts from "@wessberg/rollup-plugin-ts";
import paths from "rollup-plugin-ts-paths";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { spawn } from "child_process";
import { keys, mapValues, upperFirst, camelCase, template } from "lodash";
import pkg from "./package.json";

const { main, dependencies, module, unpkg, browser } = pkg;
const formatModule = (name) => upperFirst(camelCase(name.indexOf("@") !== -1 ? name.split("/")[1] : name));
const yearRange = (date) => (new Date().getFullYear() === +date ? date : `${date} - ${new Date().getFullYear()}`);
const year = yearRange(pkg.since || new Date().getFullYear());
const external = keys(dependencies || {});
const globals = mapValues(dependencies || {}, (value, key) => formatModule(key));
const name = formatModule(pkg.name);
/* eslint-disable */
const banner = template(`
/**
 * <%= p.nameFormatted %> (<%= p.name %> v<%= p.version %>)
 * <%= p.description %>
 * <%= p.homepage %>
 * (c) <%= p.year %> <%= p.author %>
 * @license <%= p.license || "MIT" %>
 */
/* eslint-disable */`, { variable: "p" })({ ...pkg, nameFormatted: name, year }).trim();
/* eslint-enable */

const live = !!process.env.ROLLUP_WATCH;

const outputs = [
  { format: "cjs", file: main },
  !live && { format: "umd", file: unpkg },
  !live && { format: "esm", file: module },
  !live && { format: "iife", file: browser },
].filter((it) => it);

export default {
  input: live ? "example/index.ts" : "src/index.ts",
  output: outputs.map(({ format, file }) => ({
    exports: "named",
    sourcemap: true,
    file,
    format,
    globals,
    name,
    banner,
  })),
  external,
  watch: {
    include: ["src/**/*", "example/**/*"],
  },
  plugins: [
    sourcemaps(),
    paths(),
    commonjs(),
    nodeResolve(),
    json({ compact: true }),
    ts({ tsconfig: live ? "tsconfig.json" : "tsconfig.build.json" }),
    live
      ? npmTaskAfterBuild("start")
      : terser({ output: { comments: (node, comment) => /@preserve|@license|@cc_on/i.test(comment.value) } }),
  ],
};

function npmTaskAfterBuild(task, ...args) {
  let instance = undefined;
  let timeout = undefined;

  function waitForProcessExit(process) {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => {
      process.on("exit", () => setTimeout(resolve, 200));
      process.kill();
    });
  }

  async function restartCommand() {
    if (instance) await waitForProcessExit(instance);
    instance = spawn("npm", ["run", task, ...args], {
      stdio: ["ignore", "inherit", "inherit"],
      shell: true,
      env: process.env,
    });
  }

  function writeBundle() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(restartCommand, 1000);
  }

  process.on("beforeExit", () => instance && instance.kill());

  return { writeBundle };
}
