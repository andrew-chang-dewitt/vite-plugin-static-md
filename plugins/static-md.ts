/*
 * vite-plugin-static-md
 *
 * A simple plugin for building a truly static multi-page site from markdown files using vite.
 *
 * Features:
 *
 * - [x] Dev server w/ HMR for live updates as you edit markdown files.
 * - [ ] Build outputs static index.html files from markdown files, matching the source file tree.
 * - [ ] Customize output of...
 *   - [ ] ...html using html template files.
 *   - [ ] ...markdown rendering using custom markdown renderer functions.
 *   - [ ] ...css styles by specifying css files to include.
 * - [ ] Create sitemaps & feeds from markdown files.
 */

import { readFile, readdir, stat } from "fs/promises"
import { ParsedPath, parse, resolve } from "path"

import { JSDOM } from "jsdom"
import { marked } from "marked"
import {
  Plugin,
  PreviewServer,
  UserConfig,
  ViteDevServer,
  createFilter,
  send,
} from "vite"
import type { Connect } from "vite"

const HTML_TEMPLATE = `\
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
  root?: string
  // htmlTemplate: string
}

export default function staticMd(opts: Options): Plugin[] {
  let root: string
  let paths: string[] = []
  let pages: Record<string, Page> = {}

  let filter = createFilter("**/*.md")

  return [
    {
      name: "static-md-plugin:serve",
      apply: "serve",

      // edit user config to add all markdown files as rollup entry points
      async config(userConfig): Promise<UserConfig> {
        // ensure a root is specified so URIs can be build for output destinations
        let cfgRoot = opts.root || userConfig.root
        if (cfgRoot) {
          root = cfgRoot
        } else {
          throw Error(
            "Root must be defined in vite config or in plugin options",
          )
        }

        // walk filetree at root & get absolute paths to every markdown file
        paths = await getPaths(root)
        pages = await getPages(paths, root)

        return {
          build: {
            rollupOptions: {
              // build rollup input option object from absolute paths
              input: buildInputObj(paths, root),
            },
          },
        }
      },

      // TODO: try to emit markdown files into build?
      // UPDATE: looks like `this.emit` is ignored during dev mode
      //         might need to split this plugin into :build & :serve variants
      // buildStart(options) {
      //   console.log("buildStart(...)")
      //   console.log(dir(options))
      //   for (const page of Object.values(pages)) {
      //     const { id } = page
      //     console.log(`emitting ${id}`)
      //     this.emitFile({
      //       type: "chunk",
      //       id,
      //     })
      //   }
      // },

      // configure custom middleware to point urls matching `pages` to their
      // markdown sources & transform those sources into index.html files
      configureServer(server) {
        server.middlewares.use(indexMdMiddleware(root, pages, server))
      },

      // async transformIndexHtml(html, ctx): Promise<string> {
      //   console.log(
      //     `transformIndexHtml(...) transforming ${ctx.filename} for request at ${ctx.path}`,
      //   )
      //   console.log(dir(html))

      //   return html
      // },

      // async resolveId(source, importer, options) {
      //   console.log(`resolveId(...) resolving ${source} with`)
      //   console.log(dir(importer))
      //   console.log(dir(options))
      // },

      // // then, allow loading markdown files as entry points hopefully?
      // async load(id) {
      //   console.log(`load(...) loading ${id}...`)
      //   if (!filter(id)) return null

      //   const contents = await readFile(id, { encoding: "utf8" })
      //   console.log(`loaded ${id}:`)
      //   console.log(dir({ code: contents }))

      //   return {
      //     code: contents,
      //   }
      // },

      // and transform md files to html string
      // async transform(code, id) {
      //   console.log(`transform(...) transforming ${id}...`)
      //   if (!filter(id)) return null
      //   console.log("from:")
      //   console.log(dir(code))

      //   console.log(`moduleInfo(${id})`)
      //   let info = this.getModuleInfo(id)
      //   console.log(dir(info))

      //   const asHtml = await marked(code)
      //   const DOM = new JSDOM(HTML_TEMPLATE)
      //   const document = DOM.window.document
      //   const targetNode = document.querySelector("#markdown-target")
      //   targetNode.innerHTML = asHtml

      //   let res = "<!doctype html>\n" + document.documentElement.outerHTML
      //   console.log("to:")
      //   console.log(dir(res))
      //   return res
      // },
    },
  ]
}

async function getPaths(root: string): Promise<string[]> {
  const files = await readdir(root)

  let paths: string[] = []

  for (const f of files) {
    const file = resolve(root, f)
    const isDir = await stat(file).then((s) => s.isDirectory())

    if (isDir) {
      // if file is directory, recur
      paths = [...paths, ...(await getPaths(file))]
    } else if (parse(file).ext === ".md") {
      // if file is markdown, add to results
      paths.push(resolve(root, file))
    } // otherwise, ignore file
  }

  return paths
}

interface Page {
  src: string
  id: string
  md: string
  url: string
}

async function getPages(
  paths: string[],
  root: string,
): Promise<Record<string, Page>> {
  let pages = {}

  for (const path of paths) {
    const page = await buildPage(path, root)
    pages[page.url] = page
  }

  return pages
}

async function buildPage(path: string, root: string): Promise<Page> {
  const md = await readFile(path, { encoding: "utf8" })
  const parsed = parse(path)
  const url = getURL(parsed, root)
  const id = getHtmlId(parsed)

  return {
    src: path,
    id,
    md,
    url,
  }
}

async function mdToStaticHtml(md: string): Promise<string> {
  const asHtml = await marked(md)

  const DOM = new JSDOM(HTML_TEMPLATE)
  const document = DOM.window.document
  const targetNode = document.querySelector("#markdown-target")
  if (targetNode == null) {
    throw TypeError(
      'HTML template must include an element with the id "markdown-target".',
    )
  }

  targetNode.innerHTML = asHtml

  return "<!doctype html>\n" + document.documentElement.outerHTML
}

function buildInputObj(
  entries: string[],
  root: string,
): Record<string, string> {
  return entries.reduce((ret, entry) => {
    const filePath = parse(entry)
    return {
      ...ret,
      // [getURL(filePath, root)]: getHtmlId(filePath),
      [getRollupInputKey(filePath, root)]: resolve(entry),
    }
  }, {})
}

/*
 * Remove leading directories & file name from path to get a relative URI.
 */
function getRollupInputKey({ dir, name }: ParsedPath, root: string): string {
  let res = ""

  // starts w/ root means it's not relative --
  // FIXME: this probably should be a lot more robust, but good enough for now
  if (dir.startsWith(root)) {
    res += dir.slice(root.length + 1) // +1 to remove leading `/` too
  } // otherwise we're already relative?
  else {
    res += dir
  }

  // if filename is `index`, then relative URI is the containing directory:
  //   e.g. `some/page/index.md` => `some/page/`
  // otherwise, relative uri should include filename:
  //   e.g. `some/page/nested.md` => `some/page/nested/`
  if (name !== "index") {
    res += `/${name}`
  }

  return res
}

function getURL(path: ParsedPath, root: string): string {
  return `/${getRollupInputKey(path, root)}/`
}

function getHtmlId({ dir, name, ext }: ParsedPath): string {
  let res = `${dir}/${name}`

  // if filename is `index`, then relative URI is the containing directory:
  //   e.g. `some/page/index.md` => `some/page/`
  // otherwise, relative uri should include filename:
  //   e.g. `some/page/nested.md` => `some/page/nested/`
  if (name !== "index") {
    res += `/index`
  }
  // assume each md file will be generated into an html file
  res += ".html"

  return res
}

// Can probably copy the implementation of indexHtmlMiddleware here
// https://github.com/vitejs/vite/blob/v5.4.9/packages/vite/src/node/server/middlewares/indexHtml.ts#L414
// to get something that gets an html "file" from the md Page obj, then processes it
// through server.transformIndexHtml(...) before sending it on to the client
// this'll only work for dev though, build/preview needs to emit files to the bundle probably
function indexMdMiddleware(
  root: string,
  pages: Record<string, Page>,
  server: ViteDevServer | PreviewServer,
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
      // get the source id from the page url path
      let { src } = pages[url]

      // then the rest here gets changed to simply get the same headers
      const headers = isDev
        ? server.config.server.headers
        : server.config.preview.headers

      try {
        // and if in Dev inject a script tag that loads markdown using
        // `<filename>.md?raw`, parses it w/ marked before inserting parsed
        // markdown into html template instead of loading from filesystem
        if (isDev) {
          let html = await mdToDynHtml(src, root)
          // have vite apply standard html transforms
          // (hopefully this includes adding the markdown source to the module graph?)
          html = await server.transformIndexHtml(url, html, req.originalUrl)
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

async function mdToDynHtml(mdSrcPath: string, root: string): Promise<string> {
  const DOM = new JSDOM(HTML_TEMPLATE)
  const document = DOM.window.document
  const body = document.querySelector("body")!

  const mdSrcRelative = getRelativePath(parse(mdSrcPath), root)

  const scriptTag = document.createElement("script")
  scriptTag.type = "module"
  scriptTag.text = `
import { marked } from "marked"

import "$/styles/index.css"
import doc from "/${mdSrcRelative}?raw"

const content = marked.parse(doc)
document.querySelector("#markdown-target").innerHTML = content
  `

  body.appendChild(scriptTag)

  return "<!doctype html>\n" + document.documentElement.outerHTML
}

function getRelativePath({ dir, base }: ParsedPath, root: string): string {
  let res = ""

  // starts w/ root means it's not relative --
  // FIXME: this probably should be a lot more robust, but good enough for now
  if (dir.startsWith(root)) {
    res += dir.slice(root.length + 1) // +1 to remove leading `/` too
  } // otherwise we're already relative?
  else {
    res += dir
  }

  res += `/${base}`

  return res
}
