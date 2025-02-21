import { readdir, stat } from "fs/promises"
import { ParsedPath, parse, resolve } from "path"
import { logger } from "./logging.js"

export async function getPaths(
  root: string,
  exclude: string[],
): Promise<string[]> {
  const files = await readdir(root)

  let paths: string[] = []

  for (const f of files) {
    const file = resolve(root, f)
    const isDir = await stat(file).then((s) => s.isDirectory())

    if (isDir) {
      // if file is directory, recur
      paths = [...paths, ...(await getPaths(file, exclude))]
    } else if (parse(file).ext === ".md") {
      // if file is markdown & not excluded, add to results
      const path = resolve(root, file)
      if (!exclude.includes(path)) paths.push(path)
    } // otherwise, ignore file
  }

  return paths
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Ensures leading & trailing slashes are present & defers rest to
 * `getOutputRelativePath(...)` function
 */
export function getURL(path: ParsedPath, root: string): string {
  const out = getOutputRelativePath(path, root)
  return out.length === 0 ? "/" : `/${out}/`
}

export function getHtmlId({ dir, name }: ParsedPath): string {
  let res = `${dir}/${name}`

  // if filename is `index`, then relative URI is the containing directory:
  //   e.g. `some/page/index.md` => `some/page/`
  // otherwise, relative uri should include filename:
  //   e.g. `some/page/nested.md` => `some/page/nested/`
  if (name !== "index") {
    res += `/index`
  }
  // assume each md file will be generated into an html file
  res += ".html"

  return res
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Remove leading directories from path to get a relative URI. Also removes any
 * "index" if present since the server will look for an "index.html" in
 * matching path location
 */
export function getOutputRelativePath(
  { dir, name }: ParsedPath,
  root: string,
): string {
  let res = ""
  logger().dbg(`[getOutputRelativePath] making ${dir}/${name} relative...`)

  // starts w/ root means it's not relative --
  // FIXME: this probably should be a lot more robust, but good enough for now
  if (dir.startsWith(root)) {
    res += dir.slice(root.length + 1) // +1 to remove leading `/` too
  } // otherwise we're already relative?
  else {
    res += dir
  }

  // if filename is `index`, then relative URI is the containing directory:
  //   e.g. `some/page/index.md` => `some/page/`
  // otherwise, relative uri should include filename:
  //   e.g. `some/page/nested.md` => `some/page/nested/`
  if (name !== "index") {
    // a separating `/` is needed if the relative path is in a subdir
    if (res.length > 0) {
      res += "/"
    }
    res += `${name}`
  }

  logger().dbg(`[getOutputRelativePath] done: ${res}`)

  return res
}

/**
 * @param path ParsedPath -- some path to some markdown resource
 * @param root string -- root path that the result should be relative to
 * @returns string a relative path to a directory for the given resource
 *
 * Defers to `getOutputRelativePath(...)`
 */
export function getRollupInputKey(path: ParsedPath, root: string): string {
  const out = getOutputRelativePath(path, root)

  return out.length === 0 ? "main" : out
}

export function getInputRelativePath(
  { dir, base }: ParsedPath,
  root: string,
): string {
  let res = ""
  logger().dbg(`[getRollupInputKey] making ${dir}/${base} relative...`)

  // starts w/ root means it's not relative --
  // FIXME: this probably should be a lot more robust, but good enough for now
  if (dir.startsWith(root)) {
    res += dir.slice(root.length + 1) // +1 to remove leading `/` too
  } // otherwise we're already relative?
  else {
    res += dir
  }

  // a separating `/` is needed if the relative path is in a subdir
  if (res.length > 0) {
    res += "/"
  }
  res += `${base}`

  logger().dbg(`[getRollupInputKey] done: ${res}`)

  return res
}
