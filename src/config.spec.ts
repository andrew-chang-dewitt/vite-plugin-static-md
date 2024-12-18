import { resolve } from "path"
import { describe, expect, it } from "vitest"
import type { LogLevel } from "vite"

import { modifyConfig } from "./config.js"
import { provider } from "./context.js"
import { logger } from "./logging.js"

describe("modifyConfig()", () => {
  describe("sets up logger", () => {
    it("uses level specified by user", async () => {
      const config = {
        logLevel: "info" as LogLevel,
        // include root here to prevent diving into entire project filetree for markdown files
        // greatly improves test runtime as it limits how much is output via the info logger
        root: resolve(__dirname, "../example/src/pages"),
      }

      await modifyConfig(config) // FIXME: why is this complaining about the type?
      // TODO: can't directly test log level is set correctly; instead we should capture
      // stdout/stderr & assert messages are printed according to log level?

      logger().info("info")
      logger().warn("warn")
      logger().error("error")
    })
  })

  describe("identifies pages to generate from markdown", () => {
    const config = {
      logLevel: "warn" as LogLevel,
      // use example project as filetree to check
      root: resolve(__dirname, "../example/src/pages"),
    }

    describe("correctly includes all md files found from root", async () => {
      const output = await modifyConfig(config)
      const ctx = provider()

      it("as html file entrypoints for build output", () => {
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
        expect(output.build?.rollupOptions?.input).toMatchObject({
          main: resolve(__dirname, "../example/src/pages/index.html"),
          page: resolve(__dirname, "../example/src/pages/page/index.html"),
          "page/nested": resolve(
            __dirname,
            "../example/src/pages/page/nested/index.html",
          ),
        })
      })

      it("as server routes for dev output", () => {
        // FIXME: this requires touching unrelated context object in test, feels v uggo
        expect(ctx.pages).toHaveProperty("/")
        expect(ctx.pages).toHaveProperty("/page/")
        expect(ctx.pages).toHaveProperty("/page/nested/")
        expect(ctx.pages).not.toHaveProperty("/not/")
      })
    })

    describe("correctly excludes entrypoints for md files specified in excludes option", async () => {
      const opts = {
        excludes: [
          resolve(__dirname, "../example/src/pages/excluded-always.md"),
        ],
      }
      const output = await modifyConfig(config, opts)
      const ctx = provider()

      it("as html entrypoints for build output", () => {
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
        expect(output.build?.rollupOptions?.input).not.toMatchObject({
          "excluded-always": resolve(
            __dirname,
            "../example/src/pages/excluded-always/index.html",
          ),
        })

        // but still include index & others
        expect(output.build?.rollupOptions?.input).toMatchObject({
          main: resolve(__dirname, "../example/src/pages/index.html"),
          page: resolve(__dirname, "../example/src/pages/page/index.html"),
          "page/nested": resolve(
            __dirname,
            "../example/src/pages/page/nested/index.html",
          ),
        })
      })

      it("as server routes for dev output", () => {
        // FIXME: this requires touching unrelated context object in test, feels v uggo
        // should not include exclusion
        expect(ctx.pages).not.toHaveProperty("/excluded-always/")
        // but still include index & others
        expect(ctx.pages).toHaveProperty("/")
        expect(ctx.pages).toHaveProperty("/page/")
        expect(ctx.pages).toHaveProperty("/page/nested/")
      })
    })

    describe("can specifiy excluded files w/ glob pattern", async () => {
      const opts = {
        excludes: ["**/*excluded*"],
      }
      const output = await modifyConfig(config, opts)
      const ctx = provider()

      it("and excludes matches from build output", () => {
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
        expect(output.build?.rollupOptions?.input).not.toMatchObject({
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
        expect(output.build?.rollupOptions?.input).toMatchObject({
          main: resolve(__dirname, "../example/src/pages/index.html"),
          page: resolve(__dirname, "../example/src/pages/page/index.html"),
          "page/nested": resolve(
            __dirname,
            "../example/src/pages/page/nested/index.html",
          ),
        })
      })

      it("and from server routes for dev output", () => {
        // FIXME: this requires touching unrelated context object in test, feels v uggo
        // should not include exclusion
        expect(ctx.pages).not.toHaveProperty("/excluded-always/")
        // but still include index & others
        expect(ctx.pages).toHaveProperty("/")
        expect(ctx.pages).toHaveProperty("/page/")
        expect(ctx.pages).toHaveProperty("/page/nested/")
      })
    })

    describe("can differentiate between dev & prod exclusions", async () => {
      const opts = {
        excludes: {
          serve: "**/excluded-always*",
          build: "**/excluded-prod*",
        },
      }
      const output = await modifyConfig(config, opts)
      const ctx = provider()

      it("excludes everything specified from build output", () => {
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
        // and should exclude both excluded-[ always | prod ] from build output
        expect(output.build?.rollupOptions?.input).not.toMatchObject({
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
        expect(output.build?.rollupOptions?.input).toMatchObject({
          main: resolve(__dirname, "../example/src/pages/index.html"),
          page: resolve(__dirname, "../example/src/pages/page/index.html"),
          "page/nested": resolve(
            __dirname,
            "../example/src/pages/page/nested/index.html",
          ),
        })
      })

      it("only excludes patterns specified with `serve` key from dev server routes", () => {
        // FIXME: this requires touching unrelated context object in test, feels v uggo
        // should not include exclusion
        expect(ctx.pages).not.toHaveProperty("/excluded-always/")
        // but still include index & others
        expect(ctx.pages).toHaveProperty("/")
        expect(ctx.pages).toHaveProperty("/page/")
        expect(ctx.pages).toHaveProperty("/page/nested/")
      })
    })
  })
})
