import { resolve } from "path"
import type { UserConfig } from "vite"

import { default as staticMd } from "vite-plugin-static-md"

import renderFn from "./src/renderer.js"

const __dirname = import.meta.dirname

const OUT_DIR = resolve(__dirname, "dist")
const HTML_ROOT = resolve(__dirname, "src/pages")
const SRC_ROOT = resolve(__dirname, "src")

export default {
  appType: "mpa",
  build: {
    outDir: OUT_DIR,
    rollupOptions: {
      input: {
        other: resolve(HTML_ROOT, "other/index.html"),
      },
    },
  },
  logLevel: "debug",
  plugins: [
    staticMd({
      excludes: {
        serve: "**/excluded-always*",
        build: ["src/pages/excluded-prod.md", "**/glob-excluded/**/*"],
      },
      cssFile: resolve(SRC_ROOT, "styles/index.css"),
      htmlTemplate: resolve(SRC_ROOT, "md-template.html"),
      renderFn,
    }),
  ],
  resolve: {
    alias: {
      $: SRC_ROOT,
    },
  },
  root: HTML_ROOT,
  server: {
    allowedHosts: ["topo"],
  },
} satisfies UserConfig
