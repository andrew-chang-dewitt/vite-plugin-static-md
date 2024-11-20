/*
 * indexMdMiddleware
 *
 * used to convert markdown sources to html when a route matching a markdown
 * source is requested from the dev server
 *
 * heavily inspired by implementation of indexHtmlMiddleware in vite server
 * https://github.com/vitejs/vite/blob/v5.4.9/packages/vite/src/node/server/middlewares/indexHtml.ts#L414
 * starts at getting something that gets an html "file" from the md Page obj,
 * then processes it through server.transformIndexHtml(...) before sending it
 * on to the client this'll only work for dev though, build/preview needs to
 */
import { Stats } from "fs"
import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from "http"
import type { Connect, PreviewServer, ViteDevServer } from "vite"

import {
  Context,
  excluded,
  included,
  provider,
  updateContext,
} from "./context.js"
import { renderDyn } from "./html.js"
import { logger } from "./logging.js"
import { buildPage } from "./page.js"
import { getURL } from "./path.js"
import { parse } from "path"

export async function addFileListener(path: string, _?: Stats) {
  logger().info(`file added: ${path}`)

  const { root, mode, pages, paths } = provider()
  const rgx = new RegExp(`^${root}.*\.md$`)

  if (rgx.test(path) && !excluded(path)) {
    logger().info("file should be included, adding...")
    // build a page object for the path
    const page = await buildPage(path, root)
    // then insert page object into Context.pages
    const key: "url" | "id" = mode === "dev" ? "url" : "id"
    updateContext({
      pages: {
        ...pages,
        [page[key]]: page,
      },
      paths: [...paths, path],
    })
  }
}

export async function unlinkFileListener(path: string, _?: Stats) {
  logger().info(`file unlinked: ${path}`)

  const { pages, paths, root } = provider()

  if (included(path)) {
    logger().info("file was included, removing...")
    const pageId = getURL(parse(path), root)
    const { [pageId]: unlinked, ...updatedPages } = pages
    const updatedPaths = paths.filter((p) => p !== path)
    updateContext({
      pages: updatedPages,
      paths: updatedPaths,
    })
  }
}

// emit files to the bundle probably
export function indexMdMiddleware(
  server: ViteDevServer | PreviewServer,
): Connect.NextHandleFunction {
  const isDev = isDevServer(server)

  return async function viteIndexHtmlMiddleware(req, res, next) {
    if (res.writableEnded) {
      return next()
    }

    const { root, pages, htmlTemplate, cssFile }: Context = provider()
    const url = req.url && cleanUrl(req.url)
    if (
      url &&
      Object.keys(pages).includes(url) &&
      req.headers["sec-fetch-dest"] !== "script"
    ) {
      logger().info(`handling ${url}`)
      // get the source id from the page url path
      let page = pages[url]
      logger().info(`matched ${page.src}`)

      // then the rest here gets changed to simply get the same headers
      const headers = isDev
        ? server.config.server.headers
        : server.config.preview.headers

      try {
        // and if in Dev inject a script tag that loads markdown using
        // `<filename>.md?raw`, parses it w/ marked before inserting parsed
        // markdown into html template instead of loading from filesystem
        if (isDev) {
          let html = await renderDyn(page, root, htmlTemplate, cssFile)
          // have vite apply standard html transforms
          // (hopefully this includes adding the markdown source to the module graph?)
          // logger().info(`${url} before vite's transform:`)
          // logger().dir(html)
          html = await server.transformIndexHtml(url, html, req.originalUrl)
          // logger().info(`${url} served as:`)
          // logger().dir(html)
          return send(req, res, html, headers)
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

function send(
  _req: IncomingMessage,
  res: ServerResponse,
  content: string,
  headers: OutgoingHttpHeaders | undefined,
): void {
  res.setHeader("Content-Type", "http")
  res.setHeader("Cache-Control", "no-cache")

  if (headers) {
    for (const name in headers) {
      res.setHeader(name, headers[name]!)
    }
  }

  res.statusCode = 200

  res.end(content)
}
