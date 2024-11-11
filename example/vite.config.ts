import { resolve } from "path"
import type { UserConfig } from "vite"

import staticMd from "../src/main"

const OUT_DIR = resolve(__dirname, "dist")
const HTML_ROOT = resolve(__dirname, "src/pages")
const SRC_ROOT = resolve(__dirname, "src")

export default {
  appType: "mpa",
  build: {
    outDir: OUT_DIR,
    rollupOptions: {
      // ideally, a solution will auto-generate these
      // for every md pge
      input: {
        main: resolve(HTML_ROOT, "index.html"),
        other: resolve(HTML_ROOT, "other/index.html"),
      },
    },
  },
  // usage should be like:
  plugins: [
    staticMd({
      htmlTemplate: resolve(SRC_ROOT, "md-template.html"),
      cssFile: resolve(SRC_ROOT, "styles/index.css"),
    }),
  ],
  resolve: {
    alias: {
      $: SRC_ROOT,
    },
  },
  root: HTML_ROOT,
} satisfies UserConfig
