import { readFile } from "fs/promises"
import { parse } from "path"
import { getHtmlId, getRollupInputKey, getURL } from "./path.js"

export interface Page {
  src: string
  id: string
  md: string
  url: string
  inputKey: string
}

export async function getPages(
  paths: string[],
  root: string,
  mode: "dev" | "build",
): Promise<Record<string, Page>> {
  let pages: Record<string, Page> = {}
  let key: "url" | "id" = mode === "dev" ? "url" : "id"

  for (const path of paths) {
    const page = await buildPage(path, root)
    pages[page[key]] = page
  }

  return pages
}

async function buildPage(path: string, root: string): Promise<Page> {
  const md = await readFile(path, { encoding: "utf8" })
  const parsed = parse(path)
  const url = getURL(parsed, root)
  const id = getHtmlId(parsed)
  const inputKey = getRollupInputKey(parsed, root)

  return {
    src: path,
    id,
    md,
    url,
    inputKey,
  }
}
