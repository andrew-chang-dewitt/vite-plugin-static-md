import { Logger, createLogger } from "vite"
import { DEFAULT_HTML_TEMPLATE, Options, Page } from "./main.js"

export interface DefaultContext extends Options {
  logger: Logger
  root?: string
  paths: string[]
  pages: Record<string, Page>
  filter?: (id: unknown) => boolean
}

export interface Context extends DefaultContext {
  root: string
  filter: (id: unknown) => boolean
}

export function initContext(opts: Options): DefaultContext {
  return {
    cssFile: opts?.cssFile,
    htmlTemplate: DEFAULT_HTML_TEMPLATE,
    logger: createLogger(),
    pages: {},
    paths: [],
  }
}

export function completeContext(
  ctx: DefaultContext,
  root: string,
  filter: (id: unknown) => boolean,
): Context {
  return { ...ctx, root, filter }
}
