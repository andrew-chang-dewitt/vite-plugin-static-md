import { readFile } from "fs/promises"

export interface Options {
  cssFile?: string // exact path only
  excludes?: string | string[] | ExcludePatterns // paths or globs
  htmlTemplate?: string // exact path only
}

export interface ExcludePatterns {
  serve?: string | string[] // paths or globs
  build: string | string[] // paths or globs
}

export type ResolvedOptions = Omit<Options, "htmlTemplate"> &
  Required<Pick<Options, "htmlTemplate">>

const defaults: Options = {}

export async function load(opts?: Options): Promise<ResolvedOptions> {
  const vals = opts || defaults

  return {
    ...vals,
    htmlTemplate: await loadHtmlTemplate(vals.htmlTemplate),
  }
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
