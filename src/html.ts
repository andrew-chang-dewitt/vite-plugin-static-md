import { JSDOM } from "jsdom"
import { marked } from "marked"
import { parse } from "path"

import { getInputRelativePath } from "./path.js"

export async function mdToStaticHtml(
  md: string,
  htmlTemplate: string,
  cssFile?: string,
): Promise<string> {
  // get md source as html
  const asHtml = await marked(md)
  // create mock dom for html manipulation
  const document = createDocument(htmlTemplate, cssFile)
  // find target node for markdown content
  const targetNode = document.querySelector("#markdown-target")
  if (targetNode == null) {
    throw TypeError(
      'HTML template must include an element with the id "markdown-target".',
    )
  }
  // get body node for css script insertion
  const body = document.querySelector("body")!
  // create script tag for importing css via vite/rollup
  const scriptTag = document.createElement("script")
  scriptTag.type = "module"
  scriptTag.text = `import "$/styles/index.css"`

  targetNode.innerHTML = asHtml
  body.appendChild(scriptTag)

  return normalizeHtml(document.documentElement.outerHTML)
}

export async function mdToDynHtml(
  mdSrcPath: string,
  root: string,
  htmlTemplate: string,
  cssFile?: string,
): Promise<string> {
  const document = createDocument(htmlTemplate, cssFile)
  const body = document.querySelector("body")!

  const mdSrcRelative = getInputRelativePath(parse(mdSrcPath), root)

  const scriptTag = document.createElement("script")
  scriptTag.type = "module"
  scriptTag.text = `
import { marked } from "marked"

import doc from "/${mdSrcRelative}?raw"

const content = marked.parse(doc)
document.querySelector("#markdown-target").innerHTML = content
  `

  body.appendChild(scriptTag)

  return normalizeHtml(document.documentElement.outerHTML)
}

// alter given string so it has everything needed to be a complete html doc
function normalizeHtml(code: string): string {
  const doctype = "<!doctype html>"

  let res = ""

  if (!code.startsWith(doctype)) {
    res += doctype
  }

  res += code

  return res
}

function createDocument(htmlTemplate: string, cssFile?: string): Document {
  const DOM = new JSDOM(htmlTemplate)
  const document = DOM.window.document
  // get body node for css script insertion
  const body = document.querySelector("body")!

  if (cssFile) {
    // create script tag for importing css via vite/rollup
    const scriptTag = document.createElement("script")
    scriptTag.type = "module"
    scriptTag.text = `import "${cssFile}"`

    body.appendChild(scriptTag)
  }

  return document
}
