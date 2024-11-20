import type { Plugin, UserConfig } from "vite"

import { modifyConfig } from "./config.js"
import {
  addFileListener,
  indexMdMiddleware,
  unlinkFileListener,
} from "./devServer.js"
import { renderStatic } from "./html.js"
import { provider as ctx } from "./context.js"

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
  return [
    {
      name: "static-md-plugin:serve",
      apply: "serve",

      // setup log level if user provides a value
      async config(userConfig): Promise<UserConfig> {
        const cfg = await modifyConfig(userConfig, opts)

        return cfg
      },

      // add markdown & affiliated sources to dev HMR
      configureServer(server) {
        // add filewatcher listeners to automatically add & remove pages as
        // files change
        server.watcher = server.watcher.on("add", addFileListener)
        server.watcher = server.watcher.on("unlink", unlinkFileListener)
        // custom middleware to point urls matching `pages` to their
        // markdown sources & transform those sources into index.html files
        server.middlewares.use(indexMdMiddleware(server))
      },
    },
    {
      name: "static-md-plugin:build",
      apply: "build",

      // edit user config to add all markdown files as rollup entry points
      async config(userConfig): Promise<UserConfig> {
        const cfg = await modifyConfig(userConfig, opts, "build")

        return cfg
      },

      resolveId(src: string) {
        // sources not in pages map are skipped
        if (!ctx().included(src)) return null
        // ensure sources given in pages map are resolved,
        // even if the file doesn't exist
        return src
      },

      async load(id: string) {
        let _ctx = ctx()
        // ids not in pages map are skipped
        if (!_ctx.included(id)) return null

        const page = _ctx.pages[id]
        const res = {
          code: await renderStatic(
            page,
            _ctx.root,
            _ctx.htmlTemplate,
            _ctx.cssFile,
          ),
        }

        return res
      },
    },
  ]
}
