import { JSDOM } from "jsdom"
import { parse, resolve } from "path"
import { readdir } from "fs/promises"

import { ctx } from "./ctx.js"
import { getInputRelativePath } from "./path.js"
import { Page, PageData } from "./page.js"
import { logger } from "./logging.js"

/**
 * render markdown source file to static html
 */
export async function render(page: Page): Promise<string> {
  const _ctxOut = ctx().getOut()
  const { src, md, data } = page
  const { root, htmlTemplate, cssFile, renderFn } = ctx().get()
  // get md source as html
  const asHtml = await renderFn(md, page)
  // get sibling files w/ same name, but different extensions
  const path = parse(src)
  let imports: string[] = []
  const rgxStr = `^${path.name}\.(?!md).*$`
  const rgx = new RegExp(rgxStr)
  for (const sibling of await readdir(path.dir)) {
    if (rgx.test(sibling)) {
      const importPath = parse(resolve(path.dir, sibling))
      const relImportPath = getInputRelativePath(importPath, root)
      imports.push(relImportPath)
    }
  }
  logger().dbg("siblings to import in html:")
  logger().dir(imports)

  // create mock dom for html manipulation
  const document = createDocument(htmlTemplate, cssFile)
  // get target node for markdown content insertion
  const targetNode = document.querySelector("#markdown-target")
  if (targetNode == null) {
    throw TypeError(
      'HTML template must include an element with the id "markdown-target".',
    )
  }
  // get body node for css script insertion
  const body = document.querySelector("body")!
  // scrub non-output data from context output
  // create script tag for importing css via vite/rollup & injecting context
  // output data into document
  const scriptTag = document.createElement("script")
  scriptTag.type = "module"
  scriptTag.text = `
// import "$/styles/index.css"
// load context data
document.ctx = ${JSON.stringify(_ctxOut)}
${
  !!data
    ? `
// load frontmatter data
document.pageData = ${JSON.stringify(data)}`
    : ""
}${
    ctx().isDev()
      ? `
// load data for this page directly from source though to trigger HMR on source
// changes, this duplicates a lot of stuff, but it's just in dev so 🤷
import "/${getInputRelativePath(parse(src), root)}?raw"`
      : ""
  }`

  targetNode.innerHTML = asHtml
  body.appendChild(scriptTag)

  // get head node for frontmatter metadata insertion
  const head = document.querySelector("head") || document.createElement("head")
  const tags = buildHeadTags(document, data)
  for (const tag of tags) {
    head.appendChild(tag)
  }

  const importsTag = document.createElement("script")
  importsTag.type = "module"
  importsTag.text = imports.map((src) => `import "/${src}"`).join("\n")
  // add after scriptTag so <head> is updated
  // & PageData is available on document for importees to use
  body.appendChild(importsTag)

  return normalizeHtml(document.documentElement.outerHTML)
}

/**
 * build `<head ... />` from `PageData`
 */
export function buildHeadTags(doc: Document, data: PageData): HTMLElement[] {
  let tags: HTMLElement[] = []
  // build head tags & append them
  // title
  const title = doc.createElement("title")
  title.textContent = data.title
  tags.push(title)

  // description => meta.name="{description}"
  if (data.description) {
    const desc = doc.createElement("meta")
    desc.name = "description"
    desc.content = data.description
    tags.push(desc)
  }

  // all other meta[name]: value => meta.name="{value}"
  if (data.meta) {
    let el: HTMLMetaElement
    for (const prop in data.meta) {
      el = doc.createElement("meta")
      el.name = prop
      el.content = data.meta[prop]
      tags.push(el)
    }
  }

  // keywords => meta.name="{keywords}"
  if (data.keywords && data.keywords.length !== 0) {
    const kw = doc.createElement("meta")
    kw.name = "keywords"
    kw.content = data.keywords.join(", ")
    tags.push(kw)
  }

  return tags
}

/**
 * alter given string so it has everything needed to be a complete html doc
 */
function normalizeHtml(code: string): string {
  const doctype = "<!doctype html>"

  let res = ""

  if (!code.startsWith(doctype)) {
    res += doctype
  }

  res += code

  return res
}

/**
 * create an html document object from a given html string, adding a stylesheet
 * link tag if css file is given
 */
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
