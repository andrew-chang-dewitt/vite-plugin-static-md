import { readFile } from "fs/promises"

import { Options } from "./main.js"
import { Page } from "./page.js"

export interface DefaultContext extends Options {
  htmlTemplate: string
  mode: Mode
  root?: string
}

export interface Context extends DefaultContext {
  root: string
  paths: string[]
  pages: Record<string, Page>
  filter: (id: unknown) => boolean
}

export type Mode = "dev" | "build"

export function isDev(mode: Mode): mode is "dev" {
  return mode === "dev"
}

export async function initContext(
  opts?: Options,
  mode?: Mode,
): Promise<DefaultContext> {
  return {
    cssFile: opts?.cssFile,
    htmlTemplate: await loadHtmlTemplate(opts?.htmlTemplate),
    mode: mode ?? "dev",
  }
}

export function completeContext(
  ctx: DefaultContext,
  root: string,
  pages: Record<string, Page>,
  paths: string[],
): Context {
  const filter = (id: unknown) => Object.keys(pages).includes(id as string)

  return { ...ctx, pages, paths, root, filter }
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
