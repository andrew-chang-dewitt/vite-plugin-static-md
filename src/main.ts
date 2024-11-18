/*
 * vite-plugin-static-md
 *
 * A simple plugin for building a truly static multi-page site from markdown files using vite.
 *
 * Features:
 *
 * - [x] Dev server w/ HMR for live updates as you edit markdown files.
 * - [x] Build outputs static index.html files from markdown files, matching the source file tree.
 * - [ ] Customize output of...
 *   - [x] ...html using html template files.
 *   - [x] ...css styles by specifying css files to include.
 *   - [ ] [TODO]...markdown rendering using custom markdown renderer functions.
 * - [ ] [TODO]Create sitemaps & feeds from markdown files.
 * - [ ] inline imports to sibling assets--e.g. for some <file>.md, if there's a
 *       <file>.css or <file>.(ts|js) next to it, then imports of both will be
 *       added to the output html
 * - [ ] create a template for initing new projects set up for this easily
 * - [ ] [TODO] create a cli that loads a given file as the sole md source into
 *       the default template & launches a dev server or generates html & pdf
 *       outputs
 * - [ ] [TODO] frontmatter support to get page title, summary, publish date, & other information
 * - [ ] toc support
 * - [ ] toc as page in directory using data from frontmatter of descendant pages
 */

import { ParsedPath, parse } from "path"

import { JSDOM } from "jsdom"
import { marked } from "marked"
import { send } from "vite"
import type {
  Connect,
  Plugin,
  PreviewServer,
  UserConfig,
  ViteDevServer,
} from "vite"

import { modifyConfig } from "./config.js"
import { Context } from "./context.js"
import { Page } from "./page.js"
import { logger } from "./logging.js"

export const DEFAULT_HTML_TEMPLATE = `\
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <article id="markdown-target"></article>
  </body>
</html>
`

export interface Options {
  cssFile?: string // exact path only
  excludes?: string | string[] | ExcludePatterns // paths or globs
  htmlTemplate?: string // exact path only
}

export interface ExcludePatterns {
  serve?: string | string[] // paths or globs
  build: string | string[] // paths or globs
}

export default function staticMd(opts?: Options): Plugin[] {
  let ctx: Context

  return [
    {
      name: "static-md-plugin:serve",
      apply: "serve",

      // setup log level if user provides a value
      async config(userConfig): Promise<UserConfig> {
        const [builtContext, cfg] = await modifyConfig(userConfig, opts)
        ctx = builtContext

        return cfg
      },

      // configure custom middleware to point urls matching `pages` to their
      // markdown sources & transform those sources into index.html files
      configureServer(server) {
        server.middlewares.use(
          indexMdMiddleware(
            server,
            ctx.root,
            ctx.pages,
            ctx.htmlTemplate,
            ctx.cssFile,
          ),
        )
      },
    },
    {
      name: "static-md-plugin:build",
      apply: "build",

      // edit user config to add all markdown files as rollup entry points
      async config(userConfig): Promise<UserConfig> {
        const [builtContext, cfg] = await modifyConfig(
          userConfig,
          opts,
          "build",
        )
        ctx = builtContext

        return cfg
      },

      resolveId(src: string) {
        // sources not in pages map are skipped
        if (!ctx.filter(src)) return null
        // ensure sources given in pages map are resolved,
        // even if the file doesn't exist
        return src
      },

      async load(id: string) {
        // ids not in pages map are skipped
        if (!ctx.filter(id)) return null

        const { md } = ctx.pages[id]
        const res = {
          code: await mdToStaticHtml(md, ctx.htmlTemplate, ctx.cssFile),
        }

        return res
      },
    },
  ]
}

async function mdToStaticHtml(
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

// heavily inspired by implementation of indexHtmlMiddleware in vite server
// https://github.com/vitejs/vite/blob/v5.4.9/packages/vite/src/node/server/middlewares/indexHtml.ts#L414
// starts at getting something that gets an html "file" from the md Page obj,
// then processes it through server.transformIndexHtml(...) before sending it
// on to the client this'll only work for dev though, build/preview needs to
// emit files to the bundle probably
function indexMdMiddleware(
  server: ViteDevServer | PreviewServer,
  root: string,
  pages: Record<string, Page>,
  htmlTemplate: string,
  cssFile?: string,
): Connect.NextHandleFunction {
  const isDev = isDevServer(server)

  return async function viteIndexHtmlMiddleware(req, res, next) {
    if (res.writableEnded) {
      return next()
    }

    const url = req.url && cleanUrl(req.url)
    if (
      url &&
      Object.keys(pages).includes(url) &&
      req.headers["sec-fetch-dest"] !== "script"
    ) {
      logger().info(`handling ${url}`)
      // get the source id from the page url path
      let { src } = pages[url]
      logger().info(`matched ${src}`)

      // then the rest here gets changed to simply get the same headers
      const headers = isDev
        ? server.config.server.headers
        : server.config.preview.headers

      try {
        // and if in Dev inject a script tag that loads markdown using
        // `<filename>.md?raw`, parses it w/ marked before inserting parsed
        // markdown into html template instead of loading from filesystem
        if (isDev) {
          let html = await mdToDynHtml(src, root, htmlTemplate, cssFile)
          // have vite apply standard html transforms
          // (hopefully this includes adding the markdown source to the module graph?)
          logger().info(`${url} before vite's transform:`)
          logger().dir(html)
          html = await server.transformIndexHtml(url, html, req.originalUrl)
          logger().info(`${url} served as:`)
          logger().dir(html)
          return send(req, res, html, "html", { headers })
        } else {
          throw TypeError(
            "Markdown should be parsed to static HTML in Build mode.",
          )
        }
        // before finally sending a response like below
      } catch (e) {
        return next(e)
      }
    }
    next()
  }
}

function isDevServer(
  server: ViteDevServer | PreviewServer,
): server is ViteDevServer {
  return "pluginContainer" in server
}

const postfixRE = /[?#].*$/
function cleanUrl(url: string): string {
  return url.replace(postfixRE, "")
}

async function mdToDynHtml(
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

function getInputRelativePath({ dir, base }: ParsedPath, root: string): string {
  let res = ""
  logger().info(`making ${dir}/${base} relative...`)

  // starts w/ root means it's not relative --
  // FIXME: this probably should be a lot more robust, but good enough for now
  if (dir.startsWith(root)) {
    res += dir.slice(root.length + 1) // +1 to remove leading `/` too
  } // otherwise we're already relative?
  else {
    res += dir
  }

  // a separating `/` is needed if the relative path is in a subdir
  if (res.length > 0) {
    res += "/"
  }
  res += `${base}`

  logger().info(`done: ${res}`)

  return res
}
