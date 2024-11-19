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
import { Connect, PreviewServer, ViteDevServer, send } from "vite"

import { Context } from "./context.js"
import { renderDyn } from "./html.js"
import { logger } from "./logging.js"
import { PageData } from "./page.js"

// emit files to the bundle probably
export function indexMdMiddleware<Data extends PageData>(
  server: ViteDevServer | PreviewServer,
  { root, pages, htmlTemplate, cssFile }: Context<Data>,
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
