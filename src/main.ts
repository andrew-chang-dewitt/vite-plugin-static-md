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
 */

import { readFile, readdir, stat } from "fs/promises"
import { ParsedPath, parse, resolve } from "path"

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

import { createLogger } from "./logging.js"

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

// init a default logger instance, will replace w/ custom level if given in config
let logger = createLogger()

export interface Options {
  htmlTemplate?: string
  cssFile?: string
}

export default function staticMd(opts: Options): Plugin[] {
  let root: string
  let paths: string[] = []
  let pages: Record<string, Page> = {}
  let htmlTemplate: string
  let cssFile = opts.cssFile

  let filter: (id: unknown) => boolean

  return [
    {
      name: "static-md-plugin:serve",
      apply: "serve",

      // setup log level if user provides a value
      config(userConfig): UserConfig {
        // setup logger if not vite's default
        if (userConfig.logLevel) {
          logger = createLogger(userConfig.logLevel)
        }

        // we don't actually modify the config at all here
        return userConfig
      },

      // get markdown pages from config & setup log level
      async configResolved(userConfig): Promise<void> {
        // get web root dir from config
        root = userConfig.root
        // load given html template from file, or use default
        htmlTemplate = opts.htmlTemplate
          ? await readFile(opts.htmlTemplate, { encoding: "utf8" })
          : HTML_TEMPLATE

        // walk filetree at root & get absolute paths to every markdown file
        paths = await getPaths(root)
        pages = await getPages(paths, root, "dev")
        logger.dir(pages)
      },

      // configure custom middleware to point urls matching `pages` to their
      // markdown sources & transform those sources into index.html files
      configureServer(server) {
        server.middlewares.use(
          indexMdMiddleware(server, root, pages, htmlTemplate, cssFile),
        )
      },
    },
    {
      name: "static-md-plugin:build",
      apply: "build",

      // edit user config to add all markdown files as rollup entry points
      async config(userConfig): Promise<UserConfig> {
        // setup logger if not vite's default
        if (userConfig.logLevel) {
          logger = createLogger(userConfig.logLevel)
        }
        // get root from config or find default
        root = resolveRoot(userConfig.root)
        // load given html template from file, or use default
        htmlTemplate = opts.htmlTemplate
          ? await readFile(opts.htmlTemplate, { encoding: "utf8" })
          : HTML_TEMPLATE
        // walk filetree at root & get absolute paths to every markdown file
        paths = await getPaths(root)
        pages = await getPages(paths, root, "build")
        filter = (id) => Object.keys(pages).includes(id as string)

        const res = {
          build: {
            rollupOptions: {
              // build rollup input option object from absolute paths
              input: buildInputObj(paths, root),
            },
          },
        }

        logger.info("config modified to include")
        logger.dir(res.build.rollupOptions)

        return res
      },

      resolveId(src: string) {
        // sources not in pages map are skipped
        if (!filter(src)) return null
        // ensure sources given in pages map are resolved,
        // even if the file doesn't exist
        return src
      },

      async load(id: string) {
        // ids not in pages map are skipped
        if (!filter(id)) return null

        const { md } = pages[id]
        const res = {
          code: await mdToStaticHtml(md, htmlTemplate, cssFile),
        }

        return res
      },
    },
  ]
}

// resolve root, using same technique as vite, found in source:
// https://github.com/vitejs/vite/blob/5f52bc8b9e4090cdcaf3f704278db30dafc825cc/packages/vite/src/node/config.ts#L527
function resolveRoot(root: string | undefined): string {
  return root ? resolve(root) : process.cwd()
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
  inputKey: string
}

async function getPages(
  paths: string[],
  root: string,
  mode: "dev" | "build",
): Promise<Record<string, Page>> {
  let pages: Record<string, Page> = {}
  let key: "url" | "id" = mode === "dev" ? "url" : "id"

  for (const path of paths) {
    const page = await buildPage(path, root)
    pages[page[key]] = page
  }

  return pages
}

async function buildPage(path: string, root: string): Promise<Page> {
  const md = await readFile(path, { encoding: "utf8" })
  const parsed = parse(path)
  const url = getURL(parsed, root)
  const id = getHtmlId(parsed)
  const inputKey = getRollupInputKey(parsed, root)

  return {
    src: path,
    id,
    md,
    url,
    inputKey,
  }
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

function buildInputObj(
  entries: string[],
  root: string,
): Record<string, string> {
  return entries.reduce((ret, entry) => {
    const filePath = parse(entry)
    return {
      ...ret,
      [getRollupInputKey(filePath, root)]: getHtmlId(filePath),
    }
  }, {})
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Defers to `getOutputRelativePath(...)`
 */
function getRollupInputKey(path: ParsedPath, root: string): string {
  return getOutputRelativePath(path, root)
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Ensures leading & trailing slashes are present & defers rest to
 * `getOutputRelativePath(...)` function
 */
function getURL(path: ParsedPath, root: string): string {
  return `/${getOutputRelativePath(path, root)}/`
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Remove leading directories from path to get a relative URI. Also removes any
 * "index" if present since the server will look for an "index.html" in
 * matching path location
 */
function getOutputRelativePath(
  { dir, name }: ParsedPath,
  root: string,
): string {
  let res = ""
  logger.info(`making ${dir}/${name} relative...`)

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
    // a separating `/` is needed if the relative path is in a subdir
    if (res.length > 0) {
      res += "/"
    }
    res += `${name}`
  }

  logger.info(`done: ${res}`)

  return res
}

function getHtmlId({ dir, name }: ParsedPath): string {
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
          let html = await mdToDynHtml(src, root, htmlTemplate, cssFile)
          // have vite apply standard html transforms
          // (hopefully this includes adding the markdown source to the module graph?)
          logger.info(`${url} before vite's transform:`)
          logger.dir(html)
          html = await server.transformIndexHtml(url, html, req.originalUrl)
          logger.info(`${url} served as:`)
          logger.dir(html)
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
  logger.info(`making ${dir}/${base} relative...`)

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

  logger.info(`done: ${res}`)

  return res
}
