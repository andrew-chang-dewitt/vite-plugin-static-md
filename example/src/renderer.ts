import hljs from "highlight.js"
import { Marked, MarkedExtension } from "marked"
import { createDirectives } from "marked-directive"
import { markedHighlight } from "marked-highlight"

export type ExtBuilder = () => MarkedExtension

function makeRenderer(extensions?: ExtBuilder[]): Marked {
  const renderer = new Marked()
  renderer.use(createDirectives())
  if (extensions) {
    extensions.forEach((ext) => {
      renderer.use(ext())
    })
  }

  return renderer
}

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

const mdExtensions = [codeHighlighter]

export default makeRenderer(mdExtensions)
