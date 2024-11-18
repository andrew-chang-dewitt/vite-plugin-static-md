import {
  LogLevel,
  Logger as ViteLogger,
  createLogger as createViteLogger,
} from "vite"
import { dir } from "./utils.js"

let _logger: ExtendedLogger

export interface ExtendedLogger extends ViteLogger {
  dir: (obj: Object) => void
}

function createLogger(level?: LogLevel): ExtendedLogger {
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

export function logger(level?: LogLevel): ExtendedLogger {
  if (!_logger) {
    _logger = createLogger(level)
  }

  return _logger
}

export function replace(level?: LogLevel): ExtendedLogger {
  _logger = createLogger(level)

  return _logger
}

// class Logger {
//   static #instance: Logger
//   viteLogger: ViteLogger
//
//   private constructor(level?: LogLevel) {
//     this.viteLogger = createViteLogger(level ?? "warn")
//   }
//
//   public static get instance(): Logger {
//
//   }
// }
