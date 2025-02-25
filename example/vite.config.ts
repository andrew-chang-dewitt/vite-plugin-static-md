import hljs from "highlight.js"
import { markedHighlight } from "marked-highlight"
import { resolve } from "path"
import type { UserConfig } from "vite"

import staticMd from "vite-plugin-static-md"

const OUT_DIR = resolve(__dirname, "dist")
const HTML_ROOT = resolve(__dirname, "src/pages")
const SRC_ROOT = resolve(__dirname, "src")

function codeHighlighter() {
  return markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang, _) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext"
      console.log(`highlighting code block for ${lang}`)
      return hljs.highlight(code, { language }).value
    },
  })
}

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
      mdExtensions: [codeHighlighter],
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
