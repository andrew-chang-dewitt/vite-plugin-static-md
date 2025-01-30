import { readFile } from "fs/promises"

import { Options } from "./main.js"
import { Page, PageOut, pageOut } from "./page.js"
import { logger } from "./logging.js"

let _ctx: Context

export function provider(): Context {
  if (!!!_ctx)
    throw new TypeError(
      "Context not yet initialized, wait until configResolved hook has" +
        "completed before attempting to access Context object.",
    )

  return _ctx
}

// scrub non-output data from context output
export function providerOut(): ContextOut {
  let ctxOut: ContextOut = { pages: {} }

  for (const [key, value] of Object.entries(_ctx.pages)) {
    ctxOut.pages[key] = pageOut(value)
  }

  logger().info("context out returned as:")
  logger().dir(ctxOut)
  return ctxOut
}

export function updateContext(updated: Partial<Context>): Context {
  _ctx = {
    ..._ctx,
    ...updated,
  }
  logger().info("context updated")
  logger().dir(_ctx)

  return _ctx
}

export interface InitialContext extends Options {
  htmlTemplate: string
  mode: Mode
  root?: string
}

export interface Context extends InitialContext {
  root: string
  paths: string[]
  pages: Record<string, Page>
  excluded: string[]
}

export interface ContextOut {
  pages: Record<string, PageOut>
}

export type Mode = "dev" | "build"

export function isDev(mode: Mode): mode is "dev" {
  return mode === "dev"
}

export async function initContext(
  opts?: Options,
  mode?: Mode,
): Promise<InitialContext> {
  return {
    cssFile: opts?.cssFile,
    htmlTemplate: await loadHtmlTemplate(opts?.htmlTemplate),
    mode: mode ?? "dev",
  }
}

export function completeContext(
  ctx: InitialContext,
  root: string,
  pages: Record<string, Page>,
  paths: string[],
  excluded: string[],
): Context {
  _ctx = {
    ...ctx,
    pages,
    paths,
    root,
    excluded,
  }

  return _ctx
}

export function included(id: unknown) {
  return (
    Object.keys(provider().pages).includes(id as string) ||
    provider().paths.includes(id as string)
  )
}

export function excluded(id: unknown) {
  return provider().excluded.includes(id as string)
}

async function loadHtmlTemplate(filename?: string): Promise<string> {
  // load given html template from file, or use default
  return filename
    ? await readFile(filename, { encoding: "utf8" })
    : DEFAULT_HTML_TEMPLATE
}

const DEFAULT_HTML_TEMPLATE = `\
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
