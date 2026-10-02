import { copyFile, mkdir } from "node:fs/promises";

import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  external: ["react", "react-dom", "motion", "tailwindcss"],
};

export default defineConfig([
  {
    ...shared,
    entry: { core: "src/core/index.ts", "tailwind-preset": "src/tailwind-preset.ts" },
  },
  {
    ...shared,
    entry: { index: "src/index.ts" },
    // Components and hooks must render on the client in RSC frameworks (e.g. Next.js landing pages).
    banner: { js: '"use client";' },
    async onSuccess() {
      await mkdir("dist", { recursive: true });
      await copyFile("src/styles/styles.css", "dist/styles.css");
      await copyFile("src/styles/tokens.css", "dist/tokens.css");
    },
  },
  {
    entry: { "worklets/pcm-vad-processor": "src/worklets/pcm-vad-processor.ts" },
    format: ["esm"],
    target: "es2022",
    tsconfig: "tsconfig.worklet.json",
    dts: false,
    // AudioWorklet modules are loaded by URL and cannot import anything.
    noExternal: [/.*/],
  },
]);
