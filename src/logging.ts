import type { LogLevel as ViteLogLevel, Logger as ViteLogger } from "vite"
import { createLogger as createViteLogger } from "vite"
import { expect, test } from "vitest"

import { dir } from "./utils.js"

let _logger: ExtendedLogger

const DEBUGLEVEL = "debug"
type DebugLevel = typeof DEBUGLEVEL

export type ExtendedLogLevel = DebugLevel | ViteLogLevel

function isDebug(level: ExtendedLogLevel): level is DebugLevel {
  return level == DEBUGLEVEL
}

export interface ExtendedLogger extends ViteLogger {
  dbg: (msg: string) => void
  dir: (obj: Object) => void
}

function createLogger(level?: ExtendedLogLevel): ExtendedLogger {
  let resolvedLevel = level || "warn"
  let viteLevel = isDebug(resolvedLevel) ? "info" : resolvedLevel
  let viteLogger = createViteLogger(viteLevel)
  let debugLogger = debuggable(resolvedLevel, viteLogger)

  return {
    ...viteLogger,
    ...debugLogger,
    ...dirrable(debugLogger),
  }
}

type Infoer = Pick<ViteLogger, "info">

interface Debugger {
  (msg: string): void
}

function debuggable<T extends Infoer>(
  level: ExtendedLogLevel,
  infoer: T,
): { dbg: Debugger } {
  return {
    dbg(msg) {
      if (level && isDebug(level)) {
        // create an error to extract file & line number from stacktrace
        const stack = new Error().stack!
        // 3rd line should reference frame that called dbg
        const location = stack.split("\n")[2].trim().slice(3)
        infoer.info(`[${location}] ${msg}`)
      }
      // if not at debug level, do nothing
    },
  }
}

if (import.meta.vitest) {
  test("Debug logger prepends caller file & line to msg", () => {
    // var to hold calls to mocked info logger
    let info_called_with: string[] = []
    // mock info logger
    const infoer: Infoer = {
      info(msg: string) {
        info_called_with.push(msg)
      },
    }
    // create debug logger the usual way
    const test_logger = debuggable("debug", infoer)

    // some test calls & assertions
    test_logger.dbg("first")
    // assert log begins w/ [<filepath>:<line>:<col>]
    const beginsWithLocation = /^\[.*\/logging\.ts:[0-9]*:[0-9]*]/
    expect(info_called_with[0]).toMatch(beginsWithLocation)
    // and that log ends with message
    expect(info_called_with[0].endsWith("first")).toBeTruthy
    test_logger.dbg("second")
    expect(info_called_with[1]).toMatch(beginsWithLocation)
    expect(info_called_with[1].endsWith("second")).toBeTruthy
    // assert line numbers are correct distance apart, indicating line numbers are correct
    // regex to extract line number
    const extractLineNum = /^\[.*\.ts:([0-9]+):([0-9]+)/
    const firstLnNum = parseInt(info_called_with[0]!.match(extractLineNum)![1])
    const secondLnNum = parseInt(info_called_with[1]!.match(extractLineNum)![1])
    expect(secondLnNum - firstLnNum).toEqual(6)
  })
}

interface Dirrer {
  (obj: unknown): void
}

type DebugLogger = {
  dbg: Debugger
}

function dirrable<T extends DebugLogger>(debugLogger: T): { dir: Dirrer } {
  return {
    dir(obj) {
      const str = dir(obj)
      debugLogger.dbg(str)
    },
  }
}

export function logger(level?: ExtendedLogLevel): ExtendedLogger {
  if (!_logger) {
    _logger = createLogger(level)
  }

  return _logger
}

export function replace(level?: ExtendedLogLevel): ExtendedLogger {
  _logger = createLogger(level)

  return _logger
}
