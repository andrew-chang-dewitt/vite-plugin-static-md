import { Logger, UserConfig, createLogger } from "vite"
import { Options, Page } from "./main.js"
import { resolve } from "path"

export interface SideEffects {
  logger: Logger
  root: string
  htmlTemplate: string
  paths: string[]
  pages: Record<string, Page>
  filter: (id: unknown) => boolean
}

export async function modifyConfig(
  opts: Options,
  userConfig: UserConfig,
): Promise<[UserConfig, SideEffects]> {
  // setup logger if not vite's default
  if (userConfig.logLevel) {
    logger = createLogger(userConfig.logLevel)
  }

  // get web root dir from config
  // or use default of same dir as the vite config file
  root = userConfig.root || resolve(".")
  // load given html template from file, or use default
  htmlTemplate = opts?.htmlTemplate
    ? await readFile(opts.htmlTemplate, { encoding: "utf8" })
    : HTML_TEMPLATE

  // walk filetree at root & get absolute paths to every markdown file
  const exclude_list = await expandExcludes(opts?.excludes)
  logger.info("excludes list expanded to:")
  logger.dir(exclude_list)
  paths = await getPaths(root, exclude_list)
  pages = await getPages(paths, root, "dev")
  logger.dir(pages)

  const res = {
    build: {
      rollupOptions: {
        // build rollup input option object from absolute paths
        input: buildInputObj(paths, root),
      },
    },
  }

  logger.info("config modified to include")
  logger.dir(res.build.rollupOptions)

  return res
}
