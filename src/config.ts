import { glob } from "fs/promises"
import { parse, resolve } from "path"
import type { UserConfig } from "vite"

import { init } from "./ctx.js"
import type { Mode } from "./ctx.js"
import {
  ExtendedLogger,
  logger as getLogger,
  replace as replaceLogger,
} from "./logging.js"
import { ExcludePatterns, Options } from "./main.js"
import { load } from "./options.js"
import { getPages } from "./page.js"
import { getHtmlId, getPaths, getRollupInputKey } from "./path.js"
import { dir } from "./utils.js"

let logger: ExtendedLogger = getLogger()

export async function modifyConfig(
  userConfig: UserConfig,
  opts?: Options,
  mode?: Mode,
): Promise<UserConfig> {
  // setup logger if not vite's default
  if (userConfig.logLevel) {
    logger = replaceLogger(userConfig.logLevel)
  }

  const resolvedOptions = await load(opts)
  const ictx = init(resolvedOptions, mode)

  // get web root dir from config
  const root = resolveRoot(userConfig.root)
  // walk filetree at root & get absolute paths to every markdown file
  const excluded = await expandExcludes(opts?.excludes, ictx.get().mode)
  logger.dbg("[modifyConfig] excludes list expanded to:")
  logger.dir(excluded)
  const paths = await getPaths(root, excluded)
  const pages = await getPages(paths, root, ictx.get())
  logger.dir(pages)

  const cfg = {
    build: {
      rollupOptions: {
        // build rollup input option object from absolute paths
        input: buildInputObj(paths, root),
      },
    },
  }

  logger.dbg("[modifyConfig] config modified to include")
  logger.dir(cfg.build.rollupOptions)

  ictx.complete({ root, pages, paths, excluded })

  return cfg
}

// resolve root, using same technique as vite, found in source:
// https://github.com/vitejs/vite/blob/5f52bc8b9e4090cdcaf3f704278db30dafc825cc/packages/vite/src/node/config.ts#L527
function resolveRoot(root: string | undefined): string {
  return root ? resolve(root) : process.cwd()
}

// expand given exclude items into a flat array of fully resolved paths
async function expandExcludes(
  list?: string | string[] | ExcludePatterns,
  mode?: "dev" | "build",
): Promise<string[]> {
  let res: string[] = []

  if (!list) return res

  if (isString(list)) {
    res = [list]
  } else if (isArrayOf(list, isString)) {
    res = list
  } else if (isExcludePatterns(list)) {
    let isBuild = mode === "build" ? true : false
    res = isBuild
      ? [
          ...(await expandExcludes(list.build)),
          ...(await expandExcludes(list.serve)),
        ]
      : await expandExcludes(list.serve)
  } else {
    logger.warn(
      "excludes must be of type `string | string[] | { serve: string | string[], build: string | string[] }`\n" +
        `ignoring given value of ${dir(list)}`,
    )
  }

  return (
    await Promise.all(
      res.map(async (path) => {
        let res: string[] = []

        for await (const p of glob(path)) {
          res.push(p)
        }

        return res.map((p) => resolve(p))
      }),
    )
  ).flat()
}

function isString(obj: any): obj is string {
  return typeof obj == "string" || obj instanceof String
}

function isArrayOf<T>(obj: any, checkT: (obj: any) => obj is T): obj is T[] {
  return Array.isArray(obj) && obj.every(checkT)
}

function isExcludePatterns(obj: any): obj is ExcludePatterns {
  const serveCorrect =
    "serve" in obj
      ? isString(obj.serve) || isArrayOf(obj.serve, isString)
      : true // serve is optional -> true if not present

  return (
    serveCorrect &&
    "build" in obj &&
    (isString(obj.build) || isArrayOf(obj.build, isString))
  )
}

function buildInputObj(
  entries: string[],
  root: string,
): Record<string, string> {
  return entries.reduce((ret, entry) => {
    const filePath = parse(entry)
    return {
      ...ret,
      [getRollupInputKey(filePath, root)]: getHtmlId(filePath),
    }
  }, {})
}
