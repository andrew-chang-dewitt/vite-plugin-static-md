/*
 * vite-plugin-static-md
 *
 * A simple plugin for building a truly static multi-page site from markdown files using vite.
 *
 * Features:
 *
 * - [x] Dev server w/ HMR for live updates as you edit markdown files.
 * - [x] Build outputs static index.html files from markdown files, matching the source file tree.
 * - [ ] Customize output of...
 *   - [x] ...html using html template files.
 *   - [x] ...css styles by specifying css files to include.
 *   - [ ] [MAYBE]...markdown rendering using custom markdown renderer functions.
 * - [ ] [TODO]Create sitemaps & feeds from markdown files.
 * - [x] inline imports to sibling assets--e.g. for some <file>.md, if there's a
 *       <file>.css or <file>.(ts|js) next to it, then imports of both will be
 *       added to the output html
 * - [x] create a template for initing new projects set up for this easily
 * - [x] create a cli that loads a given file as the sole md source into
 *       the default template & launches a dev server or generates html & pdf
 *       outputs
 * - [x] [TODO] frontmatter support to get page title, summary, publish date, & other information
 * - [ ] toc support
 * - [ ] toc as page in directory using data from frontmatter of descendant pages
 */

import { plugin } from "./plugin.js"
export default plugin
export type { Options, ExcludePatterns } from "./plugin.js"
export type { Page, PageData } from "./page.js"
export type { Context } from "./context.js"
