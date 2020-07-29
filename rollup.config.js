import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "@rollup/plugin-commonjs";
import ts from "@wessberg/rollup-plugin-ts";
import paths from "rollup-plugin-ts-paths";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import { keys, mapValues, upperFirst, camelCase, template } from "lodash";
import pkg from "./package.json";

const { main, dependencies, module, unpkg, browser } = pkg;
const formatModule = (name) => upperFirst(camelCase(name.indexOf("@") !== -1 ? name.split("/")[1] : name));
const yearRange = (date) => (new Date().getFullYear() === +date ? date : `${date} - ${new Date().getFullYear()}`);
const year = yearRange(pkg.since || new Date().getFullYear());
const external = keys(dependencies || {});
const globals = mapValues(dependencies || {}, (value, key) => formatModule(key));
const name = formatModule(pkg.name);
const banner = template(`
/**
 * <%= nameFormatted %> (<%= name %> v<%= version %>)
 * <%= description %>
 * <%= homepage %>
 * (c) <%= year %> <%= author %>
 * @license <%= license || "MIT" %>
 */
`)({ ...pkg, nameFormatted: name, year }).trim();

const outputs = [
  { format: "cjs", file: main },
  { format: "umd", file: unpkg },
  { format: "esm", file: module },
  { format: "iife", file: browser },
];

export default {
  input: "src/index.ts",
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
    include: ["src/**/*"],
  },
  plugins: [sourcemaps(), paths(), commonjs(), nodeResolve(), json({ compact: true }), ts({ tsconfig: "tsconfig.build.json" })],
};
