import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      exclude: [...configDefaults.coverage.exclude, "example/**"],
    },
    exclude: [...configDefaults.exclude, "example/**"],
    includeSource: ["src/**/*.ts"],
  },
})
