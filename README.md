# vite-plugin-static-md

Vite plugin for building a truly static site from html, css, & markdown.
Leverages the dev experience offered by vite (dev server w/ HMR & easy bundling for production) to allow for a tight feedback loop when authoring content in markdown or styling & arranging it with css, yet ships the final product as simple html & css (no JS required).
Finaly, as it's simply a vite plugin, you can use this alongside any other vite compatible features/plugins you might need or want in your Multi-Page-Application web project.

## Usage

Install the plugin via npm:

```
npm install --save vite-plugin-static-md
```

Then enable in your vite.config.js:

```javascript
// import the default export
import staticMd from "vite-plugin-static-md"

export default {
  // vite needs to be told to work in MPA mode to
  // render index.html files other than './index.html'
  appType: "mpa",
  // enable the plugin
  plugins: [staticMd(/* options */)],
}
```

This plugin uses a filesystem-based routing system, autodiscovering markdown files in and descending from your vite root directory & rendering them as `index.html` files matching the appropriate path.
During bundling, that means that this:

```
{VITE_ROOT}
├── index.html
├── main.ts
├── other
│   ├── index.html
│   └── main.ts
└── page
    ├── index.md
    └── nested.md
```

will be transformed to this:

```
{VITE_ROOT}/dist/
├── index.html
├── other
│   └── index.html
└── page
    ├── index.html
    └── nested
        └── index.html
```

given the following `vite.config.js`:

```javascript
export default {
  appType: "mpa",
  build: {
    rollupOptions: {
      // specifiy any non-markdown entry points here:
      input: {
        main: resolve(__dirname, "./index.html"),
        other: resolve(__dirname, "./other/index.html")
      },
    },
  },
  plugins: [staticMd()],
} satisfies UserConfig
```

## Options:

This plugin can be configured to customimze some behaviours.

### Options type:

```typescript
export interface Options {
  cssFile?: string                               // exact path only
  excludes?: string | string[] | ExcludePatterns // paths or globs
  htmlTemplate?: string                          // exact path only
  renderer?: Marked                              // marked instance to be used
                                                 // instead of default bare
                                                 // Marked class
}
```

### `Options.htmlTemplate?: string`

The file given to htmlTemplate must specify where the html transposed from your markdown sources should go using an element with `id="markdown-target"`.
For example, the default html template this plugin uses when no template file is given looks like this:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <article id="markdown-target"></article>
  </body>
</html>
```

### `Options.cssFile?: string`

If specified, this option injects the css file into the html generated from each markdown file.

### `Options.excludes?: string | string[] | ExcludePatterns`

If specified, this option tells the plugin to ignore the file(s) specified.
When given as an object matching the `ExcludePatterns` type, it tells the plugin to ignore files given to `excludes.serve` when using the dev server and to ignore files given to both `excludes.serve` & `excludes.build` when building for production.

```typescript
export interface ExcludePatterns {
  serve?: string | string[] // paths or globs
  build: string | string[] // paths or globs
}
```

### `Options.renderer?: Marked`

To customize how the markdown source for a page is rendered, supply an instance of `Marked`. This allows setting up custom extensions before passing the renderer to the plugin, while retaining the renderer for local use as well.

## Frontmatter support:

Frontmatter yaml will be parsed according the following structure:

```typescript
export interface PageData {
  title: string
  description?: string
  keywords?: string[]
  imports?: string[]
  meta?: Record<string, string>
}
```

These attributes are then used to generate the following html snippets to be included in the output html, along with the transpiled markdown:

### `PageData.title: string`

A value to use as the text content for a `<title>` in the rendered html's `<head>`.

### `PageData.description: string`

A value to use as the text content for a `<meta name="description" content=${description} />` in the rendered html's `<head>`.

### `PageData.keywords: string[]`

A value to use as the text content for a `<meta name="keywords" content=${keywords} />` in the rendered html's `<head>`.

### `PageData.meta: Record<string, string>`

A mapping of key value pairs to use for creating arbitrary`<meta name=${key} content=${value} />` in the rendered html's `<head>`.

## Sibling imports

This plugin automatically attempts to import any files of the same name, but a different extension, as a markdown source into the resulting html via `vite`.
As long as there's a file loader capable of importing the filetype to js/ts, then it can be imported.

This allows things like per-file scoping of css for a given `<name>.md` source simply by including a `<name>.css` in the same directory.
Or if truly static webpages are just a little is a little _too_ static for your (e.g. you'd like a JS widget or something), you can also include scripts via `<name>.(js|ts)`.
You can find examples of both here in [`/example/src/pages/page`](/example/src/pages/page) for `nested.md` via `nested.css` & `nested.ts`.
