import type { Plugin, UserConfig } from "vite"

import { modifyConfig } from "./config.js"
import { indexMdMiddleware } from "./devServer.js"
import { renderStatic } from "./html.js"
import { Context } from "./context.js"

export interface Options {
  cssFile?: string // exact path only
  excludes?: string | string[] | ExcludePatterns // paths or globs
  htmlTemplate?: string // exact path only
}

export interface ExcludePatterns {
  serve?: string | string[] // paths or globs
  build: string | string[] // paths or globs
}

export function plugin(opts?: Options): Plugin[] {
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
        server.middlewares.use(indexMdMiddleware(server, ctx))
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

        const page = ctx.pages[id]
        const res = {
          code: await renderStatic(
            page,
            ctx.root,
            ctx.htmlTemplate,
            ctx.cssFile,
          ),
        }

        return res
      },
    },
  ]
}
