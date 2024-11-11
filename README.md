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

This plugin can be configured to take a custom html template file as well as to inject a global stylesheet into every html page generated from your markdown.

```typescript
export interface Options {
  htmlTemplate?: string // path to html template file
  cssFile?: string // path to global stylesheet file
}
```

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
