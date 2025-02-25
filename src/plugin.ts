import type { Plugin, UserConfig } from "vite"

import { modifyConfig } from "./config.js"
import { ctx } from "./ctx.js"
import {
  addFileListener,
  indexMdMiddleware,
  unlinkFileListener,
  changeFileListener,
} from "./devServer.js"
import { render } from "./html.js"
import { Options } from "./options.js"

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
        // add filewatcher to listen for changes in markdown sources & trigger a rebuild of that page's data
        server.watcher = server.watcher.on("change", changeFileListener)
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
        if (!ctx().includes(src)) return null
        // ensure sources given in pages map are resolved,
        // even if the file doesn't exist
        return src
      },

      async load(id: string) {
        let _ctx = ctx().get()
        // ids not in pages map are skipped
        if (!ctx().includes(id)) return null

        const page = _ctx.pages[id]
        const res = {
          code: await render(page),
        }

        return res
      },
    },
  ]
}
