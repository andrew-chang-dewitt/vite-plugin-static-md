import { Marked } from "marked"
import { logger } from "./logging.js"
import { ResolvedOptions } from "./options.js"
import { Page } from "./page.js"
import { createDirectives } from "marked-directive"

export { init, ctx }
export type {
  Mode,
  Out as ContextDataOut,
  Base as ContextData,
  InitialBase as ContextDataInitial,
}

interface Base {
  cssFile?: string
  htmlTemplate: string
  mode: Mode
  root: string
  paths: string[]
  pages: Record<string, Page>
  excluded: string[]
  renderer: Marked
}

type Mode = "dev" | "build"

type InitialBase = Partial<Pick<Base, "root">> &
  Pick<Base, "cssFile" | "htmlTemplate" | "mode" | "renderer">

interface InitialContext extends Provider<InitialBase>, ContextCompleter {}

interface Provider<T> {
  get(): Readonly<T>
}

function initProvidable(ictx: () => InitialBase): Provider<InitialBase> {
  return {
    get() {
      return {
        ...ictx(),
      }
    },
  }
}

interface ContextCompleter {
  complete(rest: Omit<Base, keyof Omit<InitialBase, "root">>): Context
}

function completable(ictx: Provider<InitialBase>): ContextCompleter {
  return {
    complete: (rest) =>
      ContextBuilder({
        ...ictx.get(),
        ...rest,
      }),
  }
}

function InitialContextBuilder(base: InitialBase): InitialContext {
  _setInitial(base)
  const provider = initProvidable(_getInitial)
  const completer = completable(provider)

  return Object.assign(provider, completer)
}

// Start building a context object from the given Options & Mode.
//
// Parses options into matching context properties. Returns a function ready to
// complete building the Context object when all properties are available.
function init(opts: ResolvedOptions, mode?: Mode): InitialContext {
  const renderer = new Marked()
  renderer.use(createDirectives())
  if (opts.mdExtensions) {
    opts.mdExtensions.forEach((ext) => {
      renderer.use(ext())
    })
  }

  const ictx = InitialContextBuilder({
    cssFile: opts.cssFile,
    htmlTemplate: opts.htmlTemplate,
    mode: mode ?? "dev",
    renderer,
  })

  return ictx
}

if (import.meta.vitest) {
  const { expect, test } = await import("vitest")

  test("init creates a partially complete context", () => {
    logger().dbg("in test")
    expect(1).toEqual(1)
  })
}

interface Context
  extends InExclusionChecker,
    Provider<Base>,
    Updater<Base>,
    DevChecker {
  getOut: Provider<Out>["get"]
}

function ctx(): Context {
  if (!!!_ctx)
    throw new TypeError(
      "Context not yet initialized, wait until configResolved hook has" +
        "completed before attempting to access Context object.",
    )

  return ContextBuilder(_ctx)
}

function ContextBuilder(base: Base): Context {
  _createCtx(base)
  const providerOut = outProvidable(_getCtx)
  const provider = ctxProvidable(_getCtx)
  const updater = updatable(_getCtx)
  const devChecker = devCheckable(_getCtx)
  const filterChecks = inExclusionCheckable(_getCtx)

  return Object.assign(
    { getOut: providerOut.get },
    provider,
    updater,
    devChecker,
    filterChecks,
  )
}

function ctxProvidable(ctx: () => Base): Provider<Base> {
  return {
    get() {
      return { ...ctx() }
    },
  }
}

type Out = Pick<Base, "pages">

function outProvidable(ctx: () => Base): Provider<Out> {
  return {
    get() {
      return { pages: ctx().pages }
    },
  }
}

interface Updater<T> {
  set(values: Partial<T>): T
}

function updatable(ctx: () => Base): Updater<Base> {
  return {
    set(values) {
      _updateCtx(values)
      return ctx()
    },
  }
}

interface DevChecker {
  isDev(): boolean
}

function devCheckable(ctx: () => Base): DevChecker {
  return {
    isDev() {
      return ctx().mode == "dev"
    },
  }
}

interface InExclusionChecker {
  includes(id: unknown): boolean
  excludes(id: unknown): boolean
}

function inExclusionCheckable(ctx: () => Base): InExclusionChecker {
  return {
    includes(id) {
      return (
        Object.keys(ctx().pages).includes(id as string) ||
        ctx().paths.includes(id as string)
      )
    },

    excludes(id) {
      return ctx().excluded.includes(id as string)
    },
  }
}

let _ictx: InitialBase

function _setInitial(base: InitialBase): void {
  _ictx = base
}
function _getInitial(): InitialBase {
  return _ictx
}

let _ctx: Base

function _createCtx(base: Base): void {
  _ctx = base
}
function _updateCtx(base: Partial<Base>): void {
  _ctx = {
    ..._ctx,
    ...base,
  }
}
function _getCtx(): Base {
  return _ctx
}
