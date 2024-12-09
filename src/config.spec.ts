import { resolve } from "path"
import { describe, expect, it } from "vitest"
import { modifyConfig } from "./config.js"

describe("modifyConfig()", () => {
  describe("build output", () => {
    it("correctly includes entrypoints for md files found from root", async () => {
      const config = {
        // setup logger for more helpful test debugging
        // logLevel: "trace",
        // use example project as filetree to check
        root: resolve(__dirname, "../example/src/pages"),
      }
      const actual = await modifyConfig(config)

      // example project has following structure of markdown files:
      //
      //   example/
      //   |- src/pages
      //      |- index.md
      //      |- page/
      //      |  |- index.md
      //      |  |- nested.md
      //      |- ...
      //
      // and should include all 3 in the generated config rollup entry points
      expect(actual.build?.rollupOptions?.input).toMatchObject({
        main: resolve(__dirname, "../example/src/pages/index.html"),
        page: resolve(__dirname, "../example/src/pages/page/index.html"),
        "page/nested": resolve(
          __dirname,
          "../example/src/pages/page/nested/index.html",
        ),
      })
    })

    it("correctly excludes entrypoints for md files specified in excludes option", async () => {
      const config = {
        // setup logger for more helpful test debugging
        // logLevel: "trace",
        // use example project as filetree to check
        root: resolve(__dirname, "../example/src/pages"),
      }
      const opts = {
        excludes: [
          resolve(__dirname, "../example/src/pages/excluded-always.md"),
        ],
      }
      const actual = await modifyConfig(config, opts)

      // example project has following structure of markdown files:
      //
      //   example/
      //   |- src/pages
      //      |- index.md
      //      |- excluded-always.md
      //      |- page/
      //      |  |- index.md
      //      |  |- nested.md
      //      |- ...
      //
      // and should exclude it from the generated config rollup entry points
      expect(actual.build?.rollupOptions?.input).not.toMatchObject({
        "excluded-always": resolve(
          __dirname,
          "../example/src/pages/excluded-always/index.html",
        ),
      })
      // but still include index & others
      expect(actual.build?.rollupOptions?.input).toMatchObject({
        main: resolve(__dirname, "../example/src/pages/index.html"),
        page: resolve(__dirname, "../example/src/pages/page/index.html"),
        "page/nested": resolve(
          __dirname,
          "../example/src/pages/page/nested/index.html",
        ),
      })
    })

    it("can specifiy excluded files w/ glob pattern", async () => {
      const config = {
        // setup logger for more helpful test debugging
        // logLevel: "trace",
        // use example project as filetree to check
        root: resolve(__dirname, "../example/src/pages"),
      }
      const opts = {
        excludes: ["**/*excluded*"],
      }
      const actual = await modifyConfig(config, opts)

      // example project has following structure of markdown files:
      //
      //   example/
      //   |- src/pages
      //      |- index.md
      //      |- excluded-always.md
      //      |- excluded-prod.md
      //      |- page/
      //      |  |- index.md
      //      |  |- nested.md
      //      |- ...
      //
      // and should exclude both excluded-[ always | prod ] from output
      expect(actual.build?.rollupOptions?.input).not.toMatchObject({
        "excluded-always": resolve(
          __dirname,
          "../example/src/pages/excluded-always/index.html",
        ),
        "excluded-prod": resolve(
          __dirname,
          "../example/src/pages/excluded-prod/index.html",
        ),
      })
      // but still include index & others
      expect(actual.build?.rollupOptions?.input).toMatchObject({
        main: resolve(__dirname, "../example/src/pages/index.html"),
        page: resolve(__dirname, "../example/src/pages/page/index.html"),
        "page/nested": resolve(
          __dirname,
          "../example/src/pages/page/nested/index.html",
        ),
      })
    })
  })
})
