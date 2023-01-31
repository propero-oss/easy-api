import { defineConfig } from "tsup";
import pkg from "./package.json";

function banner(lines: string[]) {
  if (!lines.length) return "";
  return `/**!${lines.map((line) => `\n * ${line}`).join("")}\n */`;
}

function dateRange(since: number) {
  const now = new Date().getFullYear();
  if (now === since) return since;
  return `${since} - ${now}`;
}

export default defineConfig(({ watch }) => {
  return {
    entry: watch ? ["example/index.ts"] : ["src/index.ts"],
    dts: !watch,
    minify: !watch,
    format: watch ? ["cjs"] : ["esm", "cjs"],
    sourcemap: !watch,
    name: pkg.name,
    banner: {
      js: banner([`${pkg.name} v${pkg.version}`, pkg.description, `© ${dateRange(pkg.since)} ${pkg.author}`, `@license ${pkg.license}`]),
    },
    onSuccess: watch ? "pnpm run start" : undefined,
  };
});
