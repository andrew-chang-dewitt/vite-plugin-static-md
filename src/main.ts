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
 *   - [ ] [MAYBE]...markdown rendering using custom markdown renderer functions.
 * - [ ] [TODO]Create sitemaps & feeds from markdown files.
 * - [ ] inline imports to sibling assets--e.g. for some <file>.md, if there's a
 *       <file>.css or <file>.(ts|js) next to it, then imports of both will be
 *       added to the output html
 * - [ ] create a template for initing new projects set up for this easily
 * - [ ] [TODO] create a cli that loads a given file as the sole md source into
 *       the default template & launches a dev server or generates html & pdf
 *       outputs
 * - [ ] [TODO] frontmatter support to get page title, summary, publish date, & other information
 * - [ ] toc support
 * - [ ] toc as page in directory using data from frontmatter of descendant pages
 */

import type { Plugin, UserConfig } from "vite"

import { modifyConfig } from "./config.js"
import { Context } from "./context.js"
import { indexMdMiddleware } from "./devServer.js"
import { mdToStaticHtml } from "./html.js"

export interface Options {
  cssFile?: string // exact path only
  excludes?: string | string[] | ExcludePatterns // paths or globs
  htmlTemplate?: string // exact path only
}

export interface ExcludePatterns {
  serve?: string | string[] // paths or globs
  build: string | string[] // paths or globs
}

export default function plugin(opts?: Options): Plugin[] {
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

        const { md } = ctx.pages[id]
        const res = {
          code: await mdToStaticHtml(md, ctx.htmlTemplate, ctx.cssFile),
        }

        return res
      },
    },
  ]
}
