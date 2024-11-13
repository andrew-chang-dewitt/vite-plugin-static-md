import { LogLevel, Logger, createLogger as createViteLogger } from "vite"
import { dir } from "./utils.js"

interface ExtendedLogger extends Logger {
  dir: (obj: Object) => void
}

export function createLogger(level?: LogLevel): ExtendedLogger {
  return {
    // default to warn to avoid cluttering user logs
    // unless user specifies they want info or other
    ...createViteLogger(level || "warn"),
    dir: function (obj: Object): void {
      const str = dir(obj)
      this.info(str)
    },
  }
}
