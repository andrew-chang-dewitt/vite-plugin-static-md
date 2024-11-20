import { resolve } from "path"
import type { UserConfig } from "vite"

import staticMd from "../src/main.js"

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
  logLevel: "info",
  plugins: [
    staticMd({
      excludes: {
        serve: "**/excluded-always*",
        build: ["src/pages/excluded-prod.md", "**/glob-excluded/**/*"],
      },
      cssFile: resolve(SRC_ROOT, "styles/index.css"),
      htmlTemplate: resolve(SRC_ROOT, "md-template.html"),
    }),
  ],
  resolve: {
    alias: {
      $: SRC_ROOT,
    },
  },
  root: HTML_ROOT,
} satisfies UserConfig
