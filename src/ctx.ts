import { expect, test } from "vitest"

import { logger } from "./logging.js"
import { Page } from "./page.js"

interface ContextBase {
  htmlTemplate: string
  mode: Mode
  root: string
  paths: string[]
  pages: Record<string, Page>
  excluded: string[]
}
export type InitialContext = Partial<Pick<ContextBase, "root">> &
  Pick<ContextBase, "htmlTemplate" | "mode">

type Mode = "dev" | "build"

if (import.meta.vitest) {
  test("test", () => {
    logger().info("in test")
    expect(1).toEqual(1)
  })
}
