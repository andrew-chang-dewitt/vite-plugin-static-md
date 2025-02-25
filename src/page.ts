import { readFile } from "fs/promises"
import matter from "gray-matter"
import { parse } from "path"

import {
  getHtmlId,
  getInputRelativePath,
  getRollupInputKey,
  getURL,
} from "./path.js"
import { ContextDataInitial as InitialContext } from "./ctx.js"

export interface Page {
  src: string
  id: string
  md: string
  data: PageData
  url: string
  inputKey: string
}

export interface PageData {
  title: string
  description?: string
  keywords?: string[]
  meta?: Record<string, string>
}

export type PageOut = Pick<Page, "data" | "url">

export function pageOut({ data, url }: Page): PageOut {
  return { data, url }
}

export async function getPages(
  paths: string[],
  root: string,
  ctx: InitialContext,
): Promise<Record<string, Page>> {
  let pages: Record<string, Page> = {}
  let key: "url" | "id" = ctx.mode === "dev" ? "url" : "id"

  for (const path of paths) {
    const page = await buildPage(path, root)
    pages[page[key]] = page
  }

  return pages
}

export async function buildPage(path: string, root: string): Promise<Page> {
  const fileContents = await readFile(path, { encoding: "utf8" })
  const { content: md, data: uncheckedData } = matter(fileContents)
  // FIXME: should we validate the data's type here?
  const data = uncheckedData as PageData
  const parsed = parse(path)
  const url = getURL(parsed, root)
  const id = getHtmlId(parsed)
  const inputKey = getRollupInputKey(parsed, root)

  // page title defaults to filename
  if (!data.title) {
    data.title = getInputRelativePath(parsed, root)
  }

  return {
    data,
    id,
    inputKey,
    md,
    src: path,
    url,
  }
}

export async function refreshPage(page: Page, root: string): Promise<Page> {
  const fileContents = await readFile(page.src, { encoding: "utf8" })
  const { content: md, data: uncheckedData } = matter(fileContents)
  const data = uncheckedData as PageData
  // page title defaults to filename
  if (!data.title) {
    data.title = getInputRelativePath(parse(page.src), root)
  }

  return {
    ...page,
    md,
    data,
  }
}
