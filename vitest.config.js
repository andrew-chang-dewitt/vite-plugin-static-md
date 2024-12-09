import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "example/**"],
    coverage: {
      exclude: [...configDefaults.coverage.exclude, "example/**"],
    },
  },
})
